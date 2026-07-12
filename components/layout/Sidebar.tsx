"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { visibleNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const sections = visibleNav(role);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-ink-900/40 backdrop-blur-xl lg:flex">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 px-6 py-6">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-env to-env-deep shadow-glow">
          <Icon name="Globe2" className="h-5 w-5 text-ink-950" />
          <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
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

      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-8">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-100",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon
                      name={item.icon}
                      className={cn(
                        "relative h-[18px] w-[18px] transition-colors",
                        active ? "text-env" : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                    <span className="relative flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="relative rounded-md bg-env/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-env-soft">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 px-6 py-4 text-[10px] leading-relaxed text-slate-600">
        Powered by a live scoring engine and an Ollama ESG Copilot.
      </div>
    </aside>
  );
}
