"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { formatNumber } from "@/lib/utils";
import { redeemReward } from "@/lib/actions/gamification";

type Reward = {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  icon: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function RewardCatalog({
  rewards,
  user,
}: {
  rewards: Reward[];
  user: { id: string; name: string; points: number };
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const redeem = (r: Reward) => {
    setRedeeming(r.id);
    startTransition(async () => {
      const res = await redeemReward(r.id, user.id);
      if (res.ok) {
        toast.success(res.message, {
          icon: <Icon name="Gift" className="h-4 w-4 text-env" />,
        });
        router.refresh();
      } else {
        toast.error(res.error);
      }
      setRedeeming(null);
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rewards.map((r, i) => {
        const affordable = user.points >= r.pointsRequired;
        const inStock = r.stock > 0;
        const canRedeem = affordable && inStock && !busy;
        return (
          <motion.div
            key={r.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -4 }}
            className="card glass-hover flex flex-col relative overflow-hidden"
          >
            {/* Glow on affordable items */}
            {canRedeem && (
              <div className="pointer-events-none absolute inset-0 animate-glow-pulse opacity-30">
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 40px rgba(52,211,153,0.1)" }} />
              </div>
            )}

            <div className="flex items-start justify-between relative z-10">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-env/20 to-transparent">
                <Icon name={r.icon} className="h-6 w-6 text-env" />
              </div>
              <span
                className={`chip ${inStock ? "" : "text-red-400"}`}
              >
                {inStock ? `${r.stock} in stock` : "Out of stock"}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-fg relative z-10">{r.name}</h3>
            <p className="mt-1 flex-1 text-xs text-slate-500 relative z-10">{r.description}</p>

            <div className="mt-4 flex items-center justify-between relative z-10">
              <span className="flex items-center gap-1.5 text-lg font-bold text-fg">
                <Icon name="Coins" className="h-4 w-4 text-gold" />
                {formatNumber(r.pointsRequired)}
                <span className="text-xs font-normal text-slate-500">pts</span>
              </span>
              <motion.button
                onClick={() => redeem(r)}
                disabled={!canRedeem}
                className={canRedeem ? "btn-primary btn-sm" : "btn-ghost btn-sm"}
                whileHover={canRedeem ? { scale: 1.05 } : {}}
                whileTap={canRedeem ? { scale: 0.95 } : {}}
                style={canRedeem ? { boxShadow: "0 0 20px -6px rgba(52,211,153,0.4)" } : {}}
              >
                {redeeming === r.id ? (
                  <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
                ) : !inStock ? (
                  "Sold out"
                ) : !affordable ? (
                  `Need ${formatNumber(r.pointsRequired - user.points)} more`
                ) : (
                  <>
                    <Icon name="Sparkles" className="h-3.5 w-3.5" />
                    Redeem
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
