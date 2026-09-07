import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';

export default function Sobre() {
  useSeo({
    title: 'Sobre a TicketHub',
    description: 'A TicketHub reúne as festas e shows de Belo Horizonte e aponta onde comprar mais barato. Não vendemos ingresso — encontramos o link com desconto e te levamos até ele.',
    path: '/sobre',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#4a90e2] mb-3">Sobre nós</p>
      <h1 className="text-3xl md:text-5xl font-black text-[#111] leading-[1.05] mb-5">
        O atalho para a noite de BH <span className="text-[#1a3a6b]">pelo menor preço</span>
      </h1>
      <p className="text-lg text-[#444] leading-relaxed mb-10">
        A TicketHub não vende ingresso. A gente reúne as festas, shows e rolês de Belo Horizonte
        num lugar só e aponta, entre as plataformas oficiais, o link com o melhor preço que a gente
        encontra — e te leva direto até ele.
      </p>

      <div className="flex flex-col gap-9">
        <section>
          <h2 className="text-xl font-black text-[#111] mb-2">O que a gente faz</h2>
          <p className="text-[#555] leading-relaxed">
            Todo fim de semana surgem eventos em BH espalhados por dezenas de plataformas, cada um
            com um preço diferente. Vasculhar tudo dá trabalho. Nós fazemos essa busca por você:
            curadoria da cena local, os eventos organizados num catálogo, e a indicação de onde
            comprar mais barato. Você economiza tempo e, quando dá, dinheiro.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-[#111] mb-2">Por que é de graça pra você</h2>
          <p className="text-[#555] leading-relaxed">
            Não cobramos nada. Quando você compra pelo link que indicamos, a plataforma parceira nos
            remunera — é assim que a TicketHub se sustenta. Nosso interesse é o mesmo que o seu:
            te mandar para a opção certa, pelo menor preço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-[#111] mb-2">De onde vem o seu ingresso</h2>
          <p className="text-[#555] leading-relaxed">
            A compra e a emissão acontecem na plataforma oficial do evento — é lá que seu e-ticket é
            gerado, com a mesma segurança de sempre. A TicketHub é a ponte, não o caixa. Em caso de
            dúvida sobre um evento, é só falar com a gente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-[#111] mb-2">A cena, não só o catálogo</h2>
          <p className="text-[#555] leading-relaxed">
            Somos de BH e acompanhamos a noite daqui de perto. Além do site, mantemos{' '}
            <Link to="/grupos" className="text-[#1a3a6b] font-bold underline decoration-[#4a90e2] underline-offset-2">
              grupos no WhatsApp
            </Link>{' '}
            com os melhores rolês e promoções antes de todo mundo.
          </p>
        </section>
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
          Falar com a gente
        </Link>
      </div>
    </div>
  );
}
