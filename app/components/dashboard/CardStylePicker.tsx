"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, LayoutGrid, RotateCcw } from "lucide-react";
import { Modal } from "@/app/components/modals";

type CardLayout = "compact" | "classic" | "detailed";
type CardShape = "soft" | "round" | "square";

const LAYOUT_KEY = "argymetrics-card-layout";
const SHAPE_KEY = "argymetrics-card-shape";
const DEFAULT_LAYOUT: CardLayout = "classic";
const DEFAULT_SHAPE: CardShape = "soft";

const LAYOUT_OPTIONS: {
  value: CardLayout;
  label: string;
  description: string;
}[] = [
  {
    value: "compact",
    label: "Compacta",
    description: "Más datos en menos espacio. Oculta gráficos y metadatos.",
  },
  {
    value: "classic",
    label: "Clásica",
    description: "El equilibrio actual: valor, gráfico y contexto.",
  },
  {
    value: "detailed",
    label: "Detallada",
    description: "Más aire, valores grandes y todos los metadatos.",
  },
];

const SHAPE_OPTIONS: {
  value: CardShape;
  label: string;
  description: string;
}[] = [
  {
    value: "soft",
    label: "Suave",
    description: "Bordes redondeados, iconos suaves.",
  },
  {
    value: "round",
    label: "Circular",
    description: "Iconos circulares y tarjetas más curvas.",
  },
  {
    value: "square",
    label: "Recta",
    description: "Iconos y tarjetas cuadradas.",
  },
];

function isCardLayout(value: string | null): value is CardLayout {
  return value === "compact" || value === "classic" || value === "detailed";
}

function isCardShape(value: string | null): value is CardShape {
  return value === "soft" || value === "round" || value === "square";
}

function readStoredCardStyle(): { layout: CardLayout; shape: CardShape } {
  if (typeof window === "undefined") {
    return { layout: DEFAULT_LAYOUT, shape: DEFAULT_SHAPE };
  }

  try {
    const layout = localStorage.getItem(LAYOUT_KEY);
    const shape = localStorage.getItem(SHAPE_KEY);
    return {
      layout: isCardLayout(layout) ? layout : DEFAULT_LAYOUT,
      shape: isCardShape(shape) ? shape : DEFAULT_SHAPE,
    };
  } catch {
    return { layout: DEFAULT_LAYOUT, shape: DEFAULT_SHAPE };
  }
}

function applyCardStyle(layout: CardLayout, shape: CardShape) {
  const root = document.documentElement;
  root.dataset.cardLayout = layout;
  root.dataset.cardShape = shape;
}

/**
 * Small style studio for the dashboard cards.
 *
 * The actual styling is CSS-driven through `data-card-layout` and
 * `data-card-shape` on <html>, so server components stay untouched. The
 * preference is persisted in localStorage and applied before paint from the
 * inline script in `app/layout.tsx`.
 */
export default function CardStylePicker({
  showLabel = false,
}: {
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<CardLayout>(DEFAULT_LAYOUT);
  const [shape, setShape] = useState<CardShape>(DEFAULT_SHAPE);

  // Keep CSS in sync when the component mounts. No setState here: the modal
  // reads the current preference from localStorage when it opens.
  useEffect(() => {
    const stored = readStoredCardStyle();
    applyCardStyle(stored.layout, stored.shape);
  }, []);

  function openPicker() {
    const stored = readStoredCardStyle();
    setLayout(stored.layout);
    setShape(stored.shape);
    setOpen(true);
  }

  function updateLayout(nextLayout: CardLayout) {
    setLayout(nextLayout);
    applyCardStyle(nextLayout, shape);
    try {
      localStorage.setItem(LAYOUT_KEY, nextLayout);
    } catch {
      // Private mode or blocked storage: the visual change still applies.
    }
  }

  function updateShape(nextShape: CardShape) {
    setShape(nextShape);
    applyCardStyle(layout, nextShape);
    try {
      localStorage.setItem(SHAPE_KEY, nextShape);
    } catch {
      // Private mode or blocked storage: the visual change still applies.
    }
  }

  function resetStyles() {
    setLayout(DEFAULT_LAYOUT);
    setShape(DEFAULT_SHAPE);
    applyCardStyle(DEFAULT_LAYOUT, DEFAULT_SHAPE);
    try {
      localStorage.removeItem(LAYOUT_KEY);
      localStorage.removeItem(SHAPE_KEY);
    } catch {
      // Ignore storage errors.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        aria-label="Personalizar vista de tarjetas"
        title="Personalizar vista de tarjetas"
        className={
          showLabel
            ? "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-card-hover)]"
            : "flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-card-hover)]"
        }
        style={{ color: "var(--text-secondary)" }}
      >
        <LayoutGrid size={16} />
        {showLabel && <span>Vista de tarjetas</span>}
      </button>

      {open &&
        createPortal(
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Vista de tarjetas"
            size="md"
          >
        <div className="space-y-6">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Elegí cuánta información querés ver y qué forma prefieren las
            tarjetas. La preferencia se guarda en este navegador.
          </p>

          <section aria-labelledby="card-layout-heading">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3
                id="card-layout-heading"
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Diseño
              </h3>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {LAYOUT_OPTIONS.find((option) => option.value === layout)?.label}
              </span>
            </div>

            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              role="group"
              aria-labelledby="card-layout-heading"
            >
              {LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateLayout(option.value)}
                  aria-pressed={layout === option.value}
                  className="card-style-option rounded-xl border p-3 text-left"
                  style={{
                    borderColor: "var(--border-primary)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <CardStylePreview layout={option.value} shape={shape} />
                  <span
                    className="mt-2 flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {option.label}
                    {layout === option.value && (
                      <Check size={14} style={{ color: "var(--color-accent)" }} />
                    )}
                  </span>
                  <span
                    className="mt-1 block text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="card-shape-heading">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3
                id="card-shape-heading"
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Forma
              </h3>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {SHAPE_OPTIONS.find((option) => option.value === shape)?.label}
              </span>
            </div>

            <div
              className="grid grid-cols-3 gap-3"
              role="group"
              aria-labelledby="card-shape-heading"
            >
              {SHAPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateShape(option.value)}
                  aria-pressed={shape === option.value}
                  className="card-style-shape-option rounded-xl border p-3 text-left"
                  style={{
                    borderColor: "var(--border-primary)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <ShapeSwatch shape={option.value} />
                  <span
                    className="mt-1 flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {option.label}
                    {shape === option.value && (
                      <Check size={12} style={{ color: "var(--color-accent)" }} />
                    )}
                  </span>
                  <span
                    className="mt-0.5 block text-[11px] leading-snug"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div
            className="flex items-center justify-between gap-3 border-t pt-4"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <button
              type="button"
              onClick={resetStyles}
              className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-muted)" }}
            >
              <RotateCcw size={13} />
              Restablecer
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "var(--color-accent)",
                color: "var(--text-inverted)",
              }}
            >
              Listo
            </button>
          </div>
        </div>
          </Modal>,
          document.body
        )}
    </>
  );
}

function CardStylePreview({
  layout,
  shape,
}: {
  layout: CardLayout;
  shape: CardShape;
}) {
  return (
    <div
      className="card-style-preview"
      data-card-layout={layout}
      data-card-shape={shape}
      aria-hidden="true"
    >
      <div
        className="metric-card card-style-preview-card flex items-center rounded-xl border p-2"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="metric-card-icon flex shrink-0 items-center justify-center rounded-md"
          style={{
            background: "var(--color-accent-light)",
            color: "var(--color-accent)",
          }}
        >
          <span
            className="block h-2 w-2 rounded-full"
            style={{ background: "currentColor" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="card-style-preview-label" />
          <p
            className="metric-card-value font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            $ 1.250
          </p>
          {layout !== "compact" && (
            <div className="metric-card-sparkline">
              <svg
                className="card-style-preview-sparkline"
                viewBox="0 0 100 16"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 12 L16 9 L30 11 L46 5 L62 8 L78 3 L100 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          )}
          {layout === "detailed" && (
            <div className="metric-card-extra">
              <span className="card-style-preview-meta" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShapeSwatch({ shape }: { shape: CardShape }) {
  const cardRadius = shape === "round" ? 16 : shape === "square" ? 4 : 9;
  const iconRadius = shape === "round" ? 999 : shape === "square" ? 3 : 6;

  return (
    <div className="flex h-10 items-center justify-center">
      <div
        className="flex h-9 w-14 items-center gap-1.5 border p-1.5"
        style={{
          borderRadius: cardRadius,
          borderColor: "var(--border-primary)",
          background: "var(--bg-primary)",
        }}
      >
        <span
          className="block h-4 w-4 shrink-0"
          style={{
            borderRadius: iconRadius,
            background: "var(--color-accent)",
          }}
        />
        <span
          className="block h-1.5 w-5 rounded-full"
          style={{ background: "var(--border-primary)" }}
        />
      </div>
    </div>
  );
}
