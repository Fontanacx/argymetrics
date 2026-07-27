import type { BriefingInput } from "@/lib/types";
import { formatARS, formatPercent } from "@/lib/formatters/currency";
import { CheckCircle2, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

interface ProfileInsightProps {
  profile: "freelancer" | "ahorrista" | "inversor";
  data: BriefingInput;
}

export function ProfileInsight({ profile, data }: ProfileInsightProps) {
  if (profile === "freelancer") {
    const mep = data.mep.value;
    const avg = data.mep7dAverage || mep;
    const diffPct = avg > 0 ? ((mep - avg) / avg) * 100 : 0;

    let message = "";
    let icon = null;
    let color = "";
    let sentiment: "positive" | "negative" | "neutral" = "neutral";

    if (diffPct > 1) {
      message = `Buen momento para cobrar — el MEP está ${formatPercent(diffPct)} por encima del promedio de los últimos 7 días.`;
      icon = <CheckCircle2 size={18} />;
      color = "var(--color-positive)";
      sentiment = "positive";
    } else if (diffPct < -1) {
      message = `El MEP está por debajo del promedio semanal. Conviene esperar si podés.`;
      icon = <AlertTriangle size={18} />;
      color = "var(--color-negative)";
      sentiment = "negative";
    } else {
      message = `El MEP está en línea con el promedio semanal. Podés cobrar sin apuro.`;
      icon = <CheckCircle2 size={18} />;
      color = "var(--text-primary)";
      sentiment = "neutral";
    }

    const bestWallet = data.wallets && data.wallets.length > 0
      ? data.wallets.reduce((prev, curr) => curr.compra > prev.compra ? curr : prev)
      : null;

    if (bestWallet && bestWallet.compra > mep) {
        message += ` Considerá liquidar vía ${bestWallet.name} a ${formatARS(bestWallet.compra)}, que paga mejor que el MEP tradicional.`;
    } else if (bestWallet) {
        message += ` La billetera virtual con mejor conversión cripto hoy es ${bestWallet.name} (${formatARS(bestWallet.compra)}).`;
    }

    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricBox label="Dólar MEP" value={formatARS(mep)} />
          <MetricBox label="Dólar CCL" value={formatARS(data.ccl.value)} />
          <MetricBox label="Dólar Cripto" value={formatARS(data.cripto.value)} />
        </div>
        <ConclusionBox message={message} icon={icon} color={color} sentiment={sentiment} />
      </div>
    );
  }

  if (profile === "ahorrista") {
    const brecha = data.brechaBlueOficial;
    const rp = data.riesgoPais.value;

    let message = "";
    let icon = null;
    let color = "";
    let sentiment: "positive" | "negative" | "neutral" = "neutral";

    if (brecha < 5 && rp < 700) {
      message = "Momento tranquilo. La brecha está calma y el riesgo país controlado.";
      icon = <CheckCircle2 size={18} />;
      color = "var(--color-positive)";
      sentiment = "positive";
    } else if (rp > 900 || brecha > 15) {
      message = "Señales de tensión. Mejor mantener posiciones y no tomar decisiones apresuradas.";
      icon = <AlertTriangle size={18} />;
      color = "var(--color-negative)";
      sentiment = "negative";
    } else {
      message = "Mercado estable pero con variables a monitorear. Seguí de cerca el riesgo país.";
      icon = <TrendingUp size={18} />;
      color = "var(--color-accent)";
      sentiment = "neutral";
    }

    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricBox label="Brecha Blue-Oficial" value={formatPercent(brecha)} colored />
          <MetricBox label="Riesgo País" value={`${Math.round(rp)} pts`} />
          <MetricBox label="Inflación Mensual" value={formatPercent(data.inflacion.value)} />
        </div>
        <ConclusionBox message={message} icon={icon} color={color} sentiment={sentiment} />
      </div>
    );
  }

  if (profile === "inversor") {
    const verde = data.stocksEnVerde;
    const sortedStocks = [...data.stocks].sort((a,b) => (b.variation || 0) - (a.variation || 0));
    const gainer = sortedStocks[0];
    const loser = sortedStocks[sortedStocks.length - 1];

    let message = "";
    let icon = null;
    let color = "";
    let sentiment: "positive" | "negative" | "neutral" = "neutral";

    if (verde >= 7) {
      message = `Jornada positiva en BYMA. ${gainer?.symbol.replace(".BA","")} lidera con +${formatPercent(gainer?.variation || 0)}. Buen clima para revisar posiciones.`;
      icon = <CheckCircle2 size={18} />;
      color = "var(--color-positive)";
      sentiment = "positive";
    } else if (verde <= 3) {
      message = `Jornada negativa en BYMA. ${loser?.symbol.replace(".BA","")} la mayor caída con ${formatPercent(loser?.variation || 0)}. Cautela recomendada.`;
      icon = <AlertTriangle size={18} />;
      color = "var(--color-negative)";
      sentiment = "negative";
    } else {
      const gainerStr = (gainer?.variation || 0) > 0 ? `+${formatPercent(gainer?.variation || 0)}` : formatPercent(gainer?.variation || 0);
      message = `Jornada mixta. Selectividad clave: ${gainer?.symbol.replace(".BA","")} sube ${gainerStr} mientras ${loser?.symbol.replace(".BA","")} retrocede ${formatPercent(loser?.variation || 0)}.`;
      icon = <TrendingUp size={18} />;
      color = "var(--color-accent)";
      sentiment = "neutral";
    }

    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBox label={`Top Alza (${gainer?.symbol.replace(".BA","")})`} value={`+${formatPercent(gainer?.variation || 0)}`} valueColor="var(--color-positive)" />
          <MetricBox label={`Top Baja (${loser?.symbol.replace(".BA","")})`} value={`${formatPercent(loser?.variation || 0)}`} valueColor="var(--color-negative)" />
          <MetricBox label="Oro" value={formatPercent(data.gold.variation || 0)} colored />
          <MetricBox label="Petróleo Brent" value={formatPercent(data.brent.variation || 0)} colored />
        </div>
        <ConclusionBox message={message} icon={icon} color={color} sentiment={sentiment} />
      </div>
    );
  }

  return null;
}

function MetricBox({ label, value, colored = false, valueColor }: { label: string, value: string, colored?: boolean, valueColor?: string }) {
  let displayColor = valueColor || "var(--text-primary)";
  if (colored && !valueColor) {
    if (value.startsWith("+") || (parseFloat(value.replace(",", ".")) > 0 && !value.startsWith("-"))) displayColor = "var(--color-positive)";
    else if (value.startsWith("-")) displayColor = "var(--color-negative)";
  }

  return (
    <div
      className="group/metric rounded-xl border p-3 transition-all duration-200"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider truncate mb-1.5" style={{ color: "var(--text-muted)" }} title={label}>{label}</p>
      <p className="text-base font-extrabold tabular-nums tracking-tight" style={{ color: displayColor }}>{value}</p>
    </div>
  );
}

function ConclusionBox({ message, icon, color, sentiment }: { message: string, icon: React.ReactNode, color: string, sentiment: "positive" | "negative" | "neutral" }) {
  const borderColors = {
    positive: "var(--color-positive)",
    negative: "var(--color-negative)",
    neutral: "var(--color-accent)",
  };

  const bgColors = {
    positive: "var(--color-positive-bg)",
    negative: "var(--color-negative-bg)",
    neutral: "var(--color-accent-light)",
  };

  return (
    <div
      className="relative flex items-start gap-3 rounded-xl border p-4 overflow-hidden"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Left accent line */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: borderColors[sentiment], opacity: 0.7 }}
      />

      <div className="mt-0.5 shrink-0 ml-1" style={{ color }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={12} style={{ color: "var(--text-muted)", opacity: 0.7 }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Conclusión
          </span>
        </div>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
