import { Container } from '@/components/ui/layout';
import { PROOF_POINTS, REVIEW_SUMMARY } from '@/lib/trust';

/** Row of proof points right under the hero: rating + key figures. */
export function ProofStrip() {
  return (
    <section aria-label="Why drivers choose Kestrow" className="border-b border-line bg-surface">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-5 md:divide-x md:divide-line md:py-10 [&>div]:md:pl-6 [&>div:first-child]:md:pl-0">
        <div>
          <div className="font-display text-4xl leading-none tabular text-ink md:text-5xl">{REVIEW_SUMMARY.rating}</div>
          <div className="mt-2 text-sm text-fg-muted">
            <span className="text-star" aria-hidden>
              ★★★★★{' '}
            </span>
            {REVIEW_SUMMARY.countLabel} reviews on {REVIEW_SUMMARY.source}
          </div>
        </div>
        {PROOF_POINTS.map(([value, label]) => (
          <div key={label}>
            <div className="font-display text-4xl leading-none tabular text-ink md:text-5xl">{value}</div>
            <div className="mt-2 text-sm text-fg-muted">{label}</div>
          </div>
        ))}
      </Container>
    </section>
  );
}
