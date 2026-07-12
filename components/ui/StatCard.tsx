"use client";

import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  icon,
  accent = "#FFE600",
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  accent?: string;
  delta?: { value: string; positive: boolean };
  hint?: string;
}) {
  const numeric = typeof value === "number";
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="card glass-hover group relative overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-15 blur-2xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-35"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {icon && (
          <div
            className="grid h-8 w-8 place-items-center rounded-lg border border-sand/10 transition-colors group-hover:border-sand/20"
            style={{ background: `${accent}18` }}
          >
            <Icon name={icon} className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" style={{ color: accent }} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="num-display text-3xl font-bold text-slate-50">
          {numeric ? <CountUp value={value as number} /> : value}
        </span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              delta.positive ? "text-env" : "text-[#FF5C4A]",
            )}
          >
            <Icon name={delta.positive ? "TrendingUp" : "TrendingDown"} className="h-3.5 w-3.5" />
            {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    </motion.div>
  );
}
