"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  icon,
  accent = "#FFE600",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: string;
  accent?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="glass relative z-10 w-full max-w-lg overflow-hidden p-6"
            style={{
              boxShadow: `0 0 80px -20px ${accent}20, 0 24px 48px -12px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Top gradient line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
              }}
            />

            <div className="mb-5 flex items-start gap-3">
              {icon && (
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line/10"
                  style={{ background: `${accent}18` }}
                >
                  <Icon name={icon} className="h-5 w-5" style={{ color: accent }} />
                </motion.div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-fg">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-slate-400">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-500 transition-all duration-200 hover:bg-line/5 hover:text-slate-200 hover:rotate-90"
              >
                <Icon name="X" className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
