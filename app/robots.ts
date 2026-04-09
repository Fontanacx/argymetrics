import type { MetadataRoute } from "next";

/**
 * Robots.txt for ArgyMetrics.
 * Next.js 14+ App Router: export from app/robots.ts.
 * Accessible at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://argymetrics.vercel.app/sitemap.xml",
  };
}
