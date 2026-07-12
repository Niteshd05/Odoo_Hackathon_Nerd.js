import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SectionTitle, StatusPill } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const [policies, audits, issues] = await Promise.all([
    prisma.eSGPolicy.findMany({
      include: { _count: { select: { acks: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.audit.findMany({ include: { department: true }, orderBy: { date: "desc" } }),
    prisma.complianceIssue.findMany({ include: { department: true }, orderBy: { raisedAt: "desc" } }),
  ]);

  const passRate = audits.length
    ? Math.round((audits.filter((a) => a.result === "Pass").length / audits.length) * 100)
    : 0;
  const openIssues = issues.filter((i) => i.status !== "Resolved").length;
  const critical = issues.filter((i) => i.severity === "Critical").length;

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Policies, Audits & Compliance"
        icon="Scale"
        accent="#a78bfa"
        description="Governance posture across policies, audit outcomes, and open compliance issues."
      />

      <div className="rounded-xl border border-gov/20 bg-gov/[0.06] px-4 py-2.5 text-sm text-gov">
        <Icon name="Info" className="mr-1.5 inline h-4 w-4" />
        The Governance pillar is a seeded, read-only slice for this demo. The acknowledgement and
        audit workflows are intentionally out of scope.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Policies" value={policies.length} icon="FileText" accent="#a78bfa" />
        <StatCard label="Audit pass rate" value={`${passRate}%`} icon="ShieldCheck" accent="#34d399" hint={`${audits.length} audits`} />
        <StatCard label="Open issues" value={openIssues} icon="AlertTriangle" accent="#fbbf24" />
        <StatCard label="Critical" value={critical} icon="ShieldAlert" accent={critical ? "#f87171" : "#34d399"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle title="Policies" subtitle="Published governance policies" icon="FileText" />
          <div className="space-y-2.5">
            {policies.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">{p.title}</span>
                  <StatusPill status={p.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.body}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span className="chip">{p.category}</span>
                  <span className="flex items-center gap-1">
                    <Icon name="Check" className="h-3 w-3 text-env" /> {p._count.acks} acknowledged
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <SectionTitle title="Audits" subtitle="Recent audit outcomes" icon="ClipboardList" />
            <div className="space-y-2">
              {audits.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]">
                  <Icon
                    name={a.result === "Pass" ? "CircleCheck" : a.result === "Fail" ? "CircleX" : "CircleDot"}
                    className={`h-4 w-4 ${a.result === "Pass" ? "text-env" : a.result === "Fail" ? "text-red-400" : "text-gold"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{a.title}</div>
                    <div className="text-xs text-slate-500">{a.type} · {a.department?.name ?? "Org"}</div>
                  </div>
                  <StatusPill status={a.result} />
                  <span className="hidden text-xs text-slate-500 sm:block">{shortDate(a.date)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle title="Compliance issues" subtitle="Open and resolved items" icon="TriangleAlert" />
            <div className="space-y-2">
              {issues.map((i) => (
                <div key={i.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{i.title}</div>
                    <div className="text-xs text-slate-500">{i.department?.name ?? "Org"} · raised {shortDate(i.raisedAt)}</div>
                  </div>
                  <StatusPill status={i.severity} />
                  <StatusPill status={i.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
