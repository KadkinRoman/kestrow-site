import Link from 'next/link';
import { PostCard } from '@/components/sections/Cards';
import { buttonClass } from '@/components/ui/Button';
import { pageParam } from '@/components/catalog/CatalogResults';
import { BLOG_PAGE_SIZE, getArticles, getArticleTags } from '@/lib/content';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Categories + article list. Depends on ?tag=&page=, so it renders inside <Suspense>. */
export async function ArticleList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tags = await getArticleTags();
  // known category only: an arbitrary ?tag= does not create cache entries
  const tag = tags.find((t) => t.slug === one(sp.tag))?.slug;
  const page = pageParam(sp.page);
  // "Load more": pages 1..N, N is capped at the real number of pages
  const load = (p: number) => getArticles({ tag, page: p, pageSize: BLOG_PAGE_SIZE });
  const first = await load(1);
  const last = Math.min(page, first.pageCount);
  const rest = await Promise.all(Array.from({ length: last - 1 }, (_, i) => load(i + 2)));
  const list = { items: [first, ...rest].flatMap((p) => p.items), total: first.total };
  const hasMore = last < first.pageCount;

  return (
    <>
      <nav aria-label="Categories" className="mt-6">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ slug: '', name: 'All' }, ...tags].map((t) => {
            const active = (tag ?? '') === t.slug;
            return (
              <li key={t.slug || 'all'} className="shrink-0">
                <Link
                  href={t.slug ? `${routes.blog()}?tag=${t.slug}#articles` : `${routes.blog()}#articles`}
                  scroll={false}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-10 items-center rounded-control border px-4 text-sm transition-colors',
                    active ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
                  )}
                >
                  {t.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.items.map((a) => (
          <PostCard key={a.slug} article={a} />
        ))}
      </div>
      {!list.items.length && <p className="mt-8 text-fg-muted">No articles in this category yet.</p>}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Link
            href={`?${new URLSearchParams({ ...(tag ? { tag } : {}), page: String(last + 1) })}`}
            scroll={false}
            className={buttonClass('secondary', 'lg')}
          >
            Load more
          </Link>
        </div>
      )}
    </>
  );
}

export function ArticleListSkeleton() {
  return (
    <div aria-busy className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-surface" />
      ))}
    </div>
  );
}
