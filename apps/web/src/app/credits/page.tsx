import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/Hero';
import { Section } from '@/components/ui/layout';
import credits from '@/lib/credits.json';

export const metadata: Metadata = {
  title: 'Image credits',
  description: 'Photos used on this demo site and their Creative Commons licenses.',
  robots: { index: false },
};

type Credit = {
  file: string;
  title: string;
  creator: string;
  creatorUrl?: string;
  source: string;
  sourceUrl?: string;
  license: string;
  licenseUrl: string;
};

const GROUPS: [prefix: string, label: string][] = [
  ['car-', 'Cars'],
  ['interior-', 'Interiors'],
  ['story-', 'Customer stories'],
  ['article-', 'Blog'],
  ['inspect-', 'Inspection'],
  ['', 'Other'],
];

const linkClass = 'underline underline-offset-2 hover:text-fg';

/** Attribution for the CC-licensed photos seeded into the demo (apps/cms/seed-assets/credits.json). */
export default function CreditsPage() {
  const list = credits as Credit[];
  const groups = GROUPS.map(([prefix, label]) => ({
    label,
    items: list.filter((c) => (prefix ? c.file.startsWith(prefix) : !GROUPS.some(([p]) => p && c.file.startsWith(p)))),
  })).filter((g) => g.items.length);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Image credits' }]}
        title="Image credits"
        lead="Kestrow Motors is a fictional dealership built as a portfolio project. The photos are published under Creative Commons licenses by the authors listed below; the files are shown resized."
        media={null}
      />
      <Section spacing="sm">
        <div className="max-w-3xl space-y-10">
          {groups.map((g) => (
            <div key={g.label}>
              <h2 className="text-xl font-semibold">{g.label}</h2>
              <ol className="mt-3 divide-y divide-line text-sm">
                {g.items.map((c) => (
                  <li key={c.file} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                    <code className="shrink-0 text-xs text-fg-muted sm:w-32">{c.file}</code>
                    <span className="text-fg-muted">
                      {c.sourceUrl ? (
                        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {c.title}
                        </a>
                      ) : (
                        c.title
                      )}
                      {' — '}
                      {c.creatorUrl ? (
                        <a href={c.creatorUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {c.creator}
                        </a>
                      ) : (
                        c.creator
                      )}
                      {` (${c.source}), `}
                      <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {c.license}
                      </a>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
