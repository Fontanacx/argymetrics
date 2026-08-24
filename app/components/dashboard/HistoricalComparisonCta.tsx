import { ArrowUpRight, ChartLine } from "lucide-react";
import Link from "next/link";

export default function HistoricalComparisonCta() {
  return (
    <section className="historical-comparison-cta" aria-labelledby="historical-comparison-cta-title">
      <div className="historical-comparison-cta-copy">
        <div className="historical-comparison-cta-icon" aria-hidden="true">
          <ChartLine size={22} strokeWidth={2.1} />
        </div>
        <div>
          <p className="historical-comparison-cta-eyebrow">Nueva herramienta</p>
          <h2 id="historical-comparison-cta-title">¿Ya probaste nuestro comparador histórico?</h2>
          <p>
            Explorá la evolución del dólar, el riesgo país y la inflación en un solo lugar.
          </p>
        </div>
      </div>

      <Link href="/comparador" className="historical-comparison-cta-link">
        Probar comparador
        <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.2} />
      </Link>
    </section>
  );
}
