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
  createPolicy, setPolicyStatus, deletePolicy, acknowledgePolicy,
  createAudit, deleteAudit,
  createIssue, setIssueStatus, deleteIssue,
} from "@/lib/actions/governance";

export type Policy = { id: string; title: string; body: string; category: string; status: string; acks: number; ackedByMe: boolean };
export type Audit = { id: string; title: string; type: string; result: string; department: string | null; date: string };
export type Issue = { id: string; title: string; severity: string; status: string; department: string | null; raisedAt: string };

const POLICY_CATS = ["Ethics", "Environmental", "Governance", "Supply Chain", "Data"];
const ISSUE_STATUS = ["Open", "In Progress", "Resolved"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const AUDIT_RESULTS = ["Pass", "Partial", "Fail"];

export function GovernanceBoard({
  policies, audits, issues, departments, canManage,
}: {
  policies: Policy[];
  audits: Audit[];
  issues: Issue[];
  departments: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [modal, setModal] = useState<null | "policy" | "audit" | "issue">(null);
  const [pForm, setPForm] = useState({ title: "", body: "", category: "Governance", status: "Published" });
  const [aForm, setAForm] = useState({ title: "", type: "Internal", result: "Pass", departmentId: "", notes: "" });
  const [iForm, setIForm] = useState({ title: "", severity: "Medium", departmentId: "" });

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>, close = false) =>
    startTransition(async () => {
      const res = await fn();
      res.ok ? toast.success(res.message) : toast.error(res.error);
      if (close) setModal(null);
      router.refresh();
    });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Policies */}
      <div className="card">
        <Header icon="FileText" title="Policies" sub="Acknowledge and manage" action={canManage && (
          <button onClick={() => setModal("policy")} className="btn-primary btn-sm"><Icon name="Plus" className="h-3.5 w-3.5" /> Policy</button>
        )} />
        <div className="space-y-2.5">
          <AnimatePresence>
            {policies.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-xl border border-line/[0.08] bg-line/[0.02] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-50">{p.title}</span>
                  <StatusPill status={p.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.body}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="chip">{p.category}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Icon name="Check" className="h-3 w-3 text-accent" /> {p.acks} acknowledged
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {p.status === "Published" && (
                      p.ackedByMe ? (
                        <span className="chip text-accent"><Icon name="CheckCheck" className="h-3 w-3" /> Acknowledged</span>
                      ) : (
                        <button onClick={() => run(() => acknowledgePolicy(p.id))} disabled={busy} className="btn-primary btn-sm">
                          Acknowledge
                        </button>
                      )
                    )}
                    {canManage && (
                      <>
                        {p.status !== "Published" && (
                          <button onClick={() => run(() => setPolicyStatus(p.id, "Published"))} disabled={busy} className="btn-ghost btn-sm">Publish</button>
                        )}
                        {p.status !== "Archived" && (
                          <button onClick={() => run(() => setPolicyStatus(p.id, "Archived"))} disabled={busy} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200"><Icon name="Archive" className="h-3.5 w-3.5" /></button>
                        )}
                        <button onClick={() => run(() => deletePolicy(p.id))} disabled={busy} className="rounded-lg p-1.5 text-slate-500 hover:bg-danger/10 hover:text-danger"><Icon name="Trash2" className="h-3.5 w-3.5" /></button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Audits + Issues */}
      <div className="space-y-6">
        <div className="card">
          <Header icon="ClipboardList" title="Audits" sub="Outcomes log" action={canManage && (
            <button onClick={() => setModal("audit")} className="btn-primary btn-sm"><Icon name="Plus" className="h-3.5 w-3.5" /> Audit</button>
          )} />
          <div className="space-y-1.5">
            <AnimatePresence>
              {audits.map((a) => (
                <motion.div key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-line/[0.03]">
                  <Icon name={a.result === "Pass" ? "CircleCheck" : a.result === "Fail" ? "CircleX" : "CircleDot"}
                    className={`h-4 w-4 ${a.result === "Pass" ? "text-accent" : a.result === "Fail" ? "text-danger" : "text-slate-400"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{a.title}</div>
                    <div className="text-xs text-slate-500">{a.type} · {a.department ?? "Org"} · {shortDate(a.date)}</div>
                  </div>
                  <StatusPill status={a.result} />
                  {canManage && (
                    <button onClick={() => run(() => deleteAudit(a.id))} disabled={busy} className="rounded p-1 text-slate-500 hover:text-danger"><Icon name="X" className="h-3.5 w-3.5" /></button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="card">
          <Header icon="TriangleAlert" title="Compliance issues" sub="Track to resolution" action={canManage && (
            <button onClick={() => setModal("issue")} className="btn-primary btn-sm"><Icon name="Plus" className="h-3.5 w-3.5" /> Issue</button>
          )} />
          <div className="space-y-1.5">
            <AnimatePresence>
              {issues.map((i) => (
                <motion.div key={i.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-line/[0.03]">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{i.title}</div>
                    <div className="text-xs text-slate-500">{i.department ?? "Org"} · raised {shortDate(i.raisedAt)}</div>
                  </div>
                  <StatusPill status={i.severity} />
                  {canManage ? (
                    <select
                      value={i.status}
                      onChange={(e) => run(() => setIssueStatus(i.id, e.target.value))}
                      disabled={busy}
                      className="rounded-lg border border-line/12 bg-ink-900 px-2 py-1 text-xs text-slate-200"
                    >
                      {ISSUE_STATUS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <StatusPill status={i.status} />
                  )}
                  {canManage && (
                    <button onClick={() => run(() => deleteIssue(i.id))} disabled={busy} className="rounded p-1 text-slate-500 hover:text-danger"><Icon name="X" className="h-3.5 w-3.5" /></button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Policy modal */}
      <Modal open={modal === "policy"} onClose={() => setModal(null)} title="New policy" icon="FileText">
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={pForm.title} onChange={(e) => setPForm({ ...pForm, title: e.target.value })} /></div>
          <div><label className="label">Body</label><textarea className="input min-h-[80px]" value={pForm.body} onChange={(e) => setPForm({ ...pForm, body: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Category</label><select className="input" value={pForm.category} onChange={(e) => setPForm({ ...pForm, category: e.target.value })}>{POLICY_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Status</label><select className="input" value={pForm.status} onChange={(e) => setPForm({ ...pForm, status: e.target.value })}><option>Published</option><option>Draft</option></select></div>
          </div>
          <div className="flex justify-end gap-2"><button onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
            <button onClick={() => run(() => createPolicy(pForm), true)} disabled={busy} className="btn-primary"><Icon name="Check" className="h-4 w-4" /> Create</button></div>
        </div>
      </Modal>

      {/* Audit modal */}
      <Modal open={modal === "audit"} onClose={() => setModal(null)} title="Log an audit" icon="ClipboardList">
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={aForm.title} onChange={(e) => setAForm({ ...aForm, title: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Type</label><select className="input" value={aForm.type} onChange={(e) => setAForm({ ...aForm, type: e.target.value })}><option>Internal</option><option>External</option></select></div>
            <div><label className="label">Result</label><select className="input" value={aForm.result} onChange={(e) => setAForm({ ...aForm, result: e.target.value })}>{AUDIT_RESULTS.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div><label className="label">Dept</label><select className="input" value={aForm.departmentId} onChange={(e) => setAForm({ ...aForm, departmentId: e.target.value })}><option value="">Org</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          </div>
          <div className="flex justify-end gap-2"><button onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
            <button onClick={() => run(() => createAudit(aForm), true)} disabled={busy} className="btn-primary"><Icon name="Check" className="h-4 w-4" /> Log</button></div>
        </div>
      </Modal>

      {/* Issue modal */}
      <Modal open={modal === "issue"} onClose={() => setModal(null)} title="Raise a compliance issue" icon="TriangleAlert">
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={iForm.title} onChange={(e) => setIForm({ ...iForm, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Severity</label><select className="input" value={iForm.severity} onChange={(e) => setIForm({ ...iForm, severity: e.target.value })}>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label className="label">Department</label><select className="input" value={iForm.departmentId} onChange={(e) => setIForm({ ...iForm, departmentId: e.target.value })}><option value="">Org</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          </div>
          <div className="flex justify-end gap-2"><button onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
            <button onClick={() => run(() => createIssue(iForm), true)} disabled={busy} className="btn-primary"><Icon name="Check" className="h-4 w-4" /> Raise</button></div>
        </div>
      </Modal>
    </div>
  );
}

function Header({ icon, title, sub, action }: { icon: string; title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon name={icon} className="h-4 w-4 text-slate-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
