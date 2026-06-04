/**
 * Imagens responsivas via wsrv.nl (CDN Cloudflare, gratuito).
 * Aceita qualquer URL HTTPS pública — inclusive signed URLs do Supabase.
 *
 * Uso:
 *   <img
 *     src={imgSrc(url, 960)}
 *     srcSet={imgSrcSet(url, [480, 768, 1280, 1920])}
 *     sizes="(max-width: 768px) 100vw, 50vw"
 *   />
 */

const PROXY = 'https://wsrv.nl/';

function isProxyable(url: string | undefined | null): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url) && !url.startsWith('data:');
}

function build(url: string, width: number, opts: { quality?: number; dpr?: number } = {}) {
  const q = opts.quality ?? 72;
  const params = new URLSearchParams({
    url,
    w: String(width),
    output: 'webp',
    q: String(q),
    fit: 'cover',
  });
  if (opts.dpr && opts.dpr > 1) params.set('dpr', String(opts.dpr));
  return `${PROXY}?${params.toString()}`;
}

/** Single optimized src at a given width (in CSS px). */
export function imgSrc(url: string | undefined | null, width: number, quality = 72): string | undefined {
  if (!isProxyable(url)) return url ?? undefined;
  return build(url, width, { quality });
}

/** srcSet with multiple width descriptors. */
export function imgSrcSet(
  url: string | undefined | null,
  widths: number[] = [480, 768, 1280, 1920],
  quality = 72,
): string | undefined {
  if (!isProxyable(url)) return undefined;
  return widths.map((w) => `${build(url, w, { quality })} ${w}w`).join(', ');
}
