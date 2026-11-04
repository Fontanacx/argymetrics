import type { BrlWalletRate } from "../types";
import {
  BRL_WALLET_NAMES,
  BRL_WALLET_PROVIDER_IDS,
  COMPARAPIX_BASE,
  REVALIDATE_BRL_WALLETS,
} from "@/lib/constants";

interface ComparaPixQuote {
  symbol?: unknown;
  buy?: unknown;
  sell?: unknown;
}

interface ComparaPixProvider {
  quotes?: unknown;
  logo?: unknown;
  url?: unknown;
  hasFees?: unknown;
  updatedAt?: unknown;
  stale?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Fetches BRL/ARS quotes from ComparaPix, the public PIX rate aggregator.
 *
 * The API returns many providers. We keep a curated list of wallets/fintechs
 * and map its `buy` / `sell` fields to our "venta" / "compra" semantics:
 * - ComparaPix `buy`: ARS you pay to buy 1 BRL (our `venta`)
 * - ComparaPix `sell`: ARS you receive to sell 1 BRL (our `compra`)
 *
 * On any failure we return an empty array so the dashboard and converter
 * continue working without the BRL wallet section.
 */
export async function fetchBrlWalletRates(): Promise<BrlWalletRate[]> {
  try {
    const res = await fetch(`${COMPARAPIX_BASE}/quotes`, {
      next: { revalidate: REVALIDATE_BRL_WALLETS },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[fetchBrlWalletRates] HTTP ${res.status}`);
      return [];
    }

    const data: unknown = await res.json();
    if (!isRecord(data)) {
      console.error("[fetchBrlWalletRates] unexpected response shape");
      return [];
    }

    const wallets: BrlWalletRate[] = [];

    for (const id of BRL_WALLET_PROVIDER_IDS) {
      const rawProvider = data[id];
      if (!isRecord(rawProvider)) continue;

      const provider = rawProvider as ComparaPixProvider;
      if (provider.stale === true) continue;
      if (!Array.isArray(provider.quotes)) continue;

      const quote = (provider.quotes as ComparaPixQuote[]).find(
        (item) => item.symbol === "BRLARS"
      );
      if (!quote || typeof quote.buy !== "number" || quote.buy <= 0) continue;

      wallets.push({
        id,
        nombre: BRL_WALLET_NAMES[id] ?? id,
        compra:
          typeof quote.sell === "number" && quote.sell > 0
            ? quote.sell
            : null,
        venta: quote.buy,
        fechaActualizacion:
          typeof provider.updatedAt === "string"
            ? provider.updatedAt
            : new Date().toISOString(),
        logo: typeof provider.logo === "string" ? provider.logo : undefined,
        url: typeof provider.url === "string" ? provider.url : undefined,
        hasFees: provider.hasFees === true,
      });
    }

    return wallets.sort((a, b) => a.venta - b.venta);
  } catch (error) {
    console.error("[fetchBrlWalletRates] Network error:", error);
    return [];
  }
}
