import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  icon,
  accent = "#34d399",
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  accent?: string;
  delta?: { value: string; positive: boolean };
  hint?: string;
}) {
  return (
    <div className="card glass-hover group relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {icon && (
          <div
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10"
            style={{ background: `${accent}18` }}
          >
            <Icon name={icon} className="h-4 w-4" style={{ color: accent }} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-white">
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              delta.positive ? "text-env" : "text-red-400",
            )}
          >
            <Icon
              name={delta.positive ? "TrendingUp" : "TrendingDown"}
              className="h-3.5 w-3.5"
            />
            {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    </div>
  );
}
