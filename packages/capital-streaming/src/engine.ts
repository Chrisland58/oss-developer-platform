/**
 * Capital Streaming Engine
 *
 * Core simulation logic for modeling continuous token streams vs.
 * traditional lump-sum milestone payments. Used by the frontend
 * simulator and can be consumed independently as a library.
 */

import type {
  StreamConfig,
  StreamSnapshot,
  LumpSumPayment,
  SimulationResult,
  SimulationSummary,
  SimulationOptions,
  TokenAmount,
} from "./types";

// ---------------------------------------------------------------------------
// Core Streaming Math
// ---------------------------------------------------------------------------

/**
 * Returns the constant rate of token flow per second for a stream.
 */
export function getRatePerSecond(config: StreamConfig): TokenAmount {
  const duration = config.endTime - config.startTime;
  if (duration <= 0) {
    throw new Error("Stream endTime must be after startTime");
  }
  return config.totalAmount / duration;
}

/**
 * Returns the total amount deployed by a stream at a given Unix timestamp.
 * Clamps to [0, totalAmount].
 */
export function getDeployedAt(
  config: StreamConfig,
  atTime: number
): TokenAmount {
  if (atTime <= config.startTime) return 0;
  if (atTime >= config.endTime) return config.totalAmount;

  const elapsed = atTime - config.startTime;
  const rate = getRatePerSecond(config);
  return Math.min(elapsed * rate, config.totalAmount);
}

/**
 * Returns the remaining capital in the pool at a given timestamp.
 */
export function getRemainingAt(
  config: StreamConfig,
  atTime: number
): TokenAmount {
  return config.totalAmount - getDeployedAt(config, atTime);
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

/**
 * Generates a full time-series simulation of a capital stream,
 * including a comparison against equivalent lump-sum payments.
 *
 * @param config   - Stream configuration
 * @param options  - Resolution and lump-sum milestone schedule
 * @returns        Full simulation result with snapshots and summary
 */
export function simulate(
  config: StreamConfig,
  options: SimulationOptions = {}
): SimulationResult {
  const { resolution = 100, lumpSumMilestones = [0] } = options;

  const duration = config.endTime - config.startTime;
  if (duration <= 0) {
    throw new Error("Stream endTime must be after startTime");
  }
  if (config.totalAmount <= 0) {
    throw new Error("totalAmount must be greater than 0");
  }

  const ratePerSecond = getRatePerSecond(config);
  const step = duration / resolution;

  // --- Generate streaming snapshots ---
  const snapshots: StreamSnapshot[] = [];

  for (let i = 0; i <= resolution; i++) {
    const timestamp = config.startTime + i * step;
    const deployed = getDeployedAt(config, timestamp);
    const remaining = config.totalAmount - deployed;
    const percentComplete = (deployed / config.totalAmount) * 100;

    snapshots.push({
      timestamp,
      deployed,
      remaining,
      ratePerSecond,
      percentComplete,
    });
  }

  // --- Generate lump-sum comparison ---
  // Normalize and sort milestones, clamp to [0, 1]
  const normalizedMilestones = [...new Set(lumpSumMilestones)]
    .map((m) => Math.max(0, Math.min(1, m)))
    .sort((a, b) => a - b);

  const amountPerMilestone = config.totalAmount / normalizedMilestones.length;
  const lumpSumComparison: LumpSumPayment[] = normalizedMilestones.map(
    (fraction, index) => ({
      timestamp: config.startTime + fraction * duration,
      amount: amountPerMilestone,
      label: index === 0 ? "Upfront Payment" : `Milestone ${index}`,
    })
  );

  // --- Capital efficiency analysis ---
  //
  // "Capital at risk" = money already disbursed but not yet earned.
  //
  // Lump-sum model: each milestone disburses amountPerMilestone immediately.
  // The total capital at risk peaks right after every disbursement.
  // We use the *first* milestone amount as the worst-case single-event at-risk
  // figure (typically the full amount for a single upfront payment).
  //
  // Streaming model: capital is deployed continuously, so the average deployed
  // at any given moment is ~50% of total (for a linear stream over full duration).
  // We measure average deployed across all snapshots.
  const lumpSumMaxCapitalAtRisk = amountPerMilestone; // worst single event

  const streamingMaxCapitalAtRisk = ratePerSecond * step; // max deployed per step

  // Average capital already out of treasury at any random point in time
  const avgStreamingDeployed =
    snapshots.reduce((sum, s) => sum + s.deployed, 0) / snapshots.length;

  // For lump-sum, the average at-risk is the average cumulative disbursement.
  // With N evenly-spaced milestones, capital steps up N times.
  // Average = sum of step heights × fraction of time each is active.
  // Simplified: average over same timeline = avgLumpSum across same snapshots.
  const lumpSumDeployedAt = (t: number): number => {
    // How many milestones have fired by time t?
    const elapsed = t - config.startTime;
    const fraction = elapsed / duration;
    const milestonesFired = normalizedMilestones.filter((m) => m <= fraction).length;
    return milestonesFired * amountPerMilestone;
  };
  const avgLumpSumDeployed =
    snapshots.reduce((sum, s) => sum + lumpSumDeployedAt(s.timestamp), 0) /
    snapshots.length;

  const capitalEfficiencyGain =
    avgLumpSumDeployed > 0
      ? Math.max(
          0,
          ((avgLumpSumDeployed - avgStreamingDeployed) / avgLumpSumDeployed) * 100
        )
      : 0;

  const summary: SimulationSummary = {
    durationSeconds: duration,
    durationDays: duration / 86400,
    ratePerSecond,
    lumpSumMaxCapitalAtRisk,
    avgLumpSumDeployed,
    avgStreamingDeployed,
    streamingMaxCapitalAtRisk,
    capitalEfficiencyGain,
    totalDeployed: config.totalAmount,
  };

  return {
    config,
    snapshots,
    lumpSumComparison,
    summary,
  };
}

// ---------------------------------------------------------------------------
// Utility Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a StreamConfig from human-friendly inputs.
 *
 * @param totalAmount  - Total grant in tokens
 * @param durationDays - Duration in days
 * @param token        - Token symbol (e.g. "XLM")
 * @param recipient    - Stellar address of the recipient
 * @param startDate    - Optional start date (defaults to now)
 */
export function createStreamConfig(
  id: string,
  label: string,
  totalAmount: TokenAmount,
  durationDays: number,
  token: string,
  recipient: string,
  startDate?: Date
): StreamConfig {
  const start = startDate ? startDate.getTime() / 1000 : Date.now() / 1000;
  const end = start + durationDays * 86400;

  return {
    id,
    label,
    totalAmount,
    startTime: Math.floor(start),
    endTime: Math.floor(end),
    token,
    status: "active",
    recipient,
  };
}

/**
 * Formats a token amount for display (2 decimal places + symbol).
 */
export function formatAmount(amount: TokenAmount, symbol: string): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
}

/**
 * Formats a duration in seconds to a human-readable string.
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
