"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/misc";
import {
  createEmissionFactor,
  updateEmissionFactor,
  toggleEmissionFactor,
  deleteEmissionFactor,
} from "@/lib/actions/environmental";

type Factor = {
  id: string;
  name: string;
  unit: string;
  factor: number;
  sourceType: string;
  status: string;
  usage: number;
};

const TYPES = ["Purchase", "Manufacturing", "Expense", "Fleet"];
const TYPE_COLOR: Record<string, string> = {
  Purchase: "#38bdf8",
  Manufacturing: "#34d399",
  Expense: "#fbbf24",
  Fleet: "#a78bfa",
};

export function FactorManager({ factors }: { factors: Factor[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Factor | null>(null);

  const [form, setForm] = useState({ name: "", unit: "kg CO2 / unit", factor: "", sourceType: "Purchase" });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", unit: "kg CO2 / unit", factor: "", sourceType: "Purchase" });
    setOpen(true);
  };
  const openEdit = (f: Factor) => {
    setEditing(f);
    setForm({ name: f.name, unit: f.unit, factor: String(f.factor), sourceType: f.sourceType });
    setOpen(true);
  };

  const save = () => {
    startTransition(async () => {
      const payload = {
        name: form.name,
        unit: form.unit,
        factor: Number(form.factor),
        sourceType: form.sourceType,
      };
      const res = editing
        ? await updateEmissionFactor(editing.id, payload)
        : await createEmissionFactor(payload);
      if (res.ok) {
        toast.success(res.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const toggle = (id: string) =>
    startTransition(async () => {
      const res = await toggleEmissionFactor(id);
      res.ok ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });

  const remove = (id: string) =>
    startTransition(async () => {
      const res = await deleteEmissionFactor(id);
      res.ok ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="btn-primary">
          <Icon name="Plus" className="h-4 w-4" />
          New factor
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {factors.map((f) => (
          <div key={f.id} className="card glass-hover group relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: `${TYPE_COLOR[f.sourceType]}20`, color: TYPE_COLOR[f.sourceType] }}
                >
                  {f.sourceType}
                </span>
                <StatusPill status={f.status} />
              </div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => openEdit(f)} className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
                  <Icon name="Pencil" className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => toggle(f.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
                  <Icon name={f.status === "Active" ? "PowerOff" : "Power"} className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => remove(f.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-400/10 hover:text-red-400">
                  <Icon name="Trash2" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <h3 className="mt-3 font-semibold text-white">{f.name}</h3>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold" style={{ color: TYPE_COLOR[f.sourceType] }}>
                {f.factor}
              </span>
              <span className="text-xs text-slate-500">{f.unit}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Used by {f.usage} carbon {f.usage === 1 ? "transaction" : "transactions"}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit emission factor" : "New emission factor"}
        description="CO2 emitted per unit of the operation quantity."
        icon="Sigma"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Grid Electricity" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Source type</label>
              <select className="input" value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Factor (kg CO2 / unit)</label>
              <input className="input" type="number" step="0.01" value={form.factor} onChange={(e) => setForm({ ...form, factor: e.target.value })} placeholder="e.g. 0.71" />
            </div>
          </div>
          <div>
            <label className="label">Unit label</label>
            <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg CO2 / kWh" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={save} disabled={pending} className="btn-primary">
              {pending ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : <Icon name="Check" className="h-4 w-4" />}
              {editing ? "Save changes" : "Create factor"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
