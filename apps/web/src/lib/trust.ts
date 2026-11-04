/**
 * Proof points shown next to calls to action (hero, payment calculator, final form) and in JSON-LD.
 * Demo figures of the fictional dealership — kept in one place so every block says the same thing.
 */
export const REVIEW_SUMMARY = { rating: 4.8, count: 1240, countLabel: '1,240', source: 'Google & Cars.com' } as const;

export const PROOF_POINTS: [value: string, label: string][] = [
  ['6,500+', 'cars sold since 2014'],
  ['172-point', 'inspection on every car'],
  ['7 days', 'money-back guarantee'],
  ['100 mi', 'free home delivery radius'],
];

/** "From" price used in the hero and meta texts (cheapest car in the demo inventory) */
export const PRICE_FROM = 8900;

/** Financing terms of the demo (payment calculator, financing modal) */
export const FINANCING = { aprFrom: 5.9, terms: [36, 48, 60, 72] } as const;
