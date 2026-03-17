# ArgyMetrics 🇦🇷

🌍 **En vivo:** [argymetrics.vercel.app](https://argymetrics.vercel.app/)

ArgyMetrics es un dashboard financiero interactivo y en tiempo real diseñado para rastrear las métricas clave de la economía argentina y los mercados globales. Provee información centralizada y de fácil lectura sobre divisas, indicadores de riesgo, criptomonedas y materias primas.

##  Características Principales

- **Divisas (Dólar y Euro):** Cotizaciones en tiempo real del Dólar (Blue, Oficial, Bolsa, CCL, Tarjeta, etc.) y Euro, incluyendo minigráficos (*sparklines*) con el historial de los últimos días.
- **Riesgo País e Inflación:** Seguimiento diario del Riesgo País y la Inflación Mensual (IPC), con gráficos históricos accesibles mediante modales interactivos.
- **Criptomonedas:** Precios en vivo de Bitcoin (BTC) y Ethereum (ETH) utilizando datos precisos.
- **Materias Primas (Commodities):** Valores actualizados de Oro y Petróleo Brent.
- **Conversor de Monedas:** Una herramienta integrada para convertir rápidamente entre Pesos Argentinos (ARS) y las distintas variantes del Dólar y Euro.
- **Bandas Cambiarias:** Visualización del estado actual de la cotización oficial dentro del esquema de bandas cambiarias esperado.

##  Tecnologías Utilizadas

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Server Components).
- **Lenguaje:** TypeScript.
- **Estilos:** Tailwind CSS v4 para un diseño moderno, responsivo y modo oscuro.
- **Gráficos:** Recharts para visualizaciones de datos históricas nítidas y dinámicas.
- **Íconos:** Lucide React.
- **Fuentes de Datos:** APIs públicas como DolarAPI, ArgentinaDatos, CriptoYa y Yahoo Finance.

## ⚙️ Instalación y Uso Local

Este proyecto utiliza `pnpm` como gestor de paquetes.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/argymetrics.git
   ```

2. Instala las dependencias:
   ```bash
   cd argymetrics
   pnpm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   pnpm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

##  Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la interfaz, agregar nuevas métricas de Argentina o corregir bugs, no dudes en hacer un *fork* y enviar un *pull request*.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

---
*Datos provistos por DolarAPI, ArgentinaDatos y CriptoYa. La información es de carácter informativo y no constituye asesoramiento financiero.*
