import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';

const PASSOS = [
  { n: '1', t: 'Você encontra o evento', d: 'Reunimos as festas, shows e rolês de BH num catálogo só, com curadoria da cena local. Nada de vasculhar dez sites.' },
  { n: '2', t: 'A gente aponta o link mais barato', d: 'Comparamos as plataformas oficiais e mostramos onde comprar pelo melhor preço que encontramos — com o desconto em destaque.' },
  { n: '3', t: 'Você compra na plataforma oficial', d: 'O botão te leva direto ao vendedor oficial. A compra e o e-ticket saem de lá, com a segurança de sempre.' },
];

const PERGUNTAS = [
  { q: 'Vocês vendem o ingresso?', a: 'Não. A TicketHub é a ponte: reunimos os eventos e apontamos o link com o melhor preço. A compra acontece na plataforma oficial do evento.' },
  { q: 'É seguro comprar assim?', a: 'Sim. Você é levado ao vendedor oficial, e é lá que o pagamento é processado e o e-ticket é emitido — com a mesma segurança de comprar direto no site dele.' },
  { q: 'De onde vem o desconto?', a: 'De parcerias e cupons que negociamos com as plataformas. Buscamos o melhor preço disponível para cada evento; quando há desconto, ele fica em destaque na página.' },
  { q: 'É de graça pra mim?', a: 'É. Você não paga nada à TicketHub. Quando compra pelo nosso link, a plataforma parceira nos remunera — é assim que a gente se sustenta.' },
  { q: 'Como eu recebo o ingresso?', a: 'Direto da plataforma oficial, em formato e-ticket, no e-mail ou no aplicativo dela. A TicketHub não emite ingresso.' },
  { q: 'E se der problema com a compra?', a: 'Emissão, troca e reembolso são resolvidos com a plataforma oficial, que processou a venda. Mas pode falar com a gente pelo WhatsApp que a gente te orienta.' },
];

export default function ComoFunciona() {
  useSeo({
    title: 'Como funciona',
    description: 'Entenda como a TicketHub funciona: reunimos os eventos de BH, apontamos o link mais barato e você compra na plataforma oficial. Tire suas dúvidas sobre segurança, desconto e e-ticket.',
    path: '/como-funciona',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#4a90e2] mb-3">Como funciona</p>
      <h1 className="text-3xl md:text-5xl font-black text-[#111] leading-[1.05] mb-5">
        Do rolê ao ingresso, <span className="text-[#1a3a6b]">pelo menor preço</span>
      </h1>
      <p className="text-lg text-[#444] leading-relaxed mb-12">
        A TicketHub não vende ingresso — a gente acha o link com desconto e te leva até ele. Em três passos:
      </p>

      <ol className="flex flex-col gap-5 mb-16 list-none p-0">
        {PASSOS.map((p) => (
          <li key={p.n} className="flex gap-5 items-start">
            <span className="flex-shrink-0 w-11 h-11 rounded-full bg-[#1a3a6b] text-white font-black text-lg flex items-center justify-center">{p.n}</span>
            <div>
              <h2 className="text-lg font-black text-[#111] mb-1">{p.t}</h2>
              <p className="text-[#555] leading-relaxed">{p.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="text-2xl font-black text-[#111] mb-6">Perguntas frequentes</h2>
      <div className="flex flex-col divide-y divide-gray-100 border-y border-gray-100">
        {PERGUNTAS.map((item) => (
          <div key={item.q} className="py-5">
            <h3 className="font-black text-[#111] mb-1.5">{item.q}</h3>
            <p className="text-[#555] leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-12">
        <Link
          to="/mais-baratos"
          className="inline-flex items-center justify-center rounded-full bg-[#1a3a6b] text-white font-bold text-sm px-6 py-3 no-underline transition-colors hover:bg-[#12294d]"
        >
          Ver eventos em BH
        </Link>
        <Link
          to="/contato"
          className="inline-flex items-center justify-center rounded-full border-2 border-[#1a3a6b] text-[#1a3a6b] font-bold text-sm px-6 py-3 no-underline transition-colors hover:bg-[#1a3a6b] hover:text-white"
        >
          Ainda com dúvida? Fale com a gente
        </Link>
      </div>
    </div>
  );
}
