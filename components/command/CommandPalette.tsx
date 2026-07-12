"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { visibleNav } from "@/lib/nav";

type Cmd = {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  group: string;
  href?: string;
  run?: () => void;
  keywords?: string;
};

export function CommandPalette({ role }: { role: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build the command list from nav + quick actions.
  const commands = useMemo<Cmd[]>(() => {
    const nav = visibleNav(role).flatMap((section) =>
      section.items.map((item) => ({
        id: `nav-${item.href}`,
        label: item.label,
        icon: item.icon,
        group: section.title,
        href: item.href,
      })),
    );
    const actions: Cmd[] = [
      { id: "act-op", label: "Record an operation", hint: "auto-calc carbon", icon: "Plus", group: "Actions", href: "/environmental/operations", keywords: "add carbon emission" },
      { id: "act-copilot", label: "Ask the ESG Copilot", icon: "Sparkles", group: "Actions", href: "/copilot", keywords: "ai chat question" },
      { id: "act-sim", label: "Open What-if Simulator", icon: "FlaskConical", group: "Actions", href: "/simulator", keywords: "scenario model score" },
      { id: "act-forecast", label: "View Carbon Forecast", icon: "TrendingUp", group: "Actions", href: "/environmental/forecast", keywords: "project prediction" },
      { id: "act-feed", label: "Open Activity Feed", icon: "Activity", group: "Actions", href: "/activity", keywords: "pulse live events" },
    ];
    return [...actions, ...nav];
  }, [role]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [query, commands]);

  // Toggle on Cmd/Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  const choose = (c: Cmd) => {
    setOpen(false);
    if (c.href) router.push(c.href);
    else c.run?.();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      choose(results[cursor]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass relative z-10 w-full max-w-xl overflow-hidden p-0"
            onKeyDown={onListKey}
          >
            <div className="flex items-center gap-3 border-b border-sand/10 px-4">
              <Icon name="Search" className="h-4 w-4 text-slate-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and actions..."
                className="flex-1 bg-transparent py-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="rounded-md border border-sand/15 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="no-scrollbar max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No matches for &quot;{query}&quot;
                </div>
              ) : (
                results.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => choose(c)}
                    onMouseEnter={() => setCursor(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      i === cursor ? "bg-sand/[0.08]" : "hover:bg-sand/[0.04]"
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sand/[0.06]">
                      <Icon name={c.icon} className={`h-4 w-4 ${i === cursor ? "text-env" : "text-slate-400"}`} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-slate-100">{c.label}</span>
                      {c.hint && <span className="block text-xs text-slate-500">{c.hint}</span>}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-600">{c.group}</span>
                    {i === cursor && <Icon name="CornerDownLeft" className="h-3.5 w-3.5 text-slate-500" />}
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-sand/10 px-4 py-2.5 text-[11px] text-slate-600">
              <span className="flex items-center gap-1"><Icon name="ArrowUp" className="h-3 w-3" /><Icon name="ArrowDown" className="h-3 w-3" /> navigate</span>
              <span className="flex items-center gap-1"><Icon name="CornerDownLeft" className="h-3 w-3" /> open</span>
              <span className="ml-auto">EcoSphere command bar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
