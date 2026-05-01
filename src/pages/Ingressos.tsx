import { useState } from 'react';
import { useDB } from '@/contexts/DBContext';
import EventoCard from '@/components/EventoCard';

const GENEROS = ['FUNK','SERTANEJO','PAGODE','ROCK','POP','ELETRÔNICO','MPB','TRAP','JAZZ'];

export default function Ingressos() {
  const { eventos, ready } = useDB();
  const [busca, setBusca] = useState('');
  const [genero, setGenero] = useState('');
  const [dropOpen, setDropOpen] = useState(false);

  const filtered = eventos.filter(ev => {
    const okG = !genero || ev.categoria === genero;
    const q = busca.toLowerCase();
    const okB = !q || ev.titulo?.toLowerCase().includes(q) || ev.local?.toLowerCase().includes(q);
    return okG && okB;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1f36] page-px py-[72px]">
        <span className="text-[11px] font-bold text-[#4a90e2] tracking-[3px] uppercase">TODOS OS EVENTOS</span>
        <h1 className="text-[52px] font-black text-white my-[10px] leading-[1.1]" style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}>Ingressos</h1>
        <p className="text-base text-[#aaa] max-w-[520px] leading-[1.65]">Encontre e garanta seu ingresso para os melhores eventos.</p>
      </section>

      {/* Body */}
      <div className="page-px pt-10 pb-20">

        {/* Filtros centralizados */}
        <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
          {/* Search */}
          <div className="flex-1 flex items-center bg-[#f2f2f2] rounded-full px-[14px] gap-1.5 border-2 border-transparent focus-within:bg-white focus-within:border-[#ddd] transition-all">
            <svg className="text-[#888] flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="flex-1 py-[11px] bg-transparent border-none text-sm outline-none text-[#333] placeholder-[#aaa] min-w-0"
              placeholder="Buscar eventos..."
            />
          </div>

          {/* Genre dropdown */}
          <div className="relative sm:w-[260px]">
            <button
              onClick={() => setDropOpen(o => !o)}
              className={`w-full flex items-center justify-between px-[14px] py-[10px] bg-white border-[1.5px] rounded-[10px] text-sm font-semibold text-[#333] cursor-pointer transition-all hover:border-[#1a3a6b] hover:text-[#1a3a6b] ${dropOpen ? 'border-[#1a3a6b] text-[#1a3a6b] rounded-b-none' : 'border-[#ddd]'}`}
            >
              {genero || '— Todos os gêneros —'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform flex-shrink-0" style={{ transform: dropOpen ? 'rotate(180deg)' : '' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {dropOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border-[1.5px] border-[#1a3a6b] border-t-0 rounded-b-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-50 max-h-[280px] overflow-y-auto">
                <div
                  className={`px-[14px] py-[10px] text-sm text-[#555] cursor-pointer font-medium transition-colors hover:bg-[#f0f4ff] hover:text-[#1a3a6b] ${!genero ? 'bg-[#1a3a6b] text-white font-bold' : ''}`}
                  onClick={() => { setGenero(''); setDropOpen(false); }}
                >
                  Todos
                </div>
                {GENEROS.map(g => (
                  <div
                    key={g}
                    className={`px-[14px] py-[10px] text-sm text-[#555] cursor-pointer font-medium transition-colors hover:bg-[#f0f4ff] hover:text-[#1a3a6b] ${genero === g ? 'bg-[#1a3a6b] text-white font-bold' : ''}`}
                    onClick={() => { setGenero(g); setDropOpen(false); }}
                  >
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div>
          <div className="flex items-end justify-between mb-7">
            <span className="text-sm text-[#aaa]">
              {filtered.length} evento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {!ready ? (
            <p className="text-[#aaa]">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#aaa] py-6">Nenhum evento disponível no momento.</p>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {filtered.map(ev => <EventoCard key={ev.id} ev={ev} linkLabel="Ver ingresso" />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
