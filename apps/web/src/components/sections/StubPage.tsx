import type { ReactNode } from 'react';
import type { Crumb } from '@/components/ui/Breadcrumbs';
import { CtaForm } from './Cta';
import { PageHero } from './Hero';
import { CatalogRailSection } from './Shared';
import { Section } from '@/components/ui/layout';

/**
 * Template for a page that is not in the prototype frame (delivery, inspection, contact…).
 * Content to be added later; the structure will follow Figma.
 */
export function StubPage({
  crumbs,
  title,
  lead,
  media,
  children,
  formId,
}: {
  crumbs: Crumb[];
  title: string;
  lead: string;
  media?: string | null;
  children?: ReactNode;
  formId: string;
}) {
  return (
    <>
      <PageHero crumbs={crumbs} title={title} lead={lead} media={media} />
      <Section spacing="sm">
        <div className="max-w-3xl space-y-4">
          {children ?? (
            <p className="rounded-card border border-dashed border-line p-5 text-fg-muted">
              This page is not in the prototype frame yet. Content will be added later; blocks will follow Figma.
            </p>
          )}
        </div>
      </Section>
      <CtaForm
        title="Still have questions?"
        text="Leave your phone number and our team will call you back and explain everything."
        form={{ formId, layout: 'inline', submitLabel: 'Call me back' }}
      />
      <CatalogRailSection />
    </>
  );
}
