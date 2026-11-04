/** "Laminate vs. MDF: what's the difference?" → "laminate-vs-mdf-what-s-the-difference" (article heading anchors) */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
