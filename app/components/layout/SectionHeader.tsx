import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  subtitle?: string;
}

/**
 * Section divider with an icon and title. Used to separate dashboard sections.
 */
export default function SectionHeader({ title, icon: Icon, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon size={18} style={{ color: "var(--text-muted)" }} />
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
