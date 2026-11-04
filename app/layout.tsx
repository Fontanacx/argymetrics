import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import horizontalLogo from "@/logo/logo-horizontal.png";
import icon16 from "@/logo/icon-16x16.png";
import icon32 from "@/logo/icon-32x32.png";
import icon64 from "@/logo/icon-64x64.png";
import icon128 from "@/logo/icon-128x128.png";
import icon256 from "@/logo/icon-256x256.png";
import icon512 from "@/logo/icon-512x512.png";
import favicon from "@/logo/favicon.ico";
import ogImage from "@/logo/og-image-white.png";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://argymetrics.vercel.app";
const logoUrl = new URL(horizontalLogo.src, siteUrl).toString();
const socialImageUrl = new URL(ogImage.src, siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "ArgyMetrics",
  title: "ArgyMetrics | Cotizaciones del dólar y mercados de Argentina",
  description:
    "Panel financiero argentino con dólar oficial, blue, MEP, CCL, riesgo país, inflación, acciones y criptomonedas. Datos actualizados automáticamente.",
  keywords: [
    "dolar blue",
    "dolar oficial",
    "dolar MEP",
    "dolar CCL",
    "USDT",
    "riesgo pais",
    "inflacion Argentina",
    "cotizaciones",
    "precio dolar hoy",
    "mercados argentinos",
    "acciones argentinas",
    "banda cambiaria",
    "ArgyMetrics",
  ],
  authors: [{ name: "ArgyMetrics" }],
  creator: "ArgyMetrics",
  publisher: "ArgyMetrics",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: favicon.src, type: "image/x-icon" },
      { url: icon16.src, sizes: "16x16", type: "image/png" },
      { url: icon32.src, sizes: "32x32", type: "image/png" },
      { url: icon64.src, sizes: "64x64", type: "image/png" },
      { url: icon128.src, sizes: "128x128", type: "image/png" },
      { url: icon256.src, sizes: "256x256", type: "image/png" },
      { url: icon512.src, sizes: "512x512", type: "image/png" },
    ],
    shortcut: favicon.src,
    apple: [{ url: icon256.src, sizes: "256x256", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "ArgyMetrics | Datos financieros de Argentina",
    description:
      "Dólar, riesgo país, inflación, acciones y criptomonedas en un panel claro y actualizado.",
    type: "website",
    locale: "es_AR",
    siteName: "ArgyMetrics",
    url: siteUrl,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "ArgyMetrics — Datos financieros de Argentina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArgyMetrics | Datos financieros de Argentina",
    description:
      "Cotizaciones del dólar, riesgo país e inflación en tiempo real.",
    images: [socialImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#061f58" },
  ],
};

/** JSON-LD structured data: WebSite + FinancialService */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ArgyMetrics",
      description:
        "Panel de datos financieros argentinos en tiempo real: cotizaciones del dolar, riesgo pais e inflacion.",
      inLanguage: "es-AR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ArgyMetrics",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
        width: horizontalLogo.width,
        height: horizontalLogo.height,
      },
    },
    {
      "@type": "FinancialService",
      "@id": `${siteUrl}/#service`,
      name: "ArgyMetrics",
      description:
        "Plataforma de seguimiento financiero argentino con cotizaciones del dolar oficial, blue, MEP, CCL, riesgo pais e inflacion actualizados en tiempo real.",
      url: siteUrl,
      image: logoUrl,
      logo: logoUrl,
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
                  var cardLayout = localStorage.getItem('argymetrics-card-layout');
                  var cardShape = localStorage.getItem('argymetrics-card-shape');
                  if (cardLayout === 'compact' || cardLayout === 'classic' || cardLayout === 'detailed') {
                    document.documentElement.dataset.cardLayout = cardLayout;
                  }
                  if (cardShape === 'soft' || cardShape === 'round' || cardShape === 'square') {
                    document.documentElement.dataset.cardShape = cardShape;
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
