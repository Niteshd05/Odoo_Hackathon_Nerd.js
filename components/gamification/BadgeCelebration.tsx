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
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: ["#FFE600", "#A1A1AA", "#71717A", "#FFE600", "#8A8A92", "#FFF17A", "#FFF17A"][i % 7],
      rotate: Math.random() * 720 - 360,
      size: Math.random() * 6 + 3,
      shape: i % 3, // 0: square, 1: circle, 2: rectangle
    })),
  );

  // Sparkle particles around badge
  const [sparkles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      distance: 60 + Math.random() * 20,
      delay: i * 0.1,
      size: Math.random() * 4 + 2,
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
          className="absolute inset-0 bg-ink-950/85 backdrop-blur-lg"
          onClick={onClose}
        />

        {/* Radial light rays */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.15, rotate: 360 }}
          transition={{ opacity: { duration: 0.5 }, rotate: { duration: 60, repeat: Infinity, ease: "linear" } }}
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${tier.glow}20 5%, transparent 10%, transparent 20%, ${tier.glow}15 25%, transparent 30%, transparent 40%, ${tier.glow}10 45%, transparent 50%, transparent 60%, ${tier.glow}15 65%, transparent 70%, transparent 80%, ${tier.glow}20 85%, transparent 90%)`,
          }}
        />

        {/* Confetti with varied shapes */}
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="absolute top-0"
            style={{
              left: `${p.x}%`,
              background: p.color,
              width: p.shape === 2 ? p.size * 2 : p.size,
              height: p.size,
              borderRadius: p.shape === 1 ? "50%" : p.shape === 2 ? "2px" : "1px",
            }}
            initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              y: "105vh",
              opacity: [1, 1, 1, 0],
              rotate: p.rotate,
              scale: [1, 1.2, 0.8, 0.5],
            }}
            transition={{ duration: 3, delay: p.delay, ease: "easeIn" }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="glass relative z-10 w-full max-w-sm p-8 text-center"
          style={{
            boxShadow: `0 0 80px -20px ${tier.glow}40, 0 24px 48px -12px rgba(0,0,0,0.6)`,
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Badge unlocked
          </div>

          <div className="relative mx-auto mt-5">
            {/* Sparkle particles */}
            {sparkles.map((s) => (
              <motion.span
                key={s.id}
                className="absolute rounded-full"
                style={{
                  width: s.size,
                  height: s.size,
                  background: tier.text,
                  top: "50%",
                  left: "50%",
                  marginTop: -s.size / 2,
                  marginLeft: -s.size / 2,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((s.angle * Math.PI) / 180) * s.distance,
                  y: Math.sin((s.angle * Math.PI) / 180) * s.distance,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.3 + s.delay,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}

            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative mx-auto grid h-28 w-28 place-items-center rounded-full"
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
              <span className="absolute inset-0 animate-pulse-ring rounded-full border" style={{ borderColor: tier.ring, animationDelay: "0.5s" }} />
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 text-2xl font-bold text-fg"
          >
            {badge.name}
          </motion.h2>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 15 }}
            className="mt-1 inline-block rounded-md px-2.5 py-0.5 text-sm font-semibold"
            style={{ background: `${tier.ring}22`, color: tier.text }}
          >
            {badge.tier}
          </motion.div>

          {badges.length > 1 && (
            <p className="mt-3 text-sm text-slate-400">
              + {badges.length - 1} more badge{badges.length > 2 ? "s" : ""} unlocked!
            </p>
          )}

          <motion.button
            onClick={onClose}
            className="btn-primary mt-6 w-full"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Awesome
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
