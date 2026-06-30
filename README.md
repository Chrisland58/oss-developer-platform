# OSS Developer Platform — Stellar/Soroban

A monorepo for two complementary open-source developer tools built on Stellar/Soroban:

| Product | Description |
|---|---|
| **SorobanAuth** | Gas-sponsored smart wallet using custom account interface, ed25519, and WebAuthn/Passkey support |
| **Capital Streaming** | Continuous grant streaming simulator and treasury efficiency visualizer |

---

## Repository Structure

```
/
├── packages/
│   ├── soroban-auth/              # Rust smart contract (Soroban)
│   │   ├── src/lib.rs             # Contract implementation
│   │   ├── Cargo.toml
│   │   └── README.md
│   └── capital-streaming/         # TypeScript streaming engine
│       ├── src/
│       │   ├── engine.ts          # Streaming math & simulation core
│       │   ├── engine.test.ts     # Vitest unit tests
│       │   ├── types.ts           # Shared types
│       │   └── index.ts           # Public exports
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       └── README.md
├── apps/
│   └── web/                       # React frontend (Vite + TailwindCSS)
│       ├── src/
│       │   ├── pages/
│       │   │   ├── WalletSetup.tsx        # SorobanAuth onboarding flow
│       │   │   └── StreamingSimulator.tsx # Capital streaming simulator
│       │   ├── hooks/
│       │   │   └── useWalletSetup.ts      # Wallet state machine
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       └── package.json
├── docs/
│   ├── soroban-auth.md
│   └── capital-streaming.md
├── SETUP.md                       # Machine setup guide (start here)
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── package.json                   # npm workspace root
└── README.md
```

---

## Quick Start

> **First time on this machine?** See [SETUP.md](./SETUP.md) — you need
> Visual C++ Build Tools, Node.js LTS, and the WASM Rust target installed first.

```bash
# Install all JS/TS dependencies
npm install

# Start the web app (localhost:5173)
npm run dev

# Run TypeScript tests
npm test

# Type-check the full monorepo
npm run typecheck

# Run Rust contract tests
cargo test --manifest-path packages/soroban-auth/Cargo.toml

# Build contract WASM (for deployment)
npm run build:contract
```

---

## Products

### SorobanAuth
Removes the #1 friction point for open-source developers entering the Stellar ecosystem — no wallet setup, no XLM required to get started. Uses Soroban's `CustomAccountInterface` to enable:
- **Gas Sponsorship (Paymasters)** — sponsors pay transaction fees on behalf of developers
- **ed25519 Key Validation** — cryptographic signature verification on-chain
- **WebAuthn/Passkey Support** — biometric-based key management (no seed phrases)

### Capital Streaming
Replaces lump-sum grant disbursement with continuous per-second token streams, improving:
- **Treasury Efficiency** — capital is only deployed as work progresses
- **Contributor Alignment** — incentives remain active over the full project lifecycle
- **Risk Reduction** — sponsors can halt streams if deliverables stall

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust, Soroban SDK, WASM |
| Streaming Engine | TypeScript |
| Frontend | React, Vite, TailwindCSS |
| Wallet Integration | Stellar SDK, Passkey/WebAuthn API |
| Charts | Recharts |
