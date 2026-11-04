import { ModalButton } from '@/components/modals/ModalButton';
import { CostEstimator } from '@/components/sections/CostEstimator';
import { CtaForm } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { staticPhoto } from '@/components/ui/Photo';
import { CatalogRailSection, FaqSection, StepsSection } from '@/components/sections/Shared';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';
import { PageSections } from '@/components/sections/PageSections';
import { OtherServices } from '@/components/sections/OtherServices';
import { getPage } from '@/lib/content';

export const generateMetadata = () =>
  pageMetadata(routes.payment(), {
    title: 'Financing',
    description: 'Get pre-approved in 2 minutes with a soft credit check. APR from 5.9% for well-qualified buyers, terms of 36–72 months, and no prepayment penalties.',
  });

export default async function PaymentPage() {
  const page = await getPage(routes.payment());
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Buyer\'s guide', href: routes.buyers() }, { label: 'Financing' }]}
        title="Know your monthly payment before you visit"
        lead="Get pre-approved in 2 minutes with a soft check that does not affect your credit score. A credit application is only submitted when you say so."
        chips={['APR from 5.9%', 'Terms of 36–72 months', 'Soft check, no credit impact']}
        media="Photo: financing"
        image={staticPhoto('financing.jpg', 'A finance manager reviewing monthly payment options with a customer')}
        actions={
          <ModalButton
            size="lg"
            modal={{ type: 'lead', title: 'Get pre-approved', form: { formId: 'payment', submitLabel: 'Check my rate' } }}
          >
            Get pre-approved
          </ModalButton>
        }
      />

      <PageSections lead={page?.lead} sections={page?.sections ?? []} />

      <Section>
        <SectionHeading title="Pick the way to pay that fits" />
        <TileGrid cols={5} className="mt-8">
          <Tile icon title="Bring your own loan" text="Use pre-approval from your bank or credit union; we handle the paperwork." />
          <Tile icon title="Pay in full" text="The whole price in a single payment, with no financing needed." />
          <Tile
            icon
            title="Financing"
            text="Monthly payments through a lender, with APR from 5.9% for well-qualified buyers."
            footer={
              <ModalButton modal={{ type: 'installment' }} unstyled className="mt-3 text-left text-sm underline underline-offset-2">
                Financing terms
              </ModalButton>
            }
          />
          <Tile icon title="Down payment by card or wire" text="Reserve the car with a card payment, settle the rest by wire or ACH." />
          <Tile icon title="Trade-in as down payment" text="Your car's value can cover part or all of the down payment." />
        </TileGrid>
      </Section>

      <StepsSection group="payment" title="How financing works" />

      <div className="bg-surface/60">
        <CostEstimator />
      </div>

      <CtaForm
        title="Not sure which option fits?"
        text="Tell our finance manager what monthly payment you are comfortable with. We'll show you the cars and terms that fit."
        form={{ formId: 'payment', layout: 'inline', submitLabel: 'Check my rate' }}
      />

      <CatalogRailSection title="Cars for every budget" subtitle="" />

      <FaqSection group="payment" />

      <OtherServices current={routes.payment()} />
    </>
  );
}
