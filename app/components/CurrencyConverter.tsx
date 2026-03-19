"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import type { DollarWithHistory } from "@/lib/types";
import { formatARS } from "@/lib/formatters/currency";
import { CASA_LABELS } from "@/lib/constants";

interface CurrencyConverterProps {
  dollars: DollarWithHistory[];
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; flag: string }[];
}

function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pr-2 text-sm font-bold tracking-wide uppercase outline-none focus:ring-0 transition-opacity hover:opacity-80"
        style={{ color: "var(--text-primary)" }}
        type="button"
      >
        <span className="text-xl leading-none">{selectedOption?.flag || "🇺🇸"}</span>
        <span>{selectedOption?.label || "Select"}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 mt-[1px] ${isOpen ? "rotate-180" : ""}`} 
          style={{ color: "var(--text-muted)" }} 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full z-50 mt-3 max-h-64 min-w-[220px] overflow-y-auto rounded-xl border p-1 shadow-2xl"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
            boxShadow: "0px 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex flex-col gap-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
                style={{
                  background: value === opt.value ? "var(--bg-primary)" : "transparent",
                  color: value === opt.value ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "var(--border-subtle)";
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "transparent";
                }}
                type="button"
              >
                <span className="text-xl leading-none">{opt.flag}</span>
                <span className="font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

  const selectOptions = useMemo(() => {
    return dollars.map((d) => ({
      value: d.rate.casa,
      label: CASA_LABELS[d.rate.casa] || d.rate.nombre,
      flag: getFlag(d.rate.casa),
    }));
  }, [dollars]);

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
              <CustomSelect
                value={selectedCurrency}
                onChange={setSelectedCurrency}
                options={selectOptions}
              />
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
              <CustomSelect
                value={selectedCurrency}
                onChange={setSelectedCurrency}
                options={selectOptions}
              />
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
