/* eslint-disable react-refresh/only-export-components -- registro de conteúdo (dados + JSX), não é módulo de componente para HMR */
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface Guia {
  slug: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  Body: () => ReactNode;
}

const P = ({ children }: { children: ReactNode }) => (
  <p className="text-[#444] leading-relaxed mb-4">{children}</p>
);
const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-xl md:text-2xl font-black text-[#111] mt-9 mb-3">{children}</h2>
);
const A = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="text-[#1a3a6b] font-bold underline decoration-[#4a90e2] underline-offset-2">{children}</Link>
);

export const GUIAS: Guia[] = [
  {
    slug: 'como-ir-a-festas-em-bh-gastando-menos',
    title: 'Como ir a festas em BH gastando menos',
    description: 'Cinco formas práticas de pagar mais barato nas festas e shows de Belo Horizonte: lotes, cupons, taxas e os grupos onde as promoções saem primeiro.',
    h1: 'Como ir a festas em BH gastando menos',
    lead: 'Ir para o rolê não precisa pesar no bolso. Cinco formas práticas de pagar menos nas festas de BH.',
    Body: () => (
      <>
        <P>
          O preço de um ingresso em Belo Horizonte muda bastante dependendo de quando e onde você
          compra. Com um pouco de estratégia dá para economizar de verdade — sem abrir mão do rolê.
        </P>
        <H2>1. Compre no lote certo</H2>
        <P>
          Quase toda festa vende por lotes: o primeiro é o mais barato e vai subindo conforme esgota.
          Decidiu que vai? Comprar cedo costuma ser o maior desconto disponível — e evita o risco de
          só sobrar o lote caro (ou nada) na porta.
        </P>
        <H2>2. Fique de olho nos descontos</H2>
        <P>
          A gente reúne os eventos com desconto e vantagens num lugar só. Vale conferir a página de{' '}
          <A to="/mais-baratos">festas com desconto em BH</A> antes de comprar — às vezes o mesmo
          evento tem cupom, "sem taxa" ou uma condição melhor.
        </P>
        <H2>3. Entre nos grupos de WhatsApp</H2>
        <P>
          As melhores promoções costumam sair primeiro para quem está por dentro. Nos{' '}
          <A to="/grupos">grupos de WhatsApp da TicketHub</A> a gente avisa de desconto e lote
          promocional antes de esgotar.
        </P>
        <H2>4. Prefira eventos "sem taxa"</H2>
        <P>
          A taxa de conveniência some no valor final e pode pesar. Alguns eventos rodam sem essa taxa
          — quando esse for o caso, ela aparece em destaque na página do evento.
        </P>
        <H2>5. Compare antes de fechar</H2>
        <P>
          O mesmo evento às vezes aparece em plataformas diferentes, com preços diferentes. Esse é o
          nosso trabalho: a gente compara e aponta o link com o melhor preço. Comece pelo{' '}
          <A to="/mais-baratos">catálogo de eventos de BH</A> e vá pro rolê gastando menos.
        </P>
      </>
    ),
  },
  {
    slug: 'guia-de-festas-eletronicas-em-bh',
    title: 'Guia de festas eletrônicas em BH',
    description: 'Como se achar na cena de música eletrônica de Belo Horizonte: o que olhar antes de comprar, onde encontrar as festas e como pagar mais barato.',
    h1: 'Guia de festas eletrônicas em BH',
    lead: 'Da pista ao rooftop: como se achar na cena eletrônica de Belo Horizonte e ir pro rolê pagando menos.',
    Body: () => (
      <>
        <P>
          A música eletrônica é uma das cenas mais ativas da noite de BH, de open airs em rooftop a
          festas que varam a madrugada. Com tanta opção, vale saber o que olhar antes de comprar.
        </P>
        <H2>O que conferir antes de comprar</H2>
        <P>
          Line-up, horário e local mudam completamente a experiência. Cheque quem toca, a que horas
          abre e onde é — e confirme se o ingresso é o do dia certo, já que muitas festas têm mais de
          uma data. Tudo isso fica na página de cada evento.
        </P>
        <H2>Onde encontrar as festas</H2>
        <P>
          Reunimos as festas do gênero numa página só: veja a agenda de{' '}
          <A to="/mais-baratos/eletronico">festas eletrônicas em BH</A>. Dá para comparar datas, locais
          e ir direto pro link de compra de cada uma.
        </P>
        <H2>Como pagar mais barato</H2>
        <P>
          Lote promocional e cupom fazem diferença. Confira a página de{' '}
          <A to="/mais-baratos">eventos com desconto</A> e entre nos{' '}
          <A to="/grupos">grupos de WhatsApp</A> para saber das promoções antes de esgotar. A compra
          é sempre na plataforma oficial — a gente só acha o caminho mais barato até ela.
        </P>
      </>
    ),
  },
  {
    slug: 'o-que-fazer-em-bh-esse-fim-de-semana',
    title: 'O que fazer em BH esse fim de semana',
    description: 'O guia rápido para achar o rolê certo em Belo Horizonte neste fim de semana — festas, shows e eventos por gênero, local e preço, com o link mais barato.',
    h1: 'O que fazer em BH esse fim de semana',
    lead: 'BH tem agenda cheia todo fim de semana. O difícil é achar o rolê certo e comparar preço — este guia resolve isso em minutos.',
    Body: () => (
      <>
        <P>
          De rooftop com música eletrônica a pagode no fim de tarde, passando por sertanejo
          universitário e a cena cultural gratuita do Centro, Belo Horizonte não deixa ninguém em
          casa. O problema quase nunca é falta de opção — é achar o que combina com você e não pagar
          caro. Veja como se orientar.
        </P>
        <H2>1. Comece pela agenda</H2>
        <P>
          Para ver tudo que está rolando de uma vez, use o{' '}
          <A to="/calendario">calendário de eventos de BH</A> ou o{' '}
          <A to="/mais-baratos">catálogo com as ofertas em destaque</A>. Assim você compara datas e
          preços num lugar só, sem abrir dez sites.
        </P>
        <H2>2. Filtre pelo seu tipo de rolê</H2>
        <P>
          Já sabe o clima que quer? Vá direto ao gênero:{' '}
          <A to="/mais-baratos/eletronico">festas eletrônicas</A> (muitas em rooftop e open air),{' '}
          <A to="/mais-baratos/pagode">pagode e samba</A> ou{' '}
          <A to="/mais-baratos/sertanejo">sertanejo</A>. Cada página mostra os próximos eventos
          daquele estilo, com o link de compra.
        </P>
        <H2>3. Rolê ao ar livre e rooftops</H2>
        <P>
          A cena de rooftop e open air é um dos pontos fortes da noite de BH — especialmente no clima
          bom. Vale conferir a agenda das casas que você curte na página de cada local e chegar cedo,
          porque os lotes mais baratos esgotam primeiro.
        </P>
        <H2>4. Vá pagando menos</H2>
        <P>
          Antes de fechar, confira as <A to="/mais-baratos">festas com desconto</A>, entenda como{' '}
          <A to="/guias/ingresso-com-cupom-como-funciona">cupom e lote funcionam</A> e veja as
          dicas de <A to="/guias/como-ir-a-festas-em-bh-gastando-menos">como gastar menos</A>. Para
          saber das promoções antes de todo mundo, entre nos{' '}
          <A to="/grupos">grupos de WhatsApp</A>. A TicketHub não vende ingresso — acha o link com o
          melhor preço e te leva à plataforma oficial.
        </P>
      </>
    ),
  },
  {
    slug: 'ingresso-com-cupom-como-funciona',
    title: 'Ingresso com cupom: como funciona (e quando vale a pena)',
    description: 'Cupom, lote e taxa de conveniência: entenda como pagar menos no ingresso da sua festa em BH, sem cair em furada. Guia direto da TicketHub.',
    h1: 'Ingresso com cupom: como funciona (e quando vale a pena)',
    lead: 'Cupom, lote, taxa: como pagar menos no ingresso da festa em BH — e por que quase sempre vale a pena checar antes de comprar.',
    Body: () => (
      <>
        <P>
          O preço de um ingresso em Belo Horizonte muda conforme quando e onde você compra. Entender
          três coisas — lote, cupom e taxa — já garante que você não pague mais do que precisa.
        </P>
        <H2>O que é lote</H2>
        <P>
          Quase toda festa vende por lotes: o primeiro é o mais barato e o preço sobe conforme os
          ingressos esgotam. Comprar na bilheteria, em cima da hora, costuma ser a opção mais cara —
          e ainda corre o risco de já ter esgotado. Decidiu que vai? Comprar cedo, no lote promocional,
          é o desconto mais fácil de conseguir.
        </P>
        <H2>O que é cupom de desconto</H2>
        <P>
          Cupom é um código que reduz o valor na hora do pagamento, na plataforma oficial do evento.
          Em BH, várias festas têm cupons de parceiros — é comum e legítimo. O detalhe: o cupom só
          vale se for real e aplicável ao seu ingresso. É exatamente isso que a gente faz: procura,
          entre as opções, o link com o melhor preço ou cupom para cada evento.
        </P>
        <H2>A taxa de conveniência</H2>
        <P>
          Além do preço do ingresso, a maioria das plataformas cobra uma taxa de conveniência que só
          aparece no valor final. Alguns eventos rodam <strong>sem taxa</strong> — quando é o caso,
          isso aparece em destaque na página do evento e faz diferença real no bolso.
        </P>
        <H2>Como a TicketHub entra nisso</H2>
        <P>
          A TicketHub <strong>não vende ingresso</strong>: a gente reúne os eventos de BH, compara e
          aponta o <A to="/mais-baratos">link com o melhor preço</A>, te levando para a{' '}
          <strong>plataforma oficial</strong> — onde a compra e o e-ticket acontecem com segurança.
          Entenda melhor em <A to="/como-funciona">como funciona</A> e{' '}
          <A to="/sobre">quem somos</A>.
        </P>
        <H2>Quando vale a pena</H2>
        <P>
          Quase sempre. Antes de comprar, cheque se há cupom ou lote promocional — a diferença entre
          o primeiro lote com cupom e a bilheteria pode ser grande. Só desconfie de "desconto" que não
          se comprova: compre sempre pela plataforma oficial do evento.
        </P>
      </>
    ),
  },
];

export const guiaBySlug = (slug?: string): Guia | undefined => GUIAS.find((g) => g.slug === slug);
