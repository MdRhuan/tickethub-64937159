
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

export function eventoSlug(ev: { titulo: string; id: string }): string {
  return slugify(ev.titulo) || ev.id;
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

