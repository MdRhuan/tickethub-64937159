import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDB } from '@/contexts/DBContext';
import { fmtDataFull } from '@/lib/utils';

function buildEmbedUrl(mapaUrl: string, local: string): string | null {
  if (mapaUrl) {
    if (mapaUrl.includes('/embed')) return mapaUrl;
    const m = mapaUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m) return `https://maps.google.com/maps?q=${m[1]},${m[2]}&output=embed&hl=pt-BR`;
  }
  if (local) return `https://maps.google.com/maps?q=${encodeURIComponent(local)}&output=embed&hl=pt-BR`;
  return null;
}

export default function EventoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { eventos, ready } = useDB();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const ev = eventos.find(e => e.id === id);

  if (!ready) return <div className="p-20 text-center text-[#aaa]">Carregando...</div>;
  if (!ev) return <div className="p-20 text-center text-[#aaa]">Evento não encontrado.</div>;

  const heroBg = ev.imgBanner || ev.imgUrl;
  const embedSrc = buildEmbedUrl(ev.mapaUrl, ev.local);
  const shareUrl = window.location.href;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const ingressos = [ev.ing1, ev.ing2, ev.ing3].filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[440px] flex items-end page-px pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[#2a2a3e]" style={heroBg ? { backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10 z-[1]" />
        <div className="relative z-[2] max-w-[700px]">
          {(ev.tagCard || ev.categoria) && (
            <span className="inline-block bg-[#1a3a6b] text-white text-[11px] font-bold px-[14px] py-1 rounded-full tracking-[1.5px] mb-[14px]">
              {ev.tagCard || ev.categoria}
            </span>
          )}
          <h1 className="text-[56px] font-black text-white leading-[1.05] mb-[18px] max-md:text-[30px]">{ev.titulo}</h1>
          <div className="flex gap-7 items-center flex-wrap max-md:flex-col max-md:items-start max-md:gap-2">
            {ev.data && (
              <div className="flex items-center gap-2 text-[15px] text-[#ccc]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {fmtDataFull(ev.data)}
              </div>
            )}
            {ev.hora && (
              <div className="flex items-center gap-2 text-[15px] text-[#ccc]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {ev.hora}
              </div>
            )}
            {ev.local && (
              <div className="flex items-center gap-2 text-[15px] text-[#ccc]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {ev.local}
              </div>
            )}
          </div>
        </div>

        {/* Share btn */}
        <button
          onClick={() => setShareOpen(true)}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-5 py-[9px] border border-white/50 rounded-lg bg-white/15 backdrop-blur-sm text-sm font-bold text-white cursor-pointer hover:bg-white/30 hover:border-white transition-all btn-pulse"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Compartilhar
        </button>
      </section>

      {/* Content */}
      <div className="grid gap-[52px] page-px py-[44px] pb-20 items-start" style={{ gridTemplateColumns: '1fr 380px' }}>

        {/* Left */}
        <div className="flex flex-col gap-9">

          {/* Sobre */}
          <div>
            <h2 className="text-[20px] font-black text-[#111] mb-[14px] pb-[10px] border-b-2 border-[#f0f0f0]">Sobre o Evento</h2>
            <p className="text-[15px] text-[#555] leading-[1.8]">{ev.sobre || 'Informações detalhadas sobre o evento em breve.'}</p>
          </div>

          {/* Atrações */}
          {ev.atracoes?.length > 0 && (
            <div>
              <h2 className="text-[20px] font-black text-[#111] mb-[14px] pb-[10px] border-b-2 border-[#f0f0f0]">Atrações</h2>
              <div className="flex flex-row gap-3 flex-wrap">
                {ev.atracoes.map((at, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 p-5 px-4 bg-[#f7f7f7] rounded-xl border border-[#eee] flex-1 min-w-[120px] text-center hover:shadow-md transition-shadow max-md:min-w-[100px] max-md:p-[14px]">
                    <div
                      className="w-20 h-20 bg-[#ddd] rounded-[10px] flex-shrink-0 max-md:w-16 max-md:h-16"
                      style={at.foto ? { backgroundImage: `url(${at.foto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    />
                    <span className="text-sm font-bold text-[#111]">{at.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local */}
          <div>
            <h2 className="text-[20px] font-black text-[#111] mb-[14px] pb-[10px] border-b-2 border-[#f0f0f0]">Local</h2>
            <div className="bg-[#f7f7f7] rounded-2xl p-5 border border-[#eee]">
              {ev.local && <p className="text-base font-bold text-[#111] mb-1">{ev.local}</p>}
              {embedSrc && (
                <div className="rounded-xl overflow-hidden mb-[10px]">
                  <iframe src={embedSrc} width="100%" height="220" style={{ border: 0, borderRadius: 12, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="mapa" />
                </div>
              )}
              {(ev.mapaUrl || ev.local) && (
                <a
                  href={ev.mapaUrl || `https://maps.google.com/maps?q=${encodeURIComponent(ev.local)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#1a3a6b] no-underline hover:underline"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Ver no Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4 sticky top-20 max-md:static">

          {/* Info box */}
          <div className="bg-[#f7f7f7] rounded-2xl p-5 flex flex-col gap-[14px] border border-[#eee]">
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Data', value: ev.data ? fmtDataFull(ev.data) : null },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Horário', value: ev.hora || null },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Local', value: ev.local || null },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Classificação', value: ev.classificacao || null },
            ].filter(r => r.value).map((row, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[#555]">
                <span className="flex-shrink-0">{row.icon}</span>
                <div>
                  <span className="font-bold text-[#111] text-[13px] block">{row.label}</span>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {/* Tickets */}
          {ingressos.length > 0 ? ingressos.map((ing, i) => (
            <div key={i} className="border-2 border-[#eee] rounded-2xl p-5 bg-white flex flex-col gap-3 transition-all hover:border-[#4a90e2] hover:shadow-[0_4px_20px_rgba(74,144,226,0.12)] cursor-pointer">
              <span className="text-[17px] font-black text-[#111]">{ing!.nome}</span>
              {ing!.link ? (
                <a href={ing!.link} target="_blank" rel="noopener noreferrer" className="block mt-2 py-[10px] bg-[#1a3a6b] text-white rounded-lg text-[13px] font-bold text-center no-underline hover:bg-[#102a4e] transition-colors btn-pulse">
                  Garantir ingresso com desconto
                </a>
              ) : (
                <span className="block mt-2 py-[10px] bg-[#eee] text-[#999] rounded-lg text-[13px] text-center">Em breve</span>
              )}
            </div>
          )) : ev.preco ? (
            <p className="text-[20px] font-black text-[#111] py-4">A partir de {ev.preco}</p>
          ) : (
            <p className="text-[#aaa] py-4">Nenhum ingresso disponível no momento.</p>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-2xl w-[420px] p-8 shadow-[0_12px_48px_rgba(0,0,0,0.2)] flex flex-col gap-5 max-md:w-[calc(100%-24px)] max-md:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#111]">Compartilhar evento</h3>
              <button onClick={() => setShareOpen(false)} className="bg-transparent border-none cursor-pointer text-[#888] p-1 rounded-md hover:bg-[#f0f0f0] hover:text-[#333] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-sm text-[#888] -mt-3">Compartilhe esse evento com seus amigos</p>
            <div className="grid grid-cols-2 gap-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(ev.titulo + ' — ' + shareUrl)}`} target="_blank" rel="noopener" className="flex items-center gap-[10px] px-4 py-3 rounded-[10px] bg-[#e8f8ef] text-[#25d366] text-sm font-semibold no-underline hover:opacity-85 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                WhatsApp
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(ev.titulo)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener" className="flex items-center gap-[10px] px-4 py-3 rounded-[10px] bg-[#e8f0fb] text-[#000] text-sm font-semibold no-underline hover:opacity-85 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter/X
              </a>
            </div>
            <div className="flex gap-[10px] border-t border-[#f0f0f0] pt-5">
              <input readOnly value={shareUrl} className="flex-1 px-[14px] py-[10px] border border-[#ddd] rounded-lg text-[13px] text-[#555] bg-[#fafafa] outline-none" />
              <button onClick={copyLink} className="px-5 py-[10px] bg-[#1a3a6b] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#102a4e] transition-colors whitespace-nowrap btn-pulse">
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
