# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `SorobanAuthWallet` Soroban smart contract with `CustomAccountInterface`
  - ed25519 signature verification via native Soroban host primitives
  - `AccountError` enum with `#[contracterror]` derive for proper WASM ABI
  - `initialize(pubkey)` — single-owner setup, callable once
  - `get_account_owner()` — Paymaster policy inspection endpoint
  - 4 unit tests: happy path, double-init guard, no-signatures error, uninitialized error
- `@oss-platform/capital-streaming` TypeScript library
  - `simulate()` — full time-series simulation with lump-sum comparison
  - `getRatePerSecond()`, `getDeployedAt()`, `getRemainingAt()` — core math
  - `createStreamConfig()` — human-friendly factory
  - `formatAmount()`, `formatDuration()` — display utilities
  - 9 unit tests (vitest)
- `@oss-platform/web` React app (Vite + TailwindCSS)
  - Wallet Setup page — 3-step gas-sponsored onboarding flow
  - Capital Streaming Simulator — interactive chart with 4 lump-sum models
  - `useWalletSetup` hook — manages keygen + deployment state machine
- Project infrastructure
  - npm workspaces monorepo
  - `.env.example` with all required Stellar/WebAuthn config keys
  - `.gitignore`, `LICENSE` (MIT), `CONTRIBUTING.md`, `CHANGELOG.md`
  - Full product documentation in `docs/`
