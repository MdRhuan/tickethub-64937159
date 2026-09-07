import { useParams, Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { guiaBySlug } from '@/data/guias';

export default function Guia() {
  const { slug } = useParams<{ slug: string }>();
  const g = guiaBySlug(slug);

  useSeo({
    title: g?.title ?? 'Guia não encontrado',
    description: g?.description ?? 'Guia não encontrado. Veja todos os guias da TicketHub.',
    path: slug ? `/guias/${slug}` : undefined,
    type: 'article',
    noindex: !g,
  });

  if (!g) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 text-center">
        <h1 className="text-2xl font-black text-[#111] mb-3">Guia não encontrado</h1>
        <Link to="/guias" className="text-[#1a3a6b] font-bold underline decoration-[#4a90e2] underline-offset-2">Ver todos os guias</Link>
      </div>
    );
  }

  const Body = g.Body;

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#4a90e2] mb-3">Guia</p>
      <h1 className="text-3xl md:text-5xl font-black text-[#111] leading-[1.05] mb-4">{g.h1}</h1>
      <p className="text-lg text-[#444] leading-relaxed mb-8">{g.lead}</p>
      <Body />
      <div className="mt-12 pt-6 border-t border-gray-100">
        <Link to="/guias" className="text-[#1a3a6b] font-bold text-sm underline decoration-[#4a90e2] underline-offset-2">← Todos os guias</Link>
      </div>
    </article>
  );
}
