import Link from 'next/link';
import { Fragment } from 'react';
import { ModalButton } from '@/components/modals/ModalButton';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import type { Kitchen } from '@/lib/content/types';
import { discountPercent, formatPrice, installmentFrom } from '@/lib/format';
import { routes } from '@/lib/routes';

/** Vehicle card: photo, badges, price with price drop, estimated payment, buttons. */
export function KitchenCard({ kitchen }: { kitchen: Kitchen }) {
  const href = routes.kitchen(kitchen.category.slug, kitchen.slug);
  const discount = discountPercent(kitchen.price, kitchen.oldPrice);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-card">
      <Link href={href} className="relative block" tabIndex={-1} aria-hidden>
        <Photo media={kitchen.gallery[0]} label="Car photo" ratio="4/3" sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 85vw" rounded={false} />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {discount > 0 && <Badge>Price drop</Badge>}
          {kitchen.badge && <Badge tone="light">{kitchen.badge}</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <span className="text-sm text-fg-muted">{kitchen.shortDesc}</span>
        <h3 className="mt-1 font-display text-2xl">
          <Link href={href} className="hover:underline">
            {kitchen.name.split(' ').map((w, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                {w.includes('-') ? <span className="whitespace-nowrap">{w}</span> : w}
              </Fragment>
            ))}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
          <b className="text-xl">{formatPrice(kitchen.price)}</b>
          {kitchen.oldPrice && <s className="text-sm text-fg-muted">{formatPrice(kitchen.oldPrice)}</s>}
        </div>

        <div className="mt-1 text-sm text-fg-muted">
          Est. {formatPrice(installmentFrom(kitchen.price))}/mo{' '}
          <ModalButton modal={{ type: 'installment' }} unstyled className="underline underline-offset-2 hover:text-fg">
            terms
          </ModalButton>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <ModalButton
            size="sm"
            className="flex-1 whitespace-nowrap"
            modal={{
              type: 'lead',
              title: 'Check availability',
              text: `Leave your contact details. A sales consultant will confirm the ${kitchen.name} is available and answer your questions.`,
              extra: { kitchen: kitchen.name },
            }}
          >
            Check availability
          </ModalButton>
          <Link href={href} className={buttonClass('secondary', 'sm', 'flex-1 whitespace-nowrap')}>
            View details
          </Link>
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
