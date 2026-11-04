'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { ModalButton } from '@/components/modals/ModalButton';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { routes } from '@/lib/routes';
import { FINANCING, REVIEW_SUMMARY } from '@/lib/trust';

/*
 * Monthly payment calculator: car price − down payment − trade-in = amount financed,
 * standard amortised loan at the APR of the selected credit tier. Demo rates of the fictional dealership;
 * taxes, title and registration are not included.
 */
const CREDIT_TIERS = [
  { id: 'excellent', label: 'Excellent', note: '760+', apr: FINANCING.aprFrom },
  { id: 'good', label: 'Good', note: '680–759', apr: 7.9 },
  { id: 'fair', label: 'Fair', note: '620–679', apr: 10.9 },
  { id: 'rebuilding', label: 'Rebuilding', note: 'under 620', apr: 14.9 },
] as const;

const TERMS = FINANCING.terms.map((m) => ({ id: String(m), label: `${m} mo`, months: m }));

/** Monthly payment of an amortised loan */
function monthlyPayment(principal: number, aprPercent: number, months: number) {
  if (principal <= 0) return 0;
  const r = aprPercent / 100 / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - (1 + r) ** -months);
}

/** Price filter key of the catalog for a car price */
const priceKey = (price: number) => (price < 25_000 ? 'under-25k' : price <= 40_000 ? '25k-40k' : 'over-40k');

function Segmented({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly { id: string; label: string; note?: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((o) => (
          <label key={o.id} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'flex h-full flex-col rounded-media border border-line bg-paper px-4 py-3 text-[15px] transition-colors',
                'peer-checked:border-fg peer-checked:bg-fg peer-checked:text-on-primary',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                'hover:border-fg/60',
              )}
            >
              <span className="font-medium">{o.label}</span>
              {o.note && <span className="mt-0.5 text-xs opacity-70">{o.note}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint: [string, string];
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-2xl">
          {formatPrice(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--color-fg)]"
      />
      <div className="mt-1 flex justify-between text-xs text-fg-muted">
        <span>{hint[0]}</span>
        <span>{hint[1]}</span>
      </div>
    </div>
  );
}

/** "What will my payment be?" — instant monthly payment; the button sends the numbers with a pre-approval request. */
export function CostEstimator({ id = 'estimate' }: { id?: string }) {
  const [price, setPrice] = useState(28_000);
  const [down, setDown] = useState(3_000);
  const [tradeIn, setTradeIn] = useState(0);
  const [term, setTerm] = useState('60');
  const [tier, setTier] = useState<string>('good');

  const credit = CREDIT_TIERS.find((t) => t.id === tier)!;
  const months = Number(term);
  const financed = Math.max(0, price - down - tradeIn);
  const payment = Math.round(monthlyPayment(financed, credit.apr, months));
  const interest = Math.max(0, Math.round(payment * months - financed));
  const summary = `Car ${formatPrice(price)}, down ${formatPrice(down)}, trade-in ${formatPrice(tradeIn)}, ${months} mo, ${credit.label} credit (${credit.apr}% APR)`;

  return (
    <section id={id} className="scroll-mt-24 py-12 md:py-20">
      <div className="mx-auto w-full max-w-site px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div>
            <p className="eyebrow">Payment calculator</p>
            <h2 className="mt-3 text-4xl md:text-6xl">What will my payment be?</h2>
            <p className="mt-4 max-w-xl text-lg text-fg-muted">
              Move the sliders to see a monthly payment in seconds. No sign-up, and checking your rate later is a soft
              credit pull — it won&rsquo;t affect your score.
            </p>

            <div className="mt-8 space-y-7">
              <Slider label="Car price" value={price} min={10_000} max={90_000} step={500} onChange={setPrice} hint={['$10,000', '$90,000']} />
              <Slider
                label="Down payment"
                value={Math.min(down, price)}
                min={0}
                max={20_000}
                step={250}
                onChange={setDown}
                hint={['$0', '$20,000']}
              />
              <Slider label="Trade-in value" value={tradeIn} min={0} max={40_000} step={500} onChange={setTradeIn} hint={['No trade-in', '$40,000']} />
              <Segmented legend="Loan term" options={TERMS} value={term} onChange={setTerm} />
              <Segmented legend="Credit" options={CREDIT_TIERS} value={tier} onChange={setTier} />
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-block bg-inverse p-7 text-on-inverse md:p-9" aria-live="polite">
              <p className="text-sm text-on-inverse-muted">Estimated monthly payment</p>
              <p className="mt-2 font-display text-6xl leading-none md:text-7xl">
                {formatPrice(payment)}
                <span className="text-2xl text-on-inverse-muted">/mo</span>
              </p>
              <p className="mt-3 text-on-inverse-muted">
                {credit.apr}% APR · {months} months
              </p>

              <dl className="mt-7 space-y-3 border-t border-on-inverse/15 pt-6 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-on-inverse-muted">Amount financed</dt>
                  <dd className="text-right">{formatPrice(financed)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-on-inverse-muted">Total interest</dt>
                  <dd className="text-right">{formatPrice(interest)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-on-inverse-muted">Not included</dt>
                  <dd className="text-right">Taxes, title &amp; registration</dd>
                </div>
              </dl>

              <ModalButton
                variant="contrast"
                size="lg"
                className="mt-8 w-full"
                modal={{
                  type: 'lead',
                  title: 'Get pre-approved',
                  text: `Your estimate: ${formatPrice(payment)}/mo. Leave your phone number and our finance manager will confirm your real rate — a soft credit check, no impact on your score.`,
                  form: { formId: 'payment', submitLabel: 'Check my rate' },
                  extra: { estimate: `${formatPrice(payment)}/mo`, configuration: summary },
                }}
              >
                Get pre-approved
              </ModalButton>
              <Link
                href={`${routes.catalog()}?price=${priceKey(price)}`}
                className="mt-3 flex min-h-11 items-center justify-center rounded-control border border-on-inverse/30 text-[15px] hover:bg-on-inverse/10"
              >
                Browse cars around {formatPrice(Math.round(price / 1000) * 1000)}
              </Link>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-on-inverse-muted">
                <span className="text-star" aria-hidden>
                  ★★★★★
                </span>
                {REVIEW_SUMMARY.rating} from {REVIEW_SUMMARY.count.toLocaleString('en-US')} reviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
