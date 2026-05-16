import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
