import { fetchDollarsWithHistory } from "@/lib/api/historical";
import { fetchWalletDollars } from "@/lib/api/wallets";
import { fetchLatamCurrencies } from "@/lib/api/latam";
import { fetchBrlWalletRates } from "@/lib/api/brl-wallets";
import { Navbar } from "@/app/components/layout";
import { Footer } from "@/app/components/layout";
import { CurrencyConverter } from "@/app/components/conversor";
import { SectionHeader } from "@/app/components/layout";
import { ArrowLeftRight } from "lucide-react";

export const metadata = {
  title: "Conversor de Monedas — ArgyMetrics",
  description: "Calculadora de divisas con las cotizaciones en tiempo real del dólar blue, oficial, MEP, CCL y Cripto.",
};

export const dynamic = "force-dynamic";

export default async function ConversorPage() {
  const [dollars, walletDollars, latamCurrencies, brlWallets] = await Promise.all([
    fetchDollarsWithHistory(),
    fetchWalletDollars(),
    fetchLatamCurrencies(),
    fetchBrlWalletRates(),
  ]);

  const combinedDollars = [
    ...dollars,
    ...walletDollars,
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <SectionHeader title="Conversor de Divisas" icon={ArrowLeftRight} />
        </div>
        
        <CurrencyConverter
          dollars={combinedDollars}
          latamCurrencies={latamCurrencies}
          brlWallets={brlWallets}
        />
      </main>

      <Footer />
    </div>
  );
}
