"use client";

import { motion } from "framer-motion";
import { scoreColor, scoreGrade } from "@/lib/utils";

/**
 * Animated radial ESG score gauge. The arc fills to `score`/100 and the color
 * shifts by grade band. Used for the org-level headline number.
 */
export function ScoreRing({
  score,
  size = 220,
  strokeWidth = 16,
  label = "Overall ESG",
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);
  const { grade, label: gradeLabel } = scoreGrade(clamped);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.45" />
          </linearGradient>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#ring-glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl font-bold tracking-tight text-white"
          >
            {clamped.toFixed(1)}
          </motion.div>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-sm font-bold"
              style={{ background: `${color}22`, color }}
            >
              {grade}
            </span>
            <span className="text-xs text-slate-400">{gradeLabel}</span>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
