import { useEffect } from 'react';

// Nome do site usado no sufixo do <title> e em og:site_name.
const SITE_NAME = 'TicketHub';

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  url?: string;
}

function clampDesc(s: string, max = 180): string {
  const clean = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

function ogImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) return url;
  const p = new URLSearchParams({ url, w: '1200', h: '630', fit: 'cover', output: 'jpg', q: '80' });
  return `https://wsrv.nl/?${p.toString()}`;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSeo({ title, description, image, type = 'website', url }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    const desc = description ? clampDesc(description) : '';
    const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const img = ogImageUrl(image);

    if (desc) upsertMeta('name', 'description', desc);

    upsertMeta('property', 'og:title', fullTitle);
    if (desc) upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', type);
    if (pageUrl) upsertMeta('property', 'og:url', pageUrl);
    if (img) {
      upsertMeta('property', 'og:image', img);
      upsertMeta('property', 'og:image:width', '1200');
      upsertMeta('property', 'og:image:height', '630');
    }

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    if (desc) upsertMeta('name', 'twitter:description', desc);
    if (img) upsertMeta('name', 'twitter:image', img);

    if (pageUrl) upsertCanonical(pageUrl);
  }, [title, description, image, type, url]);
}
