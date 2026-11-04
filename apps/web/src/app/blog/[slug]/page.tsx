import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleAuthors } from '@/components/blog/ArticleAuthors';
import { ArticleBody, ArticleToc } from '@/components/blog/ArticleBody';
import { ModalButton } from '@/components/modals/ModalButton';
import { LinksRow } from '@/components/sections/Blocks';
import { PostCard } from '@/components/sections/Cards';
import { CtaBox } from '@/components/sections/Cta';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container, Section, SectionHeading } from '@/components/ui/layout';
import { Photo } from '@/components/ui/Photo';
import { getArticle, getArticleSlugs, getRelatedArticles } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { routes } from '@/lib/routes';
import { atLeastOne } from '@/lib/static-params';

// The page depends entirely on the slug, and 404 and 308 must be sent as HTTP statuses (SEO), so the params
// check is not hidden inside <Suspense>: navigating here may wait for the server. Known slugs are prerendered.
export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return atLeastOne(await getArticleSlugs(), ['slug']);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.excerpt,
    openGraph: { type: 'article', publishedTime: article.publishedAt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  const related = await getRelatedArticles(article.slug);

  return (
    <>
      {/* 1 · Article header */}
      <section className="pt-6 pb-8">
        <Container>
          <Breadcrumbs items={[{ label: 'Blog', href: routes.blog() }, { label: article.title }]} />
          <header className="mx-auto mt-8 max-w-prose">
            <div className="text-sm text-fg-muted">{article.tag.name}</div>
            <h1 className="mt-2 text-3xl font-semibold md:text-5xl">{article.title}</h1>
            {article.lead && <p className="mt-4 text-lg md:text-xl">{article.lead}</p>}
            <div className="mt-4 text-sm text-fg-muted">
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              {article.readingMinutes && <> • {article.readingMinutes} min read</>}
              {article.author && <> • {article.author.name}</>}
            </div>
          </header>
          <Photo media={article.cover} label="Article cover" ratio="21/9" priority sizes="(min-width: 1280px) 1240px, 100vw" className="mt-8" />
        </Container>
      </section>

      {/* 2–3 · Table of contents and text */}
      <Section spacing="sm">
        <div className="mx-auto max-w-prose space-y-8">
          <ArticleToc blocks={article.content} />
          <ArticleAuthors author={article.author} expert={article.expert} />
          <ArticleBody blocks={article.content} />
        </div>
      </Section>

      {/* 4 · You may find this useful */}
      <Section>
        <SectionHeading title="You may find this useful" />
        <LinksRow
          links={[
            { href: routes.materials(), label: 'Trade-in valuation' },
            { href: routes.zamer(), label: 'Book a test drive' },
            { href: routes.catalog(), label: 'Browse inventory' },
            { href: routes.payment(), label: 'Financing' },
            { href: routes.about(), label: 'About us' },
          ]}
        />
      </Section>

      {/* 5 · Read next */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title="Read next" />
          <Button href={routes.blog()} variant="secondary">
            All articles
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((a) => (
            <PostCard key={a.slug} article={a} />
          ))}
        </div>
      </Section>

      {/* 6 · Final call to action */}
      <CtaBox
        title="Ready to find your car?"
        text="Send a request. A sales consultant will suggest matching cars and send you a monthly payment estimate."
        aside={
          <ModalButton
            variant="contrast"
            size="lg"
            className="w-full"
            modal={{ type: 'lead', title: 'Get my offer', form: { formId: 'article', submitLabel: 'Get my offer' } }}
          >
            Get my offer
          </ModalButton>
        }
      />
    </>
  );
}
