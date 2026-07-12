"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/misc";
import { cn, clamp, formatNumber, scoreColor, scoreGrade } from "@/lib/utils";

type Dept = {
  id: string;
  name: string;
  code: string;
  baseCO2: number;
  targetCO2: number | null;
  baseEnv: number;
  soc: number;
  gov: number;
  employeeCount: number;
};

function envScore(actual: number, target: number | null, fallback: number) {
  if (target === null) return fallback;
  return clamp(100 * (target / Math.max(actual, 1)), 0, 100);
}

export function Simulator({
  departments,
  baseWeights,
}: {
  departments: Dept[];
  baseWeights: { wE: number; wS: number; wG: number };
}) {
  const [co2, setCo2] = useState<Record<string, number>>(
    Object.fromEntries(departments.map((d) => [d.id, d.baseCO2])),
  );
  const [w, setW] = useState(baseWeights);

  const compute = (
    co2Map: Record<string, number>,
    weights: { wE: number; wS: number; wG: number },
  ) => {
    const sum = weights.wE + weights.wS + weights.wG || 1;
    const nE = weights.wE / sum, nS = weights.wS / sum, nG = weights.wG / sum;
    const rows = departments.map((d) => {
      const env = envScore(co2Map[d.id], d.targetCO2, d.baseEnv);
      const total = env * nE + d.soc * nS + d.gov * nG;
      return { ...d, env, total };
    });
    const totalEmp = rows.reduce((s, r) => s + r.employeeCount, 0) || 1;
    const overall = rows.reduce((s, r) => s + r.total * r.employeeCount, 0) / totalEmp;
    return { rows: rows.sort((a, b) => b.total - a.total), overall };
  };

  const sim = useMemo(() => compute(co2, w), [co2, w]); // eslint-disable-line
  const base = useMemo(
    () => compute(Object.fromEntries(departments.map((d) => [d.id, d.baseCO2])), baseWeights),
    [departments, baseWeights],
  );

  const delta = sim.overall - base.overall;
  const grade = scoreGrade(sim.overall);
  const reset = () => {
    setCo2(Object.fromEntries(departments.map((d) => [d.id, d.baseCO2])));
    setW(baseWeights);
  };
  const netZero = () =>
    setCo2(Object.fromEntries(departments.map((d) => [d.id, Math.round(d.baseCO2 * 0.6)])));

  const pctW = (v: number) => Math.round((v / (w.wE + w.wS + w.wG || 1)) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Controls */}
      <div className="space-y-6">
        <div className="card">
          <SectionTitle
            title="Emissions levers"
            subtitle="Drag a department's carbon to model an intervention"
            icon="SlidersHorizontal"
            right={
              <div className="flex gap-2">
                <button onClick={netZero} className="chip hover:border-sand/25">
                  <Icon name="Wind" className="h-3 w-3" /> -40% all
                </button>
                <button onClick={reset} className="chip hover:border-sand/25">
                  <Icon name="RotateCcw" className="h-3 w-3" /> Reset
                </button>
              </div>
            }
          />
          <div className="space-y-5">
            {departments.map((d) => {
              const cur = co2[d.id];
              const env = envScore(cur, d.targetCO2, d.baseEnv);
              const changed = Math.abs(cur - d.baseCO2) > 1;
              return (
                <div key={d.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-200">
                      <span className="font-mono text-xs text-slate-500">{d.code}</span>
                      {d.name}
                      {changed && (
                        <span className="text-[10px] font-semibold text-gold">modified</span>
                      )}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{formatNumber(cur)} kg</span>
                      <span
                        className="w-10 text-right font-semibold"
                        style={{ color: scoreColor(env) }}
                      >
                        {env.toFixed(0)}
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(d.baseCO2 * 0.2)}
                    max={Math.round(d.baseCO2 * 1.8)}
                    step={10}
                    value={cur}
                    onChange={(e) => setCo2({ ...co2, [d.id]: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                    style={{ accentColor: scoreColor(env) }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <SectionTitle title="Pillar weights" subtitle="Re-prioritize what ESG means here" icon="Scale" />
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              { k: "wE" as const, label: "Environmental", color: "#FFE600" },
              { k: "wS" as const, label: "Social", color: "#A1A1AA" },
              { k: "wG" as const, label: "Governance", color: "#71717A" },
            ]).map((p) => (
              <div key={p.k}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{p.label}</span>
                  <span className="font-bold" style={{ color: p.color }}>{pctW(w[p.k])}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={w[p.k]}
                  onChange={(e) => setW({ ...w, [p.k]: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                  style={{ accentColor: p.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live result */}
      <div className="space-y-6">
        <div className="card sticky top-20 text-center">
          <div className="eyebrow mb-3">Simulated overall ESG</div>
          <motion.div
            key={Math.round(sim.overall * 10)}
            initial={{ scale: 0.94, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="num-display text-7xl font-bold"
            style={{ color: scoreColor(sim.overall) }}
          >
            {sim.overall.toFixed(1)}
          </motion.div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-sm font-bold"
              style={{ background: `${scoreColor(sim.overall)}22`, color: scoreColor(sim.overall) }}
            >
              {grade.grade}
            </span>
            <span className="text-sm text-slate-400">{grade.label}</span>
          </div>

          <div
            className={cn(
              "mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
              Math.abs(delta) < 0.05
                ? "border-sand/15 text-slate-400"
                : delta > 0
                  ? "border-env/30 bg-env/10 text-env"
                  : "border-[#FF5C4A]/30 bg-[#FF5C4A]/10 text-[#E9AE9A]",
            )}
          >
            <Icon name={delta >= 0 ? "TrendingUp" : "TrendingDown"} className="h-4 w-4" />
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)} vs baseline ({base.overall.toFixed(1)})
          </div>

          <div className="mt-6 space-y-2 text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Live ranking
            </div>
            <AnimatePresence>
              {sim.rows.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  className="flex items-center gap-2.5 rounded-lg border border-sand/[0.07] bg-sand/[0.02] px-3 py-2"
                >
                  <span className="w-4 text-center font-mono text-xs text-slate-500">{i + 1}</span>
                  <span className="flex-1 text-sm text-slate-200">{r.name}</span>
                  <span className="font-semibold" style={{ color: scoreColor(r.total) }}>
                    {r.total.toFixed(1)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            This is a sandbox - nothing is saved. Explore interventions, then act for real in
            Operations and Configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
