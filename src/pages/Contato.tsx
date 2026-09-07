import { useSeo } from '@/lib/seo';

const WHATSAPP_DIRECT = 'https://wa.me/5531983158818';
const WHATSAPP_GROUP = 'https://chat.whatsapp.com/EGrwvkC1N8WJyfp9Rsb8LM';
const INSTAGRAM = 'https://www.instagram.com/tickethubh/';

// O JSON-LD ContactPage desta rota é injetado no HTML pelo prerender
// (scripts/prerender-og.mjs), para ficar visível a crawlers sem JS. Por isso
// não passamos jsonLd ao useSeo aqui — evita schema duplicado após a hidratação.

const CANAIS = [
  { titulo: 'WhatsApp', linha: '+55 (31) 98315-8818', obs: 'Dúvida sobre um evento ou sobre uma compra — resposta rápida.', href: WHATSAPP_DIRECT, cta: 'Chamar no WhatsApp' },
  { titulo: 'Instagram', linha: '@tickethubh', obs: 'Os rolês da semana, bastidores e novidades.', href: INSTAGRAM, cta: 'Seguir no Instagram' },
  { titulo: 'Grupos de WhatsApp', linha: 'Comunidade TicketHub', obs: 'Promoções e eventos em primeira mão, antes de todo mundo.', href: WHATSAPP_GROUP, cta: 'Entrar no grupo' },
];

export default function Contato() {
  useSeo({
    title: 'Contato',
    description: 'Fale com a TicketHub pelo WhatsApp ou Instagram. Tire dúvidas sobre eventos e compras, ou divulgue o seu evento em Belo Horizonte.',
    path: '/contato',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#4a90e2] mb-3">Contato</p>
      <h1 className="text-3xl md:text-5xl font-black text-[#111] leading-[1.05] mb-5">
        Fale com a gente
      </h1>
      <p className="text-lg text-[#444] leading-relaxed mb-10">
        Dúvida sobre um evento, um problema na compra ou quer divulgar o seu rolê? Estamos aqui —
        e respondemos rápido.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        {CANAIS.map((c) => (
          <a
            key={c.titulo}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col bg-white border border-gray-100 rounded-2xl p-5 no-underline shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
          >
            <span className="font-black text-[#111] text-base">{c.titulo}</span>
            <span className="text-[#1a3a6b] font-bold text-sm mt-0.5">{c.linha}</span>
            <span className="text-[#666] text-sm leading-relaxed mt-2 flex-1">{c.obs}</span>
            <span className="text-[#4a90e2] font-bold text-sm mt-3">{c.cta} →</span>
          </a>
        ))}
      </div>

      <div className="bg-[#f6f8fc] border border-[#e3ebf6] rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-black text-[#111] mb-2">Tem um evento em BH?</h2>
        <p className="text-[#555] leading-relaxed mb-4">
          Se você produz festas ou shows na cidade, a gente divulga para o público certo — e ajuda
          a lotar a sua data. Mande os detalhes pelo WhatsApp que retornamos.
        </p>
        <a
          href={WHATSAPP_DIRECT}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#25D366] text-white font-bold text-sm px-6 py-3 no-underline transition-colors hover:bg-[#1eb85a]"
        >
          Divulgar meu evento
        </a>
      </div>
    </div>
  );
}
