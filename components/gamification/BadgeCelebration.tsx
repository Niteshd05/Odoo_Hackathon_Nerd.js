"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { TIER_STYLE } from "@/lib/badges";

export type CelebratedBadge = { id: string; name: string; tier: string; icon: string };

/** Full-screen confetti + badge reveal shown when a new badge unlocks. */
export function BadgeCelebration({
  badges,
  onClose,
}: {
  badges: CelebratedBadge[];
  onClose: () => void;
}) {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: ["#34d399", "#38bdf8", "#a78bfa", "#fbbf24", "#f472b6"][i % 5],
      rotate: Math.random() * 360,
    })),
  );

  useEffect(() => {
    const t = setTimeout(onClose, 4600);
    return () => clearTimeout(t);
  }, [onClose]);

  const badge = badges[0];
  const tier = TIER_STYLE[badge.tier] ?? TIER_STYLE.Bronze;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] grid place-items-center overflow-hidden p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-ink-950/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Confetti */}
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="absolute top-0 h-2.5 w-2.5 rounded-sm"
            style={{ left: `${p.x}%`, background: p.color }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: "105vh", opacity: [1, 1, 0], rotate: p.rotate + 360 }}
            transition={{ duration: 2.6, delay: p.delay, ease: "easeIn" }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="glass relative z-10 w-full max-w-sm p-8 text-center"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Badge unlocked
          </div>

          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="relative mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full"
            style={{
              background: `radial-gradient(circle, ${tier.glow}, transparent 70%)`,
            }}
          >
            <div
              className="grid h-24 w-24 place-items-center rounded-full border-2"
              style={{ borderColor: tier.ring, background: "rgba(10,14,26,0.8)" }}
            >
              <Icon name={badge.icon} className="h-11 w-11" style={{ color: tier.text }} />
            </div>
            <span className="absolute inset-0 animate-pulse-ring rounded-full border-2" style={{ borderColor: tier.ring }} />
          </motion.div>

          <h2 className="mt-5 text-2xl font-bold text-white">{badge.name}</h2>
          <div
            className="mt-1 inline-block rounded-md px-2.5 py-0.5 text-sm font-semibold"
            style={{ background: `${tier.ring}22`, color: tier.text }}
          >
            {badge.tier}
          </div>

          {badges.length > 1 && (
            <p className="mt-3 text-sm text-slate-400">
              + {badges.length - 1} more badge{badges.length > 2 ? "s" : ""} unlocked!
            </p>
          )}

          <button onClick={onClose} className="btn-primary mt-6 w-full">
            Awesome
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
