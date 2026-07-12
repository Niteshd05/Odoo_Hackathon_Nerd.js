"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { visibleNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function MobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sections = visibleNav(role);

  let itemIndex = 0;

  return (
    <div className="border-b border-line/5 px-4 py-3 lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-line/10 bg-line/5 px-3 py-2 text-sm text-slate-200 transition-all duration-300 hover:border-line/20 hover:bg-line/10"
      >
        <Icon name="Menu" className="h-4 w-4" />
        Menu
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="h-full w-72 overflow-y-auto border-r border-line/[0.08] bg-ink-900/90 backdrop-blur-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-bold text-fg">EcoSphere</span>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1 transition hover:bg-line/10">
                  <Icon name="X" className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              {sections.map((section) => (
                <div key={section.title} className="mb-4">
                  <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const currentIndex = itemIndex++;
                    return (
                      <motion.div
                        key={item.href}
                        custom={currentIndex}
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-200",
                            active
                              ? "bg-line/10 text-fg"
                              : "text-slate-400 hover:bg-line/5 hover:text-slate-200",
                          )}
                        >
                          <Icon name={item.icon} className={cn("h-4 w-4", active && "text-env")} />
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
