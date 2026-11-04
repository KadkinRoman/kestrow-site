import Image from 'next/image';
import type { ReactNode } from 'react';
import type { RichText as RichTextData, RichTextBlock, RichTextInline } from '@/lib/content/types';
import { inlineText } from '@/lib/rich-text';

/** Top-level headings (h1/h2 → h2 on the page) — for the table of contents; the mapper assigns the id */
export function richTextHeadings(blocks: RichTextData) {
  return blocks.flatMap((b) => (b.type === 'heading' && b.level <= 2 && b.id ? [{ id: b.id, text: inlineText(b.children) }] : []));
}

/** Soft line breaks (Shift+Enter in the Strapi editor) → <br> */
function withBreaks(text: string): ReactNode {
  const parts = text.split('\n');
  return parts.length === 1 ? text : parts.flatMap((p, i) => (i ? [<br key={i} />, p] : [p]));
}

function Inline({ nodes }: { nodes: RichTextInline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.type === 'link') {
          const external = /^https?:\/\//.test(n.url);
          return (
            <a key={i} href={n.url} className="underline underline-offset-2" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <Inline nodes={n.children} />
            </a>
          );
        }
        let el: ReactNode = withBreaks(n.text);
        if (n.code) el = <code className="rounded bg-surface px-1">{el}</code>;
        if (n.bold) el = <strong>{el}</strong>;
        if (n.italic) el = <em>{el}</em>;
        if (n.underline) el = <u>{el}</u>;
        if (n.strikethrough) el = <s>{el}</s>;
        return <span key={i}>{el}</span>;
      })}
    </>
  );
}

function List({ block }: { block: Extract<RichTextBlock, { type: 'list' }> }) {
  const Tag = block.format === 'ordered' ? 'ol' : 'ul';
  return (
    <Tag className={block.format === 'ordered' ? 'list-decimal space-y-2 pl-6' : 'list-disc space-y-2 pl-6'}>
      {block.children.map((item, i) =>
        item.type === 'list' ? (
          <li key={i} className="list-none">
            <List block={item} />
          </li>
        ) : (
          <li key={i}>
            <Inline nodes={item.children} />
          </li>
        ),
      )}
    </Tag>
  );
}

function Block({ block }: { block: RichTextBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p>
          <Inline nodes={block.children} />
        </p>
      );
    case 'heading': {
      const Tag = `h${Math.min(Math.max(block.level, 2), 4)}` as 'h2' | 'h3' | 'h4';
      return (
        <Tag id={block.id}>
          <Inline nodes={block.children} />
        </Tag>
      );
    }
    case 'list':
      return <List block={block} />;
    case 'quote':
      return (
        <blockquote>
          <Inline nodes={block.children} />
        </blockquote>
      );
    case 'code':
      return (
        <pre className="overflow-x-auto rounded-card bg-surface p-4 text-sm">
          <code>{inlineText(block.children)}</code>
        </pre>
      );
    case 'image':
      return block.image.width && block.image.height ? (
        <Image
          src={block.image.url}
          alt={block.image.alternativeText ?? ''}
          width={block.image.width}
          height={block.image.height}
          className="h-auto w-full rounded-media"
        />
      ) : null;
    default:
      return null;
  }
}

/** Renders a blocks (Rich text) field from Strapi 5. Text styles come from the parent or via className. */
export function RichText({ blocks, className }: { blocks: RichTextData; className?: string }) {
  if (!blocks?.length) return null;
  const content = blocks.map((b, i) => <Block key={i} block={b} />);
  // without className — a fragment: blocks become direct children of the container (.prose-article)
  return className ? <div className={className}>{content}</div> : <>{content}</>;
}
