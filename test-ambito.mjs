async function test() {
  try {
    const ambitoRes = await fetch("https://mercados.ambito.com/riesgopais/info", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
      }
    });
    console.log("Status:", ambitoRes.status);
    const text = await ambitoRes.text();
    console.log("Text snippet:", text.substring(0, 200));
    
    // Sometimes parsing Ambito's JSON proxy route yields strings
    if (text.includes('"valor"')) {
      const matched = text.match(/"valor"\s*:\s*"([^"]+)"/);
      console.log("Matched:", matched);
      if (matched && matched[1]) {
        const parsedVal = parseFloat(matched[1].replace(/\./g, "").replace(",", "."));
        console.log("Parsed Val:", parsedVal);
      }
    } else {
      console.log("Does not include 'valor'");
      const matchedAlt = text.match(/<span[^>]*>([\d,.]+)<\/span>/); // very generic, just to see
      console.log("Any numbers?", text.match(/[\d]{3},[\d]{2}/g));
    }
  } catch(e) {
    console.error(e);
  }
}
test();
