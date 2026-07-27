"use client";

import { useEffect } from "react";

/**
 * Global error boundary for the ArgyMetrics app.
 * Displayed when an unhandled error occurs in a route segment.
 * Must be a Client Component to use the `reset` callback.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging (e.g., Sentry, console)
    console.error("[ArgyMetrics] Error de ruta:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--color-negative-bg)" }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-negative)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Algo salió mal
        </h1>
        <p
          className="max-w-sm text-sm leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Ocurrió un error al cargar los datos financieros. Podés intentar
          nuevamente o volver más tarde.
        </p>
      </div>

      <button
        onClick={reset}
        className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{
          background: "var(--color-accent)",
          color: "var(--text-inverted)",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
