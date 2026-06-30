# Machine Setup Guide

This guide gets your Windows machine fully configured to build and run the project.
Follow every step in order — nothing can be skipped.

---

## Step 1 — Visual C++ Build Tools (required for Rust on Windows)

Rust on Windows uses the MSVC linker (`link.exe`). Without it, `cargo build` and
`cargo test` will fail with `linker 'link.exe' not found`.

**Install the Build Tools (free, no full Visual Studio needed):**

1. Go to: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Click **Download Build Tools**
3. Run the installer
4. In the workload screen, check **"Desktop development with C++"**
5. Click **Install** (~6 GB)
6. **Restart your machine** after installation

To verify:
```powershell
link /?
# Should print: Microsoft (R) Incremental Linker
```

---

## Step 2 — Node.js (required for the web app and TypeScript packages)

1. Go to: https://nodejs.org
2. Download the **LTS** version (v20 or v22)
3. Run the installer — accept all defaults
4. **Restart your terminal** after installation

To verify:
```powershell
node --version   # e.g. v20.14.0
npm --version    # e.g. 10.7.0
```

---

## Step 3 — Add Rust WASM target (required for contract compilation)

After Step 1, open a new terminal and run:

```powershell
rustup target add wasm32-unknown-unknown
```

To verify:
```powershell
rustup target list --installed
# Should include: wasm32-unknown-unknown
```

---

## Step 4 — Install project dependencies

```powershell
# From the project root
npm install
```

---

## Step 5 — Verify everything works

```powershell
# Run TypeScript tests (capital-streaming engine)
npm test

# Type-check all TypeScript
npm run typecheck

# Start the web app
npm run dev

# Run Rust contract tests
cargo test --manifest-path packages/soroban-auth/Cargo.toml

# Build contract WASM (optional, for deployment)
npm run build:contract
```

---

## Current Status of This Machine

| Tool | Status | Action needed |
|---|---|---|
| Rust / Cargo | ✅ Installed (v1.96) | — |
| MSVC linker (`link.exe`) | ❌ Missing | Install Build Tools (Step 1) |
| Node.js / npm | ❌ Missing | Install Node.js LTS (Step 2) |
| `wasm32-unknown-unknown` | ❌ Missing | Run `rustup target add` (Step 3) |

---

## Troubleshooting

**`linker 'link.exe' not found`**
→ Visual C++ Build Tools not installed or machine not restarted. Repeat Step 1.

**`npm` not recognized**
→ Node.js not installed or terminal not restarted after install. Repeat Step 2.

**`error[E0463]: can't find crate for 'std'` when building for wasm**
→ WASM target not installed. Run: `rustup target add wasm32-unknown-unknown`

**`could not compile` on first `cargo test`**
→ First build downloads ~170 crates and can take 5–10 minutes. Let it finish.
