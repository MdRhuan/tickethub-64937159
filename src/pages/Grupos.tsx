import { useSeo } from '@/lib/seo';
import { imgSrc } from '@/lib/responsiveImg';

/**
 * Edite esta lista para adicionar ou remover grupos.
 * foto: URL pública da imagem | nome | descricao (curta) | link do convite
 */
export const GRUPOS = [
  {
    foto: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    nome: 'Grupo de Ofertas BH',
    descricao: 'Promoções e cupons de ingressos para os melhores rolês de Belo Horizonte, todos os dias.',
    link: 'https://chat.whatsapp.com/EGrwvkC1N8WJyfp9Rsb8LM',
  },
  {
    foto: 'https://images.unsplash.com/photo-1470229722913-7ea0d7d0a1f4?w=800',
    nome: 'Sertanejo & Piseiro',
    descricao: 'Avisos de shows sertanejos, piseiro e festas do agro na região metropolitana.',
    link: 'https://chat.whatsapp.com/EGrwvkC1N8WJyfp9Rsb8LM',
  },
  {
    foto: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    nome: 'Eletrônica & Clubs',
    descricao: 'Line-ups, listas e descontos das principais festas eletrônicas da cidade.',
    link: 'https://chat.whatsapp.com/EGrwvkC1N8WJyfp9Rsb8LM',
  },
];

export default function Grupos() {
  useSeo({
    title: 'Grupos de WhatsApp — TicketHub BH',
    description: 'Entre nos grupos de WhatsApp do TicketHub e receba promoções de ingressos e avisos de eventos em Belo Horizonte.',
    path: '/grupos',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-2xl md:text-4xl font-black text-[#111] mb-2">Grupos de WhatsApp</h1>
      <p className="text-[#555] text-sm md:text-base mb-8 max-w-2xl">
        Escolha um grupo e receba em primeira mão as promoções e novidades dos eventos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GRUPOS.map((g) => (
          <article
            key={g.nome}
            className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
          >
            <img
              src={imgSrc(g.foto, 640, 72, 16 / 9) ?? g.foto}
              alt={`Foto do grupo ${g.nome}`}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[16/9] object-cover bg-gray-100"
            />
            <div className="flex flex-col flex-1 p-4 md:p-5">
              <h2 className="font-black text-base md:text-lg text-[#111] leading-snug mb-1.5">{g.nome}</h2>
              <p
                className="text-sm text-[#555] leading-relaxed mb-4 overflow-hidden"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              >
                {g.descricao}
              </p>
              <a
                href={g.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] text-white font-bold text-sm py-3 no-underline transition-colors hover:bg-[#1eb85a]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                Entrar no grupo
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
