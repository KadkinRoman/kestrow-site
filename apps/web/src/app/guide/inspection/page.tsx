import { ModalButton } from '@/components/modals/ModalButton';
import { CtaForm } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { staticPhoto } from '@/components/ui/Photo';
import { OtherServices } from '@/components/sections/OtherServices';
import { SectionTiles } from '@/components/sections/SectionTiles';
import { CatalogRailSection, FaqSection, StepsSection } from '@/components/sections/Shared';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/page-meta';
import { routes } from '@/lib/routes';

export const generateMetadata = () =>
  pageMetadata(routes.installation(), {
    title: '172-point inspection',
    description: 'Every Kestrow Motors car passes a 172-point inspection by our own technicians. See what we check, what we replace and what we disclose.',
  });

/** Inspection page per the final prototype; the two inspection blocks are sections of a "Page" entry */
export default async function InstallationPage() {
  const page = await getPage(routes.installation());

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Buyer\'s guide', href: routes.buyers() }, { label: '172-point inspection' }]}
        title="The 172-point inspection behind every Kestrow car"
        lead={
          page?.lead ??
          'Before a car is listed, our technicians check it from engine to upholstery, repair what falls short and write down the results. You can read the full report for any car.'
        }
        chips={['172 checkpoints', 'Worn parts replaced', 'Report shared with you']}
        media="Photo: car inspection"
        image={staticPhoto('inspection-1.jpg', 'Technician inspecting a car on a lift in the service bay')}
        actions={
          <ModalButton
            size="lg"
            modal={{
              type: 'lead',
              title: 'Get an inspection report',
              text: 'Tell us which car you are looking at and we will send you its full inspection report.',
              form: { formId: 'installation', submitLabel: 'Send me the report' },
            }}
          >
            Get a sample inspection report
          </ModalButton>
        }
      />

      <SectionTiles
        title="What does the inspection cover?"
        subtitle="Every car is different, so the work after inspection varies. We split it into what every inspection checks and what we repair or replace, so you know up front what was done to the car."
        sections={page?.sections ?? []}
        cols={2}
      />

      <StepsSection group="installation" title="How the inspection works" />

      <CtaForm
        title="Want to see an inspection report?"
        text="Tell us which car interests you and we'll send its full report, with photos of anything that was repaired."
        form={{ formId: 'installation', layout: 'inline', submitLabel: 'Send me the report' }}
      />

      <CatalogRailSection title="Inspected cars ready to drive" subtitle="" />

      <FaqSection group="installation" />

      <OtherServices current={routes.installation()} />
    </>
  );
}
