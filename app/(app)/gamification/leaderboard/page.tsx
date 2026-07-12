import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { cn, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PODIUM = [
  { color: "#E0A838", icon: "Crown", label: "1st", h: "h-28" },
  { color: "#cbd5e1", icon: "Medal", label: "2nd", h: "h-20" },
  { color: "#f59e0b", icon: "Medal", label: "3rd", h: "h-16" },
];

export default async function LeaderboardPage() {
  const me = await getCurrentUser();
  const employees = await prisma.employee.findMany({
    include: {
      department: true,
      _count: { select: { badges: true, participations: true } },
    },
    orderBy: { xp: "desc" },
  });

  const top3 = employees.slice(0, 3);
  // Podium display order: 2nd, 1st, 3rd.
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Gamification"
        title="Leaderboard"
        icon="Medal"
        accent="#E0A838"
        description="Employees ranked by lifetime XP earned from sustainability challenges."
      />

      {/* Podium */}
      <div className="card">
        <div className="flex items-end justify-center gap-4 py-4 sm:gap-8">
          {podiumOrder.map((emp) => {
            const rank = employees.indexOf(emp);
            const p = PODIUM[rank];
            return (
              <div key={emp.id} className="flex flex-col items-center">
                <span
                  className="mb-2 grid h-14 w-14 place-items-center rounded-full text-sm font-bold text-ink-950 ring-4"
                  style={{ background: emp.avatarColor, ["--tw-ring-color" as string]: `${p.color}55` }}
                >
                  {emp.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </span>
                <div className="text-sm font-semibold text-white">{emp.name.split(" ")[0]}</div>
                <div className="text-xs text-slate-500">{formatNumber(emp.xp)} XP</div>
                <div
                  className={cn("mt-2 flex w-20 items-start justify-center rounded-t-xl pt-2", p.h)}
                  style={{ background: `linear-gradient(to top, ${p.color}22, ${p.color}08)`, borderTop: `2px solid ${p.color}` }}
                >
                  <Icon name={p.icon} className="h-5 w-5" style={{ color: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full ranking */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 text-right font-medium">Badges</th>
                <th className="pb-3 text-right font-medium">Points</th>
                <th className="pb-3 text-right font-medium">XP</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => {
                const isMe = emp.id === me?.id;
                return (
                  <tr
                    key={emp.id}
                    className={cn("table-row", isMe && "bg-env/[0.06]")}
                  >
                    <td className="py-3">
                      <span
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-lg text-xs font-bold",
                          i < 3 ? "text-ink-950" : "bg-white/5 text-slate-400",
                        )}
                        style={i < 3 ? { background: PODIUM[i].color } : undefined}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold text-ink-950"
                          style={{ background: emp.avatarColor }}
                        >
                          {emp.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                        </span>
                        <div>
                          <div className="font-medium text-white">
                            {emp.name}
                            {isMe && <span className="ml-2 text-[10px] font-semibold text-env">YOU</span>}
                          </div>
                          <div className="text-xs text-slate-500">{emp.title ?? emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">{emp.department?.name ?? "-"}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Icon name="Award" className="h-3.5 w-3.5 text-gold" />
                        {emp._count.badges}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400">{formatNumber(emp.points)}</td>
                    <td className="py-3 text-right font-bold text-white">{formatNumber(emp.xp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
