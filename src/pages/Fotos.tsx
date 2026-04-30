import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '@/contexts/DBContext';
import { fmtDataFull } from '@/lib/utils';

export default function Fotos() {
  const { albuns, ready } = useDB();
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');

  const sorted = [...albuns].sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  const filtered = sorted.filter(al => {
    const okN = !busca || (al.nome || '').toLowerCase().includes(busca.toLowerCase());
    const okD = !dataFiltro || al.data === dataFiltro;
    return okN && okD;
  });

  return (
    <main className="page-px py-12 pb-20" style={{ minHeight: '60vh' }}>
      {/* Topo */}
      <div className="flex items-end justify-between gap-6 mb-10" style={{ flexWrap: 'wrap' }}>
        <div>
          <span className="block text-[11px] font-bold tracking-[2px] text-[#4a90e2] uppercase mb-[6px]">GALERIA DE FOTOS</span>
          <h1 className="text-[32px] font-black text-[#111] leading-[1.1]">Álbuns</h1>
        </div>
        <div className="flex items-center gap-[10px]" style={{ flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2 bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-[14px] py-[9px] focus-within:border-[#4a90e2] focus-within:bg-white transition-all">
            <svg className="text-[#888] flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome..."
              className="border-none bg-transparent outline-none text-[13px] text-[#111] placeholder-[#aaa] w-[180px]"
            />
          </div>
          <input
            type="date"
            value={dataFiltro}
            onChange={e => setDataFiltro(e.target.value)}
            className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-[14px] py-[9px] text-[13px] text-[#111] outline-none focus:border-[#4a90e2] focus:bg-white transition-all"
          />
          {(busca || dataFiltro) && (
            <button
              onClick={() => { setBusca(''); setDataFiltro(''); }}
              className="px-4 py-[9px] bg-transparent border border-[#ddd] rounded-[10px] text-[13px] text-[#888] font-semibold cursor-pointer hover:border-[#111] hover:text-[#111] transition-all"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {!ready ? (
        <p className="text-[#aaa]">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-[#bbb] text-sm">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Nenhum álbum encontrado.
        </div>
      ) : (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {filtered.map(al => (
            <div key={al.id} className="bg-white rounded-2xl overflow-hidden border border-[#eee] shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all">
              <div
                className="w-full bg-[#e8edf5] flex items-center justify-center"
                style={{
                  aspectRatio: '4/3',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundImage: al.capa ? `url(${al.capa})` : undefined,
                }}
              >
                {!al.capa && (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="text-[15px] font-extrabold text-[#111] leading-snug">{al.nome}</p>
                <p className="flex items-center gap-[6px] text-[12px] text-[#888]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {fmtDataFull(al.data)}
                </p>
                <Link
                  to={`/galeria/${al.id}`}
                  className="block mt-auto py-[10px] bg-[#1a3a6b] text-white rounded-[10px] text-[13px] font-bold text-center no-underline hover:bg-[#4a90e2] transition-colors"
                >
                  Ver Fotos
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
