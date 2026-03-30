import { getMarketIndices } from "./indices";

async function main() {
  const data = await getMarketIndices();
  console.log(JSON.stringify(data.map(d => ({ symbol: d.symbol, variation: d.variation })), null, 2));
}

main().catch(console.error);
