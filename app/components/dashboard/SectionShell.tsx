import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "@/app/components/layout";

interface SectionShellProps {
  /** HTML anchor id (e.g. "divisas") */
  id?: string;
  title: string;
  icon: LucideIcon;
  subtitle?: string;
  /** Optional node rendered on the right side of the header row */
  right?: ReactNode;
  children: ReactNode;
}

/**
 * Standard section wrapper shared by dashboard sections and their
 * Suspense skeletons, so the header markup never diverges between
 * the loading state and the loaded content.
 */
export default function SectionShell({ id, title, icon, subtitle, right, children }: SectionShellProps) {
  return (
    <section id={id} className="mb-8">
      <div className={`mb-4${right ? " flex items-center justify-between" : ""}`}>
        <SectionHeader title={title} icon={icon} subtitle={subtitle} />
        {right}
      </div>
      {children}
    </section>
  );
}
