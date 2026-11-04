/**
 * Composite sections repeated across several pages. They fetch their own data
 * (async server components), so each page needs just one line.
 */
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Tile, TileGrid } from '@/components/ui/Tile';
import {
  getArticles,
  getFaqs,
  getHomeReviews,
  getKitchenCategories,
  getKitchensForRail,
  getOrderStages,
  getPromos,
  getSettings,
} from '@/lib/content';
import type { ContentGroup } from '@/lib/content/types';
import { routes } from '@/lib/routes';
import { Faq, Steps } from './Blocks';
import { PostCard, PromoCard, ReviewCard, ReviewTextCard } from './Cards';
import { KitchenRail } from './KitchenRail';
import { Rail } from './Rail';

export async function CatalogRailSection({
  title = 'Cars in stock',
  subtitle = 'Hand-picked pre-owned cars, each with a 172-point inspection and a transparent, no-haggle price.',
}: {
  title?: string;
  subtitle?: string;
}) {
  const [kitchens, categories] = await Promise.all([getKitchensForRail(), getKitchenCategories()]);
  return (
    <Section>
      <KitchenRail
        title={title}
        subtitle={subtitle}
        kitchens={kitchens}
        categories={categories}
        footer={
          <Button href={routes.catalog()} variant="secondary">
            Browse all cars
          </Button>
        }
      />
    </Section>
  );
}

/** Video reviews rail (home, car page, About): those flagged "on home"; the button leads to the Reviews page */
export async function ReviewsSection({ id = 'reviews', moreHref = routes.reviews() }: { id?: string; moreHref?: string }) {
  const [reviews, settings] = await Promise.all([getHomeReviews(), getSettings()]);
  return (
    <Section id={id}>
      <Rail
        title="What drivers say about Kestrow"
        variant={reviews.some((r) => r.videoUrl) ? 'narrow' : 'cards'}
        toolbar={
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {settings.reviewLinks.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {l.label}
              </a>
            ))}
          </div>
        }
        footer={
          <Button href={moreHref} variant="secondary">
            See more reviews
          </Button>
        }
      >
        {reviews.map((r) => (r.videoUrl ? <ReviewCard key={r.id} review={r} /> : <ReviewTextCard key={r.id} review={r} />))}
      </Rail>
    </Section>
  );
}

export async function PromosRailSection({
  title = 'Special offers for you',
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const [promos, settings] = await Promise.all([getPromos(), getSettings()]);
  return (
    <Section>
      <Rail
        title={title}
        subtitle={subtitle}
        variant="wide"
        footer={
          <Button href={routes.promos()} variant="secondary">
            All offers
          </Button>
        }
      >
        {promos.map((p) => (
          <PromoCard key={p.slug} promo={p} showTerm period={settings.promoPeriod} />
        ))}
      </Rail>
    </Section>
  );
}

export async function BlogTeaserSection({ title = 'Kestrow blog', exclude }: { title?: string; exclude?: string }) {
  const { items } = await getArticles({ pageSize: 4 });
  const posts = items.filter((a) => a.slug !== exclude).slice(0, 3);
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title={title}
          subtitle="Practical advice on what matters most: choosing a used car, financing, trade-ins and keeping it running well."
        />
        <Button href={routes.blog()} variant="secondary">
          All articles
        </Button>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((a) => (
          <PostCard key={a.slug} article={a} />
        ))}
      </div>
    </Section>
  );
}

export async function FaqSection({ group, title = 'Frequently asked questions' }: { group: ContentGroup; title?: string }) {
  const items = await getFaqs(group);
  if (!items.length) return null;
  return (
    <Section>
      <SectionHeading title={title} />
      <Faq items={items} name={`faq-${group}`} />
    </Section>
  );
}

export async function StepsSection({
  group,
  title,
  eyebrow,
  subtitle,
  labels,
  children,
}: {
  group: ContentGroup;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** Timeline label per step ("Day 1", "Week 2") */
  labels?: string[];
  children?: ReactNode;
}) {
  const items = await getOrderStages(group);
  return (
    <Section>
      <SectionHeading title={title} eyebrow={eyebrow} subtitle={subtitle} />
      <Steps items={items} labels={labels} />
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </Section>
  );
}

/** "What you get / Kestrow stands behind every car" */
export function GuaranteesSection({
  title = 'What you get when you buy a car from us',
  items = [
    '172-point inspection',
    '12-month powertrain warranty',
    '7-day money-back guarantee',
    'No-haggle, transparent price',
    'Free delivery within 100 miles',
  ],
  withLink = true,
}: {
  title?: string;
  items?: string[];
  withLink?: boolean;
}) {
  return (
    <Section>
      <SectionHeading title={title} />
      <TileGrid cols={5} className="mt-8">
        {items.map((t) => (
          <Tile key={t} title={t} icon />
        ))}
      </TileGrid>
      {withLink && (
        <div className="mt-6">
          <Button href={routes.warranty()} variant="secondary">
            Learn more about the warranty
          </Button>
        </div>
      )}
    </Section>
  );
}
