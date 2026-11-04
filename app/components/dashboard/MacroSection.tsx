import { Activity, Landmark, ShoppingBasket, Users, Wallet } from "lucide-react";
import {
  fetchActividadEconomica,
  fetchActividadEconomicaHistory,
  fetchCanastaBasica,
  fetchCanastaBasicaHistory,
  fetchIpcRegional,
  fetchPobreza,
  fetchPobrezaHistory,
  fetchSalarioReal,
  fetchSalarioRealHistory,
} from "@/lib/api/indec";
import {
  formatCompact,
  formatPercent,
  formatPercentUnsigned,
} from "@/lib/formatters/currency";
import { formatMonthYear, formatSemesterPeriod } from "@/lib/formatters/date";
import { INDICATOR_DEFINITIONS } from "@/lib/constants/definitions";
import IndicatorCard from "./IndicatorCard";
import RegionalInflationGrid from "./RegionalInflationGrid";
import SectionShell from "./SectionShell";

export function MacroSectionSkeleton() {
  return (
    <SectionShell
      id="economia-real"
      title="Economía Real"
      icon={Landmark}
      subtitle="Salario, actividad, canastas y pobreza · INDEC"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[118px] animate-pulse rounded-xl border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-primary)",
            }}
          />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[86px] animate-pulse rounded-xl border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-primary)",
            }}
          />
        ))}
      </div>
    </SectionShell>
  );
}

/**
 * "Economía Real" section: official INDEC data for wages, activity, baskets
 * and poverty, plus the regional IPC breakdown.
 *
 * Every card is optional: if the API or the token fails, the card falls back
 * to "Sin datos disponibles" and the section hides itself when nothing loads.
 */
export default async function MacroSection() {
  const [
    salario,
    salarioHistory,
    actividad,
    actividadHistory,
    canasta,
    canastaHistory,
    pobreza,
    pobrezaHistory,
    ipcRegional,
  ] = await Promise.all([
    fetchSalarioReal(),
    fetchSalarioRealHistory(),
    fetchActividadEconomica(),
    fetchActividadEconomicaHistory(),
    fetchCanastaBasica(),
    fetchCanastaBasicaHistory(),
    fetchPobreza(),
    fetchPobrezaHistory(),
    fetchIpcRegional(),
  ]);

  const hasData =
    salario !== null ||
    actividad !== null ||
    canasta !== null ||
    pobreza !== null ||
    ipcRegional.length > 0;

  if (!hasData) return null;

  const salarioPositive = salario ? salario.interanual >= 0 : true;
  const actividadPositive = actividad ? actividad.interanual >= 0 : true;
  const canastaPositive =
    canasta?.variacionMensual !== null && canasta?.variacionMensual !== undefined
      ? canasta.variacionMensual <= 0
      : true;
  const pobrezaPositive =
    pobrezaHistory.length >= 2
      ? pobrezaHistory[pobrezaHistory.length - 1].valor <=
        pobrezaHistory[pobrezaHistory.length - 2].valor
      : true;

  const canastaHistorySeries = canastaHistory.map((entry) => ({
    fecha: entry.fecha,
    valor: entry.cbt,
  }));

  return (
    <SectionShell
      id="economia-real"
      title="Economía Real"
      icon={Landmark}
      subtitle="Salario, actividad, canastas y pobreza · INDEC"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Salario real */}
        <IndicatorCard
          icon={<Wallet size={20} />}
          iconBg="rgba(16, 185, 129, 0.1)"
          iconColor="rgb(16, 185, 129)"
          label="Salario Real (interanual)"
          value={salario ? formatPercent(salario.interanual) : ""}
          dateLabel={
            salario ? `${formatMonthYear(salario.fecha)} · vs IPC` : undefined
          }
          infoModal={
            salario
              ? {
                  title: "Salario Real",
                  kind: "macro",
                  format: "percent",
                  data: salarioHistory,
                  definition: INDICATOR_DEFINITIONS.salarioReal,
                  updateTime: salario.fecha,
                }
              : undefined
          }
          sparkline={
            salarioHistory.length > 0
              ? {
                  data: salarioHistory,
                  positive: salarioPositive,
                  label: "Salario Real",
                  formatType: "inflacion",
                  dataKey: "valor",
                }
              : undefined
          }
        >
          {salario && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Nominal {formatPercent(salario.nominalInteranual)} · IPC{" "}
              {formatPercentUnsigned(salario.inflacionInteranual)}
            </p>
          )}
        </IndicatorCard>

        {/* Actividad económica */}
        <IndicatorCard
          icon={<Activity size={20} />}
          iconBg="var(--color-accent-light)"
          iconColor="var(--color-accent)"
          label="Actividad Económica (EMAE)"
          value={actividad ? formatPercent(actividad.interanual) : ""}
          dateLabel={
            actividad
              ? `${formatMonthYear(actividad.fecha)} · interanual`
              : undefined
          }
          infoModal={
            actividad
              ? {
                  title: "Actividad Económica (EMAE)",
                  kind: "macro",
                  format: "percent",
                  data: actividadHistory,
                  definition: INDICATOR_DEFINITIONS.actividad,
                  updateTime: actividad.fecha,
                }
              : undefined
          }
          sparkline={
            actividadHistory.length > 0
              ? {
                  data: actividadHistory,
                  positive: actividadPositive,
                  label: "Actividad Económica (EMAE)",
                  formatType: "inflacion",
                  dataKey: "valor",
                }
              : undefined
          }
        >
          {actividad && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Var. mensual {formatPercent(actividad.mensual)}
            </p>
          )}
        </IndicatorCard>

        {/* Canasta básica */}
        <IndicatorCard
          icon={<ShoppingBasket size={20} />}
          iconBg="rgba(249, 115, 22, 0.1)"
          iconColor="rgb(249, 115, 22)"
          label="Canasta Básica Total (hogar de 4)"
          value={canasta ? formatCompact(canasta.cbt) : ""}
          dateLabel={canasta ? `${formatMonthYear(canasta.fecha)} · GBA` : undefined}
          infoModal={
            canasta
              ? {
                  title: "Canasta Básica Total",
                  kind: "macro",
                  format: "ars",
                  data: canastaHistorySeries,
                  definition: INDICATOR_DEFINITIONS.canasta,
                  updateTime: canasta.fecha,
                }
              : undefined
          }
          sparkline={
            canastaHistorySeries.length > 0
              ? {
                  data: canastaHistorySeries,
                  positive: canastaPositive,
                  label: "Canasta Básica Total",
                  formatType: "dollar",
                  dataKey: "valor",
                }
              : undefined
          }
        >
          {canasta && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              CBA {formatCompact(canasta.cba)}
              {canasta.variacionMensual !== null
                ? ` · m/m ${formatPercentUnsigned(canasta.variacionMensual)}`
                : ""}
            </p>
          )}
        </IndicatorCard>

        {/* Pobreza */}
        <IndicatorCard
          icon={<Users size={20} />}
          iconBg="rgba(239, 68, 68, 0.1)"
          iconColor="rgb(239, 68, 68)"
          label="Pobreza (personas)"
          value={pobreza ? formatPercentUnsigned(pobreza.pobrezaPersonas) : ""}
          dateLabel={
            pobreza
              ? `${formatSemesterPeriod(pobreza.periodo)} · 31 aglomerados urbanos${
                  pobreza.provisorio ? " · provisorio" : ""
                }`
              : undefined
          }
          infoModal={
            pobreza
              ? {
                  title: "Pobreza e Indigencia",
                  kind: "macro",
                  format: "percent",
                  data: pobrezaHistory,
                  definition: INDICATOR_DEFINITIONS.pobreza,
                  updateTime: pobreza.fecha,
                }
              : undefined
          }
          sparkline={
            pobrezaHistory.length > 0
              ? {
                  data: pobrezaHistory,
                  positive: pobrezaPositive,
                  label: "Pobreza (personas)",
                  formatType: "inflacion",
                  dataKey: "valor",
                }
              : undefined
          }
        >
          {pobreza && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Indigencia {formatPercentUnsigned(pobreza.indigenciaPersonas)} ·
              Hogares {formatPercentUnsigned(pobreza.pobrezaHogares)}
            </p>
          )}
        </IndicatorCard>
      </div>

      <RegionalInflationGrid items={ipcRegional} />
    </SectionShell>
  );
}
