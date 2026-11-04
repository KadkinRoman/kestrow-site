import { ModalButton } from '@/components/modals/ModalButton';
import { CtaForm, QuizCta } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { staticPhoto } from '@/components/ui/Photo';
import { PromoGrid } from '@/components/sections/PromoGrid';
import { FaqSection } from '@/components/sections/Shared';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeading } from '@/components/ui/layout';
import { getMainPromo, getPromos, getSettings } from '@/lib/content';
import { promoTerm } from '@/lib/format';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';

export const generateMetadata = () =>
  pageMetadata(routes.promos(), {
    title: 'Special offers',
    description: 'Current Kestrow Motors offers: trade-in bonus, financing deals and price drops on inspected pre-owned cars in Denver.',
  });

export default async function PromosPage() {
  const [promos, main, settings] = await Promise.all([getPromos(), getMainPromo(), getSettings()]);
  const term = promoTerm(main?.endsAt, settings.promoPeriod);

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        crumbs={[{ label: 'Offers' }]}
        title="Kestrow special offers"
        lead="Choose the offer that suits your next car."
        sub="Bonuses, price drops and financing terms apply depending on the car and the terms of each offer."
        media="Offers visual"
        image={staticPhoto('keys.jpg', 'Car keys handed over at the Kestrow Motors showroom')}
        actions={
          <ModalButton size="lg" modal={{ type: 'lead', title: 'Get a price with an offer applied' }}>
            Get a price with an offer applied
          </ModalButton>
        }
      />

      {/* 2 · Main offer */}
      {main && (
        <CtaForm
          eyebrow={<Badge tone="light">{term ?? 'Main offer'}</Badge>}
          title={main.title}
          text={main.text}
          form={{ formId: 'promo-main', layout: 'inline', submitLabel: 'Claim my $1,000 bonus' }}
        />
      )}

      {/* 3 · All offers */}
      <Section>
        <SectionHeading title="All offers" />
        {/* the trade-in bonus appears both in the main block and in the general list */}
        <PromoGrid promos={promos} period={settings.promoPeriod} />
      </Section>

      {/* 4 · Quiz */}
      <QuizCta />

      {/* 5 · FAQ */}
      <FaqSection group="offers" title="Questions about offers" />

      {/* 6 · Final call to action */}
      <CtaForm
        title="Get your price with our current offers applied"
        text="Leave your contact details and a sales consultant will find the right offer for the car you want."
        form={{ formId: 'promo-final', layout: 'inline', submitLabel: 'Get my offer' }}
      />
    </>
  );
}
