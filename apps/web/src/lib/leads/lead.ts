/**
 * Form submission: validation against the form description from Strapi and Bitrix24 lead fields (crm.item.add).
 */
import type { LeadFormSpec } from '@/lib/content/types';
import { LEAD_FILE_MAX_BYTES, hasLeadFileSignature, isAllowedLeadFile, safeLeadFileName } from '@/lib/lead-file';
import { routes } from '@/lib/routes';
import { UTM_KEYS, UTM_LEAD_FIELDS, readAttributionFields, type Attribution } from './attribution';

/** Lead originatorId value — "who created it": the site; originId is the outbox entry id (duplicate protection) */
export const ORIGINATOR_ID = 'kestrow-site';

export type Lead = {
  form: LeadFormSpec;
  name: string;
  /** E.164: +1XXXXXXXXXX */
  phone: string;
  emails: string[];
  /** Other form fields and extra data — "Label: value" lines for the comment */
  details: string[];
  file: { data: File; name: string } | null;
  page: string;
  /** Where the visitor came from (UTM, ads, referrer) — from the form's hidden fields */
  attribution: Attribution;
};

export type LeadError =
  | 'form_misconfigured'
  | 'invalid_phone'
  | 'consent_required'
  | 'required'
  | 'too_long'
  | 'invalid_email'
  | 'invalid_option'
  | 'file_too_large'
  | 'file_type';

const MAX_TEXT = 200;
const MAX_TEXTAREA = 2000;
const MAX_EXTRA = 30;
const MAX_EXTRA_VALUE = 1000;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Labels of extra data from the places that open a form (quiz answers already arrive with the question text) */
const EXTRA_LABELS: Record<string, string> = {
  title: 'Dialog',
  promo: 'Offer',
  kitchen: 'Car',
  project: 'Customer story',
  selection: 'Car selection',
};

/** 5550104820 / 1 555 010 4820 / +1 (555) 010-4820 → +15550104820; otherwise null */
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  // 10 digits, and a NANP area code never starts with 0 or 1
  if (!/^[2-9]\d{9}$/.test(national)) return null;
  return `+1${national}`;
}

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

/** A Bitrix24 lead comment understands BB codes: square brackets in visitor input are replaced with round ones */
const plain = (s: string) => s.replace(/\[/g, '(').replace(/]/g, ')');

const mountain = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Denver',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** "10/23/2026 20:50" in Mountain time — for timestamps in the lead comment */
export const formatMountain = (date: Date) => mountain.format(date).replace(',', '');

/**
 * Fallback form description: Strapi is unavailable and the form cache is empty. A request with a phone number matters
 * more than the exact set of fields: we accept name, phone, e-mail, comment, contact method and a file; fields with other names are lost.
 * Source: the quiz is marked separately in the portal (REPEAT_SALE "Website (quiz)"), other forms are CALLBACK.
 */
export function fallbackForm(formId: string): LeadFormSpec {
  return {
    formId,
    title: `Website request (${formId})`,
    submitLabel: 'Send',
    willSendToCrm: true,
    crmTitle: 'Website: request',
    crmSourceId: formId === 'quiz' ? 'REPEAT_SALE' : 'CALLBACK',
    fields: [
      { name: 'name', label: 'Your name', type: 'text', required: false, options: [] },
      { name: 'phone', label: 'Phone', type: 'tel', required: true, options: [] },
      { name: 'email', label: 'Email', type: 'email', required: false, options: [] },
      { name: 'comment', label: 'Comment', type: 'textarea', required: false, options: [] },
      // a radio without options accepts any value
      { name: 'contactWay', label: 'Preferred way to reach you', type: 'radio', required: false, options: [] },
      { name: 'file', label: 'File or photo', type: 'file', required: false, options: [] },
    ],
  };
}

export async function parseLead(form: LeadFormSpec, data: FormData): Promise<Lead | LeadError> {
  // A lead without a phone is useless: the Strapi form must have a field of type tel
  if (!form.fields.some((f) => f.type === 'tel')) return 'form_misconfigured';
  if (!data.get('agree')) return 'consent_required';

  let phone: string | null = null;
  let name = '';
  let file: Lead['file'] = null;
  const emails: string[] = [];
  const details: string[] = [];

  for (const f of form.fields) {
    const raw = data.get(f.name);
    switch (f.type) {
      case 'tel': {
        // the form's first phone is always required, the others follow the "required" flag
        const value = str(raw);
        if (!value && phone && !f.required) continue;
        const p = normalizePhone(value);
        if (!p) return 'invalid_phone';
        if (!phone) phone = p;
        else details.push(`${plain(f.label)}: ${p}`);
        continue;
      }
      case 'file': {
        if (raw instanceof File && raw.size > 0) {
          if (raw.size > LEAD_FILE_MAX_BYTES) return 'file_too_large';
          const head = new Uint8Array(await raw.slice(0, 16).arrayBuffer());
          if (!isAllowedLeadFile(raw) || !hasLeadFileSignature(raw.name, head)) return 'file_type';
          file ??= { data: raw, name: safeLeadFileName(raw.name) };
        } else if (f.required) return 'required';
        continue;
      }
    }

    const value = str(raw);
    if (!value) {
      if (f.required) return 'required';
      continue;
    }
    if (value.length > (f.type === 'textarea' ? MAX_TEXTAREA : MAX_TEXT)) return 'too_long';
    if (f.type === 'email' && !EMAIL_RE.test(value)) return 'invalid_email';
    if (f.type === 'radio' && f.options.length && !f.options.includes(value)) return 'invalid_option';

    if (f.name === 'name' && f.type === 'text') name = value;
    else if (f.type === 'email') emails.push(value);
    else details.push(`${plain(f.label)}: ${plain(value)}`);
  }
  if (!phone) return 'invalid_phone';

  let extraCount = 0;
  for (const [key, value] of data.entries()) {
    const m = /^extra\[(.{1,200})\]$/.exec(key);
    if (!m || typeof value !== 'string' || !value.trim()) continue;
    if (++extraCount > MAX_EXTRA) break;
    details.push(`${plain(EXTRA_LABELS[m[1]] ?? m[1])}: ${plain(value.trim().slice(0, MAX_EXTRA_VALUE))}`);
  }

  // Page path — only URL-safe characters
  const page = str(data.get('page'));
  const safePage = /^\/[\w\-./%]{0,299}$/.test(page) ? page : '';
  return { form, name, phone, emails, details, file, page: safePage, attribution: readAttributionFields(data) };
}

/**
 * Lead fields for crm.item.add (camelCase), checked against the portal's crm.item.fields:
 * utmSource…utmTerm, originatorId, originId are standard lead fields. originId = outbox entry id: the worker
 * uses it to check whether the first attempt (timed out) already created the lead before creating it again.
 */
export function leadFields(lead: Lead, siteUrl: string, opts: { now?: Date; originId?: string } = {}) {
  const { form, attribution: a } = lead;
  const comments = [...lead.details];
  if (lead.file) comments.push(`File: ${lead.file.name} — in the lead timeline`);
  if (a.referrer) comments.push(`Referrer: ${plain(a.referrer)}`);
  if (a.landing) comments.push(`Landing page: ${plain(a.landing)}`);
  if (a.clickId) comments.push(`Ad click: ${plain(a.clickId)}`);
  // Proof of consent to personal data processing: when and on which page the box was ticked
  comments.push(
    `Consent to personal data processing: given ${formatMountain(opts.now ?? new Date())} (MT)${lead.page ? ` on page ${siteUrl}${lead.page}` : ''}, policy ${siteUrl}${routes.privacy()}`,
  );

  const utm: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = a.utm[k];
    if (v) utm[UTM_LEAD_FIELDS[k]] = v;
  }

  const assignedById = Number(process.env.BITRIX24_LEAD_ASSIGNED_BY_ID);
  return {
    title: form.crmTitle,
    name: lead.name || undefined,
    fm: [
      { typeId: 'PHONE', valueType: 'WORK', value: lead.phone },
      ...lead.emails.map((value) => ({ typeId: 'EMAIL', valueType: 'WORK', value })),
    ],
    sourceId: form.crmSourceId,
    sourceDescription: `Form "${form.title}" (${form.formId})${lead.page ? `, page ${siteUrl}${lead.page}` : ''}`,
    comments: comments.join('\n'),
    ...utm,
    ...(opts.originId ? { originatorId: ORIGINATOR_ID, originId: opts.originId } : {}),
    ...(Number.isInteger(assignedById) && assignedById > 0 ? { assignedById } : {}),
  };
}
