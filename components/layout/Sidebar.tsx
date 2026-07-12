"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { visibleNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const sections = visibleNav(role);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/30 backdrop-blur-2xl lg:flex relative overflow-hidden">
      {/* Animated aurora glow at top */}
      <div className="pointer-events-none absolute -top-20 left-0 right-0 h-40 bg-gradient-to-b from-env/[0.06] via-gov/[0.04] to-transparent animate-glow-pulse" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute top-[20%] left-[15%] h-1 w-1 rounded-full bg-env/40 animate-particle-float" />
        <span className="absolute top-[50%] left-[70%] h-1.5 w-1.5 rounded-full bg-gov/30 animate-particle-float" style={{ animationDelay: "2s" }} />
        <span className="absolute top-[75%] left-[40%] h-1 w-1 rounded-full bg-social/30 animate-particle-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Brand */}
      <Link href="/" className="group relative flex items-center gap-3 px-6 py-6">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-env to-env-deep shadow-glow transition-shadow duration-500 group-hover:shadow-glow-lg">
          <Icon name="Globe2" className="h-5 w-5 text-ink-950 transition-transform duration-700 group-hover:rotate-[20deg]" />
          <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
          {/* Glow pulse behind logo */}
          <span className="absolute inset-0 rounded-xl bg-env/20 animate-glow-pulse" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-white">
            EcoSphere
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            ESG Platform
          </div>
        </div>
      </Link>

      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-8"
      >
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <motion.div key={item.href} variants={itemVariants}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300",
                        active
                          ? "text-white"
                          : "text-slate-400 hover:text-slate-100",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl border border-white/[0.12] bg-white/[0.06]"
                          style={{
                            boxShadow: "0 0 20px -8px rgba(52, 211, 153, 0.3), inset 0 1px 0 0 rgba(255,255,255,0.05)",
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Icon
                        name={item.icon}
                        className={cn(
                          "relative h-[18px] w-[18px] transition-all duration-300",
                          active ? "text-env drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "text-slate-500 group-hover:text-slate-300",
                        )}
                      />
                      <span className="relative flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="relative rounded-md bg-env/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-env-soft animate-breathing">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.nav>

      <div className="relative border-t border-white/5 px-6 py-4 text-[10px] leading-relaxed text-slate-600">
        Powered by a live scoring engine and an Ollama ESG Copilot
        <span className="inline-block w-[2px] h-3 ml-0.5 bg-env/50 animate-pulse" />
      </div>
    </aside>
  );
}
