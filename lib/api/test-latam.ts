import { fetchLatamCurrencies } from "./latam";
fetchLatamCurrencies().then(res => {
  res.forEach(c => {
    console.log(`1 ${c.moneda} = ${c.compra.toFixed(2)} ARS. | 1000 ${c.moneda} = ${(c.compra * 1000).toFixed(2)} ARS.`);
    if (c.moneda === 'CLP' || c.moneda === 'PYG') {
      console.log(`Which implies 1000 ARS = ${(1000 / c.compra).toFixed(2)} ${c.moneda}`);
    }
  });
}).catch(console.error);
