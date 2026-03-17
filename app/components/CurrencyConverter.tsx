"use client";

import { useState, useMemo } from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import type { DollarWithHistory } from "@/lib/types";
import { formatARS } from "@/lib/formatters/currency";

interface CurrencyConverterProps {
  dollars: DollarWithHistory[];
}

export default function CurrencyConverter({ dollars }: CurrencyConverterProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("blue");
  const [amount, setAmount] = useState<string>("");
  const [mode, setMode] = useState<"venta" | "compra">("venta");
  const [isPesosTop, setIsPesosTop] = useState<boolean>(true);

  // Find the selected rate object
  const selectedRateObj = dollars.find((d) => d.rate.casa === selectedCurrency);
  const rateVenta = selectedRateObj?.rate.venta ?? 1; // avoid division by zero
  const rateCompra = selectedRateObj?.rate.compra ?? 1;

  // The rate we actually use depending on the Active Tab
  const activeRate = mode === "venta" ? rateVenta : rateCompra;

  // Handle input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/,/g, ".");
    if (value === "") return setAmount("");
    if (/^\d*\.?\d*$/.test(value)) setAmount(value);
  };

  // Provide a flag emoji based on casa
  const getFlag = (casa: string) => {
    if (casa.includes("euro")) return "🇪🇺";
    return "🇺🇸";
  };

  // Compute conversion
  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount || "0");
    if (isNaN(numAmount) || numAmount === 0 || activeRate === 0) return 0;

    if (isPesosTop) {
      // Top is ARS -> Bottom is Foreign
      // If we are "Buying" foreign (mode=venta), they sell at the VENTA price, so we divide our pesos by Venta.
      // If we are "Selling" foreign (mode=compra), they buy at the COMPRA price, so we divide our pesos by Compra.
      return numAmount / activeRate;
    } else {
      // Top is Foreign -> Bottom is ARS
      return numAmount * activeRate;
    }
  }, [amount, isPesosTop, activeRate]);

  // Compute "Actualizado hace..." string based on the selected rate
  const updatedAt = selectedRateObj?.rate.fechaActualizacion
    ? new Intl.DateTimeFormat("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Argentina/Buenos_Aires",
      }).format(new Date(selectedRateObj.rate.fechaActualizacion))
    : null;

  return (
    <div
      className="mx-auto flex max-w-[500px] flex-col rounded-xl p-6"
      style={{
        background: "#1e1e1e", // Very dark grey, matching screenshot
        color: "white",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
      }}
    >
      {/* Top Header / Tabs */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-4 border-b border-gray-700/50 pb-2">
          <button
            onClick={() => setMode("venta")}
            className={`text-sm font-bold tracking-wide transition-colors ${
              mode === "venta" ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            style={
              mode === "venta"
                ? {
                    borderBottom: "2px solid #3b82f6", // tailwind blue-500
                    marginBottom: "-10px", // pull line down to border
                    paddingBottom: "8px",
                  }
                : {}
            }
          >
            VENTA
          </button>
          <button
            onClick={() => setMode("compra")}
            className={`text-sm font-bold tracking-wide transition-colors ${
              mode === "compra" ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            style={
              mode === "compra"
                ? {
                    borderBottom: "2px solid #3b82f6",
                    marginBottom: "-10px",
                    paddingBottom: "8px",
                  }
                : {}
            }
          >
            COMPRA
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {updatedAt ? `Actualizado a las ${updatedAt}` : "Actualizando..."}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Block */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            {isPesosTop ? (
              <>
                <span className="text-lg leading-none">🇦🇷</span>
                <span className="text-sm font-bold tracking-wide">ARS</span>
              </>
            ) : (
              <div className="relative flex items-center gap-2">
                <span className="text-lg leading-none">{getFlag(selectedCurrency)}</span>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="appearance-none bg-transparent pr-4 text-sm font-bold tracking-wide uppercase outline-none focus:ring-0"
                >
                  {dollars.map((d) => (
                    <option key={`src-${d.rate.casa}`} value={d.rate.casa} className="text-black">
                      {d.rate.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-0 text-gray-400" />
              </div>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">
              {isPesosTop ? "$" : getFlag(selectedCurrency).includes("🇺🇸") ? "US$" : "€"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-lg bg-[#111111] py-4 pl-14 pr-4 text-right text-2xl font-bold text-gray-500 outline-none transition-colors focus:bg-[#1a1a1a] focus:text-white"
            />
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              setIsPesosTop(!isPesosTop);
              setAmount(convertedAmount > 0 ? convertedAmount.toFixed(2).replace(".00", "") : "");
            }}
            className="flex items-center justify-center text-blue-500 hover:text-blue-400"
            aria-label="Invertir monedas"
          >
            <ArrowDownUp size={20} />
          </button>
        </div>

        {/* Bottom Block */}
        <div className="flex flex-col gap-2 relative">
          <div className="flex items-center gap-2 px-1">
            {!isPesosTop ? (
              <>
                <span className="text-lg leading-none">🇦🇷</span>
                <span className="text-sm font-bold tracking-wide">ARS</span>
              </>
            ) : (
              <div className="relative flex items-center gap-2">
                <span className="text-lg leading-none">{getFlag(selectedCurrency)}</span>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="appearance-none bg-transparent pr-4 text-sm font-bold tracking-wide uppercase outline-none focus:ring-0"
                >
                  {dollars.map((d) => (
                    <option key={`tgt-${d.rate.casa}`} value={d.rate.casa} className="text-black">
                      {d.rate.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-0 text-gray-400" />
              </div>
            )}
          </div>
          <div className="relative rounded-lg bg-[#111111] py-4 pl-4 pr-4">
            <div className="flex items-baseline justify-end gap-1 text-right overflow-hidden">
              <span className="text-2xl font-bold text-white truncate min-w-0" title={!isPesosTop
                  ? formatARS(convertedAmount).replace("$", "").trim()
                  : convertedAmount > 0
                    ? convertedAmount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "0,00"}>
                {!isPesosTop
                  ? formatARS(convertedAmount).replace("$", "").trim()
                  : convertedAmount > 0
                    ? convertedAmount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "0,00"}
              </span>
              <span className="text-xl font-bold text-white shrink-0">
                {!isPesosTop ? "(ARS)" : getFlag(selectedCurrency).includes("🇺🇸") ? "USD" : "EUR"}
              </span>
            </div>
            {/* Precio Base Helper */}
            <div className="mt-1 text-right text-xs font-medium text-gray-400">
              precio: {formatARS(activeRate)}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[rgba(37,99,235,0.1)] px-8 py-3 text-sm font-bold text-blue-500 transition-colors hover:bg-[rgba(37,99,235,0.15)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Actualizar precios
          </button>
        </div>
      </div>
    </div>
  );
}
