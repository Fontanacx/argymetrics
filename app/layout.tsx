import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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
  openGraph: {
    title: "ArgyMetrics — Datos financieros de Argentina en tiempo real",
    description:
      "Dolar oficial, blue, MEP, CCL, USDT, riesgo pais e inflacion. Actualizado cada minuto.",
    type: "website",
    locale: "es_AR",
    siteName: "ArgyMetrics",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArgyMetrics — Datos financieros de Argentina",
    description:
      "Cotizaciones del dolar, riesgo pais e inflacion en tiempo real.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
