// ---------------------------------------------------------------------------
// Hook de resolución ESM para correr los tests con el type-stripping nativo de
// Node, sin dependencias extra. Resuelve lo que Node no entiende por sí solo:
//
//   - el alias `@/` (raíz del repo, igual que en tsconfig `paths`)
//   - imports relativos sin extensión (`./foo` -> `./foo.ts` o `./foo/index.ts`)
//
// `lib/types/index.ts` contiene SOLO tipos: todo import desde ahí debe usar
// `import type` (se borra en runtime). No hay shim.
// ---------------------------------------------------------------------------
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function isFile(p) {
  return existsSync(p) && statSync(p).isFile();
}

function tryResolve(base) {
  const candidates = [base, `${base}.ts`, path.join(base, "index.ts")];
  return candidates.find(isFile) ?? null;
}

export async function resolve(specifier, context, nextResolve) {
  let base = null;

  if (specifier.startsWith("@/")) {
    base = path.join(ROOT, specifier.slice(2));
  } else if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL?.startsWith("file:")
  ) {
    base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  }

  if (base) {
    const found = tryResolve(base);
    if (found) return nextResolve(pathToFileURL(found).href, context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  // Todo el código del repo es ESM: evita el reparseo/warning por package.json
  // sin "type".
  if (url.startsWith("file:") && url.endsWith(".ts") && !url.includes("/node_modules/")) {
    return nextLoad(url, { ...context, format: "module-typescript" });
  }
  return nextLoad(url, context);
}
