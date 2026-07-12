"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GRID = "rgba(148,163,184,0.12)";
const AXIS = "rgba(148,163,184,0.55)";

const tooltipStyle = {
  background: "rgba(10,14,26,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
  boxShadow: "0 20px 40px -20px rgba(0,0,0,0.9)",
};

/** Emissions (or any metric) trend over time as a glowing area chart. */
export function TrendArea({
  data,
  dataKey = "value",
  color = "#34d399",
  height = 240,
  unit = "",
}: {
  data: { label: string; value: number }[];
  dataKey?: string;
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke={AXIS} tickLine={false} axisLine={false} fontSize={11} />
        <YAxis stroke={AXIS} tickLine={false} axisLine={false} fontSize={11} width={48} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [`${Math.round(v).toLocaleString()}${unit}`, "Value"]}
          cursor={{ stroke: color, strokeOpacity: 0.3 }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#grad-${color})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#0a0e1a", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bar ranking (departments by score, emissions by dept, etc). */
export function RankBar({
  data,
  height = 260,
  unit = "",
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <XAxis type="number" stroke={AXIS} tickLine={false} axisLine={false} fontSize={11} />
        <YAxis
          type="category"
          dataKey="label"
          stroke={AXIS}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={110}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [`${Math.round(v).toLocaleString()}${unit}`, "Value"]}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? "#34d399"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Grouped vertical bars, e.g. emissions by department by type. */
export function GroupedBar({
  data,
  height = 260,
  unit = "",
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <XAxis dataKey="label" stroke={AXIS} tickLine={false} axisLine={false} fontSize={11} />
        <YAxis stroke={AXIS} tickLine={false} axisLine={false} fontSize={11} width={48} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [`${Math.round(v).toLocaleString()}${unit}`, "CO2"]}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={34}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? "#34d399"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Donut for categorical shares (pillar contribution, source mix). */
export function Donut({
  data,
  height = 240,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number, n) => [`${Math.round(v).toLocaleString()}`, n]}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            {centerValue && (
              <div className="text-2xl font-bold text-white">{centerValue}</div>
            )}
            {centerLabel && (
              <div className="text-[11px] uppercase tracking-widest text-slate-500">
                {centerLabel}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Radial pillar gauges (E/S/G at a glance). */
export function PillarRadial({
  data,
  height = 240,
}: {
  data: { label: string; value: number; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart
        innerRadius="30%"
        outerRadius="100%"
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={10}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </RadialBar>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number, _n, p) => [`${v}`, p.payload.label]}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
