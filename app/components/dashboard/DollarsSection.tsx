import { Clock, DollarSign, Wallet } from "lucide-react";
import { fetchDollarsWithHistory, fetchFullDollarHistory } from "@/lib/api/historical";
import { fetchWalletDollars } from "@/lib/api/wallets";
import { formatTime } from "@/lib/formatters/date";
import { getLatestUpdateTimestamp } from "@/lib/utils/rates";
import type { DollarHistoryEntry } from "@/lib/types";
import { DollarGrid, SectionShell } from "@/app/components/dashboard";
import { DollarGridSkeleton } from "@/app/components/ui";

/** Casas whose full history is passed to DollarGrid info modals. */
const FULL_HISTORY_CASAS = [
  "blue",
  "oficial",
  "mayorista",
  "bolsa",
  "contadoconliqui",
  "euro",
  "euroblue",
  "eurotarjeta",
  "cripto",
  "real",
  "realblue",
  "realtarjeta",
] as const;

const WALLET_HISTORY_KEYS = ["astropay", "cocos", "lemoncash", "belo", "buenbit"] as const;

export function DollarsSectionSkeleton() {
  return (
    <SectionShell id="divisas" title="Divisas" icon={DollarSign}>
      <DollarGridSkeleton />
    </SectionShell>
  );
}

/**
 * "Divisas" + "Dólares Billeteras Virtuales" sections.
 * Self-fetches all dollar data so it can stream independently
 * of the rest of the dashboard.
 */
export default async function DollarsSection() {
  const [dollars, walletDollars, ...fullHistories] = await Promise.all([
    fetchDollarsWithHistory(),
    fetchWalletDollars(),
    ...FULL_HISTORY_CASAS.map((casa) => fetchFullDollarHistory(casa)),
  ]);

  const histories: Record<string, DollarHistoryEntry[]> = Object.fromEntries(
    FULL_HISTORY_CASAS.map((casa, i) => [casa, fullHistories[i]])
  );

  const latestUpdate = getLatestUpdateTimestamp(dollars.map((d) => d.rate));
  const updateTime = latestUpdate ? formatTime(latestUpdate) : null;

  // Wallet rates have no variation of their own: reuse the Cripto dollar
  // sparkline and variation for their cards and modals.
  const criptoDollar = dollars.find((d) => d.rate.casa === "cripto");
  const criptoHistory = criptoDollar?.history ?? [];
  const criptoVariacion = criptoDollar?.variacion ?? null;
  const fullCriptoHistory = histories["cripto"] ?? [];

  const enrichedWalletDollars = walletDollars.map((w) => ({
    ...w,
    history: criptoHistory,
    variacion: criptoVariacion,
  }));

  return (
    <>
      <SectionShell
        id="divisas"
        title="Divisas"
        icon={DollarSign}
        right={
          updateTime && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <Clock size={12} />
              <span>Actualizado: {updateTime}</span>
            </div>
          )
        }
      >
        <DollarGrid dollars={dollars} histories={histories} />
      </SectionShell>

      {enrichedWalletDollars.length > 0 && (
        <SectionShell id="billeteras" title="Dólares Billeteras Virtuales" icon={Wallet}>
          <DollarGrid
            dollars={enrichedWalletDollars}
            histories={Object.fromEntries(
              WALLET_HISTORY_KEYS.map((key) => [key, fullCriptoHistory])
            )}
          />
        </SectionShell>
      )}
    </>
  );
}
