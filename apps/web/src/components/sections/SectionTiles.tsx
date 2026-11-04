import { Section, SectionHeading } from '@/components/ui/layout';
import { RichText } from '@/components/ui/RichText';
import { Tile, TileGrid } from '@/components/ui/Tile';
import type { PageSection } from '@/lib/content/types';

/**
 * Page sections from Strapi (page.sections) as tiles: number, heading, text. This way the editor manages
 * "How home delivery works" (5 tiles) or "What the inspection includes" (2 tiles) without a release.
 */
export function SectionTiles({
  title,
  subtitle,
  sections,
  cols = 3,
  numbered,
}: {
  title: string;
  subtitle?: string;
  sections: PageSection[];
  cols?: 2 | 3 | 4 | 5;
  numbered?: boolean;
}) {
  if (!sections.length) return null;
  return (
    <Section>
      <SectionHeading title={title} subtitle={subtitle} />
      <TileGrid cols={cols} className="mt-8">
        {sections.map((s, i) => (
          <Tile
            key={i}
            number={numbered ? i + 1 : undefined}
            title={s.title ?? ''}
            text={s.body.length ? <RichText blocks={s.body} className="space-y-2" /> : undefined}
          />
        ))}
      </TileGrid>
    </Section>
  );
}
