"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/misc";
import { shortDate } from "@/lib/utils";
import {
  createCSRActivity,
  setCSRStatus,
  deleteCSRActivity,
  joinCSRActivity,
  leaveCSRActivity,
} from "@/lib/actions/social";

export type SocialActivity = {
  id: string;
  title: string;
  category: string;
  department: string | null;
  impact: string | null;
  status: string;
  date: string;
  participants: { id: string; name: string; color: string; hours: number }[];
  totalHours: number;
  joined: boolean;
  myHours: number;
};

const CATEGORIES = ["Environment", "Education", "Health", "Community", "Diversity"];
const STATUS_FLOW = ["Planned", "Ongoing", "Completed"];
const CAT_ICON: Record<string, string> = {
  Environment: "Sprout",
  Education: "GraduationCap",
  Health: "HeartPulse",
  Community: "Users",
  Diversity: "Sparkles",
};

export function SocialBoard({
  activities,
  departments,
  canManage,
}: {
  activities: SocialActivity[];
  departments: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinFor, setJoinFor] = useState<SocialActivity | null>(null);
  const [hours, setHours] = useState("2");
  const [form, setForm] = useState({
    title: "",
    category: "Community",
    departmentId: "",
    impact: "",
    status: "Planned",
  });

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      res.ok ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });

  const submitCreate = () =>
    startTransition(async () => {
      const res = await createCSRActivity({
        title: form.title,
        category: form.category,
        departmentId: form.departmentId || undefined,
        impact: form.impact || undefined,
        status: form.status,
      });
      if (res.ok) {
        toast.success(res.message);
        setCreateOpen(false);
        setForm({ ...form, title: "", impact: "" });
        router.refresh();
      } else toast.error(res.error);
    });

  const submitJoin = () => {
    if (!joinFor) return;
    const id = joinFor.id;
    setJoinFor(null);
    run(() => joinCSRActivity(id, Number(hours)));
  };

  return (
    <>
      {canManage && (
        <div className="mb-5 flex justify-end">
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Icon name="Plus" className="h-4 w-4" /> New activity
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatePresence>
          {activities.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="card glass-hover flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/12">
                    <Icon name={CAT_ICON[a.category] ?? "HandHeart"} className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-50">{a.title}</h3>
                    <div className="text-xs text-slate-500">
                      {a.category} · {a.department ?? "Org-wide"} · {shortDate(a.date)}
                    </div>
                  </div>
                </div>
                <StatusPill status={a.status} />
              </div>

              {a.impact && (
                <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                  <Icon name="Sparkles" className="h-3.5 w-3.5" /> {a.impact}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-line/[0.07] pt-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {a.participants.slice(0, 5).map((p) => (
                      <span
                        key={p.id}
                        title={`${p.name} · ${p.hours}h`}
                        className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink-850 text-[9px] font-bold text-[#0a0a0a]"
                        style={{ background: p.color }}
                      >
                        {p.name.split(" ").map((x) => x[0]).slice(0, 1)}
                      </span>
                    ))}
                    {a.participants.length === 0 && (
                      <span className="text-xs text-slate-600">No volunteers yet</span>
                    )}
                  </div>
                  {a.participants.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {a.participants.length} · {a.totalHours}h
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {a.joined ? (
                    <>
                      <span className="chip text-accent">Joined · {a.myHours}h</span>
                      <button onClick={() => run(() => leaveCSRActivity(a.id))} disabled={busy} className="btn-ghost btn-sm">
                        Leave
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setJoinFor(a); setHours("2"); }}
                      disabled={busy}
                      className="btn-primary btn-sm"
                    >
                      <Icon name="HandHeart" className="h-3.5 w-3.5" /> Volunteer
                    </button>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {STATUS_FLOW.filter((s) => s !== a.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => run(() => setCSRStatus(a.id, s))}
                      disabled={busy}
                      className="rounded-lg border border-line/10 bg-line/[0.04] px-2 py-1 text-[11px] text-slate-400 transition hover:text-slate-100"
                    >
                      Mark {s}
                    </button>
                  ))}
                  <button
                    onClick={() => run(() => deleteCSRActivity(a.id))}
                    disabled={busy}
                    className="ml-auto rounded-lg p-1.5 text-slate-500 transition hover:bg-danger/10 hover:text-danger"
                  >
                    <Icon name="Trash2" className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Join modal */}
      <Modal
        open={!!joinFor}
        onClose={() => setJoinFor(null)}
        title={`Volunteer for ${joinFor?.title ?? ""}`}
        description="Log the hours you plan to contribute."
        icon="HandHeart"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Hours</label>
            <input className="input" type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setJoinFor(null)} className="btn-ghost">Cancel</button>
            <button onClick={submitJoin} disabled={busy} className="btn-primary">
              <Icon name="Check" className="h-4 w-4" /> Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New CSR activity"
        description="Launch a community or sustainability initiative."
        icon="HeartHandshake"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Beach cleanup drive" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                <option value="">Org-wide</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Target impact (optional)</label>
            <input className="input" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} placeholder="e.g. 500 kg waste removed" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS_FLOW.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setCreateOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={submitCreate} disabled={busy} className="btn-primary">
              <Icon name="Check" className="h-4 w-4" /> Create
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
