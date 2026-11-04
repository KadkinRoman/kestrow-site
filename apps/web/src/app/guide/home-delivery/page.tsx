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
  pageMetadata(routes.delivery(), {
    title: 'Home delivery',
    description: 'Free home delivery of your Kestrow Motors car within 100 miles of Denver, across the metro area and the Front Range.',
  });

/** Home delivery page per the final prototype; the "How home delivery works" tiles are sections of a "Page" entry */
export default async function DeliveryPage() {
  const page = await getPage(routes.delivery());

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Buyer\'s guide', href: routes.buyers() }, { label: 'Home delivery' }]}
        title="We bring your car to your door"
        lead={page?.lead ?? 'Buy online or at the showroom, sign the paperwork digitally, and we deliver your car to the address you give us.'}
        chips={['Date agreed in advance', 'Enclosed or driven delivery', 'Free within 100 miles of Denver']}
        media="Photo: car delivery"
        image={staticPhoto('delivery.jpg', 'A Kestrow Motors delivery driver handing over a car at a customer home')}
        actions={
          <ModalButton
            size="lg"
            modal={{
              type: 'lead',
              title: 'Ask about home delivery',
              text: 'Leave your contact details and your address. The Kestrow team will explain the delivery terms and timing.',
              form: { formId: 'delivery', submitLabel: 'Ask about delivery' },
            }}
          >
            Ask about home delivery
          </ModalButton>
        }
      />

      <SectionTiles
        title="How home delivery works"
        subtitle="We agree a convenient delivery date and time in advance, so you can be home to take the keys. Every step is organized around your schedule."
        sections={page?.sections ?? []}
        cols={5}
        numbered
      />

      <StepsSection group="delivery" title="Delivery step by step" />

      <CtaForm
        title="Outside the 100-mile zone or want specifics for your address?"
        text="Send a request and our delivery coordinator will confirm the cost and the date."
        form={{ formId: 'delivery', layout: 'inline', submitLabel: 'Ask about delivery' }}
      />

      <CatalogRailSection title="Cars we can deliver to you" subtitle="" />

      <FaqSection group="delivery" />

      <OtherServices current={routes.delivery()} />
    </>
  );
}
