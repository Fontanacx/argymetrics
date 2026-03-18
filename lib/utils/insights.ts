export interface NormalizedAsset {
  name: string;
  current: number;
  previous: number;
  unit?: string;
  prefix?: string;
  history?: any[];
  dataKey?: string;
  formatType?: "dollar" | "crypto" | "riesgo" | "inflacion" | "commodity";
}

export interface InsightResult {
  mostVolatile: (NormalizedAsset & { changePercent: number }) | null;
  mostStable: (NormalizedAsset & { changePercent: number }) | null;
  topPerformer: (NormalizedAsset & { changePercent: number }) | null;
}

export function computeDailyInsights(assets: NormalizedAsset[]): InsightResult {
  const validAssets = assets
    .filter((a) => a.previous > 0 && Number.isFinite(a.current) && Number.isFinite(a.previous))
    .map((a) => {
      const changePercent = ((a.current - a.previous) / a.previous) * 100;
      return { ...a, changePercent, absChange: Math.abs(changePercent) };
    });

  if (validAssets.length === 0) {
    return { mostVolatile: null, mostStable: null, topPerformer: null };
  }

  const mostVolatile = [...validAssets].sort((a, b) => b.absChange - a.absChange)[0];
  const mostStable = [...validAssets].sort((a, b) => a.absChange - b.absChange)[0];
  
  const positiveAssets = validAssets.filter((a) => a.changePercent > 0);
  const topPerformer = positiveAssets.length > 0 
    ? [...positiveAssets].sort((a, b) => b.changePercent - a.changePercent)[0] 
    : null;

  return {
    mostVolatile: mostVolatile || null,
    mostStable: mostStable || null,
    topPerformer: topPerformer || null,
  };
}
