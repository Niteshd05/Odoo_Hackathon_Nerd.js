import { forecastDepartments } from "@/lib/forecast";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SectionTitle, ProgressBar } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { formatCO2, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RISK: Record<string, { label: string; color: string; icon: string }> = {
  none: { label: "On track", color: "#FFE600", icon: "CircleCheck" },
  low: { label: "Watch", color: "#A1A1AA", icon: "Eye" },
  medium: { label: "At risk", color: "#FFE600", icon: "TriangleAlert" },
  high: { label: "Will breach", color: "#FF5C4A", icon: "Flame" },
};

export default async function ForecastPage() {
  const forecasts = await forecastDepartments();
  const year = new Date().getFullYear();

  const totalProjected = forecasts.reduce((s, f) => s + f.projectedYearEnd, 0);
  const totalGoal = forecasts.reduce((s, f) => s + (f.goal ?? 0), 0);
  const breaching = forecasts.filter((f) => f.breachRisk === "high" || f.breachRisk === "medium");

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Environmental · Predictive"
        title="Carbon Forecast"
        icon="TrendingUp"
        description={`Trend-based projection of each department's emissions to the end of ${year}, against its cap.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projected year-end" value={formatCO2(totalProjected)} icon="CalendarClock" accent="#FFE600" hint={`${year} total`} />
        <StatCard label="Combined cap" value={formatCO2(totalGoal)} icon="Target" accent="#FFE600" />
        <StatCard
          label="Headroom"
          value={formatCO2(Math.abs(totalGoal - totalProjected))}
          icon={totalProjected > totalGoal ? "TrendingUp" : "TrendingDown"}
          accent={totalProjected > totalGoal ? "#FF5C4A" : "#A1A1AA"}
          hint={totalProjected > totalGoal ? "over cap" : "under cap"}
        />
        <StatCard label="Departments at risk" value={breaching.length} icon="TriangleAlert" accent={breaching.length ? "#FF5C4A" : "#FFE600"} />
      </div>

      {breaching.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#FF5C4A]/25 bg-[#FF5C4A]/[0.07] px-4 py-3 text-sm">
          <Icon name="Flame" className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5C4A]" />
          <span className="text-slate-300">
            <span className="font-semibold text-[#E9AE9A]">{breaching.map((b) => b.name).join(", ")}</span>{" "}
            {breaching.length === 1 ? "is" : "are"} projected to exceed the annual carbon cap on the current trend. Act early to stay compliant.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {forecasts.map((f) => {
          const risk = RISK[f.breachRisk];
          const pct = f.goal ? Math.min(140, (f.projectedYearEnd / f.goal) * 100) : 0;
          return (
            <div key={f.departmentId} className="card">
              <SectionTitle
                title={f.name}
                subtitle={`YTD ${formatNumber(f.actualYTD)} kg · projected ${formatNumber(f.projectedYearEnd)} kg`}
                icon="Building2"
                right={
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                    style={{ borderColor: `${risk.color}55`, color: risk.color, background: `${risk.color}12` }}
                  >
                    <Icon name={risk.icon} className="h-3.5 w-3.5" />
                    {risk.label}
                  </span>
                }
              />
              <ForecastChart data={f.monthly} goal={f.goal} color={risk.color} />
              <div className="mt-4">
                {f.goal ? (
                  <>
                    <ProgressBar value={pct} max={140} accent={risk.color} />
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Projection band {formatNumber(f.bandLow)} - {formatNumber(f.bandHigh)} kg
                      </span>
                      <span style={{ color: risk.color }} className="font-medium">
                        {f.overBy > 0 ? `+${formatNumber(f.overBy)} kg over cap` : `${formatNumber(-f.overBy)} kg under cap`}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">No active goal set for this department.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
