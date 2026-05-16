import { Link, useNavigate } from 'react-router-dom';
import type { Evento } from '@/types';
import { fmtDataCard, daysUntil, dayBadge } from '@/lib/utils';

const LocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const FallbackImg = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#ececec] text-[#bbb]">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>
);

interface Props {
  ev: Evento;
  linkLabel?: string;
}

export default function EventoCard({ ev, linkLabel = 'Comprar' }: Props) {
  const navigate = useNavigate();
  const badgeClass =
    ev.badge === 'destaque'  ? 'bg-[#1a3a6b]' :
    ev.badge === 'esgotando' ? 'bg-[#e67e00]' :
    'bg-[#111]';

  const days = ev.data ? daysUntil(ev.data) : null;
  const db = days !== null ? dayBadge(days) : null;

  const onImgError = (e: React.SyntheticEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.backgroundImage = 'none';
    (e.currentTarget as HTMLDivElement).dataset.broken = '1';
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/ingresso/${ev.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/ingresso/${ev.id}`); } }}
      className="card-depth relative flex flex-col overflow-hidden cursor-pointer outline-none"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] bg-[#ececec]">
        {ev.imgUrl ? (
          <img
            src={ev.imgUrl}
            alt={ev.titulo || 'Evento'}
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display','flex'); }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div style={{ display: ev.imgUrl ? 'none' : 'flex' }} className="absolute inset-0">
          <FallbackImg />
        </div>
        {(ev.tagCard || ev.categoria) && (
          <span className={`absolute top-3 left-3 ${badgeClass} text-white text-[11px] font-bold px-[10px] py-1 rounded-full tracking-[0.5px] z-[2]`}>
            {ev.tagCard || ev.categoria}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="relative px-4 pt-[14px] pb-12 flex flex-col gap-1 flex-1">
        <span className="font-bold text-[15px] text-[#111] leading-snug break-words">{ev.titulo}</span>
        {ev.data && (
          <span className="text-[12px] text-[#aaa]">
            {fmtDataCard(ev.data)}{ev.hora ? ` • ${ev.hora}` : ''}
          </span>
        )}
        {ev.local && (
          <div className="flex items-center gap-[5px] text-[12px] text-[#888] mt-0.5">
            <LocIcon /><span className="break-words">{ev.local}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="text-[13px] font-bold text-[#111]">{ev.preco || 'Consultar'}</span>
          <Link
            to={`/ingresso/${ev.id}`}
            onClick={(e) => e.stopPropagation()}
            className="px-4 py-[7px] bg-[#4a90e2] text-white rounded-md text-[12px] font-bold no-underline transition-colors hover:bg-[#2d6abf] btn-pulse min-h-[36px] inline-flex items-center"
          >
            {linkLabel}
          </Link>
        </div>

        {db && (
          <span className={`days-badge days-badge--${db.kind}`} aria-label={db.text}>
            {db.text}
          </span>
        )}
      </div>
    </div>
  );
}
