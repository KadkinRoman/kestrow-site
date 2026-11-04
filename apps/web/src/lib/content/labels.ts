/**
 * Human-readable labels for Strapi enumeration keys (apps/cms/src/api/kitchen/content-types/kitchen/schema.json).
 * Shared engine: for the dealership `style` = fuel, `facade` = drivetrain, `color` = exterior color.
 * Added a value to the schema? Add its label here.
 */
import type { FilterOption } from './types';

export const STYLE_LABELS: Record<string, string> = {
  gasoline: 'gasoline',
  hybrid: 'hybrid',
  'plug-in-hybrid': 'plug-in hybrid',
  electric: 'electric',
  diesel: 'diesel',
};

export const FACADE_LABELS: Record<string, string> = {
  awd: 'AWD',
  'four-wd': '4WD',
  fwd: 'FWD',
  rwd: 'RWD',
};

export const COLOR_LABELS: Record<string, string> = {
  white: 'white',
  black: 'black',
  silver: 'silver / gray',
  blue: 'blue',
  red: 'red',
};

export const PRICE_RANGES: Record<string, { label: string; min: number; max?: number }> = {
  'under-25k': { label: 'Under $25,000', min: 0, max: 25_000 },
  '25k-40k': { label: '$25,000–40,000', min: 25_000, max: 40_000 },
  'over-40k': { label: 'Over $40,000', min: 40_000 },
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const toOptions = (labels: Record<string, string>): FilterOption[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label: capitalize(label) }));
