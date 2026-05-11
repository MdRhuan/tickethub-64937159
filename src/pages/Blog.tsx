import { useDB } from '@/contexts/DBContext';
import { fmtDataBlog } from '@/lib/utils';

export default function Blog() {
  const { posts, ready } = useDB();

  const destaque = posts.find(p => p.destaque) ?? null;
  const outros = [...posts].reverse().filter(p => !p.destaque);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1f36] page-px py-[72px]">
        <span className="block text-[11px] font-bold text-[#4a90e2] tracking-[3px] uppercase mb-3">NOSSO BLOG</span>
        <h1 className="text-[48px] font-black text-white leading-[1.1] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
          Novidades, dicas e tudo<br />sobre o mundo dos eventos
        </h1>
        <p className="text-base text-[#aaa] max-w-[520px] leading-[1.65]">
          Fique por dentro das últimas notícias, guias e histórias do universo da música e entretenimento.
        </p>
      </section>

      <section className="page-px py-16">
        {/* Destaque */}
        <span className="block text-[11px] font-bold text-[#1a3a6b] tracking-[3px] uppercase mb-1">EM DESTAQUE</span>
        <h2 className="text-[28px] font-black text-[#111] mb-8">Post em destaque</h2>

        {!ready ? (
          <div className="min-h-[200px] flex items-center justify-center text-[#aaa]">Carregando...</div>
        ) : destaque ? (
          <div className="flex rounded-2xl overflow-hidden border border-[#eee] shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] mb-16 min-h-[300px] transition-all duration-300 hover:shadow-[0_16px_52px_rgba(0,0,0,0.14),0_4px_12px_rgba(0,0,0,0.06)]" style={{ flexWrap: 'wrap' }}>
            <div
              className="flex-shrink-0"
              style={{
                width: 'clamp(200px, 45%, 45%)',
                minHeight: '200px',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                background: destaque.imgUrl ? `url("${destaque.imgUrl}") center/cover` : 'linear-gradient(135deg,#1a3a6b,#0d1a2e)',
              }}
            />
            <div className="flex-1 p-8 flex flex-col gap-3" style={{ minWidth: '280px' }}>
              {destaque.tag && <span className="inline-block bg-[#eef5ff] text-[#4a90e2] text-[11px] font-bold px-3 py-1 rounded-full w-fit">{destaque.tag}</span>}
              <h3 className="text-2xl font-extrabold text-[#111]">{destaque.titulo}</h3>
              {destaque.subtitulo && <p className="text-sm text-[#666] leading-relaxed">{destaque.subtitulo}</p>}
              <div className="flex items-center justify-between mt-auto pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a3a6b]" />
                  <span className="text-sm font-semibold text-[#333]">{destaque.autor}</span>
                </div>
                <span className="text-sm text-[#aaa]">{fmtDataBlog(destaque.data)}</span>
              </div>
              <a href="#" className="inline-block mt-2 px-5 py-[9px] bg-[#1a3a6b] text-white rounded-lg text-sm font-bold no-underline hover:bg-[#102a4e] transition-colors self-start btn-pulse">
                Ler post
              </a>
            </div>
          </div>
        ) : (
          <div className="min-h-[200px] flex items-center justify-center text-[#aaa] mb-16">
            Nenhum post em destaque no momento.
          </div>
        )}

        {/* Grid */}
        <span className="block text-[11px] font-bold text-[#1a3a6b] tracking-[3px] uppercase mt-16 mb-1">ARTIGOS RECENTES</span>
        <h2 className="text-[28px] font-black text-[#111] mb-8">Últimas publicações</h2>

        {outros.length === 0 ? (
          <p className="text-[#aaa]">Nenhuma publicação disponível no momento.</p>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {outros.map(p => (
              <div key={p.id} className="flex flex-col rounded-xl overflow-hidden border border-[#eee] shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_14px_44px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div
                  className="w-full"
                  style={{
                    aspectRatio: '8/5',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    background: p.imgUrl ? `url("${p.imgUrl}") center/cover` : 'linear-gradient(135deg,#e0e4ef,#c8d0e8)',
                  }}
                />
                <div className="p-5 flex flex-col gap-2 flex-1">
                  {p.tag && <span className="inline-block bg-[#eef5ff] text-[#4a90e2] text-[11px] font-bold px-3 py-1 rounded-full w-fit">{p.tag}</span>}
                  <h3 className="text-[15px] font-bold text-[#111] leading-snug">{p.titulo}</h3>
                  {p.subtitulo && (
                    <p className="text-[13px] text-[#666]">
                      {p.subtitulo.length > 100 ? p.subtitulo.substring(0, 100) + '...' : p.subtitulo}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-[12px] text-[#aaa]">{fmtDataBlog(p.data)}</span>
                    <a href="#" className="text-[13px] text-[#4a90e2] font-semibold no-underline hover:underline">Ler mais →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
