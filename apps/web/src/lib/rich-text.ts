import type { RichTextInline } from '@/lib/content/types';

/** Plain text of rich-text inline nodes (for heading anchors and the table of contents) */
export function inlineText(nodes: RichTextInline[]): string {
  return nodes.map((n) => (n.type === 'text' ? n.text : inlineText(n.children))).join('');
}
