
const MESES_ABR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function fmtDataCard(str: string): string {
  if (!str) return '';
  const p = str.split('-');
  return `${p[2]} ${MESES_ABR[parseInt(p[1]) - 1] || ''}`;
}

export function fmtDataFull(str: string): string {
  if (!str) return '';
  const p = str.split('-');
  return `${p[2]} de ${MESES_FULL[parseInt(p[1]) - 1] || ''} de ${p[0]}`;
}

export function fmtDataBlog(str: string): string {
  if (!str) return '';
  const p = str.split('-');
  return `${p[2]} ${MESES_ABR[parseInt(p[1]) - 1] || ''} ${p[0]}`;
}

export function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - t0.getTime()) / 86400000);
}

export function dayBadge(days: number): { text: string; kind: 'future' | 'soon' | 'today' | 'past' } {
  if (days < 0)  return { text: 'Encerrado',          kind: 'past' };
  if (days === 0) return { text: 'Hoje!',             kind: 'today' };
  if (days === 1) return { text: 'Amanhã!',           kind: 'soon' };
  return { text: `Faltam ${days} dias`,               kind: 'future' };
}

export function slugify(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type EventoLike = { titulo: string; id: string; _ts?: number };

/** Sufixo curto e estável derivado do ID único do evento. */
export function shortId(id: string): string {
  const clean = String(id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean.slice(-6) || 'ev';
}

/**
 * Gera slugs ÚNICOS por evento. Eventos com o mesmo título não compartilham URL:
 * o mais antigo (menor _ts) mantém o slug base e os demais recebem `-<shortId>`.
 * Determinístico — mesma entrada, mesmo resultado (app e prerender).
 */
export function buildEventoSlugMap(eventos: EventoLike[]): Record<string, string> {
  const ordered = [...eventos].sort((a, b) => (a._ts ?? 0) - (b._ts ?? 0) || String(a.id).localeCompare(String(b.id)));
  const used = new Set<string>();
  const map: Record<string, string> = {};
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

// Registro global preenchido quando os eventos são carregados (DBContext),
// para que eventoSlug(ev) devolva sempre o slug único do evento.
let SLUG_REGISTRY: Record<string, string> = {};

export function registerEventoSlugs(eventos: EventoLike[]): Record<string, string> {
  SLUG_REGISTRY = buildEventoSlugMap(eventos);
  return SLUG_REGISTRY;
}

export function eventoSlug(ev: EventoLike): string {
  return SLUG_REGISTRY[ev.id] || slugify(ev.titulo) || shortId(ev.id);
}

/** Resolve um evento a partir do slug da URL (slug único → id → slug base legado). */
export function findEventoBySlug<T extends EventoLike>(eventos: T[], slug?: string): T | undefined {
  if (!slug) return undefined;
  const map = buildEventoSlugMap(eventos);
  const byUnique = eventos.find((e) => map[e.id] === slug);
  if (byUnique) return byUnique;
  const byId = eventos.find((e) => e.id === slug);
  if (byId) return byId;
  // Compatibilidade com links antigos que usavam apenas o título.
  const legacy = eventos.filter((e) => (slugify(e.titulo) || shortId(e.id)) === slug);
  if (legacy.length) return legacy.sort((a, b) => (a._ts ?? 0) - (b._ts ?? 0))[0];
  return undefined;
}


/**
 * Returns the URL only if it uses a safe http(s)/mailto/tel scheme or is a
 * same-origin path. Prevents stored XSS via `javascript:`, `data:`, `vbscript:`.
 */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return null;
}

/**
 * Returns the URL only if it points to a trusted Google Maps host over http(s).
 * Used to constrain iframe/map link sources.
 */
export function safeMapUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(String(url).trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const host = u.hostname.toLowerCase();
    const ok =
      host === 'google.com' || host.endsWith('.google.com') ||
      host === 'google.com.br' || host.endsWith('.google.com.br') ||
      host === 'goo.gl' || host.endsWith('.goo.gl') ||
      host === 'maps.app.goo.gl';
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

