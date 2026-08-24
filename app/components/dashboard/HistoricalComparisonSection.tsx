import { ChartLine } from "lucide-react";
import { fetchFullDollarHistory, fetchRiesgoPaisHistory } from "@/lib/api/historical";
import { fetchInflacionHistory } from "@/lib/api/indicators";
import type { HistoricalComparisonSeries } from "@/lib/types";
import HistoricalComparison from "@/app/components/HistoricalComparison";
import SectionShell from "./SectionShell";

function HistoricalComparisonSectionSkeletonContent({ withHeader }: { withHeader: boolean }) {
  const content = (
    <div className="historical-comparison-card">
      <div className="skeleton h-8 w-64" />
      <div className="skeleton mt-4 h-72 w-full" />
    </div>
  );

  if (!withHeader) {
    return (
      <section id="comparador" className="mb-8">
        {content}
      </section>
    );
  }

  return (
    <SectionShell id="comparador" title="Comparador Histórico" icon={ChartLine}>
      {content}
    </SectionShell>
  );
}

export function HistoricalComparisonPageSkeleton() {
  return <HistoricalComparisonSectionSkeletonContent withHeader={false} />;
}

interface HistoricalComparisonSectionProps {
  withHeader?: boolean;
}

/** Server data boundary for the cross-market historical comparison. */
export default async function HistoricalComparisonSection({
  withHeader = true,
}: HistoricalComparisonSectionProps) {
  const [blueHistory, mepHistory, riesgoHistory, inflacionHistory] = await Promise.all([
    fetchFullDollarHistory("blue"),
    fetchFullDollarHistory("bolsa"),
    fetchRiesgoPaisHistory(),
    fetchInflacionHistory(),
  ]);

  const allDatasets: HistoricalComparisonSeries[] = [
    {
      key: "blue",
      label: "Dólar Blue",
      unit: "ars",
      data: blueHistory.map(({ fecha, venta }) => ({ fecha, valor: venta })),
    },
    {
      key: "mep",
      label: "Dólar MEP",
      unit: "ars",
      data: mepHistory.map(({ fecha, venta }) => ({ fecha, valor: venta })),
    },
    {
      key: "riesgo",
      label: "Riesgo País",
      unit: "points",
      data: riesgoHistory.map(({ fecha, valor }) => ({ fecha, valor })),
    },
    {
      key: "inflacion",
      label: "Inflación mensual",
      unit: "percent",
      data: inflacionHistory.map(({ fecha, valor }) => ({ fecha, valor })),
    },
  ];
  const datasets = allDatasets.filter((dataset) => dataset.data.length > 0);

  const content = <HistoricalComparison datasets={datasets} />;

  if (!withHeader) {
    return (
      <section id="comparador" className="mb-8">
        {content}
      </section>
    );
  }

  return (
    <SectionShell
      id="comparador"
      title="Comparador Histórico"
      icon={ChartLine}
      subtitle="Dólar Blue · MEP · Riesgo País · Inflación"
    >
      {content}
    </SectionShell>
  );
}
