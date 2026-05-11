import { Link } from 'react-router-dom';
import type { Evento } from '@/types';
import { fmtDataCard } from '@/lib/utils';

const LocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

interface Props {
  ev: Evento;
  linkLabel?: string;
}

export default function EventoCard({ ev, linkLabel = 'Comprar' }: Props) {
  const badgeClass =
    ev.badge === 'destaque'  ? 'bg-[#1a3a6b]' :
    ev.badge === 'esgotando' ? 'bg-[#e67e00]' :
    'bg-[#111]';

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-[#eee] shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer">
      {/* Image */}
      <div className="relative w-full aspect-[3/4]">
        <div
          className="w-full h-full bg-[#d8d8d8]"
          style={ev.imgUrl ? { backgroundImage: `url("${ev.imgUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        />
        {(ev.tagCard || ev.categoria) && (
          <span className={`absolute top-3 left-3 ${badgeClass} text-white text-[11px] font-bold px-[10px] py-1 rounded-full tracking-[0.5px]`}>
            {ev.tagCard || ev.categoria}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-[14px] pb-4 flex flex-col gap-1 flex-1">
        <span className="font-bold text-[15px] text-[#111] leading-snug">{ev.titulo}</span>
        {ev.data && (
          <span className="text-[12px] text-[#aaa]">
            {fmtDataCard(ev.data)}{ev.hora ? ` • ${ev.hora}` : ''}
          </span>
        )}
        {ev.local && (
          <div className="flex items-center gap-[5px] text-[12px] text-[#888] mt-0.5">
            <LocIcon /><span>{ev.local}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[13px] font-bold text-[#111]">{ev.preco || 'Consultar'}</span>
          <Link
            to={`/ingresso/${ev.id}`}
            className="px-4 py-[7px] bg-[#4a90e2] text-white rounded-md text-[12px] font-bold no-underline transition-colors hover:bg-[#2d6abf] btn-pulse"
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
