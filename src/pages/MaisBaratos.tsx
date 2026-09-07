import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useDB } from '@/contexts/DBContext';
import EventoCard from '@/components/EventoCard';
import LoadErrorRetry from '@/components/LoadErrorRetry';
import { useSeo } from '@/lib/seo';
import { GENEROS, generoSlug, generoFromSlug, generoLabel } from '@/lib/generos';

/**
 * Catálogo principal da TicketHub, com viés de "mais barato": as ofertas
 * (desconto/badge no campo `preco`) aparecem primeiro. O campo `preco` guarda
 * texto livre ("90%OFF", "Sem Taxa"), não preço numérico — por isso ordenamos
 * por "tem oferta" + % quando existe, não por valor.
 */
function descontoPct(preco?: string): number | null {
  if (!preco) return null;
  const m = String(preco).match(/(\d{1,3})\s*%/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n > 0 && n <= 100 ? n : null;
}
function temOferta(preco?: string): boolean {
  return !!preco && /%|\boff\b|desconto|sem\s*taxa|gr[aá]tis|promo|cupom|lote/i.test(preco);
}

export default function MaisBaratos() {
  const { eventos, ready, loadError, reload } = useDB();
  const { genero: generoSlugParam } = useParams<{ genero?: string }>();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const [busca, setBusca] = useState(qParam);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => { setBusca(qParam); }, [qParam]);

  const generoValido = generoSlugParam ? generoFromSlug(generoSlugParam) : undefined;
  const generoAtivo = generoValido ?? '';
  const generoInvalido = !!generoSlugParam && !generoValido;
  const label = generoAtivo ? generoLabel(generoAtivo) : '';

  useSeo({
    title: generoAtivo ? `Ingressos de ${label} em BH` : 'Festas com desconto em BH — as melhores ofertas',
    description: generoAtivo
      ? `Ingressos para as melhores festas de ${label.toLowerCase()} em Belo Horizonte. Ofertas em destaque e o link pelo melhor preço.`
      : 'Os eventos de Belo Horizonte com desconto e vantagens, com as maiores ofertas em destaque. A TicketHub acha o link mais barato e te leva à plataforma oficial.',
    path: generoAtivo ? `/mais-baratos/${generoSlugParam}` : '/mais-baratos',
    noindex: generoInvalido,
  });

  const lista = useMemo(() => {
    const q = busca.toLowerCase();
    return eventos
      .filter((ev) => {
        const okG = !generoAtivo || ev.categoria === generoAtivo;
        const okB = !q || ev.titulo?.toLowerCase().includes(q) || ev.local?.toLowerCase().includes(q);
        return okG && okB;
      })
      // Ofertas primeiro; entre elas, maior % no topo.
      .sort((a, b) => {
        const oa = temOferta(a.preco), ob = temOferta(b.preco);
        if (oa !== ob) return oa ? -1 : 1;
        return (descontoPct(b.preco) ?? -1) - (descontoPct(a.preco) ?? -1);
      });
  }, [eventos, busca, generoAtivo]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1f36] page-px py-[72px]">
        <span className="text-[11px] font-bold text-[#4a90e2] tracking-[3px] uppercase">{generoAtivo ? label : 'Ofertas e descontos'}</span>
        <h1 className="text-white my-[10px] font-black leading-[1.1]" style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}>
          {generoAtivo ? `${label} em BH` : 'As festas com desconto de BH'}
        </h1>
        <p className="text-base text-[#c0c8d6] max-w-[560px] leading-[1.65]">
          {generoAtivo
            ? `As melhores festas de ${label.toLowerCase()} em Belo Horizonte, com o link pelo melhor preço.`
            : 'Os eventos com desconto e vantagens, com as maiores ofertas em destaque. A compra é na plataforma oficial — a gente só acha o link com o melhor preço.'}
        </p>
      </section>

      {/* Body */}
      <div className="page-px pt-10 pb-20 max-w-[1280px] mx-auto w-full">
        {/* Filtros */}
        <div className="w-full max-w-[760px] mx-auto flex flex-col sm:flex-row items-stretch gap-3 mb-10">
          <div className="flex-1 min-w-0 flex items-center bg-[#f2f2f2] rounded-full px-[14px] gap-1.5 border-2 border-transparent focus-within:bg-white focus-within:border-[#ddd] transition-all">
            <svg className="text-[#888] flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 py-[11px] bg-transparent border-none text-sm outline-none text-[#333] placeholder-[#666] min-w-0 w-full"
              placeholder="Buscar eventos..."
            />
          </div>
          <div className="relative w-full sm:w-[260px] sm:flex-shrink-0">
            <button
              onClick={() => setDropOpen((o) => !o)}
              className={`w-full flex items-center justify-between px-[14px] py-[10px] bg-white border-[1.5px] rounded-[10px] text-sm font-semibold text-[#333] cursor-pointer transition-all hover:border-[#1a3a6b] hover:text-[#1a3a6b] ${dropOpen ? 'border-[#1a3a6b] text-[#1a3a6b] rounded-b-none' : 'border-[#ddd]'}`}
            >
              <span className="truncate">{generoAtivo ? label : '— Todos os gêneros —'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform flex-shrink-0" style={{ transform: dropOpen ? 'rotate(180deg)' : '' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {dropOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border-[1.5px] border-[#1a3a6b] border-t-0 rounded-b-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-50 max-h-[280px] overflow-y-auto">
                <Link to="/mais-baratos" onClick={() => setDropOpen(false)} className={`block px-[14px] py-[10px] text-sm text-[#555] no-underline font-medium transition-colors hover:bg-[#f0f4ff] hover:text-[#1a3a6b] ${!generoAtivo ? 'bg-[#1a3a6b] text-white font-bold' : ''}`}>Todos</Link>
                {GENEROS.map((g) => (
                  <Link key={g} to={`/mais-baratos/${generoSlug(g)}`} onClick={() => setDropOpen(false)} className={`block px-[14px] py-[10px] text-sm text-[#555] no-underline font-medium transition-colors hover:bg-[#f0f4ff] hover:text-[#1a3a6b] ${generoAtivo === g ? 'bg-[#1a3a6b] text-white font-bold' : ''}`}>{generoLabel(g)}</Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex items-end justify-center mb-7">
          <span className="text-sm text-[#666]">{lista.length} evento{lista.length !== 1 ? 's' : ''} encontrado{lista.length !== 1 ? 's' : ''}</span>
        </div>
        {!ready ? (
          <p className="text-[#666] text-center">Carregando...</p>
        ) : lista.length === 0 ? (
          loadError && eventos.length === 0 ? (
            <LoadErrorRetry message={loadError} onRetry={reload} />
          ) : (
            <p className="text-[#666] py-6 text-center">Nenhum evento disponível no momento.</p>
          )
        ) : (
          <div className="grid gap-5 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))' }}>
            {lista.map((ev, i) => <EventoCard key={ev.id} ev={ev} linkLabel="Ver ingresso" priority={i < 4} />)}
          </div>
        )}
      </div>
    </>
  );
}
