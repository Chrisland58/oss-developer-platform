/**
 * Capital Streaming — Shared Types
 *
 * Defines the data models for grant pools, stream configurations,
 * and simulation snapshots used by the streaming engine and UI.
 */

/** Token amounts represented as numbers (in display units, e.g. XLM not stroops) */
export type TokenAmount = number;

// ---------------------------------------------------------------------------
// Stream Configuration
// ---------------------------------------------------------------------------

export type StreamStatus = "active" | "paused" | "completed" | "cancelled";

export interface StreamConfig {
  /** Unique stream identifier */
  id: string;
  /** Human-readable label, e.g. "Q3 OSS Grant — @contributor" */
  label: string;
  /** Total grant pool allocated to this stream */
  totalAmount: TokenAmount;
  /** Stream start time (Unix timestamp in seconds) */
  startTime: number;
  /** Stream end time (Unix timestamp in seconds) */
  endTime: number;
  /** Token symbol, e.g. "XLM" or "USDC" */
  token: string;
  /** Current stream status */
  status: StreamStatus;
  /** Recipient address (Stellar public key) */
  recipient: string;
  /** Sponsor/Paymaster address covering fees */
  sponsor?: string;
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

/**
 * A point-in-time snapshot of stream state, used for charting and analysis.
 */
export interface StreamSnapshot {
  /** Unix timestamp for this snapshot */
  timestamp: number;
  /** Total tokens streamed/deployed so far */
  deployed: TokenAmount;
  /** Remaining tokens in the pool */
  remaining: TokenAmount;
  /** Streaming rate at this moment (tokens/second) */
  ratePerSecond: TokenAmount;
  /** Percentage of the stream completed (0–100) */
  percentComplete: number;
}

/**
 * Lump-sum payment event for comparison modeling.
 */
export interface LumpSumPayment {
  /** When the payment was made (Unix timestamp) */
  timestamp: number;
  /** Amount disbursed */
  amount: TokenAmount;
  /** Label, e.g. "Milestone 1" */
  label: string;
}

/**
 * Full simulation result comparing streaming vs lump-sum models.
 */
export interface SimulationResult {
  config: StreamConfig;
  /** Time-series snapshots of the stream state */
  snapshots: StreamSnapshot[];
  /** Equivalent lump-sum payments for comparison */
  lumpSumComparison: LumpSumPayment[];
  /** Summary statistics */
  summary: SimulationSummary;
}

export interface SimulationSummary {
  /** Total duration of the grant in seconds */
  durationSeconds: number;
  /** Total duration in days */
  durationDays: number;
  /** Constant streaming rate (tokens/second) */
  ratePerSecond: TokenAmount;
  /** Max capital disbursed in a single lump-sum event */
  lumpSumMaxCapitalAtRisk: TokenAmount;
  /** Average capital already disbursed at any point in time (lump-sum model) */
  avgLumpSumDeployed: TokenAmount;
  /** Average capital already deployed at any point in time (streaming model) */
  avgStreamingDeployed: TokenAmount;
  /** Max capital deployed in a single streaming step */
  streamingMaxCapitalAtRisk: TokenAmount;
  /** Capital efficiency gain vs lump-sum: percentage less capital at risk on average */
  capitalEfficiencyGain: number; // percentage, 0–100
  /** Total amount streamed */
  totalDeployed: TokenAmount;
}

// ---------------------------------------------------------------------------
// Simulation Options
// ---------------------------------------------------------------------------

export interface SimulationOptions {
  /** Number of data points to generate (resolution). Default: 100 */
  resolution?: number;
  /**
   * Lump-sum milestone schedule as fractions of total duration.
   * E.g. [0, 0.33, 0.66] = upfront, 1/3, 2/3 through the project.
   * Default: [0] (single upfront payment)
   */
  lumpSumMilestones?: number[];
}
