/** Limits for the file attached to a request form — shared by the browser and /api/lead. */

export const LEAD_FILE_MAX_BYTES = 10 * 1024 * 1024;

/** For the input accept attribute and the name check: photos and PDF (no SVG — it can carry a script) */
export const LEAD_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'pdf'];
export const LEAD_FILE_ACCEPT = LEAD_FILE_EXTENSIONS.map((e) => `.${e}`).join(',');

const extension = (name: string) => /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? '';

/** Check by file name extension (the MIME type comes from the client — we do not trust it) */
export function isAllowedLeadFile(file: { name: string }) {
  return LEAD_FILE_EXTENSIONS.includes(extension(file.name));
}

/** The content signature matches the extension (first bytes of the file) */
export function hasLeadFileSignature(name: string, head: Uint8Array) {
  const ascii = (from: number, to: number) => String.fromCharCode(...head.subarray(from, to));
  switch (extension(name)) {
    case 'jpg':
    case 'jpeg':
      return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    case 'png':
      return head[0] === 0x89 && ascii(1, 4) === 'PNG';
    case 'webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case 'heic':
    case 'heif':
      return ascii(4, 8) === 'ftyp';
    case 'pdf':
      return ascii(0, 5) === '%PDF-';
    default:
      return false;
  }
}

/** Name for the CRM: no paths or control characters, at most 100 characters, extension kept */
export function safeLeadFileName(name: string) {
  const ext = extension(name);
  const base = name
    .replace(/^.*[\\/]/, '')
    .replace(/\.[^.]*$/, '')
    .replace(/[\p{Cc}<>:"|?*[\]]/gu, '_')
    .trim()
    .slice(0, 90);
  return `${base || 'file'}.${ext}`;
}
