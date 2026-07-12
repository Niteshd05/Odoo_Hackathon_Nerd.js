"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { signOut } from "@/lib/actions/auth";
import { cn, formatNumber } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import type { SessionUser } from "@/lib/session";

const ROLE_STYLE: Record<string, string> = {
  Admin: "text-accent border-accent/40 bg-accent/10",
  Manager: "text-social border-social/30 bg-social/10",
  Employee: "text-env border-env/30 bg-env/10",
};

function openCommandK() {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
}

export function Topbar({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-sand/[0.07] bg-ink-950/70 px-4 backdrop-blur-xl lg:px-8">
      {/* Command palette trigger */}
      <button
        onClick={openCommandK}
        className="flex items-center gap-2 rounded-xl border border-sand/10 bg-sand/[0.04] px-3 py-2 text-sm text-slate-400 transition hover:border-sand/20 hover:text-slate-200"
      >
        <Icon name="Search" className="h-4 w-4" />
        <span className="hidden sm:inline">Search or jump to...</span>
        <kbd className="ml-1 hidden rounded-md border border-sand/15 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-3">
        {/* XP / points wallet */}
        <div className="hidden items-center gap-3 rounded-full border border-sand/10 bg-sand/[0.04] px-4 py-1.5 sm:flex">
          <span className="flex items-center gap-1.5 text-sm">
            <Icon name="Zap" className="h-4 w-4 text-gold" />
            <span className="font-semibold text-slate-50">{formatNumber(user.xp)}</span>
            <span className="text-xs text-slate-500">XP</span>
          </span>
          <span className="h-4 w-px bg-sand/10" />
          <span className="flex items-center gap-1.5 text-sm">
            <Icon name="Coins" className="h-4 w-4 text-env" />
            <span className="font-semibold text-slate-50">{formatNumber(user.points)}</span>
            <span className="text-xs text-slate-500">pts</span>
          </span>
        </div>

        <ThemeToggle />

        {/* Account menu */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-full border border-sand/10 bg-sand/[0.04] py-1 pl-1 pr-3 transition hover:border-sand/20 hover:bg-sand/10"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-[#0a0a0a]"
              style={{ background: user.avatarColor }}
            >
              {initials}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-semibold text-slate-50">{user.name}</span>
              <span className="block text-[11px] text-slate-500">
                {user.role}
                {user.departmentName ? ` · ${user.departmentName}` : ""}
              </span>
            </span>
            <Icon name="ChevronDown" className="h-4 w-4 text-slate-500" />
          </button>

          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="glass absolute right-0 z-50 mt-2 w-64 overflow-hidden p-1.5"
                >
                  <div className="flex items-center gap-3 px-3 py-3">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-[#0a0a0a]"
                      style={{ background: user.avatarColor }}
                    >
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-50">{user.name}</div>
                      <div className="truncate text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="px-3 pb-2">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase",
                        ROLE_STYLE[user.role] ?? ROLE_STYLE.Employee,
                      )}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="my-1 h-px bg-sand/10" />
                  <button
                    onClick={() => startTransition(() => signOut())}
                    disabled={pending}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-sand/5 hover:text-slate-50"
                  >
                    <Icon name={pending ? "Loader2" : "LogOut"} className={cn("h-4 w-4", pending && "animate-spin")} />
                    Sign out & switch profile
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
