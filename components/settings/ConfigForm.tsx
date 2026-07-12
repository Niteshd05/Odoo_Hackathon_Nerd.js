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

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Weights */}
      <div className="card lg:col-span-2">
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
        <div className="space-y-6">
          {PILLARS.map((p) => (
            <div key={p.key}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <Icon name={p.icon} className="h-4 w-4" style={{ color: p.color }} />
                  {p.label}
                </span>
                <span className="text-sm font-bold" style={{ color: p.color }}>
                  {pct(w[p.key])}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={w[p.key]}
                onChange={(e) => setW({ ...w, [p.key]: Number(e.target.value) })}
                className="w-full cursor-pointer accent-current"
                style={{ accentColor: p.color }}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-white/5 pt-5">
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
      </div>

      {/* Live preview */}
      <div className="card flex flex-col items-center justify-center text-center">
        <div className="eyebrow mb-4">Live preview</div>
        <motion.div
          key={preview}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-bold tracking-tight"
          style={{ color: scoreColor(preview) }}
        >
          {preview.toFixed(1)}
        </motion.div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-sm font-bold"
            style={{ background: `${scoreColor(preview)}22`, color: scoreColor(preview) }}
          >
            {grade.grade}
          </span>
          <span className="text-sm text-slate-400">{grade.label}</span>
        </div>
        <p className="mt-4 max-w-[220px] text-xs text-slate-500">
          Overall ESG recalculates instantly as you drag the weights. Save to apply it across the
          organization.
        </p>
      </div>
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
      className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/15"
    >
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-env" : "bg-white/10"}`}
      >
        <motion.span
          layout
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          style={{ left: checked ? "22px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}
