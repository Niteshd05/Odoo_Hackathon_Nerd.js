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
      {rewards.map((r) => {
        const affordable = user.points >= r.pointsRequired;
        const inStock = r.stock > 0;
        const canRedeem = affordable && inStock && !busy;
        return (
          <motion.div
            key={r.id}
            whileHover={{ y: -3 }}
            className="card glass-hover flex flex-col"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-env/20 to-transparent">
                <Icon name={r.icon} className="h-6 w-6 text-env" />
              </div>
              <span
                className={`chip ${inStock ? "" : "text-red-400"}`}
              >
                {inStock ? `${r.stock} in stock` : "Out of stock"}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-white">{r.name}</h3>
            <p className="mt-1 flex-1 text-xs text-slate-500">{r.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-lg font-bold text-white">
                <Icon name="Coins" className="h-4 w-4 text-gold" />
                {formatNumber(r.pointsRequired)}
                <span className="text-xs font-normal text-slate-500">pts</span>
              </span>
              <button
                onClick={() => redeem(r)}
                disabled={!canRedeem}
                className={canRedeem ? "btn-primary btn-sm" : "btn-ghost btn-sm"}
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
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
