import { fetchLatamCurrencies } from "./lib/api/latam.ts";

fetchLatamCurrencies().then((res) => {
  console.log("LATAM RESULTS:");
  console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
