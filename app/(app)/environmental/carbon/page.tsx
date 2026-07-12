import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { formatCO2, shortDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CarbonLedgerPage() {
  const [transactions, agg, anomalyCount, autoCount] = await Promise.all([
    prisma.carbonTransaction.findMany({
      include: { department: true, emissionFactor: true, operationRecord: true },
      orderBy: [{ anomaly: "desc" }, { date: "desc" }],
      take: 80,
    }),
    prisma.carbonTransaction.aggregate({ _sum: { computedCO2: true }, _count: true }),
    prisma.carbonTransaction.count({ where: { anomaly: true } }),
    prisma.carbonTransaction.count({ where: { auto: true } }),
  ]);

  const total = agg._sum.computedCO2 ?? 0;
  const count = agg._count;

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Environmental"
        title="Carbon Ledger"
        icon="Gauge"
        description="Every carbon transaction, auto-derived from operations, with statistical anomaly flags."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total CO2" value={formatCO2(total)} icon="Cloud" accent="#34d399" />
        <StatCard label="Transactions" value={formatNumber(count)} icon="Rows3" accent="#38bdf8" />
        <StatCard label="Auto-calculated" value={`${count ? Math.round((autoCount / count) * 100) : 0}%`} icon="Zap" accent="#fbbf24" hint="of all records" />
        <StatCard label="Anomalies flagged" value={anomalyCount} icon="AlertTriangle" accent={anomalyCount ? "#f87171" : "#34d399"} hint="outlier detection" />
      </div>

      <div className="card">
        {transactions.length === 0 ? (
          <EmptyState icon="Gauge" title="No carbon transactions" description="Record operations to populate the ledger." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 text-right font-medium">Quantity</th>
                  <th className="pb-3 text-right font-medium">Factor</th>
                  <th className="pb-3 text-right font-medium">CO2</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    className={
                      t.anomaly
                        ? "border-b border-red-400/20 bg-red-400/[0.05]"
                        : "table-row"
                    }
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {t.anomaly && (
                          <span title={t.anomalyReason ?? "Anomaly"}>
                            <Icon name="AlertTriangle" className="h-4 w-4 shrink-0 text-red-400" />
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-white">
                            {t.operationRecord?.type ?? "Manual"}
                          </div>
                          <div className="text-xs text-slate-500">{t.emissionFactor.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{t.department.name}</td>
                    <td className="py-3 text-right text-slate-300">{formatNumber(t.quantity)}</td>
                    <td className="py-3 text-right text-slate-500">{t.emissionFactor.factor}</td>
                    <td className="py-3 text-right">
                      <span className={t.anomaly ? "font-bold text-red-300" : "font-semibold text-env-soft"}>
                        {formatCO2(t.computedCO2)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">{shortDate(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {anomalyCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-slate-300">
          <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>
            Anomalies are flagged when a transaction is a strong statistical outlier (over 2.2
            standard deviations and more than 2x the department mean for its source type). Hover
            the warning icon for the reason.
          </span>
        </div>
      )}
    </div>
  );
}
