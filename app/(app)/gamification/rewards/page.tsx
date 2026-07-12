import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionTitle, EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { RewardCatalog } from "@/components/gamification/RewardCatalog";
import { formatNumber, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  const [rewards, redemptions] = await Promise.all([
    prisma.reward.findMany({ where: { status: "Active" }, orderBy: { pointsRequired: "asc" } }),
    prisma.rewardRedemption.findMany({
      include: { reward: true, employee: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Gamification"
        title="Rewards"
        icon="Gift"
        accent="#9CB84A"
        description="Spend points earned from challenges. Redemption checks stock and deducts points."
        actions={
          user && (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Icon name="Coins" className="h-4 w-4 text-gold" />
              <span className="text-sm font-semibold text-white">{formatNumber(user.points)}</span>
              <span className="text-xs text-slate-500">points as {user.name.split(" ")[0]}</span>
            </div>
          )
        }
      />

      {user && (
        <RewardCatalog
          user={{ id: user.id, name: user.name, points: user.points }}
          rewards={rewards.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            pointsRequired: r.pointsRequired,
            stock: r.stock,
            icon: r.icon,
          }))}
        />
      )}

      <div className="card">
        <SectionTitle title="Recent redemptions" subtitle="Latest reward claims across the org" icon="History" />
        {redemptions.length === 0 ? (
          <EmptyState icon="Gift" title="No redemptions yet" description="Be the first to redeem a reward." />
        ) : (
          <div className="space-y-1">
            {redemptions.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-white/[0.03]">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold text-ink-950"
                  style={{ background: r.employee.avatarColor }}
                >
                  {r.employee.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </span>
                <span className="text-sm text-slate-300">
                  <span className="font-medium text-white">{r.employee.name}</span> redeemed{" "}
                  <span className="text-env">{r.reward.name}</span>
                </span>
                <span className="ml-auto text-xs text-slate-500">
                  {formatNumber(r.pointsSpent)} pts · {shortDate(r.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
