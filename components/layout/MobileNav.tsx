"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { visibleNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sections = visibleNav(role);

  return (
    <div className="border-b border-white/5 px-4 py-3 lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
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
            className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="h-full w-72 overflow-y-auto border-r border-white/10 bg-ink-900 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-bold text-white">EcoSphere</span>
                <button onClick={() => setOpen(false)}>
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
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2 py-2 text-sm",
                          active
                            ? "bg-white/10 text-white"
                            : "text-slate-400",
                        )}
                      >
                        <Icon name={item.icon} className="h-4 w-4" />
                        {item.label}
                      </Link>
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
