import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  createStreamConfig,
  simulate,
  formatAmount,
  formatDuration,
} from "@oss-platform/capital-streaming";

const MILESTONE_OPTIONS = [
  { label: "Single upfront payment", value: [0] },
  { label: "Two milestones (start + mid)", value: [0, 0.5] },
  { label: "Three milestones (start, 33%, 66%)", value: [0, 0.33, 0.66] },
  { label: "Quarterly (0%, 25%, 50%, 75%)", value: [0, 0.25, 0.5, 0.75] },
];

/**
 * StreamingSimulator Page
 *
 * Interactive tool to visualize how continuous capital streaming compares
 * to lump-sum milestone payments in terms of treasury capital efficiency.
 */
export default function StreamingSimulator() {
  const [poolSize, setPoolSize] = useState(100_000);
  const [durationDays, setDurationDays] = useState(90);
  const [token, setToken] = useState("XLM");
  const [milestoneIndex, setMilestoneIndex] = useState(0);

  const result = useMemo(() => {
    // Guard: engine throws if duration <= 0
    const safeDuration = Math.max(1, durationDays);
    const config = createStreamConfig(
      "sim-1",
      "Grant Simulation",
      Math.max(1, poolSize),
      safeDuration,
      token,
      "RECIPIENT_ADDRESS"
    );
    return simulate(config, {
      resolution: 120,
      lumpSumMilestones: MILESTONE_OPTIONS[milestoneIndex].value,
    });
  }, [poolSize, durationDays, token, milestoneIndex]);

  // Build chart data: merge streaming snapshots with lump-sum reference lines
  const chartData = result.snapshots.map((s) => ({
    day: ((s.timestamp - result.config.startTime) / 86400).toFixed(1),
    streaming: Number(s.deployed.toFixed(2)),
    remaining: Number(s.remaining.toFixed(2)),
  }));

  const { summary, lumpSumComparison } = result;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Capital Streaming Simulator</h1>
        <p className="mt-2 text-gray-400 text-sm leading-relaxed max-w-2xl">
          See how continuous token streaming protects your treasury compared to
          traditional milestone-based grants. Adjust the parameters below.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Grant Pool Size</span>
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2">
            <input
              type="number"
              value={poolSize}
              min={100}
              step={1000}
              onChange={(e) => setPoolSize(Number(e.target.value))}
              className="flex-1 bg-transparent text-white text-sm outline-none"
              aria-label="Grant pool size"
            />
            <span className="text-gray-500 text-xs">{token}</span>
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Duration (days)</span>
          <input
            type="number"
            value={durationDays}
            min={1}
            max={730}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
            aria-label="Stream duration in days"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Token</span>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
            aria-label="Token symbol"
          >
            <option>XLM</option>
            <option>USDC</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Lump-sum Model</span>
          <select
            value={milestoneIndex}
            onChange={(e) => setMilestoneIndex(Number(e.target.value))}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
            aria-label="Lump-sum milestone schedule"
          >
            {MILESTONE_OPTIONS.map((opt, i) => (
              <option key={i} value={i}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Stream Rate"
          value={`${summary.ratePerSecond.toFixed(4)} ${token}/s`}
        />
        <StatCard
          label="Duration"
          value={formatDuration(summary.durationSeconds)}
        />
        <StatCard
          label="Capital Efficiency Gain"
          value={`${summary.capitalEfficiencyGain.toFixed(1)}%`}
          highlight
        />
        <StatCard
          label="Total Deployed"
          value={formatAmount(summary.totalDeployed, token)}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-sm font-medium text-gray-300 mb-4">
          Deployed Capital Over Time — Streaming vs. Lump-Sum
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="remainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="day"
              tickFormatter={(v) => `Day ${v}`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value: number) => [formatAmount(value, token)]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
            />

            {/* Lump-sum milestone markers */}
            {lumpSumComparison.map((payment) => {
              const day = (
                (payment.timestamp - result.config.startTime) /
                86400
              ).toFixed(1);
              return (
                <ReferenceLine
                  key={payment.label}
                  x={day}
                  stroke="#f59e0b"
                  strokeDasharray="4 3"
                  label={{
                    value: payment.label,
                    fill: "#f59e0b",
                    fontSize: 10,
                    position: "top",
                  }}
                />
              );
            })}

            <Area
              type="monotone"
              dataKey="streaming"
              name="Streamed (deployed)"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#streamGradient)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="remaining"
              name="Remaining in pool"
              stroke="#22d3ee"
              strokeWidth={1.5}
              fill="url(#remainGradient)"
              strokeDasharray="5 3"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-3 text-xs text-gray-600">
          Yellow dashed lines indicate lump-sum payment events in the comparison model.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-lg font-semibold ${
          highlight ? "text-green-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
