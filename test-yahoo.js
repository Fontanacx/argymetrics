async function test() {
  const url = "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=2d";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    console.log("META GC=F:", Object.keys(meta));
    console.log("regularMarketPrice:", meta.regularMarketPrice);
    console.log("previousClose:", meta.previousClose);
    console.log("chartPreviousClose:", meta.chartPreviousClose);
    
    // Check quotes array
    const indicators = data?.chart?.result?.[0]?.indicators?.quote?.[0];
    console.log("Quote keys:", Object.keys(indicators || {}));
    if (indicators) {
      console.log("Close array last values:", indicators.close?.slice(-2));
    }
  } catch (err) {
    console.error(err);
  }
}
test();
