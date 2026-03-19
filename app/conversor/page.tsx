import { fetchDollarsWithHistory } from "@/lib/api/historical";
import { fetchWalletDollars } from "@/lib/api/wallets";
import type { DollarRate } from "@/lib/types";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CurrencyConverter from "../components/CurrencyConverter";
import SectionHeader from "../components/SectionHeader";
import { ArrowLeftRight } from "lucide-react";

export const metadata = {
  title: "Conversor de Monedas — ArgyMetrics",
  description: "Calculadora de divisas con las cotizaciones en tiempo real del dólar blue, oficial, MEP, CCL y Cripto.",
};

export default async function ConversorPage() {
  const [dollars, walletDollars] = await Promise.all([
    fetchDollarsWithHistory(),
    fetchWalletDollars(),
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
        
        <CurrencyConverter dollars={combinedDollars} />
      </main>

      <Footer />
    </div>
  );
}
