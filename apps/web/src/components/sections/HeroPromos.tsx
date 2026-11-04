import Link from 'next/link';
import { ModalButton } from '@/components/modals/ModalButton';
import { getPromos, getSettings } from '@/lib/content';
import { promoTerm } from '@/lib/format';
import { routes } from '@/lib/routes';

/** Offers panel in the home hero: shared term and the first offers — prototype */
export async function HeroPromos() {
  const [promos, settings] = await Promise.all([getPromos(), getSettings()]);
  if (!promos.length) return null;
  const term = promoTerm(undefined, settings.promoPeriod);

  return (
    <aside className="hidden rounded-card border border-on-inverse/15 bg-inverse/40 p-6 text-on-inverse backdrop-blur-md lg:block">
      <div className="text-xs font-semibold tracking-[0.18em] text-on-inverse-muted uppercase">{term ? `Offers · ${term.replace(/^Offer valid /, '')}` : 'Offers'}</div>
      <ul className="mt-3 space-y-2">
        {promos.slice(0, 3).map((p) => (
          <li key={p.slug}>
            <ModalButton
              unstyled
              modal={{ type: 'promo', title: p.title, text: p.text, term: promoTerm(p.endsAt, settings.promoPeriod) }}
              className="text-left font-medium underline-offset-2 hover:underline"
            >
              {p.title}
            </ModalButton>
          </li>
        ))}
      </ul>
      <Link href={routes.promos()} className="mt-4 inline-block text-sm underline underline-offset-2">
        All offers →
      </Link>
    </aside>
  );
}
