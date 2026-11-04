import { PageHero } from '@/components/sections/Hero';
import { PageSections } from '@/components/sections/PageSections';
import { Section } from '@/components/ui/layout';
import { getPage, getSettings } from '@/lib/content';
import { pageMetadata } from '@/lib/page-meta';
import { routes } from '@/lib/routes';

export const generateMetadata = () =>
  pageMetadata(routes.privacy(), {
    title: 'Privacy Policy',
    robots: { index: false },
  });

/** Editors maintain the policy text in a "Page" entry (sections); the operator details come from the site settings */
export default async function PrivacyPage() {
  const [page, settings] = await Promise.all([getPage(routes.privacy()), getSettings()]);
  const c = settings.company;

  return (
    <>
      <PageHero crumbs={[{ label: 'Privacy Policy' }]} title={page?.title ?? 'Privacy Policy'} media={null} />
      {page?.sections.length ? (
        <PageSections lead={page.lead} sections={page.sections} />
      ) : (
        <Section spacing="sm">
          <div className="prose-article max-w-3xl">
            <p>
              This Privacy Policy explains how {c?.legalName ?? 'Kestrow Motors'} (&ldquo;we&rdquo;) handles the personal data
              you share with us through this website.
            </p>
            <h2>What we collect</h2>
            <p>
              When you submit a form, we collect the details you enter: your name, phone number, email address, any
              message or file you attach, and your preferred way to be contacted. We may also record technical data such
              as the page you submitted the form from.
            </p>
            <h2>Why we collect it</h2>
            <p>
              We use this data to respond to your request, send you a price or a trade-in valuation, book a test drive and
              follow up on your car purchase. We do not sell your personal data.
            </p>
            <h2>Who sees it</h2>
            <p>
              Your request is stored in our customer-management system and is available only to our team and the service
              providers that help us run the website and handle enquiries. If you ask about financing, a credit
              application is submitted to a lender only with your explicit consent; lenders handle your application under
              their own privacy policies.
            </p>
            <h2>How long we keep it</h2>
            <p>
              We keep your data for as long as needed to handle your request and the purchase that follows, and for a
              reasonable period afterwards. You can ask us to delete it at any time.
            </p>
            <h2>Analytics and cookies</h2>
            <p>
              We may use analytics to understand how the site is used. Analytics data is aggregated and is not used to
              identify you personally.
            </p>
            <h2>Your choices</h2>
            <p>
              You can ask to see, correct or delete the personal data we hold about you by writing to{' '}
              <a href={`mailto:${settings.email}`} className="underline underline-offset-2">
                {settings.email}
              </a>
              .
            </p>
          </div>
        </Section>
      )}
      {c?.legalName && (
        <Section spacing="sm">
          <p className="max-w-3xl text-sm text-fg-muted">
            Data controller: {c.legalName}
            {c.registrationNumber && `, registration no. ${c.registrationNumber}`}
            {c.taxId && `, Tax ID ${c.taxId}`}
            {c.legalAddress && `, ${c.legalAddress}`}. Email: {settings.email}.
          </p>
        </Section>
      )}
    </>
  );
}
