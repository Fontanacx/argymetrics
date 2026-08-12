import { Coins } from "lucide-react";
import { fetchCryptos, fetchCryptoHistory } from "@/lib/api/crypto";
import CryptoStrip from "@/app/components/CryptoStrip";
import { SectionShell } from "@/app/components/dashboard";
import { CryptoStripSkeleton } from "@/app/components/ui";

export function CryptosSectionSkeleton() {
  return (
    <SectionShell title="Criptomonedas" icon={Coins}>
      <CryptoStripSkeleton />
    </SectionShell>
  );
}

/**
 * "Criptomonedas" section (BTC/ETH). Self-fetches so it streams
 * independently of the rest of the dashboard.
 */
export default async function CryptosSection() {
  const [cryptos, btcHistory, ethHistory] = await Promise.all([
    fetchCryptos(),
    fetchCryptoHistory("BTC-USD"),
    fetchCryptoHistory("ETH-USD"),
  ]);

  return (
    <SectionShell title="Criptomonedas" icon={Coins}>
      <CryptoStrip cryptos={cryptos} btcHistory={btcHistory} ethHistory={ethHistory} />
    </SectionShell>
  );
}
