import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://argymetrics.vercel.app"),
  title: "ArgyMetrics — Cotizaciones del dolar y datos financieros de Argentina",
  description:
    "Seguimiento en tiempo real del dolar oficial, blue, MEP, CCL, USDT, riesgo pais e inflacion de Argentina. Datos actualizados automaticamente.",
  keywords: [
    "dolar blue",
    "dolar oficial",
    "dolar MEP",
    "dolar CCL",
    "USDT",
    "riesgo pais",
    "inflacion Argentina",
    "cotizaciones",
    "ArgyMetrics",
  ],
  authors: [{ name: "ArgyMetrics" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ArgyMetrics — Datos financieros de Argentina en tiempo real",
    description:
      "Dolar oficial, blue, MEP, CCL, USDT, riesgo pais e inflacion. Actualizado cada minuto.",
    type: "website",
    locale: "es_AR",
    siteName: "ArgyMetrics",
    url: "https://argymetrics.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ArgyMetrics — Datos financieros de Argentina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArgyMetrics — Datos financieros de Argentina",
    description:
      "Cotizaciones del dolar, riesgo pais e inflacion en tiempo real.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** JSON-LD structured data: WebSite + FinancialService */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://argymetrics.vercel.app/#website",
      url: "https://argymetrics.vercel.app",
      name: "ArgyMetrics",
      description:
        "Panel de datos financieros argentinos en tiempo real: cotizaciones del dolar, riesgo pais e inflacion.",
      inLanguage: "es-AR",
    },
    {
      "@type": "FinancialService",
      "@id": "https://argymetrics.vercel.app/#service",
      name: "ArgyMetrics",
      description:
        "Plataforma de seguimiento financiero argentino con cotizaciones del dolar oficial, blue, MEP, CCL, riesgo pais e inflacion actualizados en tiempo real.",
      url: "https://argymetrics.vercel.app",
      areaServed: "AR",
      availableLanguage: "es-AR",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        {/* Prevent FOUC: apply theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('argymetrics-theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {/* Skip-to-content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
          style={{ background: "var(--color-accent)", color: "var(--text-inverted)" }}
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
