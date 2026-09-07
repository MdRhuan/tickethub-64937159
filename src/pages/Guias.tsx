import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { GUIAS } from '@/data/guias';

export default function Guias() {
  useSeo({
    title: 'Guias de festas e eventos em BH',
    description: 'Guias da TicketHub para curtir a noite de Belo Horizonte gastando menos: dicas de economia, cena eletrônica e como achar as melhores festas.',
    path: '/guias',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#4a90e2] mb-3">Guias</p>
      <h1 className="text-3xl md:text-5xl font-black text-[#111] leading-[1.05] mb-5">Guias da noite de BH</h1>
      <p className="text-lg text-[#444] leading-relaxed mb-10">
        Nossa curadoria para você aproveitar as festas e shows de Belo Horizonte — e gastar menos no rolê.
      </p>

      <div className="flex flex-col gap-4">
        {GUIAS.map((g) => (
          <Link
            key={g.slug}
            to={`/guias/${g.slug}`}
            className="block bg-white border border-gray-100 rounded-2xl p-5 md:p-6 no-underline shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
          >
            <h2 className="font-black text-[#111] text-lg">{g.title}</h2>
            <p className="text-[#666] text-sm leading-relaxed mt-1">{g.lead}</p>
            <span className="text-[#4a90e2] font-bold text-sm mt-3 inline-block">Ler o guia →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
