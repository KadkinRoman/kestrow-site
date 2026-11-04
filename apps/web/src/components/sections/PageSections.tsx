import Image from 'next/image';
import { Section } from '@/components/ui/layout';
import { RichText } from '@/components/ui/RichText';
import { cn } from '@/lib/cn';
import type { PageSection } from '@/lib/content/types';

/**
 * Text sections of the page from Strapi (page.lead, page.sections): heading, text, image.
 * Fixed template, not a builder: image on the right, alternating with the left. Empty — renders nothing.
 */
export function PageSections({ lead, sections, className }: { lead?: string; sections: PageSection[]; className?: string }) {
  if (!lead && !sections.length) return null;
  return (
    <div className={className}>
      {lead && (
        <Section spacing="sm">
          <p className="max-w-prose text-lg md:text-xl">{lead}</p>
        </Section>
      )}
      {sections.map((s, i) => (
        <Section key={i} spacing="sm">
          <div className={cn('grid items-start gap-8', s.image && 'lg:grid-cols-2 lg:gap-12')}>
            <div className={cn(s.image && i % 2 === 1 && 'lg:order-2')}>
              {s.title && <h2 className="text-2xl font-semibold md:text-3xl">{s.title}</h2>}
              {s.body.length > 0 && <RichText blocks={s.body} className={cn('max-w-prose', s.title && 'mt-4')} />}
            </div>
            {s.image && (
              <Image
                src={s.image.url}
                alt={s.image.alt ?? s.title ?? ''}
                width={s.image.width ?? 1200}
                height={s.image.height ?? 800}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full rounded-media"
              />
            )}
          </div>
        </Section>
      ))}
    </div>
  );
}
