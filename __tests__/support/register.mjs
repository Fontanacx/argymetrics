// Registra el resolver de módulos para los tests (se usa con `node --import`).
import { register } from "node:module";

register("./loader.mjs", import.meta.url);
