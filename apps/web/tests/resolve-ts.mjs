// Module resolution hook for Node tests (type stripping): `@/lib/x` → `src/lib/x.ts`, `./y` → `./y.ts`
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = new URL('../src/', import.meta.url);

const isFile = (p) => existsSync(p) && statSync(p).isFile();

export async function resolve(specifier, context, next) {
  let spec = specifier;
  if (spec.startsWith('@/')) spec = new URL(spec.slice(2), SRC).href;

  const relative = spec.startsWith('./') || spec.startsWith('../');
  if (relative || spec.startsWith('file:')) {
    const url = relative && context.parentURL ? new URL(spec, context.parentURL).href : spec;
    if (url.startsWith('file:')) {
      const path = fileURLToPath(url);
      for (const candidate of [path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`]) {
        if (isFile(candidate)) return next(pathToFileURL(candidate).href, context);
      }
    }
  }
  return next(spec, context);
}
