import { after, NextResponse } from 'next/server';
import { getForm } from '@/lib/content';
import type { LeadFormSpec } from '@/lib/content/types';
import { LEAD_FILE_MAX_BYTES } from '@/lib/lead-file';
import { addLead, addLeadComment, describeError } from '@/lib/leads/bitrix24';
import { fallbackForm, leadFields, parseLead } from '@/lib/leads/lead';
import { notifyLeadLost, notifyLeadQueued } from '@/lib/leads/notify';
import { enqueueAttach, enqueueLead, newOutboxId, removeItem } from '@/lib/leads/outbox';
import { allow, ipKey, isLimited, record } from '@/lib/leads/rate-limit';

/**
 * Intake of form submissions → a Bitrix24 lead (crm.item.add; a file goes into the lead feed as a comment).
 *
 * The form (fields, source, lead title) comes from Strapi by formId; if Strapi is down and the cache is empty, a fallback
 * definition is used (name, phone, email, comment, contact method, file). Anti-spam: honeypot `website`, a limit on
 * submissions per IP (IPv6 by /64) and per phone. Sending to the CRM happens only when LEADS_SEND_TO_CRM=true and the
 * form has willSendToCrm; otherwise it is a dry run and the resulting lead fields are logged. If Bitrix24 rejects the
 * lead, the request goes into the on-disk queue (src/lib/leads/outbox.ts), the team is notified, and a background
 * worker retries (no duplicates, thanks to originId); if the queue fails too, a notification with the contact
 * details is sent and the response is 502. A file from the form is uploaded to the feed after the visitor gets
 * a response (after()), with a safety task in the queue in case of a restart.
 */

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT_PER_IP = 5;
const LIMIT_PER_PHONE = 3;
/** File + form fields; anything larger is not parsed at all (the proxy must enforce an 11 MB body limit on /api/lead) */
const MAX_BODY_BYTES = LEAD_FILE_MAX_BYTES + 1024 * 1024;
/** Without Strapi we accept only a sane-looking formId, since it ends up in the lead title */
const FALLBACK_FORM_ID = /^[\w-]{1,64}$/;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const isProd = process.env.NODE_ENV === 'production';

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/**
 * Client IP behind a reverse proxy. The last X-Forwarded-For address is reliable: the proxy appends it itself
 * (Caddy, and nginx with $proxy_add_x_forwarded_for), while the leading addresses are set by the client and can't be trusted.
 * X-Real-IP is only a fallback: Caddy doesn't overwrite it and a client can supply its own
 * (bypassing the IP limit); if the proxy sets it itself (nginx $remote_addr, Caddy header_up), it will match.
 * Without a proxy (dev) the headers are client-controlled, so the limit is nominal there.
 */
function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  const real = request.headers.get('x-real-ip')?.trim();
  return forwarded || real || 'unknown';
}

/** The form definition from Strapi; if Strapi is down, a fallback so the request isn't lost */
async function resolveForm(formId: string): Promise<{ form: LeadFormSpec | null; fallback: boolean }> {
  try {
    return { form: await getForm(formId), fallback: false };
  } catch (e) {
    if (!FALLBACK_FORM_ID.test(formId)) return { form: null, fallback: true };
    console.error(
      `[lead] Strapi unavailable (${e instanceof Error ? e.message : e}); form "${formId}" accepted using the fallback definition`,
    );
    return { form: fallbackForm(formId), fallback: true };
  }
}

const fileNote = (name: string) => `The customer attached the file "${name}", but it failed to upload. Please ask them to send it again.`;

export async function POST(request: Request) {
  if (!allow(`ip:${ipKey(clientIp(request))}`, LIMIT_PER_IP, WINDOW_MS)) return fail('too_many_requests', 429);
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return fail('file_too_large', 413);

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return fail('bad_request', 400);
  }

  // honeypot: a real person never sees or fills this field, so a bot gets a fake "success"
  if (data.get('website')) return NextResponse.json({ ok: true });

  const formId = String(data.get('formId') ?? '').slice(0, 100);
  const { form, fallback } = await resolveForm(formId);
  if (!form) {
    console.error(`[lead] form "${formId}" does not exist in Strapi; request rejected`);
    return fail('unknown_form', 422);
  }

  const lead = await parseLead(form, data);
  if (lead === 'form_misconfigured') {
    console.error(`[lead] form "${form.formId}" has no tel field in Strapi; request rejected`);
    return fail(lead, 422);
  }
  if (typeof lead === 'string') return fail(lead, 422);
  if (fallback) {
    lead.details.push('Form definition unavailable (Strapi): the request was accepted using the fallback definition and some fields may not have been saved');
  }

  const phoneKey = `phone:${lead.phone}`;
  if (isLimited(phoneKey, LIMIT_PER_PHONE, WINDOW_MS)) return fail('too_many_requests', 429);

  // The queue record id is assigned before the first attempt: it is also the lead's originId, which keeps the worker from creating a duplicate
  const outboxId = newOutboxId();
  const fields = leadFields(lead, siteUrl, { originId: outboxId });

  if (process.env.LEADS_SEND_TO_CRM !== 'true' || !form.willSendToCrm) {
    const reason = form.willSendToCrm ? 'LEADS_SEND_TO_CRM≠true' : 'willSendToCrm=false';
    if (isProd) {
      // no personal data; in production this is almost certainly a misconfiguration and the request is lost
      console.error(`[lead] request NOT sent to the CRM (${reason}): form ${form.formId}`);
    } else {
      console.info(
        `[lead] dry-run (${reason}), crm.item.add entityTypeId=1 fields:`,
        JSON.stringify(fields, null, 2),
        lead.file ? `\n[lead] file for the feed: ${lead.file.name}, ${lead.file.data.size} bytes` : '',
      );
    }
    record(phoneKey, WINDOW_MS);
    return NextResponse.json({ ok: true });
  }

  let leadId: number;
  try {
    leadId = await addLead(fields);
  } catch (e) {
    const error = describeError(e);
    console.error(`[lead] Bitrix24 rejected the lead (form ${form.formId}): ${error}; request queued`);
    const formTitle = form.title;
    const file = lead.file ? { name: lead.file.name, bytes: new Uint8Array(await lead.file.data.arrayBuffer()) } : undefined;
    try {
      const item = await enqueueLead({ id: outboxId, formId: form.formId, formTitle, fields, error, file });
      record(phoneKey, WINDOW_MS);
      // Notify the team after the visitor gets a response
      after(() => notifyLeadQueued(item));
      return NextResponse.json({ ok: true, queued: true });
    } catch (queueError) {
      console.error(`[lead] queue unavailable; request lost: ${queueError instanceof Error ? queueError.message : queueError}`);
      // Last resort: send the customer's contact details to the team
      after(() => notifyLeadLost({ fields, formTitle, error }));
      return fail('crm_unavailable', 502);
    }
  }
  record(phoneKey, WINDOW_MS);

  if (lead.file) {
    // The lead is created, so the visitor needn't wait for the file upload (up to 45 s). Safety net in case of a restart during
    // the upload: a queued task; after() removes it on success, otherwise the worker retries in 2 minutes.
    const file = lead.file;
    const formTitle = form.title;
    const bytes = new Uint8Array(await file.data.arrayBuffer());
    const task = await enqueueAttach({ leadId, formId: form.formId, formTitle, file: { name: file.name, bytes } }).catch(
      (e: unknown) => {
        console.error(`[lead] safety task "attach file to lead ${leadId}" was not saved: ${e instanceof Error ? e.message : e}`);
        return null;
      },
    );
    after(async () => {
      let attached = false;
      try {
        await addLeadComment(leadId, `File from the "${formTitle}" form on the site`, file);
        attached = true;
      } catch (e) {
        console.error(
          `[lead] file "${file.name}" (${file.data.size} bytes) was not attached to lead ${leadId}: ${describeError(e)}${task ? '; the worker will retry' : ''}`,
        );
        if (!task) await addLeadComment(leadId, fileNote(file.name)).catch(() => undefined);
      }
      if (attached && task) {
        await removeItem(task.id).catch((e: unknown) =>
          console.error(`[lead] task ${task.id} was not removed, so the worker will attach the file again: ${e instanceof Error ? e.message : e}`),
        );
      }
    });
  }

  return NextResponse.json({ ok: true });
}
