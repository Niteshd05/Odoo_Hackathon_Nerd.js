"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { scoreColor, scoreGrade } from "@/lib/utils";

/**
 * Animated radial ESG score gauge with orbiting particle and count-up.
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

  // Count-up animation
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 1400;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * clamped);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [clamped]);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      {/* Radial glow pulse behind */}
      <div
        className="absolute inset-0 rounded-full animate-glow-pulse"
        style={{
          background: `radial-gradient(circle, ${color}15, transparent 70%)`,
        }}
      />

      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.45" />
          </linearGradient>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Filled arc */}
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
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      {/* Orbiting particle dot */}
      <motion.div
        className="absolute"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 12px 2px ${color}`,
          top: "50%",
          left: "50%",
          marginTop: -4,
          marginLeft: -4,
          ["--orbit-r" as string]: `${radius}px`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          style={{
            width: 8,
            height: 8,
            position: "absolute",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Center content */}
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl font-bold tracking-tight text-fg"
          >
            {displayValue.toFixed(1)}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-1 flex items-center justify-center gap-2"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 400, damping: 15 }}
              className="rounded-md px-2 py-0.5 text-sm font-bold"
              style={{ background: `${color}22`, color }}
            >
              {grade}
            </motion.span>
            <span className="text-xs text-slate-400">{gradeLabel}</span>
          </motion.div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
