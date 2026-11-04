/**
 * Attribution in the browser: remember where the visitor came from and add it to the request.
 * Client-side code only (window, localStorage). Storage may be unavailable (private mode,
 * blocked sites) — then attribution is simply not attached and the form works as before.
 */
import { appendAttributionFields, attributionFromVisit, hasCampaign, type Attribution } from './attribution';

const KEY = 'kestrow.attribution';
/** After 30 days a visit counts as new */
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Call on page load. A new ad tag overrides the saved one; otherwise the first visit is kept. */
export function captureAttribution() {
  try {
    const { search, pathname, host } = window.location;
    const current = attributionFromVisit({ search, referrer: document.referrer, path: pathname, host });
    if (hasCampaign(current) || !getStoredAttribution()) {
      localStorage.setItem(KEY, JSON.stringify(current));
    }
  } catch {
    // storage unavailable — no attribution
  }
}

export function getStoredAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Attribution;
    if (!a || typeof a !== 'object' || !a.utm || typeof a.utm !== 'object') return null;
    if (a.capturedAt && Date.now() - Date.parse(a.capturedAt) > TTL_MS) return null;
    return a;
  } catch {
    return null;
  }
}

/** Append the saved attribution to the FormData before sending the request. Never throws: the request matters more than the tags. */
export function appendStoredAttribution(data: FormData) {
  try {
    const a = getStoredAttribution();
    if (a) appendAttributionFields(data, a);
  } catch {
    // a foreign or corrupt storage entry — send without attribution
  }
}
