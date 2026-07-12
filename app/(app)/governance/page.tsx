import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { GovernanceBoard, type Policy, type Audit, type Issue } from "@/components/governance/GovernanceBoard";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const user = await getCurrentUser();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [policies, audits, issues, departments] = await Promise.all([
    prisma.eSGPolicy.findMany({
      include: { acks: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.audit.findMany({ include: { department: true }, orderBy: { date: "desc" } }),
    prisma.complianceIssue.findMany({ include: { department: true }, orderBy: { raisedAt: "desc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  const passRate = audits.length
    ? Math.round((audits.filter((a) => a.result === "Pass").length / audits.length) * 100)
    : 0;
  const openIssues = issues.filter((i) => i.status !== "Resolved").length;
  const critical = issues.filter((i) => i.severity === "Critical").length;

  const policyData: Policy[] = policies.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    category: p.category,
    status: p.status,
    acks: p.acks.length,
    ackedByMe: p.acks.some((a) => a.employeeId === user?.id),
  }));
  const auditData: Audit[] = audits.map((a) => ({
    id: a.id, title: a.title, type: a.type, result: a.result,
    department: a.department?.name ?? null, date: a.date.toISOString(),
  }));
  const issueData: Issue[] = issues.map((i) => ({
    id: i.id, title: i.title, severity: i.severity, status: i.status,
    department: i.department?.name ?? null, raisedAt: i.raisedAt.toISOString(),
  }));

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Policies, Audits & Compliance"
        icon="Scale"
        accent="#71717A"
        description="Publish and acknowledge policies, log audits, and drive compliance issues to resolution."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Policies" value={policies.length} icon="FileText" accent="#FFE600" />
        <StatCard label="Audit pass rate" value={`${passRate}%`} icon="ShieldCheck" accent="#34D399" hint={`${audits.length} audits`} />
        <StatCard label="Open issues" value={openIssues} icon="AlertTriangle" accent="#FFE600" />
        <StatCard label="Critical" value={critical} icon="ShieldAlert" accent={critical ? "#FF5C4A" : "#34D399"} />
      </div>

      <GovernanceBoard
        policies={policyData}
        audits={auditData}
        issues={issueData}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        canManage={canManage}
      />
    </div>
  );
}
