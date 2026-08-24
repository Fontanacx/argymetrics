import { BrandLogo } from "@/app/components/layout";

/** Brand-led dashboard masthead with the page's primary SEO heading. */
export default function DashboardIntro() {
  return (
    <section className="brand-hero mb-8" aria-labelledby="dashboard-title">
      <div className="brand-hero-grid">
        <div className="brand-hero-copy">
          <p className="brand-hero-eyebrow">
            <span className="brand-hero-eyebrow-dot" aria-hidden="true" />
            Argentina / mercados en vivo
          </p>
          <h1 id="dashboard-title">
            El pulso financiero de Argentina, en una sola pantalla.
          </h1>
          <p className="brand-hero-description">
            Cotizaciones del dólar, indicadores, acciones y criptomonedas para
            leer el mercado con contexto y claridad.
          </p>
          <div className="brand-hero-meta" aria-label="Características del panel">
            <span>
              <span className="brand-hero-status-dot" aria-hidden="true" />
              Actualización automática
            </span>
            <span className="brand-hero-meta-divider" aria-hidden="true" />
            <span>Fuentes públicas verificables</span>
          </div>
        </div>

        <div className="brand-hero-mark" aria-hidden="true">
          <div className="brand-hero-mark-ring" />
          <BrandLogo
            variant="mark"
            alt=""
            className="relative z-10 h-auto w-28 sm:w-52"
            sizes="(min-width: 640px) 208px, 112px"
          />
        </div>
      </div>
    </section>
  );
}
