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
        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-secondary)] active:scale-95 active:bg-[var(--bg-secondary)]"
        style={{ color: "var(--text-muted)" }}
      >
        <Info size={16} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title} allowFullscreen size="lg">
        {children}
      </Modal>
    </>
  );
}
