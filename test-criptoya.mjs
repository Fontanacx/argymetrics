// Test multiple potential live sources for Riesgo Pais
const sources = [
  {
    name: "BCRA v3 - Variable 5 (Riesgo Pais)",
    url: "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/5/2026-03-01/2026-03-17",
    headers: { "Accept": "application/json" }
  },
  {
    name: "DolarAPI riesgo-pais",
    url: "https://dolarapi.com/v1/dolares",
    headers: { "Accept": "application/json" }
  },
  {
    name: "Ambito.com mercados",
    url: "https://mercados.ambito.com/riesgopais/informacion",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      "Accept": "application/json",
    }
  },
  {
    name: "Rava Bursatil",
    url: "https://www.rava.com/api/indices/riesgo-pais",
    headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" }
  },
  {
    name: "BCRA v3 - all variables",
    url: "https://api.bcra.gob.ar/estadisticas/v3.0/monetarias",
    headers: { "Accept": "application/json" }
  },
];

for (const s of sources) {
  try {
    const res = await fetch(s.url, { headers: s.headers });
    const text = await res.text();
    console.log(`\n=== ${s.name} (${res.status}) ===`);
    console.log(text.slice(0, 400));
  } catch (e) {
    console.log(`${s.name} ERROR:`, e.message);
  }
}
