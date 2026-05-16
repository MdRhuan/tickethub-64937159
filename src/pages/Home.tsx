import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '@/contexts/DBContext';
import EventoCard from '@/components/EventoCard';

const CFG: Record<number, { x: number; scale: number; ry: number; z: number; op: number }> = {
  0: { x:   0, scale: 1,    ry:   0, z: 10, op: 1    },
  1: { x: 420, scale: 0.70, ry: -10, z:  8, op: 0.85 },
  2: { x: 620, scale: 0.50, ry: -16, z:  5, op: 0.60 },
  3: { x: 800, scale: 0.36, ry: -22, z:  2, op: 0    },
};

export default function Home() {
  const { eventos, ready } = useDB();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featured = eventos.slice(0, 4);
  const carouselEvs = eventos.slice(0, 5);
  const n = carouselEvs.length || 1;

  function goTo(idx: number) {
    setCurrent(((idx % n) + n) % n);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => ((c + 1) % n)), 4000);
  }

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(c => ((c + 1) % n)), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [n]);

  const curEv = carouselEvs[current];

  return (
    <>
      {/* ── Search ── */}
      <div className="flex justify-center px-4 md:px-10 pt-7 pb-6">
        <div className="flex items-center w-full max-w-[680px] bg-[#f2f2f2] rounded-full px-5 pr-[6px] gap-2 border-2 border-transparent focus-within:bg-white focus-within:border-[#ddd] transition-all">
          <svg className="text-[#888] flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="flex-1 py-[13px] bg-transparent border-none text-[15px] outline-none text-[#333] placeholder-[#aaa]" type="text" placeholder="Buscar Eventos" />
          <button className="px-[22px] py-[9px] bg-[#4a90e2] text-white border-none rounded-full text-sm font-bold cursor-pointer hover:bg-[#2d6abf] transition-colors btn-pulse">
            Buscar
          </button>
        </div>
      </div>

      {/* ── Carousel ── */}
      <div className="flex flex-col items-center pb-8">
        <div className="relative w-full h-[500px] [perspective:1400px] overflow-hidden max-md:h-[240px]">
          {/* Cards */}
          {carouselEvs.map((ev, i) => {
            let offset = i - current;
            if (offset > n / 2) offset -= n;
            if (offset < -n / 2) offset += n;
            const abs = Math.abs(offset);
            const sign = offset >= 0 ? 1 : -1;
            const cfg = CFG[Math.min(abs, 3)];
            return (
              <div
                key={ev.id}
                className="absolute left-1/2 top-1/2 w-[860px] h-[460px] -ml-[430px] -mt-[230px] rounded-[20px] overflow-hidden transition-all duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] max-md:w-[88vw] max-md:-ml-[44vw] max-md:h-[220px] max-md:-mt-[110px] max-md:rounded-[14px]"
                style={{
                  transform: `translateX(${sign * cfg.x}px) scale(${cfg.scale}) rotateY(${sign * cfg.ry}deg)`,
                  opacity: cfg.op,
                  zIndex: cfg.z,
                  backgroundImage: ev.imgBanner ? `url(${ev.imgBanner})` : ev.imgUrl ? `url(${ev.imgUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#d8d8d8',
                }}
              />
            );
          })}

          {/* Arrows */}
          <button
            onClick={() => { goTo(current - 1); resetTimer(); }}
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-[#ddd] bg-white items-center justify-center z-[20] text-[#333] cursor-pointer transition-all hover:bg-[#111] hover:border-[#111] hover:text-white shadow-md btn-pulse"
            style={{ left: 'max(12px, calc(50% - 490px))' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => { goTo(current + 1); resetTimer(); }}
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-[#ddd] bg-white items-center justify-center z-[20] text-[#333] cursor-pointer transition-all hover:bg-[#111] hover:border-[#111] hover:text-white shadow-md btn-pulse"
            style={{ right: 'max(12px, calc(50% - 490px))' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-[18px]">
          {carouselEvs.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetTimer(); }}
              className={`h-2 rounded-full cursor-pointer border-none transition-all ${i === current ? 'bg-[#1a3a6b] w-6 rounded' : 'bg-[#ddd] w-2 hover:bg-[#bbb]'}`}
            />
          ))}
        </div>

        {/* Event Info */}
        {curEv && (
          <div className="text-center mt-4 flex flex-col items-center gap-[10px]">
            <h2 className="text-[34px] font-black text-[#111] max-md:text-[20px]">{curEv.titulo}</h2>
            <div className="flex justify-center gap-5">
              {curEv.data && (
                <div className="flex items-center gap-[7px] text-[15px] font-semibold text-[#555]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {curEv.data}
                </div>
              )}
              {curEv.local && (
                <div className="flex items-center gap-[7px] text-[15px] font-semibold text-[#555]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {curEv.local}
                </div>
              )}
            </div>
            <Link to="/ingressos" className="mt-[6px] px-7 py-[11px] bg-[#4a90e2] text-white rounded-lg text-sm font-bold no-underline hover:bg-[#2d6abf] transition-colors btn-pulse">
              Ver Ingressos
            </Link>
          </div>
        )}
      </div>

      {/* ── Eventos ── */}
      <section className="page-px py-[48px] pb-16">
        <div className="flex justify-between items-end gap-3 mb-7">
          <h2 className="text-xl md:text-[28px] font-black text-[#111]">Principais Eventos</h2>
          <Link to="/ingressos" className="text-[#4a90e2] font-bold text-sm md:text-base no-underline border-b border-transparent hover:border-[#4a90e2] transition-all whitespace-nowrap">Ver todos →</Link>
        </div>

        {!ready ? (
          <p className="text-[#aaa]">Carregando...</p>
        ) : featured.length === 0 ? (
          <p className="text-[#aaa] py-6">Nenhum evento disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3">
            {featured.map(ev => <EventoCard key={ev.id} ev={ev} />)}
          </div>
        )}
      </section>

      {/* ── Banner Promo ── */}
      <section className="flex items-center bg-[#111] rounded-[24px] overflow-hidden mx-4 md:mx-[120px] mb-12 md:mb-20 min-h-[260px]">
        <div className="flex-1 px-[60px] py-[56px] flex flex-col gap-[14px] max-md:px-6 max-md:py-8">
          <span className="text-[38px] font-black text-[#4a90e2] max-md:text-2xl">🎉 Seu mês, suas regras!</span>
          <p className="text-[15px] font-black text-white leading-[1.6] max-w-[480px]">
            Se você faz aniversário no mês do nosso evento, temos uma surpresa esperando por você. Condições exclusivas pra aniversariantes, porque quem manda aqui é você! 👑
          </p>
          <a href="#" className="inline-block mt-1 px-6 py-3 bg-[#4a90e2] text-white rounded-lg text-sm font-bold no-underline hover:bg-[#2d6abf] transition-colors self-start btn-pulse">
            Quero condição especial
          </a>
        </div>
        <div className="w-[320px] p-10 flex items-center justify-center flex-shrink-0 max-md:hidden">
          <div className="w-[240px] bg-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-[14px]">
            <div className="h-3 bg-[#333] rounded w-4/5" />
            <div className="h-2 bg-[#333] rounded w-[55%]" />
            <div className="flex gap-3 mt-1">
              {[1,2,3].map(k => (
                <div key={k} className="flex-1 bg-[#2a2a2a] rounded-xl p-3 flex flex-col gap-[6px]">
                  <div className="h-[10px] bg-[#1a3a6b] rounded w-[60%]" />
                  <div className="h-[7px] bg-[#444] rounded w-[80%]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
