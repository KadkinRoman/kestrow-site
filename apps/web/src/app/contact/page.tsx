import { ModalButton } from '@/components/modals/ModalButton';
import { LinksRow } from '@/components/sections/Blocks';
import { CtaBox, CtaForm } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { PageSections } from '@/components/sections/PageSections';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { getPage, getSettings } from '@/lib/content';
import { pageMetadata } from '@/lib/page-meta';
import { routes } from '@/lib/routes';

export const generateMetadata = () =>
  pageMetadata(routes.contacts(), {
    title: 'Contact',
    description: 'Phone, address and messengers for Kestrow Motors, pre-owned cars in Denver, CO. Showroom open Mon–Sat, 9:00 am – 8:00 pm.',
  });

const CONSULTATION = [
  ['Find the right car', 'Talk through your budget, needs and the models worth a look.'],
  ['Value your trade-in', 'Get an appraisal of your current car in about 15 minutes.'],
  ['Get a payment estimate', 'See the monthly payment for your down payment and term.'],
  ['Book a test drive', 'Agree on a car and a time.'],
] as const;

const linkClass = 'mt-4 inline-block text-sm font-medium underline-offset-2 hover:underline';

/** Contact page per the final prototype, plus a "Company details" block from the site settings */
export default async function ContactsPage() {
  const [s, page] = await Promise.all([getSettings(), getPage(routes.contacts())]);
  const c = s.company;
  const details: [string, string | undefined][] = [
    ['Legal name', c?.legalName],
    ['Registration no.', c?.registrationNumber],
    ['Tax ID', c?.taxId],
    ['Registered address', c?.legalAddress],
  ];

  return (
    <>
      {/* 1 · Contact */}
      <PageHero
        crumbs={[{ label: 'Contact' }]}
        title="Contact Kestrow Motors"
        lead={page?.lead ?? 'Reach us whichever way suits you, or drop by the showroom to see the cars in person.'}
        media={null}
      >
        <TileGrid cols={4} className="mt-8">
          <Tile
            title={s.phone}
            text="Phone"
            footer={
              <a href={s.phoneHref} className={linkClass}>
                Call →
              </a>
            }
          />
          <Tile
            title={s.email}
            text="Email"
            footer={
              <a href={`mailto:${s.email}`} className={linkClass}>
                Write to us →
              </a>
            }
          />
          <Tile
            title={s.address}
            text="Address"
            footer={
              s.mapUrl && (
                <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Get directions →
                </a>
              )
            }
          />
          <Tile title={s.workHours} text="Hours" />
        </TileGrid>
        <p className="mt-6 flex items-start gap-3 rounded-card bg-surface p-4 text-sm">
          <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fg text-xs font-bold text-bg">
            !
          </span>
          <span>Walk-ins are welcome, but an appointment guarantees the car you want is warmed up and ready. Call us or send a request and we&apos;ll agree a time.</span>
        </p>
      </PageHero>

      <PageSections sections={page?.sections ?? []} />

      {/* 2 · Messengers */}
      <Section>
        <div className="rounded-block bg-surface p-6 md:p-10">
          <SectionHeading
            title="Message us"
            subtitle="Send a question, a link to a car you like or an offer from another dealer. Our team will help you get your bearings."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            {s.socials.map((m) => (
              <Button key={m.type} href={m.url} variant="secondary" external>
                {m.label}
              </Button>
            ))}
          </div>
        </div>
      </Section>

      {/* 3 · Map (a map widget needs an API key) */}
      <Section>
        <SectionHeading title="Find us" />
        <div className="relative mt-6">
          <iframe
            title="Map: Kestrow Motors showroom, Denver"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-105.0275%2C39.7270%2C-104.9925%2C39.7430&layer=mapnik&marker=39.735%2C-105.010"
            loading="lazy"
            className="block min-h-[440px] w-full rounded-media border border-line"
          />
          <div className="mt-4 rounded-card bg-bg p-5 shadow-card lg:absolute lg:top-6 lg:left-6 lg:mt-0 lg:max-w-sm">
            <b className="text-lg">Kestrow Motors</b>
            <p className="mt-2 text-fg-muted">{s.address}</p>
            <p className="text-fg-muted">{s.workHours}</p>
            <a href={s.phoneHref} className="mt-2 inline-block font-medium hover:underline">
              {s.phone}
            </a>
            {s.mapUrl && (
              <div className="mt-4">
                <Button href={s.mapUrl} external size="sm">
                  Get directions
                </Button>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* 4 · Visit the showroom */}
      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              title="Visit the showroom"
              subtitle="In person you can sit in the cars, take a test drive, get your trade-in appraised and talk through financing."
            />
            <div className="mt-6">
              <ModalButton
                size="lg"
                modal={{
                  type: 'lead',
                  title: 'Book a visit',
                  text: "Leave your contact details and we'll agree a convenient time to meet at the showroom.",
                  form: { formId: 'contacts', submitLabel: 'Book now' },
                }}
              >
                Book a visit
              </ModalButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['showroom-1.jpg', 'showroom-2.jpg', 'showroom-3.jpg', 'showroom-4.jpg'].map((img, n) => (
              <Photo key={img} media={staticPhoto(img, `Kestrow Motors showroom photo ${n + 1}`)} label={`Showroom photo ${n + 1}`} ratio="4/3" sizes="(min-width: 1024px) 300px, 50vw" />
            ))}
          </div>
        </div>
      </Section>

      {/* 5 · What a consultation covers */}
      <Section>
        <SectionHeading title="When you visit you can" />
        <TileGrid cols={4} className="mt-8">
          {CONSULTATION.map(([title, text], i) => (
            <Tile key={title} number={i + 1} title={title} text={text} />
          ))}
        </TileGrid>
      </Section>

      {/* 6 · Form */}
      <CtaForm
        dark={false}
        title="Still have questions?"
        text="Leave your contact details and a Kestrow sales consultant will get in touch about a car, pricing, trade-in or financing."
        form={{ formId: 'contacts', layout: 'inline', submitLabel: 'Call me back' }}
      />

      {/* 7 · You may also be looking for */}
      <Section>
        <SectionHeading title="You may also be looking for" />
        <LinksRow
          links={[
            { href: routes.catalog(), label: 'Browse inventory' },
            { href: routes.zamer(), label: 'Book a test drive' },
            { href: routes.payment(), label: 'Financing' },
            { href: routes.warranty(), label: 'Warranty' },
            { href: routes.delivery(), label: 'Home delivery' },
          ]}
        />
      </Section>

      {/* 8 · Company details, from the site settings */}
      <Section id="company" spacing="sm">
        <SectionHeading title="Company details" />
        {c?.legalName ? (
          <dl className="mt-4 max-w-2xl divide-y divide-line border-y border-line">
            {details
              .filter((r): r is [string, string] => !!r[1])
              .map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr]">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        ) : (
          <p className="mt-4 text-fg-muted">Company details are filled in under Site settings (the Company details section).</p>
        )}
      </Section>

      {/* 9 · Call to action */}
      <CtaBox
        title="Falling for a car is easy. Overpaying for it is optional"
        text="Tell us the car you like or leave your phone number. A sales consultant will send you the out-the-door price and a payment estimate."
        aside={
          <div className="flex flex-wrap gap-3">
            <ModalButton
              variant="contrast"
              size="lg"
              modal={{
                type: 'lead',
                title: 'Find me a car',
                text: 'Tell us the make and model you like or leave your phone number.',
                form: { formId: 'catalog-photo', submitLabel: 'Find this car for me' },
              }}
            >
              Find me a car
            </ModalButton>
            <ModalButton
              variant="inverse"
              size="lg"
              modal={{
                type: 'lead',
                title: 'Book a test drive',
                text: 'Pick a time and we will have the car cleaned and ready at the showroom.',
                form: { formId: 'zamer', submitLabel: 'Book now' },
              }}
            >
              Book a test drive
            </ModalButton>
          </div>
        }
      />
    </>
  );
}
