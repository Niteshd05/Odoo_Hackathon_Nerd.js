"use client";

import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  icon,
  accent = "#34d399",
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
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="card glass-hover group relative overflow-hidden"
    >
      {/* Ambient glow orb */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-15 blur-2xl transition-all duration-700 group-hover:opacity-35 group-hover:scale-110"
        style={{ background: accent, animation: "glow-pulse 4s ease-in-out infinite" }}
      />

      {/* Top edge shine */}
      <div
        className="pointer-events-none absolute top-0 left-4 right-4 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {icon && (
          <div
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 transition-all duration-300 group-hover:border-white/20"
            style={{ background: `${accent}18` }}
          >
            <Icon name={icon} className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" style={{ color: accent }} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-white text-shimmer">
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              delta.positive ? "text-env" : "text-red-400",
            )}
          >
            <Icon
              name={delta.positive ? "TrendingUp" : "TrendingDown"}
              className="h-3.5 w-3.5"
            />
            {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    </motion.div>
  );
}
