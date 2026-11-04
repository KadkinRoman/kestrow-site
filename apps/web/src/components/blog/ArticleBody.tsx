import Image from 'next/image';
import { ModalButton } from '@/components/modals/ModalButton';
import { Placeholder } from '@/components/ui/Placeholder';
import { RichText, richTextHeadings } from '@/components/ui/RichText';
import type { ArticleBlock } from '@/lib/content/types';

/** Table of contents built from the h2 headings of text blocks (ids match RichText). */
export function ArticleToc({ blocks }: { blocks: ArticleBlock[] }) {
  const items = blocks.flatMap((b) => (b.type === 'text' ? richTextHeadings(b.blocks) : []));
  if (!items.length) return null;
  return (
    <nav aria-label="Table of contents" className="rounded-card bg-surface p-5 md:p-6">
      <b>In this article:</b>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        {items.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="underline-offset-2 hover:underline">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Renders article content — the article.* dynamic zone from Strapi. */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="prose-article">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'text':
            return <RichText key={i} blocks={b.blocks} />;
          case 'image':
            return (
              <figure key={i}>
                {b.image?.width && b.image.height ? (
                  <Image
                    src={b.image.url}
                    alt={b.image.alt ?? b.caption ?? ''}
                    width={b.image.width}
                    height={b.image.height}
                    className="h-auto w-full rounded-media"
                  />
                ) : (
                  <Placeholder label={b.caption ? `Photo: ${b.caption}` : 'Photo'} ratio="16/9" />
                )}
                {b.caption && <figcaption className="mt-2 text-sm text-fg-muted">{b.caption}</figcaption>}
              </figure>
            );
          case 'tip':
            return (
              <aside key={i} className="rounded-card bg-surface p-5">
                <b className="block">{b.title}</b>
                <p className="mt-1">{b.text}</p>
              </aside>
            );
          case 'quote':
            return <blockquote key={i}>{b.text}</blockquote>;
          case 'cta':
            return (
              <div
                key={i}
                className="flex flex-col gap-4 rounded-card border border-line p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <b>{b.title}</b>
                  <p className="mt-1 text-base text-fg-muted">{b.text}</p>
                </div>
                <ModalButton
                  variant="secondary"
                  className="shrink-0"
                  modal={{
                    type: 'lead',
                    title: 'Talk to a sales consultant',
                    form: { formId: 'article', submitLabel: b.button },
                  }}
                >
                  {b.button}
                </ModalButton>
              </div>
            );
          case 'table':
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-base">
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} className="border-b-2 border-fg p-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) =>
                          k === 0 ? (
                            <th key={k} scope="row" className="border-b border-line p-3 font-semibold">
                              {cell}
                            </th>
                          ) : (
                            <td key={k} className="border-b border-line p-3">
                              {cell}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
