import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
}

/**
 * Section divider with an icon and title. Used to separate dashboard sections.
 */
export default function SectionHeader({ title, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={18} style={{ color: "var(--text-muted)" }} />
      <h2
        className="text-sm font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h2>
    </div>
  );
}
