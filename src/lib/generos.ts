// Gêneros musicais usados como categoria dos eventos e como rotas indexáveis
// (/ingressos/:genero). O slug espelha o slugify do prerender (sem acento, kebab).

export const GENEROS = ['FUNK', 'SERTANEJO', 'PAGODE', 'ROCK', 'POP', 'ELETRÔNICO', 'MPB', 'TRAP', 'JAZZ'] as const;

export function generoSlug(g: string): string {
  return g
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Recebe o slug da URL e devolve a categoria canônica (UPPERCASE) ou undefined. */
export function generoFromSlug(slug: string): string | undefined {
  return GENEROS.find((g) => generoSlug(g) === slug);
}

/** "ELETRÔNICO" -> "Eletrônico" para exibição. */
export function generoLabel(g: string): string {
  return g.charAt(0) + g.slice(1).toLowerCase();
}
