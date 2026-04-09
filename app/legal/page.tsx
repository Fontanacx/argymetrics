import type { Metadata } from "next";
import {
  ShieldAlert,
  Lock,
  Database,
  AlertTriangle,
  Code2,
  Mail,
  Scale,
  ExternalLink,
} from "lucide-react";
import { Navbar, Footer, SectionHeader } from "@/app/components/layout";

/* ─────────────────────────────────────────────────────────────────────────────
   SEO Metadata
   ───────────────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Aviso Legal — ArgyMetrics",
  description:
    "Política de privacidad, descargo de responsabilidad, fuentes de datos y transparencia de ArgyMetrics.",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Shared card shell styles — inline-style objects extracted as constants
   to keep JSX readable and avoid repetition.
   ───────────────────────────────────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  borderColor: "var(--border-primary)",
  boxShadow: "var(--shadow-card)",
};

/** Colored top accent strip rendered as a plain <div> (no pseudo-element needed). */
function CardAccent() {
  return (
    <div
      style={{
        height: 3,
        background: "var(--color-accent)",
        borderRadius: "12px 12px 0 0",
        marginTop: "-1.5rem",   // pull up to sit above the <section> padding
        marginLeft: "-1.5rem",
        marginRight: "-1.5rem",
        marginBottom: "1.25rem",
      }}
    />
  );
}

/** Reusable card title row: icon + <h2>. */
function CardTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon
        size={18}
        style={{ color: "var(--color-accent)", flexShrink: 0 }}
        aria-hidden="true"
      />
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {children}
      </h2>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Data sources list — kept as data so the JSX stays clean.
   ───────────────────────────────────────────────────────────────────────────── */
const DATA_SOURCES = [
  {
    name: "DolarAPI",
    url: "https://dolarapi.com",
    description: "Cotizaciones USD/EUR/BRL, tipos de cambio billetera y variantes del dólar.",
  },
  {
    name: "ArgentinaDatos",
    url: "https://api.argentinadatos.com",
    description: "Series históricas del dólar, Riesgo País e Inflación (IPC — INDEC).",
  },
  {
    name: "Yahoo Finance",
    url: "https://query1.finance.yahoo.com",
    description: "Commodities (Oro, Brent, Gas Natural), acciones BYMA e índices bursátiles.",
  },
  {
    name: "CriptoYa",
    url: "https://criptoya.com/api",
    description: "Precios de criptomonedas (BTC, ETH) en el mercado argentino.",
  },
  {
    name: "Ámbito Financiero",
    url: "https://mercados.ambito.com",
    description: "Variantes del tipo de cambio del Real Brasileño.",
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Page — fully static, no "use client" required.
   ───────────────────────────────────────────────────────────────────────────── */
export default function LegalPage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* ── Hero header ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionHeader
            title="Aviso Legal"
            icon={Scale}
            subtitle="Transparencia, privacidad y fuentes de datos de ArgyMetrics."
          />
        </div>

        {/* Page h1 for accessibility & SEO (visually represents the hero title) */}
        <h1 className="sr-only">Aviso Legal — ArgyMetrics</h1>

        {/* ── Cards container ─────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* ── 1. Descargo de Responsabilidad ──────────────────────────── */}
          <section
            className="rounded-xl border p-6 sm:p-8"
            style={cardStyle}
            aria-labelledby="section-disclaimer"
          >
            <CardAccent />
            <CardTitle icon={ShieldAlert}>
              <span id="section-disclaimer">Descargo de Responsabilidad</span>
            </CardTitle>

            <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <p>
                ArgyMetrics es una plataforma de carácter <strong>puramente informativo</strong>.
                El contenido publicado <strong>no constituye</strong> asesoramiento financiero,
                de inversión, impositivo ni legal de ningún tipo.
              </p>
              <p>
                La plataforma <strong>no recomienda, avala ni sugiere</strong> la compra, venta
                o tenencia de ningún instrumento financiero, moneda o activo. Cualquier decisión
                financiera debe tomarse con el asesoramiento de un profesional habilitado y
                regulado.
              </p>
              <p>
                ArgyMetrics <strong>no es</strong> un asesor financiero registrado, bróker,
                agente de bolsa ni ninguna entidad financiera regulada bajo la legislación
                argentina o extranjera.
              </p>
            </div>
          </section>

          {/* ── 2. Privacidad y Datos del Usuario ───────────────────────── */}
          <section
            className="rounded-xl border p-6 sm:p-8"
            style={cardStyle}
            aria-labelledby="section-privacy"
          >
            <CardAccent />
            <CardTitle icon={Lock}>
              <span id="section-privacy">Privacidad y Datos del Usuario</span>
            </CardTitle>

            <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <p>
                ArgyMetrics <strong>no recopila, almacena, procesa ni vende</strong> ningún
                dato personal de sus usuarios.
              </p>
              <p>
                No se utilizan cookies de rastreo. No se cargan SDKs de analítica de terceros.
                No existe registro de usuarios ni sistema de inicio de sesión.
              </p>
              <p>
                El único almacenamiento local utilizado es{" "}
                <code
                  className="rounded px-1 py-0.5 text-xs font-mono"
                  style={{
                    background: "var(--color-accent-light)",
                    color: "var(--color-accent)",
                  }}
                >
                  localStorage
                </code>{" "}
                para guardar la preferencia de tema (clave:{" "}
                <code
                  className="rounded px-1 py-0.5 text-xs font-mono"
                  style={{
                    background: "var(--color-accent-light)",
                    color: "var(--color-accent)",
                  }}
                >
                  argymetrics-theme
                </code>
                ). Esta clave no contiene información personal de ningún tipo.
              </p>
              <p>
                No se integran <em>trackers</em> de terceros, píxeles publicitarios ni scripts
                de monetización.
              </p>
            </div>
          </section>

          {/* ── 3. Fuentes de Datos ─────────────────────────────────────── */}
          <section
            className="rounded-xl border p-6 sm:p-8"
            style={cardStyle}
            aria-labelledby="section-sources"
          >
            <CardAccent />
            <CardTitle icon={Database}>
              <span id="section-sources">Fuentes de Datos</span>
            </CardTitle>

            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Todos los datos financieros mostrados provienen de APIs de terceros de acceso
              público. ArgyMetrics <strong>no genera ni produce</strong> datos financieros propios.
              A continuación se detallan las fuentes utilizadas:
            </p>

            {/* Data sources list */}
            <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {DATA_SOURCES.map((source) => (
                <li
                  key={source.name}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:gap-4"
                >
                  {/* Source name — linked */}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link inline-flex items-center gap-1 text-sm font-semibold sm:min-w-40"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {source.name}
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                  {/* Description */}
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {source.description}
                  </span>
                </li>
              ))}
            </ul>

            <p
              className="mt-4 text-xs leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Los datos pueden sufrir demoras, estar temporalmente no disponibles o contener
              inexactitudes propias de las APIs de origen. ArgyMetrics no garantiza la exactitud,
              completitud ni oportunidad de los datos mostrados.
            </p>
          </section>

          {/* ── 4. Precisión de los Datos ───────────────────────────────── */}
          <section
            className="rounded-xl border p-6 sm:p-8"
            style={cardStyle}
            aria-labelledby="section-accuracy"
          >
            <CardAccent />
            <CardTitle icon={AlertTriangle}>
              <span id="section-accuracy">Precisión de los Datos</span>
            </CardTitle>

            <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <p>
                Algunos valores mostrados son <strong>calculados o sintéticos</strong>. Por ejemplo:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Euro Blue</strong>: se calcula como Dólar Blue × 1,086 (tipo de cambio
                  cruzado EUR/USD de referencia).
                </li>
                <li>
                  <strong>Euro Tarjeta</strong>: se calcula como Euro Oficial × 1,6 (incluye el
                  recargo del impuesto PAIS/tarjeta).
                </li>
              </ul>
              <p>
                Los valores de la <strong>Banda de Flotación del BCRA (Crawling Band)</strong> se
                actualizan manualmente y pueden no reflejar cambios oficiales en tiempo real.
              </p>
              <p>
                Los datos de <strong>Inflación del INDEC</strong> se publican con una demora
                aproximada de 6 a 8 semanas respecto del período de referencia.
              </p>
              <p>
                El <strong>Riesgo País</strong> solo se actualiza en días hábiles bursátiles.
              </p>
            </div>
          </section>

          {/* ── 5. Código Abierto ────────────────────────────────────────── */}
          <section
            className="rounded-xl border p-6 sm:p-8"
            style={cardStyle}
            aria-labelledby="section-opensource"
          >
            <CardAccent />
            <CardTitle icon={Code2}>
              <span id="section-opensource">Código Abierto</span>
            </CardTitle>

            <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <p>
                ArgyMetrics es un proyecto de código abierto (<em>open source</em>), desarrollado
                y mantenido por{" "}
                <strong style={{ color: "var(--text-primary)" }}>FontanacDev</strong>.
              </p>

              {/* Links row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                <a
                  href="https://github.com/Fontanacx/argymetrics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link text-sm"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Repositorio en GitHub
                </a>
                <a
                  href="https://fontanacdev.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link text-sm"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Portfolio del desarrollador
                </a>
                <a
                  href="https://x.com/MFontanac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link text-sm"
                >
                  {/* X/Twitter icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  @MFontanac en X
                </a>
              </div>

              {/* Tech stack */}
              <p className="pt-1">
                <span style={{ color: "var(--text-muted)" }}>Stack tecnológico: </span>
                Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts.
                Desplegado en{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Vercel
                </a>
                .
              </p>
            </div>
          </section>

          {/* ── 6. Contacto ─────────────────────────────────────────────── */}
          <section
            className="rounded-xl border p-6 sm:p-8"
            style={cardStyle}
            aria-labelledby="section-contact"
          >
            <CardAccent />
            <CardTitle icon={Mail}>
              <span id="section-contact">Contacto</span>
            </CardTitle>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Para consultas, correcciones de datos o solicitudes de eliminación de contenido
              (DMCA / takedown), podés comunicarte a través de:
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              <a
                href="https://x.com/MFontanac"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link text-sm"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @MFontanac en X / Twitter
              </a>
              <a
                href="https://fontanacdev.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link text-sm"
              >
                <ExternalLink size={13} aria-hidden="true" />
                fontanacdev.netlify.app
              </a>
            </div>
          </section>

        </div>

        {/* ── Last updated note ────────────────────────────────────────────── */}
        <p
          className="mt-10 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Última actualización: Abril 2026
        </p>
      </main>

      <Footer />
    </div>
  );
}
