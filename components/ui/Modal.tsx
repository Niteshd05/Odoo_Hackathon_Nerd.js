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
  accent = "#34d399",
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
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="glass relative z-10 w-full max-w-lg overflow-hidden p-6"
          >
            <div className="mb-5 flex items-start gap-3">
              {icon && (
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10"
                  style={{ background: `${accent}18` }}
                >
                  <Icon name={icon} className="h-5 w-5" style={{ color: accent }} />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-slate-400">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
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
