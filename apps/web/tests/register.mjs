// Registers the resolver for `node --test`: the @/ → src/ alias and imports without the .ts extension
import { register } from 'node:module';

register('./resolve-ts.mjs', import.meta.url);
