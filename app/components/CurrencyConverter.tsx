"use client";

import { useState, useMemo } from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import type { DollarWithHistory } from "@/lib/types";
import { formatARS } from "@/lib/formatters/currency";
import { CASA_LABELS } from "@/lib/constants";

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
      return numAmount / activeRate;
    } else {
      return numAmount * activeRate;
    }
  }, [amount, isPesosTop, activeRate]);

  // Compute "Actualizado hace..." string based on the selected rate
  const updatedAt = selectedRateObj?.rate.fechaActualizacion
    ? new Intl.DateTimeFormat("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Argentina/Buenos_Aires",
      }).format(new Date(selectedRateObj.rate.fechaActualizacion))
    : null;

  return (
    <div
      className="mx-auto flex max-w-[500px] flex-col rounded-xl p-6 border transition-colors"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        color: "var(--text-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Top Header / Tabs */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-4 border-b pb-2" style={{ borderColor: "var(--border-subtle)" }}>
          <button
            onClick={() => setMode("venta")}
            className="text-sm font-bold tracking-wide transition-colors hover:opacity-80"
            style={
              mode === "venta"
                ? {
                    color: "var(--text-primary)",
                    borderBottom: "2px solid var(--color-accent)",
                    marginBottom: "-10px",
                    paddingBottom: "8px",
                  }
                : { color: "var(--text-muted)" }
            }
          >
            VENTA
          </button>
          <button
            onClick={() => setMode("compra")}
            className="text-sm font-bold tracking-wide transition-colors hover:opacity-80"
            style={
              mode === "compra"
                ? {
                    color: "var(--text-primary)",
                    borderBottom: "2px solid var(--color-accent)",
                    marginBottom: "-10px",
                    paddingBottom: "8px",
                  }
                : { color: "var(--text-muted)" }
            }
          >
            COMPRA
          </button>
        </div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
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
                  style={{ color: "var(--text-primary)" }}
                >
                  {dollars.map((d) => (
                    <option key={`src-${d.rate.casa}`} value={d.rate.casa} style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>
                      {CASA_LABELS[d.rate.casa] || d.rate.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-0" style={{ color: "var(--text-muted)" }} />
              </div>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: "var(--text-muted)" }}>
              {isPesosTop ? "$" : getFlag(selectedCurrency).includes("🇺🇸") ? "US$" : "€"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-lg py-4 pl-14 pr-4 text-right text-2xl font-bold outline-none transition-colors"
              style={{
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)"
              }}
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
            className="flex items-center justify-center transition-colors hover:opacity-80"
            style={{ color: "var(--color-accent)" }}
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
                  style={{ color: "var(--text-primary)" }}
                >
                  {dollars.map((d) => (
                    <option key={`tgt-${d.rate.casa}`} value={d.rate.casa} style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>
                       {CASA_LABELS[d.rate.casa] || d.rate.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-0" style={{ color: "var(--text-muted)" }} />
              </div>
            )}
          </div>
          <div className="relative rounded-lg py-4 pl-4 pr-4 border" style={{ background: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
            <div className="flex items-baseline justify-end gap-1 text-right overflow-hidden">
              <span className="text-2xl font-bold truncate min-w-0" style={{ color: "var(--text-primary)" }} title={!isPesosTop
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
              <span className="text-xl font-bold shrink-0" style={{ color: "var(--text-primary)" }}>
                {!isPesosTop ? "(ARS)" : getFlag(selectedCurrency).includes("🇺🇸") ? "USD" : "EUR"}
              </span>
            </div>
            {/* Precio Base Helper */}
            <div className="mt-1 text-right text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              precio: {formatARS(activeRate)}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg px-8 py-3 text-sm font-bold transition-colors hover:opacity-80 focus:ring-2 focus:outline-none"
            style={{ 
              background: "var(--color-accent-light)", 
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent-light)" 
            }}
          >
            Actualizar precios
          </button>
        </div>
      </div>
    </div>
  );
}
