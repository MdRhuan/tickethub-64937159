import { useEffect } from 'react';

// Domínio canônico oficial — usado para canonical e og:url em todas as páginas.
export const SITE_URL = 'https://www.tickethubh.com.br';
const SITE_NAME = 'TicketHub';

interface SeoOptions {
  /** Título da aba/SERP. Sufixado com " | TicketHub". */
  title?: string;
  /** Título completo já formatado — desativa o sufixo automático. */
  fullTitle?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  /** Caminho da rota (ex.: "/calendario"). Se ausente, usa window.location.pathname. */
  path?: string;
  /**
   * JSON-LD structured data — injetado como <script type="application/ld+json">.
   * Substituído a cada mudança.
   */
  jsonLd?: object | object[];
  /**
   * Versão do conteúdo (ex.: ev._ts). Vira `?v=` na URL da imagem de preview,
   * garantindo cache busting quando a capa é trocada e URLs distintas por evento.
   */
  version?: string | number;
}

function clampDesc(s: string, max = 155): string {
  const clean = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

function clampTitle(s: string, max = 60): string {
  const clean = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

function ogImageUrl(url?: string, version?: string | number): string | undefined {
  if (!url) return undefined;
  const v = version != null && String(version) !== '' ? String(version) : undefined;
  if (!/^https?:\/\//i.test(url)) return v ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(v)}` : url;
  const p = new URLSearchParams({ url, w: '1200', h: '630', fit: 'cover', output: 'jpg', q: '80' });
  if (v) p.set('v', v);
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

function upsertJsonLd(data?: object | object[]) {
  if (typeof document === 'undefined') return;
  document.head.querySelectorAll('script[type="application/ld+json"][data-seo="dynamic"]').forEach((el) => el.remove());
  if (!data) return;
  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo', 'dynamic');
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  }
}

export function pageUrl(path?: string): string {
  const p = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const clean = p.startsWith('/') ? p : `/${p}`;
  return `${SITE_URL}${clean}`;
}

export function useSeo({ title, fullTitle, description, image, type = 'website', path, jsonLd, version }: SeoOptions) {
  useEffect(() => {
    const composedTitle = fullTitle
      ? clampTitle(fullTitle, 70)
      : title
        ? clampTitle(`${title} | ${SITE_NAME}`, 70)
        : SITE_NAME;
    document.title = composedTitle;

    const desc = description ? clampDesc(description) : '';
    const url = pageUrl(path);
    const img = ogImageUrl(image, version);

    if (desc) upsertMeta('name', 'description', desc);

    upsertMeta('property', 'og:title', composedTitle);
    if (desc) upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    if (img) {
      upsertMeta('property', 'og:image', img);
      upsertMeta('property', 'og:image:width', '1200');
      upsertMeta('property', 'og:image:height', '630');
    }

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', composedTitle);
    if (desc) upsertMeta('name', 'twitter:description', desc);
    if (img) upsertMeta('name', 'twitter:image', img);

    upsertCanonical(url);

    upsertJsonLd(jsonLd);
  }, [title, fullTitle, description, image, type, path, jsonLd, version]);
}
