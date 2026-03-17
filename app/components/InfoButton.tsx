"use client";

import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import Modal from "./Modal";

interface InfoButtonProps {
  /** Modal title */
  title: string;
  /** Content to render inside the modal */
  children: ReactNode;
}

/**
 * Small ⓘ button that opens a modal with the provided content.
 */
export default function InfoButton({ title, children }: InfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Mas informacion sobre ${title}`}
        className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-card-hover)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        <Info size={14} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        {children}
      </Modal>
    </>
  );
}
