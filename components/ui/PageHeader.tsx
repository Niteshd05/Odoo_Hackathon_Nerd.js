"use client";

import { motion } from "framer-motion";
import { Icon } from "./Icon";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  accent = "#9CB84A",
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: string;
  accent?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between relative"
    >
      <div className="flex items-start gap-4">
        {icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accent}22, transparent)`,
            }}
          >
            <Icon name={icon} className="h-6 w-6 relative z-10" style={{ color: accent }} />
            {/* Subtle glow */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(circle, ${accent}20, transparent)` }}
            />
          </motion.div>
        )}
        <div>
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="eyebrow mb-1"
            >
              {eyebrow}
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-bold tracking-tight text-white sm:text-[28px]"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-1 max-w-2xl text-sm text-slate-400"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
      {actions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex shrink-0 items-center gap-2"
        >
          {actions}
        </motion.div>
      )}

      {/* Decorative gradient line under header */}
      <div
        className="absolute -bottom-3 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}25, ${accent}15, transparent)`,
        }}
      />
    </motion.div>
  );
}
