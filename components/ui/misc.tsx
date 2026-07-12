import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/** Small status pill with a semantic color derived from the status string. */
const STATUS_COLORS: Record<string, string> = {
  // generic
  active: "text-env border-env/30 bg-env/10",
  published: "text-env border-env/30 bg-env/10",
  completed: "text-env border-env/30 bg-env/10",
  approved: "text-env border-env/30 bg-env/10",
  achieved: "text-env border-env/30 bg-env/10",
  pass: "text-env border-env/30 bg-env/10",
  resolved: "text-env border-env/30 bg-env/10",
  draft: "text-slate-400 border-white/15 bg-white/5",
  archived: "text-slate-500 border-white/10 bg-white/5",
  inactive: "text-slate-500 border-white/10 bg-white/5",
  pending: "text-gold border-gold/30 bg-gold/10",
  "under review": "text-gold border-gold/30 bg-gold/10",
  "in progress": "text-gold border-gold/30 bg-gold/10",
  partial: "text-gold border-gold/30 bg-gold/10",
  open: "text-social border-social/30 bg-social/10",
  rejected: "text-red-400 border-red-400/30 bg-red-400/10",
  missed: "text-red-400 border-red-400/30 bg-red-400/10",
  fail: "text-red-400 border-red-400/30 bg-red-400/10",
  critical: "text-red-400 border-red-400/30 bg-red-400/10",
  high: "text-red-400 border-red-400/30 bg-red-400/10",
  medium: "text-gold border-gold/30 bg-gold/10",
  low: "text-slate-400 border-white/15 bg-white/5",
};

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  const cls = STATUS_COLORS[key] ?? "text-slate-300 border-white/15 bg-white/5";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

/** Horizontal progress bar with a value/target semantic. */
export function ProgressBar({
  value,
  max = 100,
  accent = "#34d399",
  className,
  showValue,
}: {
  value: number;
  max?: number;
  accent?: string;
  className?: string;
  showValue?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
            boxShadow: `0 0 12px ${accent}66`,
          }}
        />
      </div>
      {showValue && (
        <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-400">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

export function EmptyState({
  icon = "Inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
        <Icon name={icon} className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Section title used inside cards. */
export function SectionTitle({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {icon && <Icon name={icon} className="h-4 w-4 text-slate-400" />}
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
