"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/misc";
import { scoreColor, scoreGrade } from "@/lib/utils";
import { updateEsgConfig } from "@/lib/actions/settings";

type DeptScore = {
  name: string;
  env: number;
  soc: number;
  gov: number;
  employeeCount: number;
};

const PILLARS = [
  { key: "wE" as const, label: "Environmental", color: "#34d399", icon: "Leaf" },
  { key: "wS" as const, label: "Social", color: "#38bdf8", icon: "HeartHandshake" },
  { key: "wG" as const, label: "Governance", color: "#a78bfa", icon: "Scale" },
];

export function ConfigForm({
  initial,
  departments,
}: {
  initial: {
    wE: number;
    wS: number;
    wG: number;
    autoEmissionEnabled: boolean;
    evidenceRequiredEnabled: boolean;
    badgeAutoAwardEnabled: boolean;
  };
  departments: DeptScore[];
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [w, setW] = useState({ wE: initial.wE, wS: initial.wS, wG: initial.wG });
  const [toggles, setToggles] = useState({
    autoEmissionEnabled: initial.autoEmissionEnabled,
    evidenceRequiredEnabled: initial.evidenceRequiredEnabled,
    badgeAutoAwardEnabled: initial.badgeAutoAwardEnabled,
  });

  // Live overall ESG recompute as the sliders move.
  const preview = useMemo(() => {
    const sum = w.wE + w.wS + w.wG || 1;
    const nE = w.wE / sum, nS = w.wS / sum, nG = w.wG / sum;
    const totalEmp = departments.reduce((s, d) => s + d.employeeCount, 0) || 1;
    const overall =
      departments.reduce(
        (s, d) => s + (d.env * nE + d.soc * nS + d.gov * nG) * d.employeeCount,
        0,
      ) / totalEmp;
    return Math.round(overall * 10) / 10;
  }, [w, departments]);

  const pct = (v: number) => {
    const sum = w.wE + w.wS + w.wG || 1;
    return Math.round((v / sum) * 100);
  };

  const save = () =>
    startTransition(async () => {
      const res = await updateEsgConfig({
        weightEnvironmental: w.wE,
        weightSocial: w.wS,
        weightGovernance: w.wG,
        ...toggles,
      });
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.error);
    });

  const reset = () => setW({ wE: 0.4, wS: 0.3, wG: 0.3 });
  const grade = scoreGrade(preview);
  const previewColor = scoreColor(preview);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Weights */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card lg:col-span-2"
      >
        <SectionTitle
          title="Pillar weights"
          subtitle="How much each pillar counts toward the department total. Normalized to 100%."
          icon="SlidersHorizontal"
          right={
            <button onClick={reset} className="chip hover:border-white/20">
              <Icon name="RotateCcw" className="h-3 w-3" /> Reset
            </button>
          }
        />
        <div className="space-y-7">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <Icon name={p.icon} className="h-4 w-4" style={{ color: p.color }} />
                  {p.label}
                </span>
                <div className="flex items-center gap-2">
                  <motion.span
                    key={pct(w[p.key])}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-bold"
                    style={{ color: p.color }}
                  >
                    {pct(w[p.key])}%
                  </motion.span>
                </div>
              </div>
              {/* Track with gradient fill visualization */}
              <div className="relative">
                <div
                  className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full transition-all duration-200"
                  style={{
                    width: `${pct(w[p.key])}%`,
                    background: `linear-gradient(90deg, ${p.color}88, ${p.color})`,
                    boxShadow: `0 0 12px ${p.color}44`,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={w[p.key]}
                  onChange={(e) => setW({ ...w, [p.key]: Number(e.target.value) })}
                  className="relative z-10 w-full cursor-pointer"
                  style={{ color: p.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/5 pt-6">
          <SectionTitle title="Feature toggles" icon="ToggleRight" />
          <div className="space-y-2">
            <Toggle
              label="Auto emission calculation"
              hint="Generate a carbon transaction for every new operation"
              checked={toggles.autoEmissionEnabled}
              onChange={(v) => setToggles({ ...toggles, autoEmissionEnabled: v })}
            />
            <Toggle
              label="Require evidence on challenges"
              hint="Surface a warning when proof is missing at approval"
              checked={toggles.evidenceRequiredEnabled}
              onChange={(v) => setToggles({ ...toggles, evidenceRequiredEnabled: v })}
            />
            <Toggle
              label="Badge auto-award"
              hint="Automatically grant badges the moment their rule is met"
              checked={toggles.badgeAutoAwardEnabled}
              onChange={(v) => setToggles({ ...toggles, badgeAutoAwardEnabled: v })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={save} disabled={busy} className="btn-primary">
            {busy ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : <Icon name="Save" className="h-4 w-4" />}
            Save configuration
          </button>
        </div>
      </motion.div>

      {/* Live preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="card flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        {/* Pulsing glow behind score */}
        <div
          className="absolute inset-0 animate-glow-pulse"
          style={{
            background: `radial-gradient(circle at center, ${previewColor}10, transparent 70%)`,
          }}
        />

        <div className="eyebrow mb-4 relative z-10">Live preview</div>
        <motion.div
          key={preview}
          initial={{ scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 text-6xl font-bold tracking-tight text-shimmer"
          style={{ color: previewColor }}
        >
          {preview.toFixed(1)}
        </motion.div>
        <div className="mt-2 flex items-center gap-2 relative z-10">
          <motion.span
            key={grade.grade}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="rounded-md px-2 py-0.5 text-sm font-bold"
            style={{ background: `${previewColor}22`, color: previewColor }}
          >
            {grade.grade}
          </motion.span>
          <span className="text-sm text-slate-400">{grade.label}</span>
        </div>
        <p className="mt-4 max-w-[220px] text-xs text-slate-500 relative z-10">
          Overall ESG recalculates instantly as you drag the weights. Save to apply it across the
          organization.
        </p>
      </motion.div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
      <span
        className="relative h-6 w-11 shrink-0 rounded-full transition-all duration-300"
        style={{
          background: checked ? "#34d399" : "rgba(255,255,255,0.1)",
          boxShadow: checked ? "0 0 16px -4px rgba(52,211,153,0.5)" : "none",
        }}
      >
        <motion.span
          layout
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg"
          style={{ left: checked ? "22px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}
