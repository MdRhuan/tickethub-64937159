import { useNavigate } from 'react-router-dom';
import type { Evento } from '@/types';
import { fmtDataCard, daysUntil, dayBadge } from '@/lib/utils';

const GRUPO_OFERTAS_URL = 'https://chat.whatsapp.com/';

const WppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

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

  const allDates = (ev.datas && ev.datas.length > 0 ? ev.datas : (ev.data ? [ev.data] : [])).slice().sort();
  const todayStr = new Date().toISOString().slice(0, 10);
  const nextDate = allDates.find(d => d >= todayStr) || allDates[0] || '';
  const days = nextDate ? daysUntil(nextDate) : null;
  const db = days !== null ? dayBadge(days) : null;
  const dateLabel = allDates.length > 1
    ? `${fmtDataCard(nextDate)} +${allDates.length - 1}`
    : (nextDate ? fmtDataCard(nextDate) : '');

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
        <div className="card-badge-stack contents md:contents">
          {(ev.tagCard || ev.categoria) && (
            <span className={`absolute top-3 left-3 ${badgeClass} text-white text-[11px] font-bold px-[10px] py-1 rounded-full tracking-[0.5px] z-[2]`}>
              {ev.tagCard || ev.categoria}
            </span>
          )}
          {db && (
            <span
              className={`days-badge days-badge--${db.kind}`}
              style={{ top: 12, right: 12, bottom: 'auto' }}
              aria-label={db.text}
            >
              {db.text}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="relative px-4 pt-[14px] pb-4 flex flex-col gap-1 flex-1">
        <span className="font-bold text-[15px] text-[#111] leading-snug break-words">{ev.titulo}</span>
        {dateLabel && (
          <span className="text-[12px] text-[#aaa]">
            {dateLabel}{ev.hora ? ` • ${ev.hora}` : ''}
          </span>
        )}
        {ev.local && (
          <div className="flex items-center gap-[5px] text-[12px] text-[#888] mt-0.5">
            <LocIcon /><span className="break-words">{ev.local}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="text-[13px] font-bold text-[#111]">{ev.preco || 'Consultar'}</span>
          {ev.btnUrl && ev.btnUrl.trim() && (
            <a
              href={ev.btnUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-[7px] bg-[#4a90e2] text-white rounded-md text-[12px] font-bold no-underline transition-colors hover:bg-[#2d6abf] btn-pulse min-h-[36px] inline-flex items-center"
            >
              {ev.btnLabel?.trim() || 'Saiba mais'}
            </a>
          )}
        </div>


      </div>
    </div>
  );
}

