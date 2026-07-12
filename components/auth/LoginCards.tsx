"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { signInAs } from "@/lib/actions/auth";

type Profile = {
  id: string;
  name: string;
  title: string | null;
  role: string;
  avatarColor: string;
  department: string | null;
};

const ROLE_META: Record<
  string,
  { icon: string; blurb: string; accent: string }
> = {
  Admin: {
    icon: "ShieldCheck",
    blurb: "Full control - configure weights, run the org, see everything.",
    accent: "#71717A",
  },
  Manager: {
    icon: "ClipboardCheck",
    blurb: "Approve challenges, manage your department, award XP.",
    accent: "#A1A1AA",
  },
  Employee: {
    icon: "Sprout",
    blurb: "Join challenges, earn badges, redeem rewards.",
    accent: "#FFE600",
  },
};

export function LoginCards({ profiles }: { profiles: Profile[] }) {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<string | null>(null);

  const enter = (id: string) => {
    setActive(id);
    startTransition(() => {
      void signInAs(id);
    });
  };

  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {profiles.map((p, i) => {
        const meta = ROLE_META[p.role] ?? ROLE_META.Employee;
        const loading = pending && active === p.id;
        return (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            onClick={() => enter(p.id)}
            disabled={pending}
            className="group relative overflow-hidden rounded-3xl border border-sand/10 bg-ink-850/70 p-6 text-left backdrop-blur-xl transition-colors hover:border-sand/25 disabled:opacity-60"
          >
            {/* accent glow */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
              style={{ background: meta.accent }}
            />

            <div className="relative flex items-center justify-between">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-bold text-[#0a0a0a]"
                style={{ background: p.avatarColor }}
              >
                {p.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
              </span>
              <span
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{ borderColor: `${meta.accent}55`, color: meta.accent, background: `${meta.accent}12` }}
              >
                <Icon name={meta.icon} className="h-3.5 w-3.5" />
                {p.role}
              </span>
            </div>

            <div className="relative mt-5">
              <div className="font-display text-xl font-semibold text-slate-50">{p.name}</div>
              <div className="text-sm text-slate-400">{p.title ?? p.role}</div>
              {p.department && (
                <div className="mt-0.5 text-xs text-slate-500">{p.department}</div>
              )}
            </div>

            <p className="relative mt-4 text-xs leading-relaxed text-slate-500">
              {meta.blurb}
            </p>

            <div className="relative mt-5 flex items-center gap-2 text-sm font-semibold" style={{ color: meta.accent }}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Continue
                  <Icon name="ArrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
