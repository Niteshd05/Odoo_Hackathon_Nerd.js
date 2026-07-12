"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { switchPersona } from "@/lib/actions/session";
import { cn, formatNumber } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

type PersonaOption = {
  id: string;
  name: string;
  role: string;
  title: string | null;
  avatarColor: string;
  departmentName: string | null;
};

const ROLE_STYLE: Record<string, string> = {
  Admin: "text-gold border-gold/30 bg-gold/10",
  Manager: "text-social border-social/30 bg-social/10",
  Employee: "text-env border-env/30 bg-env/10",
};

const dropdownItemVariants = {
  hidden: { opacity: 0, x: 12 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Topbar({
  user,
  personas,
}: {
  user: SessionUser;
  personas: PersonaOption[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const pick = (id: string) => {
    setOpen(false);
    startTransition(() => switchPersona(id));
  };

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-ink-950/60 px-4 backdrop-blur-2xl lg:px-8 relative">
      {/* Gradient bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-env/20 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-env/70" />
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-env/50" style={{ animationDelay: "0.4s" }} />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-env" />
          </span>
          Live data
        </div>
        <span className="text-xs text-slate-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* XP / points wallet */}
        <div className="group hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] sm:flex">
          <span className="flex items-center gap-1.5 text-sm">
            <Icon name="Zap" className="h-4 w-4 text-gold transition-transform duration-300 group-hover:scale-110" />
            <span className="font-semibold text-white">{formatNumber(user.xp)}</span>
            <span className="text-xs text-slate-500">XP</span>
          </span>
          <span className="h-4 w-px bg-white/10" />
          <span className="flex items-center gap-1.5 text-sm">
            <Icon name="Coins" className="h-4 w-4 text-env transition-transform duration-300 group-hover:scale-110" />
            <span className="font-semibold text-white">{formatNumber(user.points)}</span>
            <span className="text-xs text-slate-500">pts</span>
          </span>
        </div>

        {/* Persona switcher */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            disabled={pending}
            className={cn(
              "flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10",
              pending && "opacity-60",
            )}
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-ink-950 ring-2 ring-white/10 transition-all duration-300"
              style={{ background: user.avatarColor }}
            >
              {initials}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-semibold text-white">
                {user.name}
              </span>
              <span className="block text-[11px] text-slate-500">
                {user.role} {user.departmentName ? `· ${user.departmentName}` : ""}
              </span>
            </span>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="ChevronDown" className="h-4 w-4 text-slate-500" />
            </motion.div>
          </button>

          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="glass absolute right-0 z-50 mt-2 w-72 overflow-hidden p-1.5"
                >
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Switch persona
                  </div>
                  <div className="no-scrollbar max-h-80 overflow-y-auto">
                    {personas.map((p, i) => (
                      <motion.button
                        key={p.id}
                        custom={i}
                        variants={dropdownItemVariants}
                        initial="hidden"
                        animate="show"
                        onClick={() => pick(p.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 hover:bg-white/[0.06]",
                          p.id === user.id && "bg-white/[0.06]",
                        )}
                      >
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-ink-950 ring-1 ring-white/10"
                          style={{ background: p.avatarColor }}
                        >
                          {p.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-white">
                            {p.name}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {p.title ?? p.role}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                            ROLE_STYLE[p.role] ?? ROLE_STYLE.Employee,
                          )}
                        >
                          {p.role}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
