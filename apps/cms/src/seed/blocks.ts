/** Helpers for blocks fields (Rich text, Strapi 5). */

type TextNode = { type: 'text'; text: string; bold?: boolean };

export type Block =
  | { type: 'paragraph'; children: TextNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: TextNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: { type: 'list-item'; children: TextNode[] }[] };

export const p = (text: string): Block => ({ type: 'paragraph', children: [{ type: 'text', text }] });

export const h = (level: 2 | 3, text: string): Block => ({ type: 'heading', level, children: [{ type: 'text', text }] });

/** Bulleted list; an item written as "lead — text" gets the lead in bold */
export const ul = (items: (string | [lead: string, text: string])[]): Block => ({
  type: 'list',
  format: 'unordered',
  children: items.map((it) => ({
    type: 'list-item',
    children: Array.isArray(it)
      ? [
          { type: 'text', text: it[0], bold: true },
          { type: 'text', text: ` — ${it[1]}` },
        ]
      : [{ type: 'text', text: it }],
  })),
});
