async function test() {
  try {
    const res = await fetch("https://dolarhoy.com/cotizacion-riesgo-pais", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const text = await res.text();
    
    // Look for the block containing the value
    // In Dolarhoy, it usually looks like <div class="value">592</div>
    const match = text.match(/<div[^>]*class=\"value\"[^>]*>\s*([\d,.]+)\s*<\/div>/i);
    if (match && match[1]) {
      console.log("Found value:", match[1]);
    } else {
      console.log("Regex failed, searching for 592...");
      const idx = text.indexOf('592');
      console.log(text.substring(idx - 60, idx + 60));
    }
  } catch(e) {
    console.error(e);
  }
}
test();
