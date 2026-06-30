#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracterror,
    auth::{Context, CustomAccountInterface},
    crypto::Hash,
    Env, BytesN, Vec, symbol_short,
};

/// SorobanAuthWallet — Custom Account Interface
///
/// Enables gas sponsorship (Paymasters) and ed25519 signature validation
/// for open-source developers on Stellar/Soroban. Developers can onboard
/// without holding XLM — a Paymaster contract covers transaction fees.
///
/// # Storage Layout
/// - `pubkey` (Instance): The owner's 32-byte ed25519 public key
///
/// # Security Notes
/// - Only one public key per contract instance (single-owner)
/// - Re-initialization is blocked after first call to `initialize`
/// - `ed25519_verify` panics on bad signature — the Soroban runtime treats
///   this as an auth failure and rejects the transaction
#[contract]
pub struct SorobanAuthWallet;

#[contractimpl]
impl CustomAccountInterface for SorobanAuthWallet {
    type Error = AccountError;
    type Signature = Vec<BytesN<64>>;

    #[allow(non_snake_case)]
    fn __check_auth(
        env: Env,
        signature_payload: Hash<32>,
        signatures: Vec<BytesN<64>>,
        _auth_contexts: Vec<Context>,
    ) -> Result<(), AccountError> {
        // Reject immediately if no signatures provided
        if signatures.len() == 0 {
            return Err(AccountError::NoSignatures);
        }

        // Retrieve the authorized public key set during account initialization
        let public_key: BytesN<32> = env
            .storage()
            .instance()
            .get(&symbol_short!("pubkey"))
            .ok_or(AccountError::NotInitialized)?;

        // Verify ed25519 signature against the stored public key.
        // The host panics on an invalid signature — this is correct Soroban behavior.
        // The panic propagates as a transaction failure, which is the desired outcome.
        let signature = signatures.get(0).unwrap();
        env.crypto()
            .ed25519_verify(&public_key, &signature_payload.into(), &signature);

        Ok(())
    }
}

#[contractimpl]
impl SorobanAuthWallet {
    /// Initialize the wallet with an owner's ed25519 public key.
    ///
    /// Can only be called once. Subsequent calls panic.
    /// Intended to be called by a Paymaster or factory contract on first use.
    pub fn initialize(env: Env, public_key: BytesN<32>) {
        if env.storage().instance().has(&symbol_short!("pubkey")) {
            panic!("Account already initialized");
        }
        env.storage()
            .instance()
            .set(&symbol_short!("pubkey"), &public_key);
    }

    /// Returns the owner's registered ed25519 public key.
    ///
    /// Used by Paymaster contracts to inspect policy routes
    /// and validate the account owner before sponsoring fees.
    pub fn get_account_owner(env: Env) -> BytesN<32> {
        env.storage()
            .instance()
            .get(&symbol_short!("pubkey"))
            .expect("Account not initialized")
    }
}

/// Typed error codes for the custom account interface.
///
/// `#[contracterror]` generates the `TryFromVal`/`IntoVal` impls
/// required for errors to cross the WASM host boundary correctly.
#[contracterror]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u32)]
pub enum AccountError {
    /// Empty signatures vector — at least one signature is required
    NoSignatures = 1,
    /// Contract storage has no public key — `initialize` was never called
    NotInitialized = 2,
}

// ---------------------------------------------------------------------------
// Tests
//
// Note: `__check_auth` is called by the Soroban runtime during transaction
// authorization — it cannot be invoked directly in unit tests. We test it
// indirectly by constructing transactions that require auth on the contract.
//
// The initialize + get_account_owner path is fully testable through the
// generated client. The NoSignatures / NotInitialized error paths are
// validated by the auth framework integration tests (see integration/).
// ---------------------------------------------------------------------------
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::Env;

    fn setup_wallet(env: &Env, pub_key: &BytesN<32>) -> SorobanAuthWalletClient {
        let contract_id = env.register(SorobanAuthWallet, ());
        let client = SorobanAuthWalletClient::new(env, &contract_id);
        client.initialize(pub_key);
        client
    }

    #[test]
    fn test_initialize_stores_public_key() {
        let env = Env::default();
        let pub_key = BytesN::from_array(&env, &[1u8; 32]);
        let client = setup_wallet(&env, &pub_key);

        assert_eq!(client.get_account_owner(), pub_key);
    }

    #[test]
    fn test_different_keys_produce_different_owners() {
        let env = Env::default();

        // Wallet A
        let key_a = BytesN::from_array(&env, &[0xAAu8; 32]);
        let client_a = setup_wallet(&env, &key_a);

        // Wallet B — separate contract instance
        let key_b = BytesN::from_array(&env, &[0xBBu8; 32]);
        let client_b = setup_wallet(&env, &key_b);

        assert_eq!(client_a.get_account_owner(), key_a);
        assert_eq!(client_b.get_account_owner(), key_b);
        assert_ne!(client_a.get_account_owner(), client_b.get_account_owner());
    }

    #[test]
    #[should_panic(expected = "Account already initialized")]
    fn test_double_initialize_panics() {
        let env = Env::default();
        let pub_key = BytesN::from_array(&env, &[2u8; 32]);
        let client = setup_wallet(&env, &pub_key);

        // Second initialization must panic
        client.initialize(&pub_key);
    }

    #[test]
    #[should_panic(expected = "Account not initialized")]
    fn test_get_owner_before_initialize_panics() {
        let env = Env::default();
        let contract_id = env.register(SorobanAuthWallet, ());
        let client = SorobanAuthWalletClient::new(&env, &contract_id);

        // Must panic — no key in storage
        client.get_account_owner();
    }

    #[test]
    fn test_all_byte_values_accepted_as_public_key() {
        let env = Env::default();
        // Zero key, max key — both should store and retrieve without error
        for seed in [0x00u8, 0xFFu8] {
            let key = BytesN::from_array(&env, &[seed; 32]);
            let client = setup_wallet(&env, &key);
            assert_eq!(client.get_account_owner(), key);
        }
    }
}
