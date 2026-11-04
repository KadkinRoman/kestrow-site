/**
 * Bitrix24 REST calls through an incoming webhook (env BITRIX24_WEBHOOK_URL is a secret, never logged).
 * Documentation: https://apidocs.bitrix24.com/ (crm.item.add, crm.item.list, crm.timeline.comment.add).
 */

const TIMEOUT_MS = 15_000;
/** A comment with a file up to 10 MB (base64 ~13 MB): 8 MB took ~7 s in testing — headroom for a slow connection */
const FILE_TIMEOUT_MS = 45_000;
/** Retrying here only on the cloud rate limit (request rejected, lead not created). Retries from the outbox are protected by originId. */
const RETRIES = 2;

export class Bitrix24Error extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'Bitrix24Error';
    this.code = code;
  }
}

type Reply<T> = { result?: T; error?: string; error_description?: string };

/** Method URL; a malformed webhook URL gives an error without the URL text (it contains the token) */
function methodUrl(method: string) {
  const base = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!base) throw new Bitrix24Error('NO_WEBHOOK', 'BITRIX24_WEBHOOK_URL is not set');
  try {
    const url = new URL(`${base.replace(/\/?$/, '/')}${method}.json`);
    if (url.protocol !== 'https:') throw new Error();
    return url;
  } catch {
    throw new Bitrix24Error('BAD_WEBHOOK', 'BITRIX24_WEBHOOK_URL is not an https webhook URL');
  }
}

export async function b24Call<T>(method: string, params: object, timeoutMs = TIMEOUT_MS): Promise<T> {
  const url = methodUrl(method);

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e) {
      // network errors and timeouts — without the original text (it may contain the URL); the cause code
      // (ENOTFOUND, ECONNREFUSED, UND_ERR_CONNECT_TIMEOUT) has no URL and helps diagnostics
      const cause = (e as { cause?: { code?: unknown } } | null)?.cause?.code;
      const detail = [e instanceof Error ? e.name : 'fetch failed', typeof cause === 'string' ? cause : '']
        .filter(Boolean)
        .join(' ');
      throw new Bitrix24Error('NETWORK', detail);
    }
    const body = (await res.json().catch(() => null)) as Reply<T> | null;
    if (res.ok && body && body.result !== undefined) return body.result;

    const code = body?.error ?? `HTTP_${res.status}`;
    if (code === 'QUERY_LIMIT_EXCEEDED' && attempt < RETRIES) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    throw new Bitrix24Error(code, body?.error_description || res.statusText || code);
  }
}

/** A lead (entityTypeId = 1) via crm.item.add: fields are camelCase, the phone goes in fm. Returns the lead id. */
export async function addLead(fields: Record<string, unknown>) {
  const res = await b24Call<{ item: { id: number } }>('crm.item.add', { entityTypeId: 1, fields });
  return res.item.id;
}

/** A comment in the lead timeline; with a file — FILES: [[name, base64]] */
export async function addLeadComment(leadId: number, comment: string, file?: { data: File; name: string }) {
  const files = file ? [[file.name, Buffer.from(await file.data.arrayBuffer()).toString('base64')]] : undefined;
  await b24Call(
    'crm.timeline.comment.add',
    { fields: { ENTITY_ID: leadId, ENTITY_TYPE: 'lead', COMMENT: comment, ...(files ? { FILES: files } : {}) } },
    files ? FILE_TIMEOUT_MS : TIMEOUT_MS,
  );
}

/** Error code and text for the log and the outbox — without the webhook URL */
export const describeError = (e: unknown) =>
  e instanceof Bitrix24Error ? `${e.code}: ${e.message}` : e instanceof Error ? e.name : 'unknown';

/**
 * Lead by the site request id (the lead's originId field) — duplicate protection when retrying from the outbox: the first
 * attempt may have created the lead without the reply arriving. The crm.item.list filter is camelCase, equality by default
 * (apidocs crm-item-list); that the field works in the filter should be confirmed with a test request on staging.
 */
export async function findLeadByOriginId(originId: string): Promise<number | null> {
  const res = await b24Call<{ items: { id: number }[] }>('crm.item.list', {
    entityTypeId: 1,
    filter: { originId },
    select: ['id'],
  });
  return res.items?.[0]?.id ?? null;
}
