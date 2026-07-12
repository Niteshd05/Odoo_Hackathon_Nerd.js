"use client";

import { icons, type LucideProps } from "lucide-react";

type IconProps = LucideProps & { name: string };

/**
 * Render a lucide icon by its string name (used by the data-driven nav and
 * badge/reward records that store an icon name).
 */
export function Icon({ name, ...props }: IconProps) {
  const Cmp = icons[name as keyof typeof icons] ?? icons.Circle;
  return <Cmp {...props} />;
}
