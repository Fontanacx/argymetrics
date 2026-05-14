"use client";

import { useEffect, useCallback, useState, type ReactNode } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "fullscreen";
  allowFullscreen?: boolean;
}

/**
 * Reusable modal with backdrop, close button, and keyboard escape support.
 * Uses a portal-less approach (renders in-place) for simplicity.
 */
export default function Modal({ open, onClose, title, children, size = "md", allowFullscreen = false }: ModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) {
      setIsMaximized(false);
      return;
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const currentSize = isMaximized ? "fullscreen" : size;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto ${
        currentSize === "fullscreen" ? "p-0 sm:p-4" : "p-4 sm:p-8"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative z-10 flex flex-col animate-fade-in shadow-xl ${
          currentSize === "fullscreen"
            ? "w-full h-full max-w-none max-h-none border-0 sm:rounded-2xl sm:border"
            : `w-full rounded-2xl border ${
                currentSize === "sm" ? "max-w-md" : currentSize === "lg" ? "max-w-4xl" : "max-w-2xl"
              }`
        }`}
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4 shrink-0"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          <div className="flex items-center gap-1">
            {allowFullscreen && currentSize !== "fullscreen" && (
              <button
                onClick={() => setIsMaximized(true)}
                aria-label="Maximizar"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Maximize2 size={16} />
              </button>
            )}
            {allowFullscreen && currentSize === "fullscreen" && isMaximized && (
              <button
                onClick={() => setIsMaximized(false)}
                aria-label="Restaurar"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Minimize2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-5 flex flex-col ${currentSize === "fullscreen" ? "flex-1 overflow-y-auto min-h-0" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
