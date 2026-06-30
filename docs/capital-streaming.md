# Capital Streaming — Product Documentation

## Problem

Open-source ecosystems rely on grants to fund contributors. The dominant model is:
- A committee approves a grant
- A lump sum is disbursed at one or a few milestones
- The sponsor has no recourse if work stalls after payment

This means **maximum capital is at risk at the moment of disbursement**, with no continuous accountability mechanism.

---

## Solution

Capital Streaming deploys grant funds as a continuous per-second token flow:

```
Total Grant: 10,000 XLM over 90 days
Stream Rate: 10,000 / (90 × 86,400) ≈ 0.001286 XLM/second

Day 1:   128.6 XLM deployed    ← only 1.3% of total at risk
Day 45: 5,000 XLM deployed     ← midpoint check
Day 90: 10,000 XLM deployed    ← full deployment on completion
```

If work stalls at day 30, the sponsor cancels the stream. 66% of the grant is recovered.

---

## Capital Efficiency Model

### Streaming
Capital is deployed linearly. The amount "at risk" at any time is exactly the amount already earned by the contributor through their work.

### Lump-Sum (Traditional)
The full milestone amount becomes at risk the moment it's disbursed. If three milestones are paid upfront, 100% of the grant is at risk on day 1.

### Efficiency Gain Formula

```
Efficiency Gain = (Avg Lump-Sum At Risk − Avg Streaming Deployed) / Avg Lump-Sum At Risk × 100
```

For a single upfront payment over 90 days, streaming typically achieves **~45–55% capital efficiency improvement**.

---

## Simulation Parameters

| Parameter | Description |
|---|---|
| Grant Pool Size | Total tokens allocated to the stream |
| Duration | Length of the grant period in days |
| Token | XLM, USDC, or any Stellar asset |
| Lump-Sum Model | Milestone schedule for comparison |
| Resolution | Number of simulation data points (default: 100) |

---

## Simulation Output

The simulator returns:

- **`snapshots[]`** — time-series of deployed/remaining capital
- **`lumpSumComparison[]`** — equivalent milestone payment events
- **`summary`** — capital efficiency gain, rate, and duration stats

---

## Use Cases

1. **Grant committees** — simulate different disbursement models before voting
2. **Treasury managers** — understand how much capital is at risk under each strategy
3. **Contributors** — show sponsors the alignment benefits of streaming
4. **Protocol DAOs** — set streaming parameters for contributor incentive programs

---

## Integration with SorobanAuth

Capital streams on Stellar can be authorized using SorobanAuth wallets:

- Contributors receive stream payments to their `SorobanAuthWallet` contract address
- No XLM required to receive or claim streamed tokens
- Paymaster covers the fee for each stream settlement transaction

---

## Roadmap

| Phase | Feature |
|---|---|
| v1 (current) | Simulation engine, UI visualizer |
| v2 | On-chain stream contracts (Soroban) |
| v2 | Real-time stream dashboard with live Stellar data |
| v3 | Governance-controlled stream parameters |
| v3 | Multi-asset streaming (XLM + USDC simultaneously) |
