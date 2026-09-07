import { slugify } from '@/lib/utils';

// Slug do local/casa para a rota /local/:slug (espelha slugify do prerender).
export const localSlug = (local: string): string => slugify(local);

// Exclui valores-placeholder que não são casas reais (não geram página de local).
const PLACEHOLDERS = /^(a\s*definir|a\s*confirmar|local\s*a\s*definir|indefinid|a\s*combinar|em\s*breve|diversos|vários|varios)/i;

export function isLocalValido(local?: string): boolean {
  if (!local) return false;
  const s = local.trim();
  return s.length >= 2 && !PLACEHOLDERS.test(s);
}
