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

function build(url: string, width: number, opts: { quality?: number; height?: number } = {}) {
  const q = opts.quality ?? 72;
  const params = new URLSearchParams({
    url,
    w: String(width),
    output: 'webp',
    q: String(q),
  });
  // Só recorta no servidor quando uma altura é pedida (ex.: cards 3:4).
  if (opts.height) {
    params.set('h', String(opts.height));
    params.set('fit', 'cover');
  }
  return `${PROXY}?${params.toString()}`;
}

/** src único. `ratio` = largura/altura (ex.: 3/4 = card retrato) recorta no servidor. */
export function imgSrc(
  url: string | undefined | null,
  width: number,
  quality = 72,
  ratio?: number,
): string | undefined {
  if (!isProxyable(url)) return url ?? undefined;
  const height = ratio ? Math.round(width / ratio) : undefined;
  return build(url, width, { quality, height });
}

/** srcSet com vários descritores de largura. */
export function imgSrcSet(
  url: string | undefined | null,
  widths: number[] = [480, 768, 1280, 1920],
  quality = 72,
  ratio?: number,
): string | undefined {
  if (!isProxyable(url)) return undefined;
  return widths
    .map((w) => `${build(url, w, { quality, height: ratio ? Math.round(w / ratio) : undefined })} ${w}w`)
    .join(', ');
}
