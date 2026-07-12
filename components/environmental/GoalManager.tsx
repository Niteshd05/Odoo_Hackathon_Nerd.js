"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar, StatusPill, EmptyState } from "@/components/ui/misc";
import { createGoal, deleteGoal } from "@/lib/actions/environmental";
import { formatNumber } from "@/lib/utils";

type Dept = { id: string; name: string };
type Goal = {
  id: string;
  name: string;
  departmentName: string;
  departmentId: string;
  targetValue: number;
  actual: number;
  period: string;
  status: string;
};

export function GoalManager({ goals, departments }: { goals: Goal[]; departments: Dept[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    departmentId: departments[0]?.id ?? "",
    targetValue: "",
    period: "2026",
  });

  const save = () => {
    startTransition(async () => {
      const res = await createGoal({
        name: form.name,
        departmentId: form.departmentId,
        targetValue: Number(form.targetValue),
        period: form.period,
      });
      if (res.ok) {
        toast.success(res.message);
        setOpen(false);
        setForm({ ...form, name: "", targetValue: "" });
        router.refresh();
      } else toast.error(res.error);
    });
  };

  const remove = (id: string) =>
    startTransition(async () => {
      const res = await deleteGoal(id);
      res.ok ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Icon name="Plus" className="h-4 w-4" />
          New goal
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon="Target" title="No goals yet" description="Set a carbon cap per department to start scoring." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, (g.actual / g.targetValue) * 100);
            const over = g.actual > g.targetValue;
            const accent = over ? "#f87171" : "#34d399";
            return (
              <div key={g.id} className="card glass-hover group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{g.name}</h3>
                      <StatusPill status={g.status} />
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {g.departmentName} · {g.period}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(g.id)}
                    className="rounded-md p-1.5 text-slate-500 opacity-0 transition hover:bg-red-400/10 hover:text-red-400 group-hover:opacity-100"
                  >
                    <Icon name="Trash2" className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(g.actual)}</div>
                    <div className="text-xs text-slate-500">kg CO2 actual</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-300">{formatNumber(g.targetValue)}</div>
                    <div className="text-xs text-slate-500">target cap</div>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar value={pct} accent={accent} />
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className={over ? "font-medium text-red-400" : "font-medium text-env"}>
                      {over
                        ? `${formatNumber(g.actual - g.targetValue)} kg over cap`
                        : `${formatNumber(g.targetValue - g.actual)} kg headroom`}
                    </span>
                    <span className="text-slate-500">{Math.round(pct)}% of cap</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New environmental goal"
        description="A carbon cap the department should stay under for the period."
        icon="Target"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Goal name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. FY26 carbon cap" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Period</label>
              <input className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Target CO2 cap (kg)</label>
            <input className="input" type="number" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} placeholder="e.g. 12000" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={save} disabled={pending} className="btn-primary">
              {pending ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : <Icon name="Check" className="h-4 w-4" />}
              Create goal
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
