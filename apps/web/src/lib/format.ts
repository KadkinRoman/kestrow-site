const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** 12400 → "$12,400" */
export function formatPrice(value: number) {
  return `$${priceFormatter.format(value)}`;
}

/** Estimated monthly payment for the financing badge (illustrative: 5.9% APR, 72-month term, no down payment) */
export function installmentFrom(price: number, months = 72, apr = 0.059) {
  const r = apr / 12;
  return Math.round((price * r) / (1 - (1 + r) ** -months) / 10) * 10;
}

export function discountPercent(price: number, oldPrice?: number) {
  return oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
}

export type PromoPeriod = { startsAt?: string; endsAt?: string };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthDay = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split('-');
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
};

/**
 * Offer term. Own end date → "Offer valid until Dec 31, 2026"; otherwise the shared period from
 * Site Settings → "Valid Oct 1 – Oct 31"; nothing set — undefined.
 */
export function promoTerm(endsAt?: string, period?: PromoPeriod) {
  if (endsAt) {
    const [y] = endsAt.slice(0, 10).split('-');
    return `Offer valid until ${monthDay(endsAt)}, ${y}`;
  }
  if (period?.endsAt) {
    return period.startsAt
      ? `Valid ${monthDay(period.startsAt)} – ${monthDay(period.endsAt)}`
      : `Valid until ${monthDay(period.endsAt)}`;
  }
  return undefined;
}

/** '2026-10-12' → "Oct 12, 2026" */
export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

/** National digits of a US number: non-digits stripped, leading country code 1 dropped, at most 10 */
export function nationalDigits(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('1')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** Phone mask: any digits → "+1 (555) 010-4820" */
export function formatPhone(input: string) {
  const p = nationalDigits(input);
  let out = '+1';
  if (p.length > 0) out += ` (${p.slice(0, 3)}`;
  if (p.length >= 3) out += ')';
  if (p.length > 3) out += ` ${p.slice(3, 6)}`;
  if (p.length > 6) out += `-${p.slice(6, 10)}`;
  return out;
}

export function isPhoneComplete(value: string) {
  return nationalDigits(value).length === 10;
}
