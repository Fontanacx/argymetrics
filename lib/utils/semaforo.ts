import { BriefingInput, SemaforoItem } from "@/lib/types";

export function computeSemaforo(data: BriefingInput): SemaforoItem[] {
  const items: SemaforoItem[] = [];

  // 1. Mercado Cambiario
  const brecha = data.brechaBlueOficial;
  let statusCambiario: "verde" | "amarillo" | "rojo" = "verde";
  let tituloCambiario = "TRANQUILO";
  if (brecha > 15) {
    statusCambiario = "rojo";
    tituloCambiario = "TENSIÓN";
  } else if (brecha >= 5) {
    statusCambiario = "amarillo";
    tituloCambiario = "MODERADO";
  }
  
  let dirCambiario = "sin cambios";
  if (data.brechaBlueYesterday !== null) {
      if (brecha > data.brechaBlueYesterday + 0.1) dirCambiario = "subió";
      else if (brecha < data.brechaBlueYesterday - 0.1) dirCambiario = "bajó";
  }
  
  items.push({
    label: "Mercado Cambiario",
    status: statusCambiario,
    titulo: tituloCambiario,
    descripcion: `Brecha Blue-Oficial en ${brecha.toFixed(1)}% · ${dirCambiario} vs ayer`
  });

  // 2. Riesgo País
  const rp = data.riesgoPais.value;
  let statusRp: "verde" | "amarillo" | "rojo" = "verde";
  let tituloRp = "BAJO";
  if (rp > 900) {
    statusRp = "rojo";
    tituloRp = "ALTO";
  } else if (rp >= 500) {
    statusRp = "amarillo";
    tituloRp = "MODERADO";
  }

  const rpTrend = data.riesgoPais.weeklyChange !== null 
      ? ` · ${data.riesgoPais.weeklyChange > 0 ? "subió" : "bajó"} ${Math.abs(data.riesgoPais.weeklyChange).toFixed(1)}% esta semana` 
      : "";
      
  items.push({
    label: "Riesgo País",
    status: statusRp,
    titulo: tituloRp,
    descripcion: `${Math.round(rp)} pts${rpTrend}`
  });

  // 3. Criptomonedas
  const criptoDiff = Math.abs((data.blue.value - data.cripto.value) / data.cripto.value * 100);
  let statusCripto: "verde" | "amarillo" | "rojo" = "verde";
  let tituloCripto = "ALINEADO";
  if (criptoDiff > 3) {
    statusCripto = "rojo";
    tituloCripto = "DIVERGENCIA ALTA";
  } else if (criptoDiff >= 1) {
    statusCripto = "amarillo";
    tituloCripto = "DIVERGENCIA LEVE";
  }

  items.push({
    label: "Criptomonedas",
    status: statusCripto,
    titulo: tituloCripto,
    descripcion: `Blue y Cripto con ${criptoDiff.toFixed(1)}% de diferencia`
  });

  // 4. Inflación
  const ipc = data.inflacion.value;
  let statusIpc: "verde" | "amarillo" | "rojo" = "verde";
  let tituloIpc = "CONTENIDA";
  if (ipc > 6) {
    statusIpc = "rojo";
    tituloIpc = "ELEVADA";
  } else if (ipc >= 3) {
    statusIpc = "amarillo";
    tituloIpc = "MODERADA";
  }

  items.push({
    label: "Inflación",
    status: statusIpc,
    titulo: tituloIpc,
    descripcion: `IPC ${ipc.toFixed(1)}% mensual · dato de ${data.inflacion.date}`
  });

  // 5. Acciones BYMA
  const verde = data.stocksEnVerde;
  const rojo = data.stocksEnRojo;
  
  let statusByma: "verde" | "amarillo" | "rojo" = "rojo";
  let tituloByma = "NEGATIVO";
  
  if (verde === 0 && rojo === 0) {
    statusByma = "amarillo";
    tituloByma = "SIN OPERACIONES";
  } else if (verde >= 7) {
    statusByma = "verde";
    tituloByma = "POSITIVO";
  } else if (verde >= 4) {
    statusByma = "amarillo";
    tituloByma = "MIXTO";
  }

  const sortedStocks = [...data.stocks].sort((a,b) => (b.variation || 0) - (a.variation || 0));
  const topGainer = sortedStocks[0];
  const topLoser = sortedStocks[sortedStocks.length - 1];

  let descByma = "";
  if (verde === 0 && rojo === 0) {
    descByma = "Jornada neutra o feriado bursátil · Sin variaciones";
  } else if (statusByma === "verde") {
    descByma = `${verde}/10 acciones en verde · ${topGainer?.symbol.replace(".BA","")} lidera (+${(topGainer?.variation || 0).toFixed(1)}%)`;
  } else if (statusByma === "amarillo") {
    // If mixed, show both gainer and loser, but check if they exist and format correctly
    const gainerVar = topGainer?.variation || 0;
    const loserVar = topLoser?.variation || 0;
    const gainerStr = gainerVar > 0 ? `+${gainerVar.toFixed(1)}%` : `${gainerVar.toFixed(1)}%`;
    const loserStr = loserVar > 0 ? `+${loserVar.toFixed(1)}%` : `${loserVar.toFixed(1)}%`;
    descByma = `Mercado mixto · ${topGainer?.symbol.replace(".BA","")} ${gainerStr} · ${topLoser?.symbol.replace(".BA","")} ${loserStr}`;
  } else {
    descByma = `${rojo}/10 acciones en rojo · ${topLoser?.symbol.replace(".BA","")} la mayor caída (${(topLoser?.variation || 0).toFixed(1)}%)`;
  }

  items.push({
    label: "Acciones BYMA",
    status: statusByma,
    titulo: tituloByma,
    descripcion: descByma
  });

  return items;
}
