import { Container } from '@/components/ui/layout';
import { PROOF_POINTS, REVIEW_SUMMARY } from '@/lib/trust';

/** Row of proof points right under the hero: rating + key figures. */
export function ProofStrip() {
  return (
    <section aria-label="Why drivers choose Kestrow" className="border-b border-line bg-paper">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-5 md:py-12">
        <div>
          <div className="font-display text-4xl leading-none md:text-5xl">{REVIEW_SUMMARY.rating}</div>
          <div className="mt-2 text-sm text-fg-muted">
            <span className="text-star" aria-hidden>
              ★★★★★{' '}
            </span>
            {REVIEW_SUMMARY.countLabel} reviews on {REVIEW_SUMMARY.source}
          </div>
        </div>
        {PROOF_POINTS.map(([value, label]) => (
          <div key={label}>
            <div className="font-display text-4xl leading-none md:text-5xl">{value}</div>
            <div className="mt-2 text-sm text-fg-muted">{label}</div>
          </div>
        ))}
      </Container>
    </section>
  );
}
