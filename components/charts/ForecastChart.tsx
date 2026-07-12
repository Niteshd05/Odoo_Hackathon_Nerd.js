"use client";

import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = "rgba(172,158,130,0.55)";
const tooltipStyle = {
  background: "rgba(25,21,9,0.96)",
  border: "1px solid rgba(217,201,163,0.16)",
  borderRadius: "12px",
  color: "#E9E0CE",
  fontSize: "12px",
};

type Point = { label: string; actual: number | null; projected: number | null };

/** Actual (solid area) + projected (dashed line) emissions with a goal line. */
export function ForecastChart({
  data,
  goal,
  color = "#FFE600",
  height = 240,
}: {
  data: Point[];
  goal?: number | null;
  color?: string;
  height?: number;
}) {
  // Bridge the last actual point into the projected series so the dashed line
  // connects seamlessly.
  const bridged = data.map((d, i) => {
    const prev = data[i - 1];
    const projected =
      d.projected ?? (prev && prev.projected === null && d.actual === null ? null : d.projected);
    return {
      ...d,
      projected:
        d.actual !== null && data[i + 1]?.projected !== undefined && data[i + 1]?.actual === null
          ? d.actual
          : projected,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={bridged} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="fc-actual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke={AXIS} tickLine={false} axisLine={false} fontSize={11} />
        <YAxis stroke={AXIS} tickLine={false} axisLine={false} fontSize={11} width={46} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number, n) => [`${Math.round(v).toLocaleString()} kg`, n === "actual" ? "Actual" : "Projected"]}
        />
        {goal != null && (
          <ReferenceLine
            y={goal}
            stroke="#FFE600"
            strokeDasharray="4 4"
            label={{ value: "Goal", fill: "#FFE600", fontSize: 10, position: "insideTopRight" }}
          />
        )}
        <Area type="monotone" dataKey="actual" stroke={color} strokeWidth={2.5} fill="url(#fc-actual)" dot={false} connectNulls />
        <Line type="monotone" dataKey="projected" stroke={color} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
