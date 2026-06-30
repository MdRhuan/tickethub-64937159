// scripts/prerender-og.mjs
//
// Roda DEPOIS do `vite build`. Para cada evento/post/álbum no Supabase, gera
// páginas estáticas em dist/ com as meta tags (title, description, og:image…)
// corretas, para que WhatsApp, Instagram, Facebook e Google vejam o conteúdo
// mesmo sem executar JavaScript.
//
// Também gera dist/sitemap.xml.
//
// Variáveis de ambiente necessárias (já existem no .env / no build da Lovable):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY
// Opcional:
//   SITE_URL  (padrão: https://tickethubbh.lovable.app)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = (process.env.SITE_URL || 'https://tickethubbh.lovable.app').replace(/\/$/, '');

// ── Helpers puros (testáveis) ───────────────────────────────────────────────

// Espelha src/lib/utils.ts slugify() + eventoSlug() — precisa bater com a rota.
export function slugify(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function eventoSlug(ev) {
  return slugify(ev.titulo) || ev.id;
}

export function escapeAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeUrl(u) {
  return String(u ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function clampDesc(s, max = 180) {
  const clean = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

export function ogImage(url, fallback = `${SITE}/og-default.jpg`) {
  if (!url || !/^https?:\/\//i.test(url)) return fallback;
  const p = new URLSearchParams({ url, w: '1200', h: '630', fit: 'cover', output: 'jpg', q: '80' });
  return `https://wsrv.nl/?${p.toString()}`;
}

/** Cria ou substitui uma meta tag pelo seu atributo identificador. */
export function setMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(`<meta\\s+${attr}=["']${key}["'][^>]*>`, 'i');
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

export function setTitle(html, title) {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  }
  return html.replace('</head>', `    <title>${escapeAttr(title)}</title>\n  </head>`);
}

export function setCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

/** Aplica todas as tags de SEO a uma cópia do index.html. */
export function buildPageHtml(template, { title, description, image, url, type = 'website' }) {
  const fullTitle = title ? `${title} — TicketHub` : 'TicketHub';
  const desc = clampDesc(description);
  const img = ogImage(image);
  let html = template;
  html = setTitle(html, fullTitle);
  if (desc) html = setMeta(html, 'name', 'description', desc);
  html = setMeta(html, 'property', 'og:title', fullTitle);
  if (desc) html = setMeta(html, 'property', 'og:description', desc);
  html = setMeta(html, 'property', 'og:image', img);
  html = setMeta(html, 'property', 'og:image:width', '1200');
  html = setMeta(html, 'property', 'og:image:height', '630');
  html = setMeta(html, 'property', 'og:type', type);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'name', 'twitter:title', fullTitle);
  if (desc) html = setMeta(html, 'name', 'twitter:description', desc);
  html = setMeta(html, 'name', 'twitter:image', img);
  html = setCanonical(html, url);
  return html;
}

// ── Busca de dados ──────────────────────────────────────────────────────────

async function fetchEventos(supabaseUrl, key) {
  const cols = 'id,titulo,sobre,imgUrl,imgBanner,data,datas,local';
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/eventos?select=${cols}&order=_ts.desc`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase respondeu ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchPosts(supabaseUrl, key) {
  const cols = 'id,titulo,subtitulo,conteudo,imgUrl,data,autor';
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/posts?select=${cols}&order=_ts.desc`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase respondeu ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchAlbuns(supabaseUrl, key) {
  const cols = 'id,nome,capa,data';
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/albuns?select=${cols}&order=_ts.desc`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase respondeu ${res.status}: ${await res.text()}`);
  return res.json();
}

// Lê VITE_* do process.env; se faltar, tenta parsear o .env local.
async function loadEnv() {
  let url = process.env.VITE_SUPABASE_URL;
  let key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if ((!url || !key) && existsSync('.env')) {
    const raw = await readFile('.env', 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const val = m[2].replace(/^["']|["']$/g, '');
      if (m[1] === 'VITE_SUPABASE_URL') url ||= val;
      if (m[1] === 'VITE_SUPABASE_PUBLISHABLE_KEY') key ||= val;
    }
  }
  return { url, key };
}

// ── Sitemap helpers ───────────────────────────────────────────────────────

function sitemapEntry({ loc, changefreq, priority }) {
  return [
    `  <url>`,
    `    <loc>${escapeUrl(loc)}</loc>`,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    `  </url>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function generateSitemap(entries) {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map(sitemapEntry),
    `</urlset>`,
  ].join('\n') + '\n';
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const templatePath = path.join(DIST, 'index.html');
  if (!existsSync(templatePath)) {
    console.error('[prerender] dist/index.html não encontrado. Rode `vite build` antes.');
    process.exit(1);
  }
  const template = await readFile(templatePath, 'utf8');

  const { url: SUPABASE_URL, key: KEY } = await loadEnv();
  if (!SUPABASE_URL || !KEY) {
    console.warn('[prerender] VITE_SUPABASE_URL/KEY ausentes — pulando prerender de conteúdo dinâmico.');
    return;
  }

  let eventos = [];
  let posts = [];
  let albuns = [];
  try {
    eventos = await fetchEventos(SUPABASE_URL, KEY);
    posts = await fetchPosts(SUPABASE_URL, KEY);
    albuns = await fetchAlbuns(SUPABASE_URL, KEY);
  } catch (e) {
    console.error('[prerender] Falha ao buscar dados:', e.message);
    process.exit(1);
  }

  const entries = [
    { loc: `${SITE}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE}/ingressos`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE}/calendario`, changefreq: 'daily', priority: '0.8' },
    { loc: `${SITE}/blog`, changefreq: 'weekly', priority: '0.7' },
    { loc: `${SITE}/fotos`, changefreq: 'weekly', priority: '0.6' },
    { loc: `${SITE}/link`, changefreq: 'monthly', priority: '0.5' },
  ];

  // Eventos
  for (const ev of eventos) {
    const slug = eventoSlug(ev);
    const pageUrl = `${SITE}/ingresso/${slug}`;
    const dataLabel = Array.isArray(ev.datas) && ev.datas.length ? ev.datas[0] : ev.data || '';
    const description = ev.sobre || `${ev.titulo}${ev.local ? ' — ' + ev.local : ''}${dataLabel ? ' em ' + dataLabel : ''}`;
    const html = buildPageHtml(template, {
      title: ev.titulo,
      description,
      image: ev.imgBanner || ev.imgUrl,
      url: pageUrl,
      type: 'article',
    });
    const dir = path.join(DIST, 'ingresso', slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    entries.push({ loc: pageUrl, changefreq: 'daily', priority: '0.8' });
  }

  // Blog posts
  for (const post of posts) {
    const pageUrl = `${SITE}/blog/${post.id}`;
    const description = post.subtitulo || clampDesc(post.conteudo) || post.titulo;
    const html = buildPageHtml(template, {
      title: post.titulo,
      description,
      image: post.imgUrl,
      url: pageUrl,
      type: 'article',
    });
    const dir = path.join(DIST, 'blog', String(post.id));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    entries.push({ loc: pageUrl, changefreq: 'weekly', priority: '0.7' });
  }

  // Galerias de fotos
  for (const al of albuns) {
    const pageUrl = `${SITE}/galeria/${al.id}`;
    const description = `Álbum de fotos de ${al.nome}${al.data ? ' em ' + al.data : ''}`;
    const html = buildPageHtml(template, {
      title: al.nome,
      description,
      image: al.capa,
      url: pageUrl,
      type: 'website',
    });
    const dir = path.join(DIST, 'galeria', String(al.id));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    entries.push({ loc: pageUrl, changefreq: 'weekly', priority: '0.6' });
  }

  await writeFile(path.join(DIST, 'sitemap.xml'), generateSitemap(entries), 'utf8');

  console.log(`[prerender] ${eventos.length} evento(s), ${posts.length} post(s), ${albuns.length} álbum(ns) gerados + sitemap.xml (${entries.length} URLs).`);
}

// Só roda main() quando executado direto (não quando importado por testes).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
