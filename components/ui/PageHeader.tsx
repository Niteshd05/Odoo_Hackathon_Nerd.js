import { Icon } from "./Icon";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  accent = "#34d399",
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: string;
  accent?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${accent}22, transparent)`,
            }}
          >
            <Icon name={icon} className="h-6 w-6" style={{ color: accent }} />
          </div>
        )}
        <div>
          {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
