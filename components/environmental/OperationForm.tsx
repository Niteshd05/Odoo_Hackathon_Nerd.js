"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { addOperationRecord } from "@/lib/actions/environmental";

type Dept = { id: string; name: string; code: string };
type Factor = { id: string; name: string; unit: string; factor: number; sourceType: string };

const TYPES = ["Purchase", "Manufacturing", "Expense", "Fleet"];

export function OperationForm({
  departments,
  factors,
}: {
  departments: Dept[];
  factors: Factor[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [type, setType] = useState("Manufacturing");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [factorId, setFactorId] = useState("");
  const [description, setDescription] = useState("");

  const matchingFactors = factors.filter((f) => f.sourceType === type);
  const selectedFactor =
    factors.find((f) => f.id === factorId) ?? matchingFactors[0];
  const preview =
    selectedFactor && quantity
      ? Math.round(Number(quantity) * selectedFactor.factor * 10) / 10
      : null;

  const submit = () => {
    startTransition(async () => {
      const res = await addOperationRecord({
        type,
        departmentId,
        quantity: Number(quantity),
        description: description || undefined,
        emissionFactorId: factorId || undefined,
      });
      if (res.ok) {
        toast.success("Operation recorded", {
          description: res.message,
          icon: <Icon name="Leaf" className="h-4 w-4 text-env" />,
        });
        setOpen(false);
        setQuantity("");
        setDescription("");
        setFactorId("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Icon name="Plus" className="h-4 w-4" />
        Add operation
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record an operation"
        description="A carbon transaction is auto-calculated from the matching emission factor."
        icon="Factory"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Source type</label>
              <select
                className="input"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setFactorId("");
                }}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select
                className="input"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Emission factor</label>
              <select
                className="input"
                value={selectedFactor?.id ?? ""}
                onChange={(e) => setFactorId(e.target.value)}
              >
                {matchingFactors.length === 0 && <option value="">No factor for type</option>}
                {matchingFactors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.factor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input
              className="input"
              placeholder="e.g. Casting shift output"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Live carbon preview */}
          <motion.div
            layout
            className="flex items-center justify-between rounded-xl border border-env/20 bg-env/[0.06] px-4 py-3"
          >
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Icon name="Calculator" className="h-4 w-4 text-env" />
              Estimated carbon
            </div>
            <div className="text-lg font-bold text-env-soft">
              {preview !== null ? `${preview.toLocaleString()} kg CO2` : "-"}
            </div>
          </motion.div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={submit} disabled={pending} className="btn-primary">
              {pending ? (
                <Icon name="Loader2" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon name="Check" className="h-4 w-4" />
              )}
              Record & calculate
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
