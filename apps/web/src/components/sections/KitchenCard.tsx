import Link from 'next/link';
import { ModalButton } from '@/components/modals/ModalButton';
import { Photo } from '@/components/ui/Photo';
import { VehicleBadges } from '@/components/vehicle/VehicleBadges';
import { VehicleName } from '@/components/vehicle/VehicleName';
import { Badge } from '@/components/ui/Badge';
import type { Kitchen } from '@/lib/content/types';
import { formatPrice, installmentFrom } from '@/lib/format';
import { routes } from '@/lib/routes';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Vehicle card: the whole card is a link (overlay on the title), buttons sit above it with z-10. */
export function KitchenCard({ kitchen }: { kitchen: Kitchen }) {
  const href = routes.kitchen(kitchen.category.slug, kitchen.slug);
  const chips = [kitchen.dimensions, kitchen.style && cap(kitchen.style), kitchen.facade].filter(Boolean) as string[];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-bg transition duration-150 hover:-translate-y-0.5 hover:border-primary focus-within:border-primary">
      <div className="relative bg-surface">
        <Photo media={kitchen.gallery[0]} label="Car photo" ratio="16/10" sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 85vw" rounded={false} />
        <VehicleBadges kitchen={kitchen} className="absolute top-3 left-3 flex flex-wrap gap-1.5" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl leading-tight">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-primary">
            <VehicleName name={kitchen.name} />
          </Link>
        </h3>
        <p className="mt-1 text-sm text-fg-muted">{kitchen.category.name}</p>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <b className="font-display tabular text-2xl">{formatPrice(kitchen.price)}</b>
          <span className="tabular text-sm text-fg-muted">≈ {formatPrice(installmentFrom(kitchen.price))}/mo*</span>
          {kitchen.oldPrice && <s className="tabular text-sm text-fg-muted">{formatPrice(kitchen.oldPrice)}</s>}
        </div>

        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li key={c} className="rounded-badge bg-surface px-2 py-1 text-xs font-medium">
                {c}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-xs text-fg-muted">Free history report · 7-day returns</p>

        <div className="mt-auto pt-3">
          <ModalButton
            unstyled
            className="relative z-10 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            modal={{
              type: 'lead',
              title: 'Check availability',
              text: `Leave your contact details. A sales consultant will confirm the ${kitchen.name} is available and answer your questions.`,
              extra: { kitchen: kitchen.name },
            }}
          >
            Check availability →
          </ModalButton>
        </div>
      </div>
    </article>
  );
}

/** Promo card inserted into the inventory grid between cars. */
export function CatalogPromoCard({ variant }: { variant: 'promo' | 'quiz' }) {
  const isQuiz = variant === 'quiz';
  return (
    <article className="flex h-full flex-col justify-between gap-6 rounded-card bg-inverse p-6 text-on-inverse">
      <div>
        <Badge tone="light">{isQuiz ? 'Quiz · 1 minute' : 'Offer'}</Badge>
        <h3 className="mt-4 text-2xl font-semibold">
          {isQuiz ? 'We will match a car to your wishes' : '$1,000 trade-in bonus'}
        </h3>
        <p className="mt-2 text-on-inverse-muted">
          {isQuiz
            ? 'Take the quiz: tell us your budget and must-haves, and we will send a shortlist of cars that fit.'
            : 'Trade in your car with any purchase, per the offer terms.'}
        </p>
      </div>
      <ModalButton
        variant="contrast"
        modal={
          isQuiz
            ? { type: 'quiz' }
            : {
                type: 'promo',
                title: '$1,000 trade-in bonus',
                text: 'Trade in your car when you buy from Kestrow and get a $1,000 bonus on top of the appraisal, per the offer terms.',
              }
        }
      >
        {isQuiz ? 'Take the quiz' : 'About this offer'}
      </ModalButton>
    </article>
  );
}
