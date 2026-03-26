/**
 * Short financial definitions for each indicator shown in the info modal.
 */

export const INDICATOR_DEFINITIONS: Record<string, string> = {
  mayorista:
    "El Dólar Mayorista es el tipo de cambio operado en el mercado interbancario para transacciones de gran volumen entre el BCRA, bancos y grandes empresas exportadoras e importadoras. Es la cotización oficial más cercana al precio de mercado dentro del sistema regulado y sirve de referencia para calcular el tipo de cambio real multilateral (TCRM). No está disponible para el público general ni para operaciones minoristas.",

  blue:
    "El dolar blue es la cotizacion informal del dolar estadounidense en Argentina. " +
    "Opera fuera del mercado regulado y refleja la oferta y demanda real sin restricciones cambiarias. " +
    "Es ampliamente utilizado como referencia por comercios y ahorristas.",

  oficial:
    "El dolar oficial es la cotizacion regulada por el Banco Central (BCRA). " +
    "Es el tipo de cambio utilizado para operaciones formales, comercio exterior y liquidacion de exportaciones. " +
    "Sujeto a controles cambiarios y bandas de flotacion.",

  bolsa:
    "El dolar MEP (Mercado Electronico de Pagos) es un tipo de cambio que se obtiene comprando " +
    "bonos en pesos y vendiendolos en dolares dentro del mercado bursatil argentino. " +
    "Es una operacion legal y regulada por la CNV.",

  contadoconliqui:
    "El dolar CCL (Contado con Liquidacion) funciona de forma similar al MEP, pero la " +
    "liquidacion se realiza en una cuenta en el exterior. Permite transferir divisas fuera del pais " +
    "de forma legal a traves del mercado de capitales.",

  cripto:
    "El dolar cripto refleja el valor del dolar implicito en el precio de stablecoins como USDT " +
    "(Tether) en exchanges argentinos. Opera 24/7 sin restricciones y se ha convertido en una " +
    "alternativa popular para el ahorro en dolares.",

  riesgoPais:
    "El riesgo pais (EMBI+ Argentina) mide la diferencia entre la tasa de interes que paga Argentina " +
    "por su deuda y la tasa de los bonos del Tesoro de EE.UU. Un valor alto indica mayor percepcion " +
    "de riesgo crediticio y encarece el financiamiento del pais.",

  inflacion:
    "La inflacion mensual es la variacion porcentual del Indice de Precios al Consumidor (IPC) " +
    "publicado por el INDEC. Mide el aumento general de precios de bienes y servicios en Argentina. " +
    "Los datos se publican con aproximadamente 6 semanas de retraso.",

  oro:
    "El Oro (Gold Futures) es un activo refugio global tradicional y uno de los metales preciosos más cotizados. " +
    "Su precio varía según la política monetaria global, la inflación y la aversión al riesgo en los mercados internacionales.",

  petroleo:
    "El Petróleo Brent es la principal referencia del mercado petrolero global, basado en la extracción del Mar del Norte. " +
    "Influye en los costos de energía y logística a nivel mundial, impactando directamente en la inflación y finanzas globales.",

  bandas:
    "Las Bandas Cambiarias son los limites de flotacion del tipo de cambio oficial definidos por el Banco Central (BCRA). " +
    "El piso (banda inferior) y el techo (banda superior) se amplian un 1% mensual bajo un esquema de crawling peg. " +
    "Cuando el dolar oficial toca el piso, el BCRA compra divisas; cuando toca el techo, vende. " +
    "Este mecanismo busca dar previsibilidad al mercado cambiario reduciendo la volatilidad.",

  btc:
    "Bitcoin (BTC) es la primera y mas importante criptomoneda del mundo, descentralizada y con un suministro limitado a 21 millones de monedas. " +
    "Funciona como una reserva de valor digital ('oro digital') y es el principal indicador del mercado cripto global.",

  eth:
    "Ethereum (ETH) es la segunda criptomoneda más grande por capitalización. Su blockchain permite la creación de contratos inteligentes (smart contracts) " +
    "y aplicaciones descentralizadas (dApps), siendo la base técnica de gran parte del ecosistema web3 y DeFi (Finanzas Descentralizadas).",

  astropay:
    "El Dólar AstroPay es la cotización implícita al comprar o vender criptomonedas (usualmente USDT o USDC) " +
    "dentro de la billetera virtual AstroPay. Es una vía rápida y 24/7 para dolarizar saldos utilizando pesos argentinos sin cepo cambiario.",

  cocos:
    "El Dólar Cocos refleja el tipo de cambio para adquirir criptomonedas estables (USDT/USDC) a través de la plataforma Cocos Crypto. " +
    "Se alinea con el valor del dólar cripto general y permite una exposición directa al dólar de forma digital e inmediata.",

  lemoncash:
    "El Dólar Lemon es el valor de conversión al operar USDT o USDC directamente desde la app Lemon Cash. " +
    "Es una de las referencias más populares en Argentina para el dólar cripto minorista.",

  belo:
    "El Dólar Belo representa el tipo de cambio obtenido al intercambiar pesos por criptoactivos estables en la billetera Belo. " +
    "Se utiliza frecuentemente para proteger ingresos o saldo en la tarjeta frente a la devaluación.",

  buenbit:
    "La cotización de Buenbit refleja el precio de compra/venta de dólares digitales (criptomonedas atadas al dólar) en su plataforma. " +
    "Es un indicador de referencia para el ecosistema de finanzas descentralizadas local.",

  euro:
    "El Euro Oficial es la cotización de la moneda europea regulada por el Banco Central (BCRA). " +
    "Se utiliza principalmente para operaciones de comercio exterior formal que involucran a la Unión Europea.",

  eurotarjeta:
    "El Euro Tarjeta es el tipo de cambio aplicado a los consumos en euros realizados con tarjetas de crédito o débito argentinas. " +
    "Incluye los impuestos y retenciones (PAIS, Ganancias) aplicados sobre el Euro Oficial.",

  euroblue:
    "El Euro Blue es la cotización informal del euro en Argentina, intercambiado fuera del mercado bancario regulado. " +
    "Al igual que el dólar blue, su valor se rige estrictamente por la oferta y la demanda del mercado paralelo.",

  gas:
    "El Gas Natural (Henry Hub Futures) es la principal referencia del mercado de gas en Norteamérica. " +
    "Su precio es un indicador clave de los costos energéticos globales, influyendo fuertemente en la industria y la economía a nivel internacional.",

  realblue:
    "El Real Blue es la cotización del real brasileño en el mercado informal argentino. " +
    "Se calcula tomando como referencia el Dólar Blue y la paridad internacional del real frente al dólar.",

  real:
    "El Real Oficial es la cotización del real brasileño regulada por el Banco Central (BCRA). " +
    "Es el tipo de cambio utilizado para operaciones formales de comercio bilateral entre Argentina y Brasil.",

  realtarjeta:
    "El Real Tarjeta es el tipo de cambio aplicado a consumos en reales realizados con tarjetas argentinas. " +
    "Incluye los impuestos y retenciones (PAIS, Ganancias) aplicados sobre el Real Oficial, resultando en un recargo del 60%.",

  // BYMA Stocks
  "ggal.ba":
    "Grupo Financiero Galicia (GGAL) es uno de los principales bancos privados de la República Argentina. Ofrece servicios financieros estructurados a individuos y empresas.",
  "ypfd.ba":
    "YPF (Yacimientos Petrolíferos Fiscales) es la empresa de energía más grande de Argentina, dedicada a la exploración, producción, refinación y venta de petróleo y gas.",
  "pamp.ba":
    "Pampa Energía (PAMP) es una de las mayores empresas integradas de electricidad en Argentina, participando en la generación, transmisión y distribución de energía eléctrica.",
  "bma.ba":
    "Banco Macro (BMA) es un banco de capitales privados argentinos que opera con una extensa red de sucursales en todo el país, enfocado en el interior de Argentina.",
  "cepu.ba":
    "Central Puerto (CEPU) es una de las mayores empresas de generación eléctrica del país, operando plantas térmicas, hidroeléctricas y parques eólicos.",
  "txar.ba":
    "Ternium Argentina (TXAR), ex Siderar, es el mayor fabricante de aceros planos de Argentina, fundamental para la industria automotriz, la construcción y el agro.",
  "alua.ba":
    "Aluar (ALUA) es la única empresa productora de aluminio primario en Argentina, exportando gran parte de su producción a mercados internacionales.",
  "cres.ba":
    "Cresud (CRES) es una de las principales empresas agropecuarias de Argentina, con extensas tierras dedicadas a la producción agrícola y ganadera.",
  "tgsu2.ba":
    "Transportadora de Gas del Sur (TGSU2) es la mayor transportadora de gas natural de Argentina, operando el sistema de gasoductos más extenso del país.",
  "loma.ba":
    "Loma Negra (LOMA) es la empresa cementera líder en Argentina, siendo un termómetro directo del sector de la construcción y la obra pública.",
};
