# Wave Program — Contribution Plan

## What This Project Does

OSS Developer Platform removes the two biggest friction points in open-source contributor onboarding on Stellar:

1. **SorobanAuth** — a gas-sponsored smart wallet that lets developers sign transactions without holding XLM
2. **Capital Streaming** — a continuous grant streaming engine that replaces lump-sum payments with per-second token flows, keeping treasury capital protected until work is delivered

---

## Types of Work We Post

### Bug Fixes
- Edge cases in streaming math (e.g. streams with sub-second durations, floating point drift)
- Auth failure messages that don't surface clearly in the UI
- Wallet setup state machine getting stuck on network timeout
- Chart rendering issues on mobile viewports

### New Features
- **Paymaster contract** — Soroban contract that sponsors gas for `SorobanAuthWallet.initialize()` calls
- **Stream cancellation UI** — let sponsors halt a stream mid-flight and reclaim undeployed capital
- **Multi-sig key registry** — allow M-of-N signers on a single wallet contract
- **WebAuthn integration** — replace simulated keygen stubs with real `navigator.credentials` calls
- **Live stream dashboard** — connect simulator to real Stellar RPC for on-chain stream data
- **CSV export** — download simulation results for grant committee review

### Documentation
- Integration guide: connecting SorobanAuth to an existing Stellar dApp
- Paymaster deployment walkthrough (testnet → mainnet)
- Capital streaming explainer with worked examples for grant committees
- `ARCHITECTURE.md` — sequence diagrams for the auth and streaming flows

### Testing
- Rust integration tests for `__check_auth` via mock auth contexts
- Vitest tests for edge cases: zero-pool, single-snapshot, duplicate milestones
- End-to-end test: wallet setup flow (Playwright)
- Fuzz testing for the streaming engine's boundary conditions

### Tooling & DevEx
- GitHub Actions CI — `cargo test` + `npm test` + `npm run typecheck` on every PR
- Contract deployment script (testnet) with environment variable injection
- Dependabot config for automated dependency updates
- Pre-commit hook: run typecheck before every commit

---

## Sprint Structure

Issues are labeled and scoped for single-sprint completion (~1 week):

| Label | Scope |
|---|---|
| `good-first-issue` | Self-contained, < 4 hours, full context in issue body |
| `bug` | Confirmed reproduction steps provided |
| `feature` | Spec linked, acceptance criteria defined |
| `docs` | Target section identified, word count guideline given |
| `test` | Coverage target specified |

Contributors claim an issue by commenting. Maintainers assign within 24 hours. Payment streams open on assignment and complete on PR merge.
