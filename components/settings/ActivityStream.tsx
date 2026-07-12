"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { shortDate } from "@/lib/utils";

export type ActivityItem = {
  id: string;
  type: "carbon" | "challenge" | "badge" | "config" | "audit" | "policy";
  title: string;
  description: string;
  actor: string;
  actorColor: string;
  timestamp: Date | string;
};

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  carbon: { icon: "Factory", color: "#FFE600" },
  challenge: { icon: "Trophy", color: "#A1A1AA" },
  badge: { icon: "Award", color: "#FFE600" },
  config: { icon: "SlidersHorizontal", color: "#71717A" },
  audit: { icon: "ClipboardCheck", color: "#C4C4CC" },
  policy: { icon: "FileText", color: "#9A9AA2" },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ActivityStream({ activities }: { activities: ActivityItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="card"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-social/25 to-transparent">
          <Icon name="Activity" className="h-4 w-4 text-social-soft" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-fg">Backend Activity Stream</h3>
          <p className="text-xs text-slate-500">Recent system events and actions</p>
        </div>
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-social animate-breathing" />
          Live
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

        <div className="space-y-1">
          {activities.map((activity, i) => {
            const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.config;
            return (
              <motion.div
                key={activity.id}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="group relative flex items-start gap-3 rounded-lg px-2 py-2.5 transition-all duration-300 hover:bg-line/[0.03]"
              >
                {/* Timeline dot */}
                <div className="relative z-10 mt-0.5">
                  <div
                    className="grid h-[28px] w-[28px] place-items-center rounded-lg border border-line/10 transition-all duration-300 group-hover:border-line/20"
                    style={{ background: `${config.color}15` }}
                  >
                    <Icon name={config.icon} className="h-3.5 w-3.5" style={{ color: config.color }} />
                  </div>
                  {/* Pulsing ring on latest item */}
                  {i === 0 && (
                    <span
                      className="absolute inset-0 rounded-lg animate-pulse-ring border"
                      style={{ borderColor: config.color + "40" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-fg truncate">{activity.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{activity.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-[#0a0a0a]"
                      style={{ background: activity.actorColor }}
                    >
                      {activity.actor[0]}
                    </span>
                    <span>{activity.actor}</span>
                    <span>·</span>
                    <span>{shortDate(activity.timestamp)}</span>
                  </div>
                </div>

                {/* Type badge */}
                <span
                  className="mt-1 shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                  style={{ background: `${config.color}15`, color: config.color }}
                >
                  {activity.type}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {activities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon name="Activity" className="h-8 w-8 text-slate-600 animate-float" />
          <p className="mt-3 text-sm text-slate-500">No recent activity</p>
        </div>
      )}
    </motion.div>
  );
}
