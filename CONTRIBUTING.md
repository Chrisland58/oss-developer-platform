# Contributing

Thanks for your interest in contributing to the OSS Developer Platform.

---

## Repository Structure

```
packages/soroban-auth/     Rust smart contract (Soroban SDK)
packages/capital-streaming/ TypeScript streaming engine
apps/web/                  React frontend (Vite)
docs/                      Product documentation
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Frontend + packages |
| npm | ≥ 9 | Workspace management |
| Rust | stable | Contract compilation |
| `wasm32-unknown-unknown` target | — | Contract WASM build |

Install the Rust WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

---

## Setup

```bash
# Install all JS dependencies
npm install

# Start the web app
npm run dev

# Run TypeScript tests
npm test

# Type-check everything
npm run typecheck
```

---

## Smart Contract (Rust)

```bash
# Build WASM
npm run build:contract

# Run Rust tests
cd packages/soroban-auth
cargo test
```

---

## Branching

- `main` — protected, requires PR + review
- `feat/<name>` — new features
- `fix/<name>` — bug fixes
- `chore/<name>` — tooling, deps, docs

---

## Pull Request Checklist

- [ ] TypeScript: `npm run typecheck` passes
- [ ] Tests: `npm test` passes
- [ ] Rust: `cargo test` passes (if contract changed)
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] New env vars added to `apps/web/.env.example`
- [ ] No `.env` files committed

---

## Commit Style

```
feat: add multi-sig key registry
fix: guard against zero-duration stream
chore: bump soroban-sdk to 21.1.0
docs: add Paymaster integration guide
```

---

## Reporting Issues

Open a GitHub issue with:
1. What you expected
2. What actually happened
3. Steps to reproduce
4. Environment (OS, Node version, Rust version)
