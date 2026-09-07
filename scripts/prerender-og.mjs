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
//   SITE_URL / VITE_SITE_URL  (padrão: https://www.tickethubh.com.br)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = path.resolve('dist');
const SITE = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.tickethubh.com.br').replace(/\/$/, '');

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

export function shortId(id) {
  const clean = String(id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean.slice(-6) || 'ev';
}

/**
 * Slugs ÚNICOS por evento — espelha src/lib/utils.ts buildEventoSlugMap().
 * Eventos homônimos NÃO compartilham URL: o mais antigo mantém o slug base,
 * os demais recebem `-<shortId>`.
 */
export function buildEventoSlugMap(eventos) {
  const ordered = [...eventos].sort((a, b) => (a._ts ?? 0) - (b._ts ?? 0) || String(a.id).localeCompare(String(b.id)));
  const used = new Set();
  const map = {};
  for (const ev of ordered) {
    const base = slugify(ev.titulo) || shortId(ev.id);
    let slug = base;
    if (used.has(slug)) slug = `${base}-${shortId(ev.id)}`;
    while (used.has(slug)) slug = `${slug}-x`;
    used.add(slug);
    map[ev.id] = slug;
  }
  return map;
}

export function eventoSlug(ev, map) {
  if (map && map[ev.id]) return map[ev.id];
  return slugify(ev.titulo) || shortId(ev.id);
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

// Belo Horizonte é UTC-3 fixo (sem horário de verão desde 2019).
const TZ_BR = '-03:00';

/** Combina data (YYYY-MM-DD) + hora (HH:MM) num ISO-8601 com fuso de BH. */
export function normalizeDateTime(dateStr, hora) {
  if (!dateStr) return undefined;
  const d = String(dateStr).slice(0, 10);
  if (!hora) return d;
  const m = String(hora).match(/(\d{1,2}):(\d{2})/);
  if (!m) return d;
  return `${d}T${m[1].padStart(2, '0')}:${m[2]}:00${TZ_BR}`;
}

/** Extrai o valor numérico de um preço textual ("R$ 40,00" -> "40.00"). Espelha EventoDetalhe.tsx. */
export function parsePreco(preco) {
  const n = String(preco ?? '').replace(/[^\d.,]/g, '').replace(',', '.');
  return n || undefined;
}

/** True se a última data do evento já passou (comparação por dia, fuso local do build). */
export function isPast(dateStr) {
  if (!dateStr) return false;
  return String(dateStr).slice(0, 10) < new Date().toISOString().slice(0, 10);
}

export function ogImage(url, fallback = `${SITE}/og-default.jpg`, version) {
  if (!url || !/^https?:\/\//i.test(url)) return fallback;
  const p = new URLSearchParams({ url, w: '1200', h: '630', fit: 'cover', output: 'jpg', q: '80' });
  // Cache busting: URL de preview única por evento/versão de capa.
  if (version) p.set('v', String(version));
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

/** Injeta conteúdo estático dentro de <div id="root">. Seguro com createRoot
 *  (o React limpa o container e remonta — sem erro de hidratação). Serve para
 *  crawlers e antecipa o LCP; o React substitui assim que o bundle carrega. */
export function setRootBody(html, bodyHtml) {
  if (!bodyHtml) return html;
  return html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${bodyHtml}</div>`);
}

/** Formata YYYY-MM-DD -> DD/MM/YYYY para leitura humana (fallback: string original). */
export function fmtDateBR(d) {
  const m = String(d ?? '').match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(d ?? '');
}

/** HTML estático do corpo de uma página de evento (acima da dobra + descrição + CTA). */
export function renderEventBody(ev, { datasLabel = '', ctaHref } = {}) {
  const paras = String(ev.sobre || 'Informações detalhadas sobre o evento em breve.')
    .split(/\n\s*\n|\n/).map((s) => s.trim()).filter(Boolean)
    .map((p) => `<p style="margin:0 0 12px">${escapeAttr(p)}</p>`).join('');
  const meta = [datasLabel, ev.hora, ev.local].filter(Boolean).map(escapeAttr).join(' • ');
  const cta = ctaHref
    ? `<a href="${escapeAttr(ctaHref)}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#1a3a6b;color:#fff;border-radius:8px;font-weight:700;text-decoration:none">Garantir ingresso</a>`
    : '';
  // Links internos (hub-and-spoke): mais do gênero + agenda da casa.
  const chip = 'display:inline-block;padding:8px 16px;border:1px solid #ddd;border-radius:999px;color:#1a3a6b;font-size:13px;font-weight:600;text-decoration:none';
  const navLinks = [];
  if (ev.categoria && GENEROS.includes(ev.categoria)) {
    navLinks.push(`<a href="/mais-baratos/${slugify(ev.categoria)}" style="${chip}">Mais ${escapeAttr(generoLabel(ev.categoria))} em BH</a>`);
  }
  if (isLocalValido(ev.local)) {
    navLinks.push(`<a href="/local/${slugify(ev.local)}" style="${chip}">Agenda do ${escapeAttr(ev.local)}</a>`);
  }
  const nav = navLinks.length
    ? `<div style="max-width:800px;margin:0 auto;padding:0 24px 36px;display:flex;gap:8px;flex-wrap:wrap">${navLinks.join('')}</div>`
    : '';
  return (
    `<section style="min-height:440px;background:#2a2a3e;color:#fff;padding:48px 24px;display:flex;flex-direction:column;justify-content:flex-end;box-sizing:border-box">` +
      `<h1 style="font-size:40px;font-weight:900;line-height:1.05;margin:0 0 16px">${escapeAttr(ev.titulo)}</h1>` +
      (meta ? `<p style="font-size:15px;color:#ccc;margin:0">${meta}</p>` : '') +
    `</section>` +
    `<div style="max-width:800px;margin:0 auto;padding:40px 24px;color:#333;box-sizing:border-box">` +
      `<h2 style="font-size:20px;font-weight:800;margin:0 0 14px">Sobre o Evento</h2>` +
      paras + cta +
    `</div>` + nav
  );
}

/** Hero estático (H1 + linha de apoio) para qualquer rota — crawlable, substituído pelo React ao montar. */
export function renderIntro(h1, lead) {
  return `<section style="background:linear-gradient(135deg,#0d0d0d,#1a1f36);padding:56px 24px;color:#fff">` +
    `<h1 style="font-size:clamp(28px,4vw,52px);font-weight:900;line-height:1.1;margin:0 0 12px">${escapeAttr(h1)}</h1>` +
    (lead ? `<p style="font-size:16px;color:#c0c8d6;max-width:600px;line-height:1.65;margin:0">${escapeAttr(lead)}</p>` : '') +
  `</section>`;
}

/** Grade estática de eventos (crawlable + LCP) para páginas de listagem. Links reais para /ingresso/:slug. */
export function renderEventGrid(eventos, slugMap) {
  if (!eventos || !eventos.length) {
    return `<p style="max-width:1280px;margin:0 auto;padding:40px 24px;color:#666">Nenhum evento disponível no momento.</p>`;
  }
  const cards = eventos.map((ev) => {
    const slug = eventoSlug(ev, slugMap);
    const allDates = (Array.isArray(ev.datas) && ev.datas.length ? ev.datas : (ev.data ? [ev.data] : [])).slice().sort();
    const meta = [allDates[0] ? fmtDateBR(allDates[0]) : '', ev.local].filter(Boolean).map(escapeAttr).join(' • ');
    return `<a href="/ingresso/${escapeAttr(slug)}" style="display:block;padding:14px 16px;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#111">` +
      `<strong style="display:block;font-size:15px;line-height:1.3">${escapeAttr(ev.titulo)}</strong>` +
      (meta ? `<span style="display:block;font-size:12px;color:#666;margin-top:3px">${meta}</span>` : '') +
      `<span style="display:block;font-size:13px;font-weight:700;margin-top:6px">${escapeAttr(ev.preco || 'Consultar')}</span>` +
    `</a>`;
  }).join('');
  return `<div style="max-width:1280px;margin:0 auto;padding:40px 24px"><div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${cards}</div></div>`;
}

/** BreadcrumbList JSON-LD a partir de [{name, url}]. */
export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

// O campo `preco` guarda um badge de promoção em texto livre ("90%OFF", "Sem Taxa",
// "Desconto Exclusivo"), não um preço numérico. Extraímos o % quando existe (para pôr
// as maiores ofertas no topo) e sinalizamos quem tem oferta. Espelha src/pages/MaisBaratos.tsx.
export function descontoPct(preco) {
  if (!preco) return null;
  const m = String(preco).match(/(\d{1,3})\s*%/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n > 0 && n <= 100 ? n : null;
}
export function temOferta(preco) {
  return !!preco && /%|\boff\b|desconto|sem\s*taxa|gr[aá]tis|promo|cupom|lote/i.test(String(preco));
}

// Locais placeholder ("A Definir" etc.) não viram página de casa. Espelha src/lib/locais.ts.
export function isLocalValido(local) {
  if (!local) return false;
  const s = String(local).trim();
  return s.length >= 2 && !/^(a\s*definir|a\s*confirmar|local\s*a\s*definir|indefinid|a\s*combinar|em\s*breve|diversos|v[aá]rios)/i.test(s);
}

// Gêneros válidos (espelha src/lib/generos.ts) — usados nas rotas /ingressos/:genero e nos links internos.
export const GENEROS = ['FUNK', 'SERTANEJO', 'PAGODE', 'ROCK', 'POP', 'ELETRÔNICO', 'MPB', 'TRAP', 'JAZZ'];
export const generoLabel = (g) => g.charAt(0) + g.slice(1).toLowerCase();

export function setCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

/** Aplica todas as tags de SEO a uma cópia do index.html. */
export function buildPageHtml(template, { title, fullTitle, description, image, url, type = 'website', jsonLd, version, bodyHtml }) {
  const composed = fullTitle || (title ? `${title} | TicketHub` : 'TicketHub');
  const desc = clampDesc(description, 155);
  const img = ogImage(image, `${SITE}/og-default.jpg`, version);
  let html = template;
  html = setTitle(html, composed);
  if (desc) html = setMeta(html, 'name', 'description', desc);
  html = setMeta(html, 'property', 'og:title', composed);
  if (desc) html = setMeta(html, 'property', 'og:description', desc);
  html = setMeta(html, 'property', 'og:image', img);
  html = setMeta(html, 'property', 'og:image:width', '1200');
  html = setMeta(html, 'property', 'og:image:height', '630');
  html = setMeta(html, 'property', 'og:type', type);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'name', 'twitter:title', composed);
  if (desc) html = setMeta(html, 'name', 'twitter:description', desc);
  html = setMeta(html, 'name', 'twitter:image', img);
  html = setCanonical(html, url);
  if (jsonLd) {
    const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const scripts = items
      .map((o) => `    <script type="application/ld+json">${JSON.stringify(o)}</script>`)
      .join('\n');
    html = html.replace('</head>', `${scripts}\n  </head>`);
  }
  if (bodyHtml) html = setRootBody(html, bodyHtml);
  return html;
}

// ── Busca de dados ──────────────────────────────────────────────────────────

async function fetchEventos(supabaseUrl, key) {
  const cols = 'id,titulo,sobre,imgUrl,imgBanner,data,datas,hora,local,categoria,preco,atracoes,ingressos,ing1,ing2,ing3,status,_ts';
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/eventos?select=${cols}&order=_ts.desc`;
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

function sitemapEntry({ loc, lastmod }) {
  return [
    `  <url>`,
    `    <loc>${escapeUrl(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
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

  // Rotas estáticas conhecidas — independentes do Supabase, então geradas SEMPRE
  // (antes do early-return por falta de credenciais). Sem esse prerender, crawlers
  // sem JS (WhatsApp, redes sociais, alguns bots de IA) recebem o index.html base,
  // ou seja, o title/description e o canonical da HOME. Aqui geramos o <head>
  // correto por rota; o corpo continua sendo renderizado pelo React. Título e
  // descrição espelham o useSeo de cada página.
  const staticPages = [
    { path: '/mais-baratos', title: 'Festas com desconto em BH — as melhores ofertas', description: 'Catálogo dos eventos de Belo Horizonte com desconto e vantagens, com as maiores ofertas em destaque. A TicketHub acha o link mais barato e te leva à plataforma oficial.',
      h1: 'As festas com desconto de BH', lead: 'Os eventos com desconto e vantagens, com as maiores ofertas em destaque. A compra é na plataforma oficial — a gente só acha o link com o melhor preço.', list: 'baratos' },
    { path: '/calendario', title: 'Agenda de eventos em Belo Horizonte', description: 'Calendário mensal de shows, festas e eventos em Belo Horizonte. Consulte datas, horários e locais dos melhores rolês em BH.',
      h1: 'Agenda de eventos em Belo Horizonte', lead: 'O calendário de shows, festas e eventos de BH. Consulte datas, horários e locais dos melhores rolês.' },
    { path: '/grupos', title: 'Grupos de WhatsApp', description: 'Entre nos grupos de WhatsApp do TicketHub e receba promoções de ingressos e avisos de eventos em Belo Horizonte.',
      h1: 'Grupos de WhatsApp do TicketHub', lead: 'Entre nos grupos e receba promoções e eventos de Belo Horizonte em primeira mão.' },
    { path: '/link', title: 'Links e contato', description: 'Todos os links e canais oficiais do TicketHub: catálogo de ingressos, agenda de eventos e grupos de WhatsApp de Belo Horizonte.',
      h1: 'TicketHub — Belo Horizonte', lead: 'Todos os canais oficiais: catálogo de ingressos, agenda de eventos e grupos de WhatsApp.' },
    { path: '/sobre', title: 'Sobre a TicketHub', description: 'A TicketHub reúne as festas e shows de Belo Horizonte e aponta onde comprar mais barato. Não vendemos ingresso — encontramos o link com desconto e te levamos até ele.',
      h1: 'Sobre a TicketHub', lead: 'Não vendemos ingresso — reunimos as festas de BH e apontamos o link com o melhor preço que a gente encontra.' },
    { path: '/como-funciona', title: 'Como funciona', description: 'Entenda como a TicketHub funciona: reunimos os eventos de BH, apontamos o link mais barato e você compra na plataforma oficial. Dúvidas sobre segurança, desconto e e-ticket.',
      h1: 'Como funciona a TicketHub', lead: 'Reunimos os eventos, apontamos o link mais barato e você compra na plataforma oficial. Simples assim.' },
    { path: '/contato', title: 'Contato', description: 'Fale com a TicketHub pelo WhatsApp ou Instagram. Tire dúvidas sobre eventos e compras, ou divulgue o seu evento em Belo Horizonte.',
      h1: 'Fale com a TicketHub', lead: 'Dúvida sobre um evento, um problema na compra ou quer divulgar seu rolê? Estamos aqui e respondemos rápido.', jsonLd: {
      '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contato — TicketHub', url: `${SITE}/contato`,
      mainEntity: { '@type': 'Organization', name: 'TicketHub', url: SITE,
        contactPoint: { '@type': 'ContactPoint', telephone: '+55-31-98315-8818', contactType: 'atendimento ao cliente', areaServed: 'BR', availableLanguage: 'Portuguese' },
        sameAs: ['https://www.instagram.com/tickethubh/'] } } },
  ];
  // 1ª passada: toda rota recebe H1 + intro no HTML (crawlable mesmo sem JS). As
  // listagens (/ingressos, /mais-baratos) ganham a grade de eventos depois do fetch.
  for (const p of staticPages) {
    const html = buildPageHtml(template, {
      title: p.title,
      description: p.description,
      url: `${SITE}${p.path}`,
      type: 'website',
      jsonLd: p.jsonLd,
      bodyHtml: renderIntro(p.h1, p.lead),
    });
    const dir = path.join(DIST, p.path.replace(/^\//, ''));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');
  }

  const { url: SUPABASE_URL, key: KEY } = await loadEnv();
  if (!SUPABASE_URL || !KEY) {
    console.warn(`[prerender] ${staticPages.length} página(s) estática(s) geradas. VITE_SUPABASE_URL/KEY ausentes — pulando prerender de eventos.`);
    return;
  }

  let eventos = [];
  try {
    eventos = await fetchEventos(SUPABASE_URL, KEY);
  } catch (e) {
    console.error('[prerender] Falha ao buscar dados:', e.message);
    process.exit(1);
  }

  const buildDate = new Date().toISOString().slice(0, 10);
  // Sitemap = home + todas as rotas estáticas (derivado de staticPages, sem duplicar) + eventos.
  const entries = [
    { loc: `${SITE}/`, lastmod: buildDate },
    ...staticPages.map((p) => ({ loc: `${SITE}${p.path}`, lastmod: buildDate })),
  ];

  // Eventos — só os aprovados (ignora pendentes/rejeitados que a query possa retornar).
  const publicados = eventos.filter((ev) => !ev.status || ev.status === 'aprovado');
  const slugMap = buildEventoSlugMap(publicados);

  // 2ª passada: SSR do corpo das listagens com a grade real de eventos (crawlable + LCP).
  // "Mais baratos": eventos com oferta primeiro (maior % no topo), depois os demais.
  const ofertasFirst = publicados.slice().sort((a, b) => {
    const oa = temOferta(a.preco), ob = temOferta(b.preco);
    if (oa !== ob) return oa ? -1 : 1;
    return (descontoPct(b.preco) ?? -1) - (descontoPct(a.preco) ?? -1);
  });
  const listingBodies = {
    '/mais-baratos': renderEventGrid(ofertasFirst, slugMap),
  };
  for (const p of staticPages.filter((s) => listingBodies[s.path])) {
    const html = buildPageHtml(template, {
      title: p.title, description: p.description, url: `${SITE}${p.path}`, type: 'website',
      jsonLd: p.jsonLd, bodyHtml: renderIntro(p.h1, p.lead) + listingBodies[p.path],
    });
    await writeFile(path.join(DIST, p.path.replace(/^\//, ''), 'index.html'), html, 'utf8');
  }

  // Home (/): o dist/index.html só tem <head>. Injeta corpo estático (H1 + destaques)
  // para crawlers/IA sem JS e para antecipar o LCP; o React remonta ao carregar.
  {
    const homeBody = renderIntro(
      'TicketHub — festas e ingressos em Belo Horizonte',
      'Descubra as festas, shows e rolês de BH e vá pelo link com o melhor preço.',
    ) + renderEventGrid(publicados.slice(0, 12), slugMap);
    const homeHtml = setRootBody(await readFile(templatePath, 'utf8'), homeBody);
    await writeFile(templatePath, homeHtml, 'utf8');
  }

  // Páginas de gênero (/ingressos/:genero) — só as categorias que têm eventos (quality gate).
  for (const g of GENEROS) {
    const evs = publicados.filter((e) => e.categoria === g);
    if (!evs.length) continue;
    const slug = slugify(g);
    const label = generoLabel(g);
    const url = `${SITE}/mais-baratos/${slug}`;
    const html = buildPageHtml(template, {
      title: `Ingressos de ${label} em BH`,
      description: `Ingressos para as melhores festas de ${label.toLowerCase()} em Belo Horizonte. Encontre o rolê e vá pelo link com o melhor preço.`,
      url, type: 'website',
      jsonLd: breadcrumbLd([{ name: 'Início', url: `${SITE}/` }, { name: 'Mais baratos', url: `${SITE}/mais-baratos` }, { name: label, url }]),
      bodyHtml: renderIntro(`${label} em BH`, `As melhores festas de ${label.toLowerCase()} em Belo Horizonte, com o link pelo melhor preço.`) + renderEventGrid(evs, slugMap),
    });
    await mkdir(path.join(DIST, 'mais-baratos', slug), { recursive: true });
    await writeFile(path.join(DIST, 'mais-baratos', slug, 'index.html'), html, 'utf8');
    entries.push({ loc: url, lastmod: buildDate });
  }

  // Páginas de local/casa (/local/:slug) — agrupa por local válido; schema Place.
  const venues = {};
  for (const ev of publicados) {
    if (!isLocalValido(ev.local)) continue;
    const slug = slugify(ev.local);
    (venues[slug] ||= { nome: ev.local, evs: [] }).evs.push(ev);
  }
  for (const [slug, v] of Object.entries(venues)) {
    const url = `${SITE}/local/${slug}`;
    const placeJsonLd = {
      '@context': 'https://schema.org', '@type': 'Place', name: v.nome, url,
      address: { '@type': 'PostalAddress', addressLocality: 'Belo Horizonte', addressRegion: 'MG', addressCountry: 'BR' },
    };
    const html = buildPageHtml(template, {
      title: `Eventos no ${v.nome} — BH`,
      description: `Agenda de festas e shows no ${v.nome}, em Belo Horizonte. Veja os próximos eventos e garanta seu ingresso pelo link com o melhor preço.`,
      url, type: 'website',
      jsonLd: [placeJsonLd, breadcrumbLd([{ name: 'Início', url: `${SITE}/` }, { name: v.nome, url }])],
      bodyHtml: renderIntro(`Eventos no ${v.nome}`, `Festas e shows no ${v.nome}, em Belo Horizonte.`) + renderEventGrid(v.evs, slugMap),
    });
    await mkdir(path.join(DIST, 'local', slug), { recursive: true });
    await writeFile(path.join(DIST, 'local', slug, 'index.html'), html, 'utf8');
    entries.push({ loc: url, lastmod: buildDate });
  }

  // Guias editoriais (/guias + /guias/:slug). Metadados espelham src/data/guias.tsx.
  const GUIAS_META = [
    { slug: 'como-ir-a-festas-em-bh-gastando-menos', title: 'Como ir a festas em BH gastando menos', description: 'Cinco formas práticas de pagar mais barato nas festas e shows de Belo Horizonte: lotes, cupons, taxas e os grupos onde as promoções saem primeiro.', h1: 'Como ir a festas em BH gastando menos', lead: 'Ir para o rolê não precisa pesar no bolso. Cinco formas práticas de pagar menos nas festas de BH.' },
    { slug: 'guia-de-festas-eletronicas-em-bh', title: 'Guia de festas eletrônicas em BH', description: 'Como se achar na cena de música eletrônica de Belo Horizonte: o que olhar antes de comprar, onde encontrar as festas e como pagar mais barato.', h1: 'Guia de festas eletrônicas em BH', lead: 'Da pista ao rooftop: como se achar na cena eletrônica de Belo Horizonte e ir pro rolê pagando menos.' },
    { slug: 'o-que-fazer-em-bh-esse-fim-de-semana', title: 'O que fazer em BH esse fim de semana', description: 'O guia rápido para achar o rolê certo em Belo Horizonte neste fim de semana — festas, shows e eventos por gênero, local e preço, com o link mais barato.', h1: 'O que fazer em BH esse fim de semana', lead: 'BH tem agenda cheia todo fim de semana. O difícil é achar o rolê certo e comparar preço — este guia resolve isso em minutos.' },
    { slug: 'ingresso-com-cupom-como-funciona', title: 'Ingresso com cupom: como funciona (e quando vale a pena)', description: 'Cupom, lote e taxa de conveniência: entenda como pagar menos no ingresso da sua festa em BH, sem cair em furada. Guia direto da TicketHub.', h1: 'Ingresso com cupom: como funciona (e quando vale a pena)', lead: 'Cupom, lote, taxa: como pagar menos no ingresso da festa em BH — e por que quase sempre vale a pena checar antes de comprar.' },
  ];
  const chipBlock = 'display:block;padding:16px 20px;border:1px solid #eee;border-radius:12px;color:#111;text-decoration:none;font-weight:700';
  const guiaIndexBody = `<div style="max-width:800px;margin:0 auto;padding:32px 24px;display:flex;flex-direction:column;gap:12px">` +
    GUIAS_META.map((g) => `<a href="/guias/${g.slug}" style="${chipBlock}">${escapeAttr(g.title)}</a>`).join('') + `</div>`;
  {
    const url = `${SITE}/guias`;
    const html = buildPageHtml(template, {
      title: 'Guias de festas e eventos em BH',
      description: 'Guias da TicketHub para curtir a noite de Belo Horizonte gastando menos: dicas de economia, cena eletrônica e como achar as melhores festas.',
      url, type: 'website',
      bodyHtml: renderIntro('Guias da noite de BH', 'Nossa curadoria para você aproveitar as festas de BH e gastar menos no rolê.') + guiaIndexBody,
    });
    await mkdir(path.join(DIST, 'guias'), { recursive: true });
    await writeFile(path.join(DIST, 'guias', 'index.html'), html, 'utf8');
    entries.push({ loc: url, lastmod: buildDate });
  }
  for (const g of GUIAS_META) {
    const url = `${SITE}/guias/${g.slug}`;
    const back = `<div style="max-width:800px;margin:0 auto;padding:0 24px 36px"><a href="/guias" style="color:#1a3a6b;font-weight:700;text-decoration:none">&larr; Todos os guias</a></div>`;
    const html = buildPageHtml(template, {
      title: g.title, description: g.description, url, type: 'article',
      bodyHtml: renderIntro(g.h1, g.lead) + back,
    });
    await mkdir(path.join(DIST, 'guias', g.slug), { recursive: true });
    await writeFile(path.join(DIST, 'guias', g.slug, 'index.html'), html, 'utf8');
    entries.push({ loc: url, lastmod: buildDate });
  }

  for (const ev of publicados) {
    const slug = eventoSlug(ev, slugMap);
    const pageUrl = `${SITE}/ingresso/${slug}`;

    // Datas: usa o array `datas` (multi-data) ou `data`. Ordena para achar início/fim.
    const allDates = (Array.isArray(ev.datas) && ev.datas.length ? ev.datas : (ev.data ? [ev.data] : []))
      .slice().sort();
    const startDate = normalizeDateTime(allDates[0], ev.hora);
    const endDate = allDates.length > 1 ? normalizeDateTime(allDates[allDates.length - 1], ev.hora) : undefined;
    const past = isPast(allDates[allDates.length - 1] || allDates[0]);
    const availability = past ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock';

    const dataLabel = allDates[0] || '';
    const description = ev.sobre || `${ev.titulo}${ev.local ? ' — ' + ev.local : ''}${dataLabel ? ' em ' + dataLabel : ''}`;

    // Ofertas: espelha EventoDetalhe.tsx — uma Offer por ingresso, ou uma genérica.
    const ingressosList = (Array.isArray(ev.ingressos) && ev.ingressos.length)
      ? ev.ingressos
      : [ev.ing1, ev.ing2, ev.ing3].filter(Boolean);
    const price = parsePreco(ev.preco);
    const offers = ingressosList.length
      ? ingressosList.map((ing) => ({
          '@type': 'Offer',
          name: ing.nome || undefined,
          url: ing.link || pageUrl,
          ...(price ? { price } : {}),
          priceCurrency: 'BRL',
          availability,
          validFrom: buildDate,
        }))
      : {
          '@type': 'Offer',
          url: pageUrl,
          ...(price ? { price } : {}),
          priceCurrency: 'BRL',
          availability,
        };

    const performer = (Array.isArray(ev.atracoes) && ev.atracoes.length)
      ? ev.atracoes.map((a) => ({ '@type': 'PerformingGroup', name: a.nome }))
      : undefined;

    const image = ev.imgBanner || ev.imgUrl;
    const eventJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: ev.titulo,
      description,
      startDate: startDate || undefined,
      endDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: ev.local ? {
        '@type': 'Place',
        name: ev.local,
        address: { '@type': 'PostalAddress', addressLocality: 'Belo Horizonte', addressRegion: 'MG', addressCountry: 'BR' },
      } : undefined,
      image: image ? [image] : undefined,
      performer,
      url: pageUrl,
      organizer: { '@type': 'Organization', name: 'TicketHub', url: SITE },
      offers,
    };
    // Corpo estático (crawlable + LCP rápido) — substituído pelo React ao montar.
    const datasLabel = allDates.map(fmtDateBR).join(' • ');
    const firstLink = ingressosList.map((i) => i && i.link).find((l) => /^https?:\/\//i.test(String(l || '')));
    const ctaHref = (!past && firstLink) ? firstLink : undefined;
    const bodyHtml = renderEventBody(ev, { datasLabel, ctaHref });

    const html = buildPageHtml(template, {
      fullTitle: `${ev.titulo} em BH — ingressos | TicketHub`,
      description,
      image,
      url: pageUrl,
      type: 'article',
      version: `${ev.id}-${ev._ts ?? ''}`,
      jsonLd: [eventJsonLd, breadcrumbLd([{ name: 'Início', url: `${SITE}/` }, { name: 'Mais baratos', url: `${SITE}/mais-baratos` }, { name: ev.titulo, url: pageUrl }])],
      bodyHtml,
    });
    const dir = path.join(DIST, 'ingresso', slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html, 'utf8');

    // Sitemap: eventos passados continuam acessíveis, mas saem do sitemap para mantê-lo fresco.
    if (!past) {
      const lastmod = Number.isFinite(Number(ev._ts)) && Number(ev._ts) > 0
        ? new Date(Number(ev._ts)).toISOString().slice(0, 10)
        : buildDate;
      entries.push({ loc: pageUrl, lastmod });
    }
  }

  await writeFile(path.join(DIST, 'sitemap.xml'), generateSitemap(entries), 'utf8');

  console.log(`[prerender] ${eventos.length} evento(s) + ${staticPages.length} página(s) estática(s) + sitemap.xml (${entries.length} URLs).`);
}

// Só roda main() quando executado direto (não quando importado por testes).
// pathToFileURL normaliza o caminho em todos os SOs (no Windows, argv[1] usa
// barras invertidas e não bate com a string `file://...` montada à mão).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
