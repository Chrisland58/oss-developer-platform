# SorobanAuth — Gas-Sponsored Smart Wallet

A Soroban smart contract implementing Stellar's `CustomAccountInterface` to enable:

- **Zero-friction onboarding** — developers don't need XLM to submit their first transaction
- **Gas Sponsorship (Paymasters)** — external contracts cover transaction fees on behalf of users
- **ed25519 key validation** — cryptographic proof verified natively by the Soroban host
- **WebAuthn/Passkey ready** — public key derived from biometric authenticators, no seed phrases

---

## How It Works

```
Developer (no XLM)
       │
       ▼
  Passkey/WebAuthn
  (generates ed25519 keypair)
       │
       ▼
  SorobanAuthWallet.initialize(pubkey)
  [funded by Paymaster]
       │
       ▼
  Developer signs transactions locally
  Paymaster sponsors fees on-chain
```

1. On first use, a **Paymaster** or factory contract calls `initialize(pubkey)` to register the developer's ed25519 public key.
2. The developer signs transaction payloads locally (via WebAuthn or any ed25519 signer).
3. `__check_auth` verifies the signature against the stored public key on every protected call.
4. The Paymaster inspects `get_account_owner()` to decide whether to sponsor fees.

---

## Contract Interface

### `initialize(env, public_key: BytesN<32>)`
Registers the owner's ed25519 public key. Can only be called once.

### `get_account_owner(env) -> BytesN<32>`
Returns the registered owner public key. Used by Paymasters for policy routing.

### `__check_auth(env, signature_payload, signatures, auth_contexts) -> Result<(), AccountError>`
Called automatically by the Soroban auth framework. Verifies that `signatures[0]` is a valid ed25519 signature over `signature_payload` by the registered owner.

---

## Error Codes

| Code | Name | Description |
|---|---|---|
| 1 | `NoSignatures` | Empty signatures vector provided |
| 2 | `NotInitialized` | Contract not yet initialized with a public key |

---

## Build

```bash
# Build WASM binary
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test
```

Requirements: Rust stable + `wasm32-unknown-unknown` target
```bash
rustup target add wasm32-unknown-unknown
```

---

## Security Considerations

- The contract is single-owner by design — one key per contract instance.
- Re-initialization is permanently blocked after first `initialize` call.
- `ed25519_verify` in Soroban panics on invalid signature, which causes the auth check to fail and the transaction to be rejected — this is the correct behavior.
- For multi-sig or key rotation, extend this contract with an authorized key registry.
