import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts sensibly. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a compact metric, e.g. 12_450 -> "12.5k". */
export function compact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Format kilograms of CO2 into a readable string with unit. */
export function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${Math.round(kg).toLocaleString()} kg`;
}

/** Format an integer with thousands separators. */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** A short human date, e.g. "12 Jul". */
export function shortDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

/** Map an ESG score (0-100) to a letter grade. */
export function scoreGrade(score: number): { grade: string; label: string } {
  if (score >= 90) return { grade: "A+", label: "Leader" };
  if (score >= 80) return { grade: "A", label: "Strong" };
  if (score >= 70) return { grade: "B", label: "Good" };
  if (score >= 60) return { grade: "C", label: "Fair" };
  if (score >= 50) return { grade: "D", label: "At risk" };
  return { grade: "E", label: "Critical" };
}

/** Map an ESG score to a tailwind-ish hex for gauges and rings. */
export function scoreColor(score: number): string {
  if (score >= 80) return "#9CB84A"; // env green
  if (score >= 65) return "#5BA894"; // social blue
  if (score >= 50) return "#E0A838"; // gold
  return "#f87171"; // red
}

/** Clamp a number to a range. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Title-cased pillar accent tokens for consistent theming. */
export const PILLAR = {
  Environmental: { color: "#9CB84A", key: "env" },
  Social: { color: "#5BA894", key: "social" },
  Governance: { color: "#CB7A4E", key: "gov" },
} as const;
