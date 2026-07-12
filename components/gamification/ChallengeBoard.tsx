"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { StatusPill, ProgressBar, EmptyState } from "@/components/ui/misc";
import { BadgeCelebration, type CelebratedBadge } from "./BadgeCelebration";
import { CHALLENGE_FLOW } from "@/lib/gamification";
import {
  approveParticipation,
  rejectParticipation,
  createChallenge,
  transitionChallenge,
} from "@/lib/actions/gamification";
import { shortDate } from "@/lib/utils";

type Challenge = {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: string;
  status: string;
  evidenceRequired: boolean;
  deadline: string | null;
  categoryName: string | null;
  participants: number;
  approved: number;
};
type Pending = {
  id: string;
  challengeTitle: string;
  employeeName: string;
  employeeColor: string;
  proof: string | null;
  progress: number;
  xp: number;
  evidenceRequired: boolean;
};
type Category = { id: string; name: string };

const DIFF_COLOR: Record<string, string> = {
  Easy: "#9CB84A",
  Medium: "#E0A838",
  Hard: "#f87171",
};
const STATUS_ORDER = ["Under Review", "Active", "Draft", "Completed", "Archived"];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const approvalVariants = {
  hidden: { opacity: 0, x: 24 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ChallengeBoard({
  challenges,
  pending,
  categories,
  canManage,
}: {
  challenges: Challenge[];
  pending: Pending[];
  categories: Category[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [celebrate, setCelebrate] = useState<CelebratedBadge[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    xp: "150",
    difficulty: "Medium",
    evidenceRequired: true,
    categoryId: categories[0]?.id ?? "",
    deadline: "",
  });

  const approve = (id: string) =>
    startTransition(async () => {
      const res = await approveParticipation(id);
      if (res.ok) {
        toast.success(res.message, {
          icon: <Icon name="Zap" className="h-4 w-4 text-gold" />,
        });
        if (res.data && res.data.newBadges.length > 0) {
          setCelebrate(res.data.newBadges);
        }
        router.refresh();
      } else toast.error(res.error);
    });

  const reject = (id: string) =>
    startTransition(async () => {
      const res = await rejectParticipation(id);
      res.ok ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });

  const move = (id: string, to: string) =>
    startTransition(async () => {
      const res = await transitionChallenge(id, to);
      res.ok ? toast.success(res.message) : toast.error(res.error);
      router.refresh();
    });

  const submitCreate = () =>
    startTransition(async () => {
      const res = await createChallenge({
        title: form.title,
        description: form.description,
        xp: Number(form.xp),
        difficulty: form.difficulty,
        evidenceRequired: form.evidenceRequired,
        categoryId: form.categoryId || undefined,
        deadline: form.deadline || undefined,
      });
      if (res.ok) {
        toast.success(res.message);
        setCreateOpen(false);
        setForm({ ...form, title: "", description: "" });
        router.refresh();
      } else toast.error(res.error);
    });

  const sorted = [...challenges].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  return (
    <>
      {canManage && (
        <div className="mb-5 flex justify-end">
          <motion.button
            onClick={() => setCreateOpen(true)}
            className="btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon name="Plus" className="h-4 w-4" />
            New challenge
          </motion.button>
        </div>
      )}

      {/* Approvals queue */}
      {canManage && (
        <div className="card mb-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15">
              <Icon name="ClipboardCheck" className="h-4 w-4 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Approval queue</h3>
              <p className="text-xs text-slate-500">
                Approving awards XP and points, and may auto-unlock a badge.
              </p>
            </div>
            <span className="ml-auto chip">{pending.length} pending</span>
          </div>

          {pending.length === 0 ? (
            <EmptyState icon="CheckCheck" title="All caught up" description="No participations waiting for review." />
          ) : (
            <div className="space-y-2.5">
              {pending.map((p, i) => (
                <motion.div
                  key={p.id}
                  custom={i}
                  variants={approvalVariants}
                  initial="hidden"
                  animate="show"
                  layout
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03] sm:flex-row sm:items-center"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-ink-950 ring-1 ring-white/10"
                    style={{ background: p.employeeColor }}
                  >
                    {p.employeeName.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{p.employeeName}</span>
                      <span className="text-xs text-slate-500">on</span>
                      <span className="text-sm text-slate-300">{p.challengeTitle}</span>
                      <span className="chip text-gold">+{p.xp} XP</span>
                    </div>
                    {p.proof ? (
                      <p className="mt-1 text-xs text-slate-500">
                        <Icon name="Paperclip" className="mr-1 inline h-3 w-3" />
                        {p.proof}
                      </p>
                    ) : p.evidenceRequired ? (
                      <p className="mt-1 text-xs text-gold/80">
                        <Icon name="AlertCircle" className="mr-1 inline h-3 w-3" />
                        Evidence required but not attached
                      </p>
                    ) : null}
                    <div className="mt-2 max-w-xs">
                      <ProgressBar value={p.progress} accent="#5BA894" showValue />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <motion.button
                      onClick={() => reject(p.id)}
                      disabled={busy}
                      className="btn-ghost btn-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon name="X" className="h-3.5 w-3.5" />
                      Reject
                    </motion.button>
                    <motion.button
                      onClick={() => approve(p.id)}
                      disabled={busy}
                      className="btn-primary btn-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon name="Check" className="h-3.5 w-3.5" />
                      Approve
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challenge grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((c, i) => (
          <motion.div
            key={c.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="card glass-hover flex flex-col"
          >
            <div className="flex items-start justify-between gap-2">
              <StatusPill status={c.status} />
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{ background: `${DIFF_COLOR[c.difficulty]}20`, color: DIFF_COLOR[c.difficulty] }}
              >
                {c.difficulty}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-white">{c.title}</h3>
            <p className="mt-1 line-clamp-2 flex-1 text-xs text-slate-500">{c.description}</p>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Icon name="Zap" className="h-3.5 w-3.5 text-gold" /> {c.xp} XP
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Users" className="h-3.5 w-3.5" /> {c.participants}
              </span>
              {c.evidenceRequired && (
                <span className="flex items-center gap-1">
                  <Icon name="Paperclip" className="h-3.5 w-3.5" /> proof
                </span>
              )}
              {c.deadline && (
                <span className="ml-auto flex items-center gap-1">
                  <Icon name="Clock" className="h-3.5 w-3.5" /> {shortDate(c.deadline)}
                </span>
              )}
            </div>

            {canManage && CHALLENGE_FLOW[c.status]?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
                {CHALLENGE_FLOW[c.status].map((to) => (
                  <button
                    key={to}
                    onClick={() => move(c.id, to)}
                    disabled={busy}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <Icon name="ArrowRight" className="mr-1 inline h-3 w-3" />
                    {to}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New challenge"
        description="Created as a Draft. Activate it when you are ready to launch."
        icon="Trophy"
        accent="#5BA894"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cycle to work week" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What should participants do?" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">XP</label>
              <input className="input" type="number" value={form.xp} onChange={(e) => setForm({ ...form, xp: e.target.value })} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
            <input type="checkbox" checked={form.evidenceRequired} onChange={(e) => setForm({ ...form, evidenceRequired: e.target.checked })} className="h-4 w-4 accent-env" />
            Require evidence for approval
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setCreateOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={submitCreate} disabled={busy} className="btn-primary">
              {busy ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : <Icon name="Check" className="h-4 w-4" />}
              Create challenge
            </button>
          </div>
        </div>
      </Modal>

      {celebrate && <BadgeCelebration badges={celebrate} onClose={() => setCelebrate(null)} />}
    </>
  );
}
