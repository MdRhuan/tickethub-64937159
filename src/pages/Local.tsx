import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDB } from '@/contexts/DBContext';
import EventoCard from '@/components/EventoCard';
import LoadErrorRetry from '@/components/LoadErrorRetry';
import { useSeo } from '@/lib/seo';
import { localSlug, isLocalValido } from '@/lib/locais';

// O schema Place desta rota é injetado no HTML pelo prerender (crawlers sem JS).
export default function Local() {
  const { slug } = useParams<{ slug: string }>();
  const { eventos, ready, loadError, reload } = useDB();

  const doLocal = useMemo(
    () => eventos.filter((ev) => isLocalValido(ev.local) && localSlug(ev.local) === slug),
    [eventos, slug],
  );
  const nome = doLocal[0]?.local ?? '';
  const encontrado = !!nome;

  useSeo({
    title: encontrado ? `Eventos no ${nome} — BH` : 'Local não encontrado',
    description: encontrado
      ? `Agenda de festas e shows no ${nome}, em Belo Horizonte. Veja os próximos eventos e garanta seu ingresso pelo link com o melhor preço.`
      : 'Este local não foi encontrado. Veja todos os eventos de Belo Horizonte na TicketHub.',
    path: slug ? `/local/${slug}` : undefined,
    noindex: !encontrado,
  });

  return (
    <>
      <section className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1f36] page-px py-[72px]">
        <span className="text-[11px] font-bold text-[#4a90e2] tracking-[3px] uppercase">Local</span>
        <h1 className="text-white my-[10px] font-black leading-[1.1]" style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}>
          {encontrado ? `Eventos no ${nome}` : 'Local não encontrado'}
        </h1>
        <p className="text-base text-[#c0c8d6] max-w-[560px] leading-[1.65]">
          {encontrado
            ? `Festas e shows no ${nome}, em Belo Horizonte. Garanta seu ingresso pelo link com o melhor preço.`
            : 'Não encontramos esse local. Veja todos os eventos da cidade.'}
        </p>
      </section>

      <div className="page-px pt-10 pb-20 max-w-[1280px] mx-auto w-full">
        {!ready ? (
          <p className="text-[#666] text-center">Carregando...</p>
        ) : !encontrado ? (
          loadError && eventos.length === 0 ? (
            <LoadErrorRetry message={loadError} onRetry={reload} />
          ) : (
            <p className="text-[#666] py-6 text-center">Nenhum evento neste local no momento.</p>
          )
        ) : (
          <>
            <div className="flex items-end justify-center mb-7">
              <span className="text-sm text-[#666]">
                {doLocal.length} evento{doLocal.length !== 1 ? 's' : ''} no {nome}
              </span>
            </div>
            <div className="grid gap-5 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))' }}>
              {doLocal.map((ev, i) => <EventoCard key={ev.id} ev={ev} linkLabel="Ver ingresso" priority={i < 4} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
