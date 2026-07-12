import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { parseRule, ruleLabel, TIER_STYLE } from "@/lib/badges";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  const [badges, totalEmployees] = await Promise.all([
    prisma.badge.findMany({
      include: {
        employees: { include: { employee: true }, orderBy: { awardedAt: "desc" } },
      },
    }),
    prisma.employee.count(),
  ]);

  // Order by rarity (fewest holders first feels aspirational).
  const ordered = [...badges].sort((a, b) => a.employees.length - b.employees.length);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Gamification"
        title="Badges"
        icon="Award"
        accent="#E0A838"
        description="Auto-awarded the moment an employee meets the unlock rule. Rarer badges sit first."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((b) => {
          const tier = TIER_STYLE[b.tier] ?? TIER_STYLE.Bronze;
          const rule = parseRule(b.unlockRule);
          const holders = b.employees.length;
          const pct = totalEmployees ? Math.round((holders / totalEmployees) * 100) : 0;
          return (
            <div key={b.id} className="card glass-hover flex flex-col">
              <div className="flex items-center gap-4">
                <div
                  className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border-2"
                  style={{
                    borderColor: tier.ring,
                    background: `radial-gradient(circle, ${tier.glow}, transparent 75%)`,
                  }}
                >
                  <Icon name={b.icon} className="h-7 w-7" style={{ color: tier.text }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{b.name}</h3>
                  </div>
                  <span
                    className="mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{ background: `${tier.ring}22`, color: tier.text }}
                  >
                    {b.tier}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-400">{b.description}</p>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <Icon name="Lock" className="h-3.5 w-3.5" />
                {rule ? ruleLabel(rule) : "Special"}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex -space-x-2">
                  {b.employees.slice(0, 5).map((eb) => (
                    <span
                      key={eb.id}
                      title={eb.employee.name}
                      className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink-850 text-[9px] font-bold text-ink-950"
                      style={{ background: eb.employee.avatarColor }}
                    >
                      {eb.employee.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                    </span>
                  ))}
                  {holders === 0 && (
                    <span className="text-xs text-slate-600">Not yet earned</span>
                  )}
                  {holders > 5 && (
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink-850 bg-white/10 text-[9px] font-bold text-slate-300">
                      +{holders - 5}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {formatNumber(holders)} earned · {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
