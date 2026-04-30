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
