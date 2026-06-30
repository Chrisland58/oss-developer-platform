# Capital Streaming Engine

A TypeScript library for simulating and comparing continuous token streaming vs. lump-sum grant disbursement for open-source treasury management.

---

## The Problem

Traditional OSS grant models disburse large lump-sum payments at milestones. This means:
- **Full capital is at risk upfront** — if a contributor stops, unspent funds are already gone
- **Misaligned incentives** — contributors receive payment before work is verified
- **Treasury inefficiency** — capital sits idle rather than being deployed progressively

## The Solution: Capital Streaming

Continuous streaming deploys tokens at a constant rate (e.g., per second). This means:
- **Capital is only deployed as work progresses** — treasury retains unstreamed funds
- **Sponsors can halt streams** at any point, recovering undeployed capital
- **Contributors are continuously incentivized** throughout the project lifecycle

---

## Usage

```typescript
import { createStreamConfig, simulate, formatAmount } from "@oss-platform/capital-streaming";

// Create a 30-day stream of 10,000 XLM
const config = createStreamConfig(
  "grant-001",
  "Q3 OSS Grant",
  10_000,
  30,
  "XLM",
  "GABC...XYZ"
);

// Simulate with 100 data points, vs 3-milestone lump-sum
const result = simulate(config, {
  resolution: 100,
  lumpSumMilestones: [0, 0.33, 0.66],
});

console.log(result.summary.capitalEfficiencyGain);
// → ~45 (streaming keeps ~45% more capital safe at any given point)

console.log(formatAmount(result.summary.ratePerSecond, "XLM"));
// → "0.00 XLM" per second (continuously)
```

---

## API

### `createStreamConfig(id, label, totalAmount, durationDays, token, recipient, startDate?)`
Convenience factory for creating a `StreamConfig`.

### `simulate(config, options?) → SimulationResult`
Runs the full simulation. Returns time-series snapshots and a lump-sum comparison.

### `getRatePerSecond(config) → number`
Returns the constant streaming rate in tokens/second.

### `getDeployedAt(config, timestamp) → number`
Returns total tokens deployed at a given Unix timestamp.

### `getRemainingAt(config, timestamp) → number`
Returns remaining pool balance at a given Unix timestamp.

### `formatAmount(amount, symbol) → string`
Formats a token amount for display.

### `formatDuration(seconds) → string`
Formats a duration in seconds to a human-readable string.

---

## Running Tests

```bash
npm test
```
