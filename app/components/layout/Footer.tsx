import Link from "next/link";
import { Globe } from "lucide-react";
import BrandLogo from "./BrandLogo";

/**
 * Minimal fintech-style footer with attribution and creator links.
 * Fully server-rendered — no JS event handlers.
 */
export default function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{ borderColor: "var(--border-primary)" }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-10 text-center">
        {/* Brand */}
        <Link
          href="/"
          className="brand-footer-lockup transition-transform hover:scale-[1.02]"
          aria-label="ArgyMetrics, inicio"
        >
          <BrandLogo
            variant="stacked"
            className="h-auto w-28 sm:w-32"
            sizes="128px"
          />
        </Link>
        <p className="-mt-2 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
          Datos para entender el mercado
        </p>

        {/* Attribution & disclaimer */}
        <div className="max-w-xl space-y-1">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Datos provistos por{" "}
            <a href="https://dolarapi.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              DolarAPI
            </a>
            {", "}
            <a href="https://api.indec.gob.ar" target="_blank" rel="noopener noreferrer" className="footer-link">
              INDEC
            </a>
            {", "}
            <a href="https://comparapix.ar" target="_blank" rel="noopener noreferrer" className="footer-link">
              ComparaPix
            </a>
            {", "}
            <a href="https://criptoya.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              CriptoYa
            </a>
            {" y "}
            <a href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              Yahoo Finance
            </a>
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            La informacion es de caracter informativo y no constituye asesoramiento financiero.
          </p>
        </div>

        {/* Creator */}
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Creado por{" "}
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            FontanacDev
          </span>
        </p>

        {/* Links row */}
        <div className="flex items-center gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
          <a
            href="https://fontanacdev.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <Globe size={14} />
            fontanacdev.netlify.app
          </a>
          <a
            href="https://x.com/MFontanac"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @MFontanac
          </a>
        </div>
      </div>
    </footer>
  );
}
