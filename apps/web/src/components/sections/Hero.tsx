import type { ReactNode } from 'react';
import { ChipList } from '@/components/ui/Badge';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';
import type { Media } from '@/lib/content/types';

/**
 * Home hero (dealership): night background, value claim and the search card on the left,
 * a framed photo with a floating proof card on the right. Deliberately not full-bleed.
 */
export function HeroDealer({
  eyebrow,
  title,
  lead,
  search,
  proof,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  /** The search card (client component) */
  search: ReactNode;
  /** Floating card over the photo: rating and guarantees */
  proof?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-inverse text-on-inverse">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_10%,rgb(31_75_255/0.35),transparent_60%)]"
      />
      <Container className="relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        <div>
          {eyebrow && <p className="text-xs font-bold tracking-[0.16em] text-on-inverse-muted uppercase">{eyebrow}</p>}
          <h1 className="mt-3 text-5xl leading-[0.95] md:text-7xl">{title}</h1>
          <p className="mt-5 max-w-xl text-lg text-on-inverse/80">{lead}</p>
          <div className="mt-8">{search}</div>
        </div>
        <div className="relative hidden lg:block">
          <Photo
            media={staticPhoto('showroom-1.jpg', 'Silver electric crossover in the Kestrow showroom')}
            label="Kestrow showroom"
            ratio="4/5"
            priority
            sizes="(min-width: 1024px) 560px, 0px"
            className="rounded-card"
          />
          {proof && (
            <div className="absolute -bottom-6 -left-6 max-w-xs rounded-card bg-bg p-5 text-fg shadow-modal">{proof}</div>
          )}
        </div>
      </Container>
    </section>
  );
}

type PageHeroProps = {
  crumbs?: Crumb[];
  title: ReactNode;
  lead?: ReactNode;
  sub?: ReactNode;
  chips?: string[];
  actions?: ReactNode;
  /** Media placeholder caption on the right; null — no media */
  media?: string | null;
  /** Photo on the right (Strapi media or a static file); without it — a placeholder with the caption */
  image?: Media;
  children?: ReactNode;
  className?: string;
};

/** Hero of inner pages: breadcrumbs, H1, lead, chips, buttons, media on the right. */
export function PageHero({ crumbs, title, lead, sub, chips, actions, media, image, children, className }: PageHeroProps) {
  return (
    <section className={cn('pt-6 pb-10 md:pb-14', className)}>
      <Container>
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className={cn('mt-6 grid items-center gap-8', media !== null && 'lg:grid-cols-2')}>
          <div>
            <h1 className="text-4xl md:text-6xl">{title}</h1>
            {lead && <p className="mt-4 text-lg md:text-xl">{lead}</p>}
            {sub && <p className="mt-3 text-fg-muted">{sub}</p>}
            {chips && <ChipList items={chips} className="mt-5" />}
            {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {media !== null && (
            <Photo media={image} label={media ?? 'Photo'} priority sizes="(min-width: 1024px) 600px, 100vw" className="min-h-64 lg:min-h-96" />
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}
