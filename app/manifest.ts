import type { MetadataRoute } from "next";
import icon256 from "@/logo/icon-256x256.png";
import icon512 from "@/logo/icon-512x512.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArgyMetrics",
    short_name: "ArgyMetrics",
    description: "Panel financiero argentino con datos de mercado actualizados automáticamente.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fa",
    theme_color: "#061f58",
    lang: "es-AR",
    icons: [
      {
        src: icon256.src,
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: icon512.src,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
