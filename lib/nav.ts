export type NavItem = {
  label: string;
  href: string;
  icon: string; // lucide icon name
  roles?: string[]; // if set, only these roles see it
  badge?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

// Navigation is grouped by ESG pillar so the product story reads top-to-bottom.
export const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "ESG Dashboard", href: "/", icon: "LayoutDashboard" },
      { label: "ESG Copilot", href: "/copilot", icon: "Sparkles", badge: "AI" },
      { label: "What-if Simulator", href: "/simulator", icon: "FlaskConical" },
      { label: "Activity Feed", href: "/activity", icon: "Activity" },
    ],
  },
  {
    title: "Environmental",
    items: [
      { label: "Carbon Dashboard", href: "/environmental", icon: "Leaf" },
      { label: "Operations", href: "/environmental/operations", icon: "Factory" },
      { label: "Carbon Ledger", href: "/environmental/carbon", icon: "Gauge" },
      { label: "Carbon Forecast", href: "/environmental/forecast", icon: "TrendingUp" },
      { label: "Emission Factors", href: "/environmental/factors", icon: "Sigma" },
      { label: "Goals", href: "/environmental/goals", icon: "Target" },
    ],
  },
  {
    title: "Gamification",
    items: [
      { label: "Challenges", href: "/gamification/challenges", icon: "Trophy" },
      { label: "Rewards", href: "/gamification/rewards", icon: "Gift" },
      { label: "Leaderboard", href: "/gamification/leaderboard", icon: "Medal" },
      { label: "Badges", href: "/gamification/badges", icon: "Award" },
    ],
  },
  {
    title: "Social & Governance",
    items: [
      { label: "Social (CSR)", href: "/social", icon: "HeartHandshake" },
      { label: "Governance", href: "/governance", icon: "Scale" },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        label: "ESG Configuration",
        href: "/settings",
        icon: "SlidersHorizontal",
        roles: ["Admin", "Manager"],
      },
    ],
  },
];

export function visibleNav(role: string): NavSection[] {
  return NAV.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || item.roles.includes(role),
    ),
  })).filter((section) => section.items.length > 0);
}
