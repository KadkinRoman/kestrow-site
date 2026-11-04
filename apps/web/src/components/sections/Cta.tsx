import type { ReactNode } from 'react';
import { LeadForm, type LeadFormConfig } from '@/components/forms/LeadForm';
import { ModalButton } from '@/components/modals/ModalButton';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';
import type { SocialLink } from '@/lib/content/types';

type CtaBoxProps = {
  title: ReactNode;
  text?: ReactNode;
  eyebrow?: ReactNode;
  dark?: boolean;
  /** Below the text on the left (extra buttons, messengers) */
  actions?: ReactNode;
  /** Right column: form or button */
  aside?: ReactNode;
  id?: string;
};

/** Lead block: text on the left, form / button on the right. Light or dark. */
export function CtaBox({ title, text, eyebrow, dark = true, actions, aside, id }: CtaBoxProps) {
  return (
    <Section id={id}>
      <div
        className={cn(
          'grid items-center gap-8 rounded-block p-6 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12',
          dark ? 'bg-inverse text-on-inverse' : 'bg-surface',
        )}
      >
        <div>
          {eyebrow && <div className={cn('mb-2 text-sm', dark ? 'text-on-inverse-muted' : 'text-fg-muted')}>{eyebrow}</div>}
          <h2 className="text-2xl font-semibold md:text-4xl">{title}</h2>
          {text && <p className={cn('mt-4 md:text-lg', dark ? 'text-on-inverse-muted' : 'text-fg-muted')}>{text}</p>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {aside && <div>{aside}</div>}
      </div>
    </Section>
  );
}

/** CtaBox with a built-in request form. */
export function CtaForm({
  form,
  dark = true,
  ...rest
}: Omit<CtaBoxProps, 'aside'> & { form: LeadFormConfig }) {
  return <CtaBox dark={dark} {...rest} aside={<LeadForm {...form} dark={dark} />} />;
}

/** "Take our quiz" block with a visual on the right. */
export function QuizCta({
  title = 'Take our quiz and we will pick cars to match your wishes',
  text = 'The quiz takes less than a minute. You will get a shortlist of cars in your budget, with real prices.',
  button = 'Find your car',
}: {
  title?: string;
  text?: string;
  button?: string;
}) {
  return (
    <CtaBox
      dark={false}
      eyebrow="Plus a $1,000 trade-in bonus"
      title={title}
      text={text}
      actions={
        <ModalButton modal={{ type: 'quiz' }} size="lg">
          {button}
        </ModalButton>
      }
      aside={<Photo media={staticPhoto('keys.jpg', 'Car keys on a showroom desk')} label="Block visual" sizes="(min-width: 1024px) 480px, 100vw" className="min-h-64" />}
    />
  );
}

/** Final call to action: messengers on the left + form on the right. */
export function FinalCta({
  title,
  text,
  socials,
  submitLabel = 'Get my offer',
  formId = 'final',
  aside,
}: {
  title: string;
  text: string;
  socials: SocialLink[];
  submitLabel?: string;
  formId?: string;
  /** Instead of the form (e.g. the quiz button) */
  aside?: ReactNode;
}) {
  const messengers = socials.filter((s) => s.type === 'whatsapp' || s.type === 'telegram');
  return (
    <CtaBox
      title={title}
      text={text}
      actions={messengers.map((s) => (
        <Button key={s.type} href={s.url} variant="inverse" external>
          Message us on {s.label}
        </Button>
      ))}
      aside={aside ?? <LeadForm formId={formId} submitLabel={submitLabel} dark />}
    />
  );
}
