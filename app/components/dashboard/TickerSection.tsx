import { fetchAllDollars } from "@/lib/api/dollars";
import { fetchDollarsWithHistory } from "@/lib/api/historical";
import { fetchRiesgoPais } from "@/lib/api/indicators";
import { fetchCommodities } from "@/lib/api/commodities";
import { fetchCryptos } from "@/lib/api/crypto";
import { getArgentineStocks } from "@/lib/api/stocks";
import { getInternationalStocks } from "@/lib/api/international-stocks";
import { getMarketIndices } from "@/lib/api/indices";
import { MarketTicker } from "@/app/components/layout";

/**
 * Data section for the MarketTicker bar.
 * Fetches all ticker sources in parallel; the ticker itself is
 * rendered by the presentational `MarketTicker` component.
 *
 * NOTE: `fetchDollarsWithHistory` is only used here to derive the daily
 * variation map. DollarsSection calls it again, but with ISR enabled the
 * second call is served from the data cache (no duplicate upstream request).
 */
export default async function TickerSection() {
  const [rates, riesgoPais, commodities, cryptos, dollars, stocks, internationalStocks, indices] =
    await Promise.all([
      fetchAllDollars(),
      fetchRiesgoPais(),
      fetchCommodities(),
      fetchCryptos(),
      fetchDollarsWithHistory(),
      getArgentineStocks(),
      getInternationalStocks(),
      getMarketIndices(),
    ]);

  const variations = Object.fromEntries(
    dollars.map((d) => [d.rate.casa, d.variacion])
  );

  return (
    <MarketTicker
      rates={rates}
      riesgoPais={riesgoPais}
      commodities={commodities}
      cryptos={cryptos}
      variations={variations}
      stocks={stocks}
      internationalStocks={internationalStocks}
      indices={indices}
    />
  );
}
