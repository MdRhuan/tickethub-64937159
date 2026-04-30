import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '@/contexts/DBContext';
import type { Evento } from '@/types';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

type View = 'grid' | 'agenda';

interface DayData { cor: string; evs: Evento[] }

function buildEventMap(eventos: Evento[]): Record<string, Record<number, DayData>> {
  const map: Record<string, Record<number, DayData>> = {};
  for (const ev of eventos) {
    if (!ev.data) continue;
    const [ano, mes, dia] = ev.data.split('-');
    const key = `${ano}-${parseInt(mes)}`;
    const d = parseInt(dia);
    if (!map[key]) map[key] = {};
    if (!map[key][d]) map[key][d] = { cor: ev.corCal || 'azul', evs: [] };
    map[key][d].evs.push(ev);
  }
  return map;
}

export default function Calendario() {
  const { eventos, ready } = useDB();
  const now = new Date();
  const [curMes, setCurMes] = useState(now.getMonth());
  const [curAno, setCurAno] = useState(now.getFullYear());
  const [diaAtivo, setDiaAtivo] = useState<number | null>(null);
  const [view, setView] = useState<View>('grid');
  const [dpOpen, setDpOpen] = useState(false);
  const [dpMes, setDpMes] = useState(curMes);
  const [dpAno, setDpAno] = useState(curAno);

  const evMap = buildEventMap(eventos);
  const key = `${curAno}-${curMes + 1}`;
  const monthData = evMap[key] || {};

  const primDia = new Date(curAno, curMes, 1).getDay();
  const ultDia = new Date(curAno, curMes + 1, 0).getDate();

  function changeMonth(delta: number) {
    let m = curMes + delta, a = curAno;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setCurMes(m); setCurAno(a);
    setDpMes(m); setDpAno(a);
    setDiaAtivo(null);
  }

  function goToDate() {
    setCurMes(dpMes); setCurAno(dpAno); setDpOpen(false); setDiaAtivo(null);
  }

  const diaAtivoEvs = diaAtivo ? (monthData[diaAtivo]?.evs || []) : [];
  const dataDiaAtivo = diaAtivo
    ? new Date(curAno, curMes, diaAtivo).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : null;

  const dotColorClass = (cor: string) =>
    cor === 'vermelho' ? 'bg-[#e03535]' : cor === 'verde' ? 'bg-[#27ae60]' : 'bg-[#4a90e2]';

  const agendaEvs = [...eventos].sort((a, b) => (a.data || '').localeCompare(b.data || ''));

  return (
    <main className="page-px py-10 pb-20">
      {/* Title row */}
      <div className="flex items-center justify-between mb-8 max-md:flex-col max-md:items-start max-md:gap-[14px]">
        <div>
          <span className="text-[11px] font-bold text-[#1a3a6b] tracking-[3px] uppercase">AGENDA</span>
          <h1 className="text-[32px] font-black text-[#111]">Calendário</h1>
        </div>
        <div className="flex items-center gap-3 max-md:w-full max-md:justify-between">
          {/* Date picker */}
          <div className="relative">
            <button
              onClick={() => setDpOpen(o => !o)}
              className="flex items-center gap-[7px] px-4 py-[9px] bg-white border border-[#ddd] rounded-[10px] text-[13px] font-bold text-[#333] cursor-pointer hover:border-[#4a90e2] hover:text-[#4a90e2] transition-all whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {MESES[curMes]} {curAno}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform" style={{ transform: dpOpen ? 'rotate(180deg)' : '' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {dpOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-[#e0e0e0] rounded-[14px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[200] min-w-[260px] flex flex-col gap-[14px] max-md:right-auto max-md:left-0" onClick={e => e.stopPropagation()}>
                <span className="text-[11px] font-bold text-[#aaa] uppercase tracking-[1.5px]">Ir para</span>
                <div className="flex gap-2">
                  <select value={dpMes} onChange={e => setDpMes(parseInt(e.target.value))} className="flex-1 px-3 py-[9px] border border-[#e0e0e0] rounded-lg text-sm text-[#333] bg-[#fafafa] outline-none cursor-pointer focus:border-[#4a90e2]">
                    {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select value={dpAno} onChange={e => setDpAno(parseInt(e.target.value))} className="w-[90px] px-3 py-[9px] border border-[#e0e0e0] rounded-lg text-sm text-[#333] bg-[#fafafa] outline-none cursor-pointer focus:border-[#4a90e2]">
                    {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button onClick={goToDate} className="py-[10px] bg-[#4a90e2] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#2d6abf] transition-colors btn-pulse">
                  Confirmar
                </button>
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-[#f2f2f2] p-1 rounded-xl">
            {(['grid','agenda'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`w-[42px] h-[42px] flex items-center justify-center border-none rounded-lg cursor-pointer transition-all ${view === v ? 'bg-white text-[#111] shadow-md btn-pulse' : 'bg-transparent text-[#888] hover:text-[#444]'}`}
              >
                {v === 'grid' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 380px' }}>
          <div className="bg-[#f7f7f7] rounded-[20px] p-7 border border-[#eee] max-md:col-span-full">
            {/* Nav */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-black text-[#111]">{MESES[curMes]} {curAno}</span>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="w-9 h-9 border border-[#ddd] rounded-lg bg-white flex items-center justify-center text-[#555] cursor-pointer hover:bg-[#111] hover:text-white hover:border-[#111] transition-all btn-pulse">‹</button>
                <button onClick={() => changeMonth(1)}  className="w-9 h-9 border border-[#ddd] rounded-lg bg-white flex items-center justify-center text-[#555] cursor-pointer hover:bg-[#111] hover:text-white hover:border-[#111] transition-all btn-pulse">›</button>
              </div>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-7 gap-[6px]">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-[12px] font-bold text-[#aaa] pb-3 max-[480px]:text-[10px]">{d}</div>
              ))}
              {Array.from({ length: primDia }, (_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: ultDia }, (_, i) => {
                const d = i + 1;
                const data = monthData[d];
                const ativo = diaAtivo === d;
                return (
                  <div
                    key={d}
                    onClick={() => setDiaAtivo(ativo ? null : d)}
                    className={`bg-white rounded-[10px] aspect-square p-[7px] cursor-pointer flex flex-col gap-1 border-2 transition-all hover:bg-[#eef5ff] hover:border-[#c8ddf7] ${ativo ? 'border-[#4a90e2] bg-[#eef5ff]' : 'border-transparent'} ${data ? 'bg-[#f0f6ff]' : ''} max-[480px]:p-1`}
                  >
                    <span className={`text-[12px] block font-medium ${data ? 'font-black text-[#111]' : 'text-[#555]'} max-[480px]:text-[10px]`}>{d}</span>
                    {data && <div className={`w-[7px] h-[7px] rounded-full mx-auto flex-shrink-0 ${dotColorClass(data.cor)}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalhes */}
          <div className="bg-[#f7f7f7] rounded-[20px] p-6 min-h-[420px] border border-[#eee] flex flex-col gap-4 max-md:col-span-full">
            <span className="text-[11px] font-bold text-[#1a3a6b] tracking-[3px] uppercase">EVENTOS DO DIA</span>
            {diaAtivo ? (
              <>
                <p className="text-[22px] font-black text-[#111] capitalize">{dataDiaAtivo}</p>
                {diaAtivoEvs.length === 0 ? (
                  <p className="text-[#aaa] text-sm">Nenhum evento neste dia.</p>
                ) : diaAtivoEvs.map(ev => (
                  <div key={ev.id} className="bg-white rounded-[14px] p-4 border border-[#eee] flex flex-col gap-[6px] hover:shadow-md transition-shadow">
                    <span className="text-[15px] font-bold text-[#111]">{ev.titulo}</span>
                    {ev.hora && <span className="flex items-center gap-[6px] text-[13px] text-[#888]"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{ev.hora}</span>}
                    {ev.local && <span className="text-[13px] text-[#aaa]">{ev.local}</span>}
                    <Link to={`/ingresso/${ev.id}`} className="inline-block mt-2 px-[18px] py-[9px] bg-[#4a90e2] text-white rounded-lg text-[13px] font-bold no-underline hover:bg-[#2d6abf] transition-colors self-start btn-pulse">Ver ingresso</Link>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-[#aaa] text-sm">Clique em um dia para ver os eventos.</p>
            )}
          </div>
        </div>
      )}

      {/* Agenda view */}
      {view === 'agenda' && (
        <div className="relative pl-[110px] flex flex-col gap-6 max-md:pl-20 max-[480px]:pl-0 max-[480px]:gap-3">
          <div className="absolute left-20 top-0 bottom-0 w-[2px] bg-[#eee] max-md:left-[54px] max-[480px]:hidden" />
          {!ready ? (
            <p className="text-[#aaa]">Carregando...</p>
          ) : agendaEvs.length === 0 ? (
            <p className="text-[#aaa] text-sm py-6">Nenhum evento na agenda.</p>
          ) : agendaEvs.map(ev => {
            const parts = ev.data ? ev.data.split('-') : [];
            const dia = parts[2] || '';
            const mesAbr = parts[1] ? MESES[parseInt(parts[1]) - 1]?.substring(0, 3) : '';
            return (
              <div key={ev.id} className="flex items-center gap-5 relative max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2">
                <div className="absolute left-[-110px] w-[76px] flex flex-col items-end gap-0.5 max-md:left-[-80px] max-md:w-[50px] max-[480px]:static max-[480px]:flex-row max-[480px]:items-center max-[480px]:gap-2">
                  <span className="text-sm font-black text-[#111] max-md:text-[12px]">{dia} {mesAbr}</span>
                  {ev.hora && <span className="text-[12px] text-[#888]">{ev.hora}</span>}
                </div>
                <div className="absolute left-[-34px] w-[14px] h-[14px] bg-[#4a90e2] rounded-full border-[3px] border-white shadow-[0_0_0_2px_#4a90e2] flex-shrink-0 max-md:left-[-32px] max-[480px]:hidden" />
                <div className="flex-1 bg-[#f7f7f7] rounded-[14px] px-[22px] py-[18px] border border-[#eee] flex flex-col gap-[6px] hover:shadow-md transition-shadow max-[480px]:w-full">
                  <span className="text-base font-bold text-[#111]">{ev.titulo}</span>
                  {ev.local && <span className="text-[13px] text-[#888] flex items-center gap-[6px]"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{ev.local}</span>}
                  {ev.categoria && <span className="inline-block bg-[#eef5ff] text-[#4a90e2] text-[11px] font-bold px-[10px] py-[3px] rounded-full w-fit mt-1">{ev.categoria}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
