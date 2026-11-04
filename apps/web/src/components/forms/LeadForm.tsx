'use client';

import Link from 'next/link';
import { useId, useState, type FormEvent } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { FormField } from '@/lib/content/types';
import { formatPhone, isPhoneComplete } from '@/lib/format';
import { LEAD_FILE_ACCEPT, LEAD_FILE_MAX_BYTES, isAllowedLeadFile } from '@/lib/lead-file';
import { appendStoredAttribution } from '@/lib/leads/attribution-client';
import { routes } from '@/lib/routes';
import { useForms } from './FormsProvider';

/**
 * Where the form is used. Fields, default button label and success text come from Strapi
 * (collection "form", by formId); here — only what depends on the place on the page.
 */
export type LeadFormConfig = {
  /** Form identifier in Strapi */
  formId: string;
  /** Button label for this placement (otherwise from Strapi) */
  submitLabel?: string;
  /** inline — short fields (name, phone) on one row on wide screens */
  layout?: 'stack' | 'inline';
};

type Props = LeadFormConfig & {
  /** Dark background (lead blocks) */
  dark?: boolean;
  /** Extra data (quiz answers, car / offer name) */
  extra?: Record<string, string>;
  onSuccess?: () => void;
  className?: string;
};

type Status = 'idle' | 'sending' | 'success' | 'error';

/** The form is missing in Strapi — show a minimal one (the server will reject such a request and ask to call) */
const FALLBACK_FIELDS: FormField[] = [
  { name: 'name', label: 'Your name', type: 'text', placeholder: 'Your name', required: false, options: [] },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (___) ___-____', required: true, options: [] },
];

const SHORT_TYPES = new Set<FormField['type']>(['text', 'tel', 'email']);

/** Same as on the server (src/lib/leads/lead.ts) */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** /api/lead responses → readable text; anything else gets the generic error text */
const SERVER_ERRORS: Record<string, string> = {
  invalid_phone: 'Enter the full phone number',
  consent_required: 'Consent to personal data processing is required',
  required: 'Please fill in the required fields',
  too_long: 'Text is too long — please shorten it',
  invalid_email: 'Check your email address',
  invalid_option: 'Choose an option from the list',
  file_too_large: 'File is larger than 10 MB',
  413: 'File is larger than 10 MB',
  file_type: 'You can attach a photo (JPG, PNG, WEBP, HEIC) or a PDF',
  too_many_requests: 'Too many requests in a row. Please try later or call us.',
};

type FieldError = { field?: string; message: string };

export function LeadForm({ formId, submitLabel, layout = 'stack', dark, extra, onSuccess, className }: Props) {
  const uid = useId();
  const { forms, texts } = useForms();
  const def = forms[formId];
  const fields = def?.fields.length ? def.fields : FALLBACK_FIELDS;
  if (!def && process.env.NODE_ENV !== 'production') {
    console.warn(`[LeadForm] form "${formId}" is missing in Strapi — the request will not be accepted`);
  }

  const [phones, setPhones] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<FieldError | null>(null);
  const errorId = `${uid}-error`;
  const firstTel = fields.find((f) => f.type === 'tel')?.name;

  function validate(data: FormData): FieldError | null {
    for (const f of fields) {
      const value = data.get(f.name);
      const text = typeof value === 'string' ? value.trim() : '';
      if (f.type === 'tel') {
        // the first phone is always required, the others follow the Strapi flag
        const phone = phones[f.name] ?? '';
        if ((f.name === firstTel || f.required || phone) && !isPhoneComplete(phone)) {
          return { field: f.name, message: SERVER_ERRORS.invalid_phone };
        }
      } else if (f.type === 'file') {
        if (value instanceof File && value.size > 0) {
          if (value.size > LEAD_FILE_MAX_BYTES) return { field: f.name, message: SERVER_ERRORS.file_too_large };
          if (!isAllowedLeadFile(value)) return { field: f.name, message: SERVER_ERRORS.file_type };
        } else if (f.required) return { field: f.name, message: `Attach a file: ${f.label}` };
      } else if (f.required && !text) {
        return { field: f.name, message: `Fill in the “${f.label}” field` };
      } else if (f.type === 'email' && text && !EMAIL_RE.test(text)) {
        return { field: f.name, message: SERVER_ERRORS.invalid_email };
      }
    }
    if (!data.get('agree')) return { field: 'agree', message: SERVER_ERRORS.consent_required };
    return null;
  }

  /** Field accessibility attributes: the error is tied to its own field */
  const a11y = (name: string) =>
    error?.field === name ? { 'aria-invalid': true, 'aria-describedby': errorId } : {};

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const invalid = validate(data);
    if (invalid) {
      setError(invalid);
      form.querySelector<HTMLElement>(`[name="${invalid.field}"]`)?.focus();
      return;
    }
    setError(null);
    setStatus('sending');

    data.set('formId', formId);
    data.set('page', window.location.pathname);
    for (const [k, v] of Object.entries(extra ?? {})) data.set(`extra[${k}]`, v);

    try {
      // where the visitor came from (UTM, ads, referrer) — goes into the Bitrix24 lead
      appendStoredAttribution(data);
      const res = await fetch('/api/lead', { method: 'POST', body: data });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? String(res.status));
      }
      setStatus('success');
      form.reset();
      setPhones({});
      setFileNames({});
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      setError({ message: SERVER_ERRORS[err instanceof Error ? err.message : ''] ?? texts.errorText });
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className={cn('rounded-card p-5', dark ? 'bg-on-inverse/10' : 'bg-surface', className)}>
        <p className="text-lg font-semibold">{texts.successTitle}</p>
        <p className={cn('mt-1', dark ? 'text-on-inverse-muted' : 'text-fg-muted')}>
          {def?.successMessage ?? texts.successText}
        </p>
      </div>
    );
  }

  const field = cn(
    'min-h-12 w-full rounded-media border px-4 text-base outline-none transition-colors',
    dark
      ? 'border-on-inverse/25 bg-on-inverse/5 text-on-inverse placeholder:text-on-inverse-muted focus:border-on-inverse'
      : 'border-line bg-bg text-fg placeholder:text-fg-muted focus:border-fg',
  );
  const muted = dark ? 'text-on-inverse-muted' : 'text-fg-muted';

  const renderField = (f: FormField) => {
    const id = `${uid}-${f.name}`;
    switch (f.type) {
      case 'text':
      case 'email':
        return (
          <div key={f.name}>
            <label className="sr-only" htmlFor={id}>
              {f.label}
            </label>
            <input
              id={id}
              name={f.name}
              type={f.type}
              required={f.required}
              placeholder={f.placeholder ?? f.label}
              autoComplete={f.type === 'email' ? 'email' : f.name === 'name' ? 'name' : undefined}
              maxLength={200}
              {...a11y(f.name)}
              className={field}
            />
          </div>
        );
      case 'tel':
        return (
          <div key={f.name}>
            <label className="sr-only" htmlFor={id}>
              {f.label}
            </label>
            <input
              id={id}
              name={f.name}
              type="tel"
              inputMode="tel"
              required={f.name === firstTel || f.required}
              autoComplete="tel"
              placeholder={f.placeholder ?? '+1 (___) ___-____'}
              value={phones[f.name] ?? ''}
              onChange={(e) => {
                const v = e.target.value ? formatPhone(e.target.value) : '';
                setPhones((p) => ({ ...p, [f.name]: v }));
              }}
              {...a11y(f.name)}
              className={field}
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={f.name}>
            <label className="sr-only" htmlFor={id}>
              {f.label}
            </label>
            <textarea
              id={id}
              name={f.name}
              rows={3}
              required={f.required}
              placeholder={f.placeholder ?? f.label}
              maxLength={2000}
              {...a11y(f.name)}
              className={cn(field, 'py-3')}
            />
          </div>
        );
      case 'file':
        return (
          <label
            key={f.name}
            className={cn(
              'flex min-h-12 cursor-pointer items-center gap-2 rounded-media border border-dashed px-4 text-sm',
              'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary',
              dark ? 'border-on-inverse/30' : 'border-line',
            )}
          >
            <span aria-hidden>📎</span>
            <span className="min-w-0 truncate">{fileNames[f.name] ?? f.placeholder ?? 'Attach a file or photo'}</span>
            <input
              type="file"
              name={f.name}
              accept={LEAD_FILE_ACCEPT}
              required={f.required}
              onChange={(e) => {
                const name = e.target.files?.[0]?.name;
                setFileNames((prev) => {
                  const next = { ...prev };
                  if (name) next[f.name] = name;
                  else delete next[f.name];
                  return next;
                });
              }}
              {...a11y(f.name)}
              className="sr-only"
            />
          </label>
        );
      case 'radio':
        return (
          <fieldset key={f.name}>
            <legend className={cn('mb-2 text-sm', muted)}>{f.label}</legend>
            <div className="flex flex-wrap gap-4">
              {f.options.map((o, i) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={f.name} value={o} defaultChecked={i === 0} />
                  {o}
                </label>
              ))}
            </div>
          </fieldset>
        );
      case 'checkbox':
        return (
          <label key={f.name} className="flex items-start gap-2 text-sm">
            <input type="checkbox" name={f.name} value="Yes" required={f.required} {...a11y(f.name)} className="mt-0.5" />
            <span>{f.label}</span>
          </label>
        );
    }
  };

  const short = fields.filter((f) => SHORT_TYPES.has(f.type));
  const rest = fields.filter((f) => !SHORT_TYPES.has(f.type));

  return (
    // method/action — in case of submission before JS loads: POST to the API, not a GET with the phone number in the page URL
    <form
      method="post"
      action="/api/lead"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      className={cn('flex flex-col gap-3', className)}
      noValidate
    >
      <input type="hidden" name="formId" value={formId} />
      {/* honeypot: hidden field for bots (checked on the server) */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className={cn('grid gap-3', layout === 'inline' && 'sm:grid-cols-2')}>{short.map(renderField)}</div>
      {rest.map(renderField)}

      <label className={cn('flex items-start gap-2 text-xs', muted)}>
        <input type="checkbox" name="agree" required defaultChecked {...a11y('agree')} className="mt-0.5" />
        <Consent text={texts.consentText} />
      </label>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className={buttonClass(dark ? 'contrast' : 'primary', 'lg')}
      >
        {status === 'sending' ? 'Sending…' : (submitLabel ?? def?.submitLabel ?? 'Send')}
      </button>
    </form>
  );
}

/** Consent text from Strapi: the tail starting at "Privacy Policy" is a link to the privacy policy */
function Consent({ text }: { text: string }) {
  const at = text.search(/privacy policy/i);
  const link = (label: string) => (
    <Link href={routes.privacy()} className="underline" target="_blank">
      {label}
    </Link>
  );
  if (at < 0) {
    return (
      <span>
        {text} ({link('Privacy Policy')})
      </span>
    );
  }
  return (
    <span>
      {text.slice(0, at)}
      {link(text.slice(at))}
    </span>
  );
}
