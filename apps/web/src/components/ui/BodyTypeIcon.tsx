import { cn } from '@/lib/cn';

/**
 * Side-profile silhouettes of body types (inline SVG, inherits currentColor).
 * Keys are the inventory category slugs; unknown slugs fall back to the sedan.
 */
const PATHS: Record<string, string> = {
  suvs: 'M6 30h52v-6c0-2-1.5-3.5-3.5-4L48 18l-6-7H18l-6 7-4.5 1.5C5.5 20.2 4 22 4 24v6zM14 18l5-6h10v6zm18 0v-6h9l5 6z',
  sedans: 'M4 30h56v-5c0-2.2-1.6-4-3.8-4.5L46 19l-8-6H22l-8 6-6.8 1.5C5.2 21 4 22.8 4 25zM16 19l7-5h7v5zm17 0v-5h4.5l6.5 5z',
  'pickup-trucks': 'M4 30h56v-9H38V12H20l-8 8-5 1.2C5.3 21.6 4 23.2 4 25zm11-11 6-5h7v5zm16 0v-5h4v5z',
  electric: 'M4 30h56v-5c0-2.3-1.7-4.2-4-4.6L45 18l-8-6H23c-3 0-5 1-7 3l-5 4-4.3 1.4C5.1 21 4 22.7 4 24.6zM18 18l5-4h8v4zm16 0v-4h3l5 4z',
  'hatchbacks-wagons': 'M4 30h56v-6c0-2-1.4-3.6-3.4-4L50 19 44 11H20l-7 8-5.4 1.3C5.5 20.8 4 22.5 4 24.6zM15 19l6-6h8v6zm17 0v-6h11l4 6z',
  'sports-convertibles': 'M4 30h56v-4c0-2-1.4-3.6-3.4-4.1L44 19l-9-4H25l-9 4-9.4 2C5 21.4 4 23 4 25zm15-11 7-3h5v3zm15 0v-3h1l6 3z',
};

export function BodyTypeIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 40" aria-hidden className={cn('h-8 w-12', className)}>
      <path d={PATHS[slug] ?? PATHS.sedans} fill="currentColor" fillRule="evenodd" />
      <circle cx="17" cy="31" r="5.5" fill="currentColor" stroke="var(--color-bg, #fff)" strokeWidth="2" />
      <circle cx="47" cy="31" r="5.5" fill="currentColor" stroke="var(--color-bg, #fff)" strokeWidth="2" />
    </svg>
  );
}
