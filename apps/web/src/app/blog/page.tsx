import Link from 'next/link';
import { Suspense } from 'react';
import { ArticleList, ArticleListSkeleton } from '@/components/blog/ArticleList';
import { CtaForm } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { getArticles } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';

export const generateMetadata = () =>
  pageMetadata(routes.blog(), {
    title: 'Blog',
    description: 'Practical guides on buying a used car: inspections, financing, trade-ins, electric cars and ownership costs.',
  });

export default async function BlogPage({ searchParams }: PageProps<'/blog'>) {
  const latest = await getArticles({ pageSize: 1 });
  const top = latest.items[0];

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        crumbs={[{ label: 'Blog' }]}
        title="The Kestrow blog"
        lead="Practical guides on buying a used car: inspections, financing, trade-ins, electric cars and ownership costs."
        sub="We answer the questions that come up before you buy a car and in the first years of owning it."
        media="Kestrow showroom photo"
        image={staticPhoto('showroom-2.jpg', 'Cars on display in the bright Kestrow Motors showroom')}
      />

      {/* 2 · Latest article */}
      {top && (
        <Section spacing="sm">
          <article className="grid items-center gap-8 lg:grid-cols-2">
            <Link href={routes.article(top.slug)} tabIndex={-1} aria-hidden>
              <Photo media={top.cover} label="Article cover" ratio="16/10" sizes="(min-width: 1024px) 600px, 100vw" />
            </Link>
            <div>
              <div className="text-sm text-fg-muted">
                {top.tag.name} · <time dateTime={top.publishedAt}>{formatDate(top.publishedAt)}</time>
              </div>
              <h2 className="mt-2 text-2xl font-semibold md:text-4xl">{top.title}</h2>
              <p className="mt-4 text-fg-muted">{top.excerpt}</p>
              <div className="mt-6">
                <Button href={routes.article(top.slug)}>Read the article</Button>
              </div>
            </div>
          </article>
        </Section>
      )}

      {/* 3 · Topics and articles (depend on ?tag=, so they stream) */}
      <Section id="articles">
        <SectionHeading title="Articles by topic" subtitle="Pick the topic that matters most to you right now." />
        <Suspense fallback={<ArticleListSkeleton />}>
          <ArticleList searchParams={searchParams} />
        </Suspense>
      </Section>

      {/* 4 · Car-finder request */}
      <CtaForm
        title="Planning to buy a car?"
        text="Tell us your budget and what you need from a car. A sales consultant will suggest the models that fit best."
        form={{ formId: 'blog', submitLabel: 'Find my car' }}
      />

      {/* 5 · Checklist (final prototype) */}
      <CtaForm
        dark={false}
        title="Not sure what to check when buying a used car? Get the checklist"
        text="Leave your contact details and we'll send you a used-car buying checklist: what to inspect, what to ask and which documents to see."
        form={{ formId: 'checklist', layout: 'inline', submitLabel: 'Get the checklist' }}
      />
    </>
  );
}
