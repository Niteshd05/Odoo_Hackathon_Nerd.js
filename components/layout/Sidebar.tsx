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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line/[0.06] bg-ink-900/30 backdrop-blur-2xl lg:flex relative overflow-hidden">
      {/* Warm aurora glow at top */}
      <div className="pointer-events-none absolute -top-20 left-0 right-0 h-40 bg-gradient-to-b from-env/[0.06] via-gov/[0.04] to-transparent animate-breathing" />

      {/* Floating motes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-env/40 animate-float" />
        <span className="absolute left-[70%] top-[50%] h-1.5 w-1.5 rounded-full bg-gov/30 animate-float" style={{ animationDelay: "2s" }} />
        <span className="absolute left-[40%] top-[75%] h-1 w-1 rounded-full bg-social/30 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Brand */}
      <Link href="/" className="group relative flex items-center gap-3 px-6 py-6">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-env to-env-deep shadow-glow">
          <Icon name="Globe2" className="h-5 w-5 text-[#0a0a0a] transition-transform duration-700 group-hover:rotate-[20deg]" />
          <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-line/20" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[17px] font-semibold tracking-tight text-slate-50">
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
                          ? "text-fg"
                          : "text-slate-400 hover:text-slate-100",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl border border-line/[0.12] bg-line/[0.06]"
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

      <div className="relative flex items-center gap-2 border-t border-sand/[0.07] px-6 py-4 text-[10px] text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-env/60" />
        Live scoring · v1.0
      </div>
    </aside>
  );
}
