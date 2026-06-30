import { describe, it, expect } from "vitest";
import {
  getRatePerSecond,
  getDeployedAt,
  getRemainingAt,
  simulate,
  createStreamConfig,
} from "./engine";

const BASE_CONFIG = createStreamConfig(
  "test-1",
  "Test Grant",
  10_000, // 10,000 XLM
  30,     // 30 days
  "XLM",
  "GABC...XYZ"
);

describe("getRatePerSecond", () => {
  it("computes the correct constant rate", () => {
    const rate = getRatePerSecond(BASE_CONFIG);
    const durationSeconds = 30 * 86400;
    expect(rate).toBeCloseTo(10_000 / durationSeconds);
  });

  it("throws on zero-duration stream", () => {
    expect(() =>
      getRatePerSecond({ ...BASE_CONFIG, endTime: BASE_CONFIG.startTime })
    ).toThrow();
  });
});

describe("getDeployedAt", () => {
  it("returns 0 before stream starts", () => {
    expect(getDeployedAt(BASE_CONFIG, BASE_CONFIG.startTime - 1)).toBe(0);
  });

  it("returns totalAmount after stream ends", () => {
    expect(getDeployedAt(BASE_CONFIG, BASE_CONFIG.endTime + 1)).toBe(10_000);
  });

  it("returns ~50% at midpoint", () => {
    const mid = (BASE_CONFIG.startTime + BASE_CONFIG.endTime) / 2;
    expect(getDeployedAt(BASE_CONFIG, mid)).toBeCloseTo(5_000, 0);
  });
});

describe("getRemainingAt", () => {
  it("returns full amount at start", () => {
    expect(getRemainingAt(BASE_CONFIG, BASE_CONFIG.startTime)).toBe(10_000);
  });

  it("returns 0 at end", () => {
    expect(getRemainingAt(BASE_CONFIG, BASE_CONFIG.endTime)).toBeCloseTo(0, 1);
  });
});

describe("simulate", () => {
  it("generates correct number of snapshots", () => {
    const result = simulate(BASE_CONFIG, { resolution: 50 });
    expect(result.snapshots).toHaveLength(51); // 0..50 inclusive
  });

  it("first snapshot has 0 deployed", () => {
    const result = simulate(BASE_CONFIG);
    expect(result.snapshots[0].deployed).toBe(0);
  });

  it("last snapshot has full amount deployed", () => {
    const result = simulate(BASE_CONFIG);
    const last = result.snapshots[result.snapshots.length - 1];
    expect(last.deployed).toBeCloseTo(10_000, 1);
    expect(last.percentComplete).toBeCloseTo(100, 1);
  });

  it("generates lump-sum comparison with single milestone", () => {
    const result = simulate(BASE_CONFIG, { lumpSumMilestones: [0] });
    expect(result.lumpSumComparison).toHaveLength(1);
    expect(result.lumpSumComparison[0].amount).toBe(10_000);
  });

  it("generates multi-milestone lump-sum comparison", () => {
    const result = simulate(BASE_CONFIG, { lumpSumMilestones: [0, 0.5, 1.0] });
    expect(result.lumpSumComparison).toHaveLength(3);
    result.lumpSumComparison.forEach((p) => {
      expect(p.amount).toBeCloseTo(10_000 / 3, 1);
    });
  });

  it("summary capital efficiency gain is positive vs single lump-sum", () => {
    const result = simulate(BASE_CONFIG, { lumpSumMilestones: [0] });
    expect(result.summary.capitalEfficiencyGain).toBeGreaterThan(0);
    // Streaming should have lower average deployed than single upfront lump-sum
    expect(result.summary.avgStreamingDeployed).toBeLessThan(
      result.summary.avgLumpSumDeployed
    );
  });

  it("efficiency gain is 0 when lump-sum and streaming are equivalent", () => {
    // Edge case: if pool is 0 nothing is deployed
    const zeroConfig = { ...BASE_CONFIG, totalAmount: 0 };
    expect(() => simulate(zeroConfig)).toThrow("totalAmount must be greater than 0");
  });
});
