# SorobanAuth — Product Documentation

## Problem

Open-source developers face a hard onboarding wall when entering the Stellar ecosystem:

1. They need to create a Stellar wallet
2. They need to acquire XLM to fund the account
3. They need XLM again to pay transaction fees for every action

This blocks contributors from simple tasks like submitting PR metadata, claiming issue bounties, or voting on governance proposals — before they've written a single line of code.

---

## Solution

SorobanAuth implements Stellar's `CustomAccountInterface` to create a **smart contract wallet** that:

- Requires **zero XLM** from the end user to set up
- Accepts **ed25519 signatures** derived from biometric authenticators (Passkeys/WebAuthn)
- Integrates with **Paymaster contracts** that sponsor transaction fees on behalf of users

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Developer Browser                  │
│                                                      │
│   WebAuthn API ──► ed25519 keypair generation       │
│   (TouchID / FaceID / Hardware Key)                 │
└──────────────────────────┬──────────────────────────┘
                           │ publicKey (BytesN<32>)
                           ▼
┌─────────────────────────────────────────────────────┐
│               Paymaster Contract                     │
│                                                      │
│   1. Receives the public key                        │
│   2. Deploys SorobanAuthWallet WASM                 │
│   3. Calls initialize(pubkey)                       │
│   4. Pays all transaction fees                      │
└──────────────────────────┬──────────────────────────┘
                           │ contract address
                           ▼
┌─────────────────────────────────────────────────────┐
│           SorobanAuthWallet Contract                 │
│                                                      │
│   Storage: pubkey → BytesN<32>                      │
│   __check_auth: ed25519_verify(pubkey, sig, payload)│
│   get_account_owner(): → BytesN<32>                 │
└─────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### Why `CustomAccountInterface`?
Soroban's `CustomAccountInterface` lets smart contracts act as first-class transaction signers. This is the building block for account abstraction on Stellar — instead of a keypair being the account, the smart contract is the account.

### Why ed25519 (not secp256k1)?
Soroban's host provides a native `ed25519_verify` primitive that is computationally cheap (low fee units). WebAuthn devices can be configured to produce ed25519 keys on supported platforms.

### Why single-owner for v1?
Single-owner keeps the auth logic auditable and minimal. Multi-sig, key rotation, and social recovery are natural v2 extensions that can be added to the key registry without changing the core auth flow.

### Why panic on bad signature?
Soroban's `ed25519_verify` panics on invalid signatures. In the Soroban execution model, a panic in `__check_auth` is treated as an auth failure and the entire transaction is rejected. This is the correct and expected behavior.

---

## Integration Guide

### For Paymaster developers

Call `get_account_owner()` to retrieve the owner's public key before deciding whether to sponsor fees:

```rust
let owner = wallet_client.get_account_owner();
// Apply your Paymaster policy: allow/deny sponsorship based on owner address
```

### For frontend developers

The `useWalletSetup` hook in `apps/web` handles the three-step flow. In production, replace the simulation stubs with:

1. **WebAuthn keygen**: `navigator.credentials.create()` → extract public key
2. **Contract deployment**: Stellar SDK transaction builder → invoke Paymaster → get contract address
3. **Signing**: `navigator.credentials.get()` → sign payload → submit transaction

---

## Roadmap

| Phase | Feature |
|---|---|
| v1 (current) | Single-owner ed25519, gas sponsorship, WebAuthn UI |
| v2 | Multi-sig (M-of-N key registry) |
| v2 | Key rotation with time-lock |
| v3 | Social recovery via guardian contracts |
| v3 | Cross-chain account abstraction |
