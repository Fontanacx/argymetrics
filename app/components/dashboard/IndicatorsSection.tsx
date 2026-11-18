import { Activity } from "lucide-react";
import { fetchAllDollars, fetchDollar } from "@/lib/api/dollars";
import {
  fetchRiesgoPais,
  fetchInflacion,
  fetchInflacionHistory,
  fetchBandas,
  fetchBandasHistory,
  fetchReservas,
  fetchReservasHistory,
} from "@/lib/api/indicators";
import { fetchRiesgoPaisHistory } from "@/lib/api/historical";
import { fetchCommodities, fetchCommodityHistory } from "@/lib/api/commodities";
import { getLatestUpdateTimestamp } from "@/lib/utils/rates";
import type { RiesgoPais, RiesgoPaisHistoryEntry } from "@/lib/types";
import {
  BandasIndicator,
  IndicatorsStrip,
  SectionShell,
} from "@/app/components/dashboard";
import { BandasIndicatorSkeleton, IndicatorsStripSkeleton } from "@/app/components/ui";

export function IndicatorsSectionSkeleton() {
  return (
    <SectionShell id="indicadores" title="Indicadores" icon={Activity}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IndicatorsStripSkeleton />
        </div>
        <div>
          <BandasIndicatorSkeleton />
        </div>
      </div>
    </SectionShell>
  );
}

/**
 * Sincroniza el valor más reciente con el historial de ArgentinaDatos,
 * para que el último punto del gráfico coincida siempre con la tarjeta.
 */
function syncRiesgoHistory(
  riesgoPais: RiesgoPais | null,
  history: RiesgoPaisHistoryEntry[]
): RiesgoPaisHistoryEntry[] {
  if (!riesgoPais) return history;

  const synced = [...history];
  const today = riesgoPais.fecha.split("T")[0];
  const lastEntry = synced[synced.length - 1];

  if (lastEntry?.fecha === today) {
    synced[synced.length - 1] = { fecha: today, valor: riesgoPais.valor };
  } else {
    synced.push({ fecha: today, valor: riesgoPais.valor });
  }

  return synced;
}

/**
 * "Indicadores" section: Riesgo País, Inflación, Commodities, Reservas BCRA
 * and the BCRA crawling-band indicator. Self-fetches so it streams
 * independently of the rest of the dashboard.
 *
 * The band applies to the wholesale rate (Com. A 3500), so the mayorista quote
 * is what gets positioned inside it. `fetchAllDollars` is normally a data-cache
 * hit from TickerSection's identical request and feeds the update timestamp.
 */
export default async function IndicatorsSection() {
  const [
    riesgoPais,
    inflacion,
    riesgoHistory,
    inflacionHistory,
    commodities,
    goldHistory,
    brentHistory,
    gasHistory,
    bandas,
    bandasHistory,
    reservas,
    reservasHistory,
    allRates,
    mayorista,
  ] = await Promise.all([
    fetchRiesgoPais(),
    fetchInflacion(),
    fetchRiesgoPaisHistory(),
    fetchInflacionHistory(),
    fetchCommodities(),
    fetchCommodityHistory("GC=F"), // Oro
    fetchCommodityHistory("BZ=F"), // Petróleo
    fetchCommodityHistory("NG=F"), // Gas
    fetchBandas(),
    fetchBandasHistory(),
    fetchReservas(),
    fetchReservasHistory(),
    fetchAllDollars(),
    fetchDollar("mayorista"),
  ]);

  const cotizacionActual = mayorista && mayorista.venta > 0 ? mayorista.venta : undefined;
  const latestUpdate = getLatestUpdateTimestamp(allRates);

  return (
    <SectionShell id="indicadores" title="Indicadores" icon={Activity}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IndicatorsStrip
            riesgoPais={riesgoPais}
            inflacion={inflacion}
            riesgoHistory={syncRiesgoHistory(riesgoPais, riesgoHistory)}
            inflacionHistory={inflacionHistory}
            commodities={commodities}
            goldHistory={goldHistory}
            brentHistory={brentHistory}
            gasHistory={gasHistory}
            reservas={reservas}
            reservasHistory={reservasHistory}
          />
        </div>
        <div>
          <BandasIndicator
            bandas={bandas}
            cotizacionActual={cotizacionActual}
            history={bandasHistory}
            updateTime={latestUpdate ?? undefined}
          />
        </div>
      </div>
    </SectionShell>
  );
}
