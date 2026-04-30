import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDB } from '@/contexts/DBContext';
import { fmtDataFull } from '@/lib/utils';

export default function Galeria() {
  const { id } = useParams<{ id: string }>();
  const { albuns, ready } = useDB();
  const navigate = useNavigate();
  const [lbIdx, setLbIdx] = useState<number | null>(null);

  const al = albuns.find(a => a.id === id);

  useEffect(() => {
    if (ready && !al) navigate('/fotos');
  }, [ready, al, navigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lbIdx === null || !al) return;
      if (e.key === 'ArrowLeft')  setLbIdx(i => ((i! - 1 + al.fotos.length) % al.fotos.length));
      if (e.key === 'ArrowRight') setLbIdx(i => ((i! + 1) % al.fotos.length));
      if (e.key === 'Escape') setLbIdx(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lbIdx, al]);

  if (!ready) return <div className="p-20 text-center text-[#aaa]">Carregando...</div>;
  if (!al) return null;

  const fotos = al.fotos || [];

  return (
    <>
      {/* Hero */}
      <div
        className="relative h-[320px] bg-[#111] flex items-end max-md:h-[240px]"
        id="galeria-hero"
        style={al.capa ? { backgroundImage: `url(${al.capa})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative z-[1] page-px pb-8 w-full">
          <Link to="/fotos" className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-white/75 no-underline mb-3 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar para Fotos
          </Link>
          <h1 className="text-[36px] font-black text-white leading-[1.1] mb-[6px] max-md:text-[26px]">{al.nome}</h1>
          <p className="text-sm text-white/65">{fmtDataFull(al.data)}</p>
        </div>
      </div>

      {/* Main */}
      <main className="page-px py-10 pb-20 min-h-[40vh]">
        <p className="text-[13px] text-[#888] font-semibold mb-6">{fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}</p>

        {fotos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-[#bbb] text-sm">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Este álbum não possui fotos.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-2">
            {fotos.map((src, i) => (
              <div
                key={i}
                onClick={() => setLbIdx(i)}
                className="rounded-[10px] overflow-hidden aspect-square cursor-pointer bg-[#e8edf5] hover:scale-[1.03] hover:opacity-90 transition-all"
              >
                <img src={src} alt={`Foto ${i + 1}`} loading="lazy" className="w-full h-full object-cover block" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lbIdx !== null && (
        <div className="fixed inset-0 bg-black/92 z-[1000] flex items-center justify-center" onClick={() => setLbIdx(null)}>
          <img src={fotos[lbIdx]} alt={`Foto ${lbIdx + 1}`} className="max-w-[88vw] max-h-[85vh] object-contain rounded-lg shadow-[0_8px_48px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()} />

          {/* Close */}
          <button onClick={() => setLbIdx(null)} className="absolute top-5 right-6 w-[42px] h-[42px] rounded-full bg-white/12 border-none flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Prev */}
          {fotos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLbIdx(i => ((i! - 1 + fotos.length) % fotos.length)); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/12 border-none flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition-colors max-md:left-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {/* Next */}
          {fotos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLbIdx(i => ((i! + 1) % fotos.length)); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/12 border-none flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition-colors max-md:right-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}

          {/* Counter */}
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-[13px] font-semibold">
            {lbIdx + 1} / {fotos.length}
          </span>
        </div>
      )}
    </>
  );
}
