import Link from 'next/link';
import { ModalButton } from '@/components/modals/ModalButton';
import { ChipList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import type { Article, Project, Promo, Review } from '@/lib/content/types';
import { formatDate, formatPrice, promoTerm, type PromoPeriod } from '@/lib/format';
import { routes } from '@/lib/routes';

/** Offer card: "Bonus/Deal" tag, visual, title, text, term (shared period), "Claim offer". */
export function PromoCard({ promo, showTerm, period }: { promo: Promo; showTerm?: boolean; period?: PromoPeriod }) {
  const term = promoTerm(promo.endsAt, period);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-card">
      <Photo media={promo.image} label="Offer visual" ratio="16/10" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 88vw" rounded={false} />
      <span className="absolute top-3 left-3">
        <Badge tone="light">{promo.kind === 'gift' ? 'Bonus' : 'Deal'}</Badge>
      </span>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl">{promo.title}</h3>
        <p className="mt-2 text-fg-muted">{promo.shortText}</p>
        {showTerm && term && <span className="mt-3 text-sm text-fg-muted">{term}</span>}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <ModalButton size="sm" modal={{ type: 'promo', title: promo.title, text: promo.text, term, image: promo.image }}>
            Claim offer
          </ModalButton>
          <ModalButton size="sm" variant="secondary" modal={{ type: 'promo', title: promo.title, text: promo.text, term, image: promo.image }}>
            Learn more
          </ModalButton>
        </div>
      </div>
    </article>
  );
}

const SOURCE_LABEL = { site: 'Video review', google: 'Google', houzz: 'Cars.com' } as const;

function Stars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <span aria-label={`Rated ${rating} out of 5`} className="text-sm tracking-wide text-star">
      {'★'.repeat(rating)}
      <span className="text-fg-muted">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

/** Vertical video review card → video modal; below it, "View car" or the rating. */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <div>
      <ModalButton
        unstyled
        modal={{ type: 'video', caption: review.caption, url: review.videoUrl }}
        className="placeholder-stripes group relative flex aspect-[9/16] w-full flex-col items-center justify-center overflow-hidden rounded-card border border-line text-fg-muted"
      >
        {review.photo && <Photo media={review.photo} label={review.caption} sizes="300px" absolute rounded={false} className="inset-0" />}
        <span className="flex size-14 items-center justify-center rounded-full bg-bg text-xl text-fg shadow-card transition-transform group-hover:scale-110">
          ▶
        </span>
        <span className="absolute inset-x-3 bottom-3 text-left text-sm font-medium text-fg">{review.caption}</span>
      </ModalButton>
      <div className="mt-2 flex min-h-6 items-center justify-between gap-2 text-sm">
        {review.kitchen ? (
          <Link href={routes.kitchen(review.kitchen.category, review.kitchen.slug)} className="underline underline-offset-2">
            View car
          </Link>
        ) : (
          <Stars rating={review.rating} />
        )}
      </div>
    </div>
  );
}

/** Text review: name, city, source, rating, text, link to the source. */
export function ReviewTextCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-paper p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{review.name}</h3>
          {review.place && <p className="text-sm text-fg-muted">{review.place}</p>}
        </div>
        <span className="rounded-control bg-surface px-2 py-1 text-xs text-fg-muted">{SOURCE_LABEL[review.source]}</span>
      </div>
      <div className="mt-2">
        <Stars rating={review.rating} />
      </div>
      {review.text && <p className="mt-4 line-clamp-6 text-[15px] leading-relaxed">“{review.text}”</p>}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm">
        {review.url && (
          <a href={review.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Read at the source
          </a>
        )}
        {review.kitchen && (
          <Link href={routes.kitchen(review.kitchen.category, review.kitchen.slug)} className="underline underline-offset-2">
            View car
          </Link>
        )}
        {review.date && (
          <time dateTime={review.date} className="ml-auto text-fg-muted">
            {formatDate(review.date)}
          </time>
        )}
      </div>
    </article>
  );
}

/** Blog article card. */
export function PostCard({ article, withExcerpt = true }: { article: Article; withExcerpt?: boolean }) {
  return (
    <article className="group">
      <Link href={routes.article(article.slug)} className="block">
        <Photo media={article.cover} label="Cover" ratio="16/10" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
        <div className="mt-3 text-sm text-fg-muted">
          {article.tag.name} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </div>
        <h3 className="mt-2 font-display text-2xl leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{article.title}</h3>
        {withExcerpt && <p className="mt-2 text-fg-muted">{article.excerpt}</p>}
      </Link>
    </article>
  );
}

/** Customer story (Strapi "project"): chips, name, specs, buttons + gallery. */
export function ProjectCase({ project }: { project: Project }) {
  return (
    <article className="group grid gap-8 border-t border-line py-12 first:border-t-0 lg:grid-cols-2 lg:gap-14">
      <div>
        <ChipList items={project.chips} />
        <h3 className="mt-5 font-display text-3xl md:text-4xl">{project.title}</h3>
        <p className="mt-3 text-fg-muted">{project.excerpt}</p>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          {project.specs.map((s) => (
            <div key={s.label}>
              <dt className="text-sm text-fg-muted">{s.label}</dt>
              <dd className="font-medium">{s.value}</dd>
            </div>
          ))}
          {project.priceFrom && (
            <div>
              <dt className="text-sm text-fg-muted">Price paid</dt>
              <dd className="font-semibold">{formatPrice(project.priceFrom)}</dd>
            </div>
          )}
        </dl>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={routes.project(project.slug)}>Read the story</Button>
          <ModalButton
            variant="secondary"
            modal={{
              type: 'lead',
              title: 'Find me a car like this',
              text: 'Leave your contact details and a sales consultant will look for a similar car in your budget.',
              extra: { project: project.title },
            }}
          >
            Find me a car like this
          </ModalButton>
        </div>
      </div>
      <div>
        <Photo media={project.gallery[0]} label="Story photo" ratio="4/3" sizes="(min-width: 1024px) 600px, 100vw" />
        {project.gallery.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {project.gallery.slice(1, 6).map((m, n) => (
              <Photo key={n} media={m} label={`Photo ${n + 2}`} ratio="1/1" sizes="120px" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
