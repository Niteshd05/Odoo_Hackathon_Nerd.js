"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import { Icon } from "@/components/ui/Icon";
import type { ActivityEvent } from "@/lib/activity";

const FILTERS: { key: string; label: string; icon: string }[] = [
  { key: "all", label: "Everything", icon: "Sparkles" },
  { key: "challenge", label: "Challenges", icon: "Trophy" },
  { key: "badge", label: "Badges", icon: "Award" },
  { key: "reward", label: "Rewards", icon: "Gift" },
  { key: "operation", label: "Carbon", icon: "Factory" },
  { key: "anomaly", label: "Anomalies", icon: "TriangleAlert" },
];

function Bold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-slate-50">{p}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [live, setLive] = useState(true);

  // Auto-refresh for the real-time pulse.
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(t);
  }, [live, router]);

  const shown = filter === "all" ? events : events.filter((e) => e.kind === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              filter === f.key
                ? "border-env/40 bg-env/10 text-env"
                : "border-sand/10 bg-sand/[0.04] text-slate-400 hover:border-sand/20 hover:text-slate-200"
            }`}
          >
            <Icon name={f.icon} className="h-3.5 w-3.5" />
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setLive((l) => !l)}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-sand/10 bg-sand/[0.04] px-3 py-1.5 text-xs text-slate-400 transition hover:text-slate-200"
        >
          <span className="relative flex h-2 w-2">
            {live && <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-env/70" />}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? "bg-env" : "bg-slate-600"}`} />
          </span>
          {live ? "Live" : "Paused"}
        </button>
      </div>

      <div className="card">
        <div className="relative space-y-1">
          {/* timeline spine */}
          <div className="absolute bottom-3 left-[19px] top-3 w-px bg-sand/10" />
          <AnimatePresence initial={false}>
            {shown.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-sand/[0.03]"
              >
                <div
                  className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sand/10 bg-ink-900"
                  style={{ boxShadow: `0 0 0 3px ${e.color}18` }}
                >
                  <Icon name={e.icon} className="h-4 w-4" style={{ color: e.color }} />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm text-slate-300">
                    {e.actor && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="grid h-4 w-4 place-items-center rounded-full text-[8px] font-bold text-[#0a0a0a]"
                          style={{ background: e.actorColor ?? "#FFE600" }}
                        >
                          {e.actor.split(" ").map((x) => x[0]).slice(0, 1).join("")}
                        </span>
                        <span className="font-semibold text-slate-50">{e.actor}</span>{" "}
                      </span>
                    )}
                    <Bold text={e.text} />
                  </p>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNowStrict(new Date(e.at), { addSuffix: true })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {shown.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">No {filter} activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
