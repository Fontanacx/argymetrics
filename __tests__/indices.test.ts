import { getMarketIndices } from "../lib/api/indices";

async function test() {
  const data = await getMarketIndices();
  console.log(JSON.stringify(data.map(d => ({ symbol: d.symbol, variation: d.variation })), null, 2));
}

test();
