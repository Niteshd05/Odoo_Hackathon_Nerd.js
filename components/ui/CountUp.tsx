"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * GSAP-powered number that counts up from 0 to `value` when it scrolls into
 * view. Used for headline metrics to give the dashboards a lively, crafted feel.
 */
export function CountUp({
  value,
  decimals = 0,
  duration = 1.2,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const format = (n: number) =>
      `${prefix}${n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    if (reduce) {
      el.textContent = format(value);
      return;
    }

    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = format(obj.v);
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, decimals, duration, prefix, suffix]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
