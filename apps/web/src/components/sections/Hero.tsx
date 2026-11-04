import type { ReactNode } from 'react';
import { ChipList } from '@/components/ui/Badge';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';
import type { Media } from '@/lib/content/types';

/** Home hero: full-bleed photo with a dark gradient, value claim, CTAs, proof line + offers panel. */
export function HeroVideo({
  eyebrow,
  title,
  lead,
  actions,
  proof,
  aside,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  actions: ReactNode;
  /** Under the buttons: rating, warranty, lead time */
  proof?: ReactNode;
  /** Right side: offers panel */
  aside?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-inverse text-on-inverse">
      <Photo
        media={staticPhoto('hero-showroom.jpg', 'Car on a mountain road at sunset')}
        label="Kestrow showroom"
        priority
        absolute
        rounded={false}
        className="inset-0 -z-20"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-inverse/90 via-inverse/70 to-inverse/25" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-inverse/60 to-transparent" aria-hidden />
      <Container className="flex min-h-[600px] items-end pt-24 pb-14 md:min-h-[min(86vh,820px)] md:pb-20">
        <div className={cn('grid w-full items-end gap-10', !!aside && 'lg:grid-cols-[1fr_minmax(0,340px)]')}>
          <div className="max-w-3xl">
            {eyebrow && <p className="text-xs font-semibold tracking-[0.2em] text-on-inverse-muted uppercase">{eyebrow}</p>}
            <h1 className="mt-4 text-5xl leading-[0.98] md:text-7xl xl:text-[5.5rem]">{title}</h1>
            <p className="mt-6 max-w-xl text-lg text-on-inverse/85 md:text-xl">{lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
            {proof && <div className="mt-8 text-sm text-on-inverse-muted">{proof}</div>}
          </div>
          {aside}
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
