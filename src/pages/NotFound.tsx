import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';

export default function NotFound() {
  useSeo({
    title: 'Página não encontrada',
    description: 'A página que você procura não existe ou foi removida. Volte para a home do TicketHub e encontre os melhores eventos em Belo Horizonte.',
    noindex: true,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
      <p className="text-6xl md:text-7xl font-black text-[#1a3a6b] mb-4">404</p>
      <h1 className="text-2xl md:text-3xl font-black text-[#111] mb-3">Página não encontrada</h1>
      <p className="text-[#555] text-sm md:text-base mb-8 max-w-md mx-auto">
        O link pode estar quebrado ou o evento já saiu do ar. Confira a agenda completa
        ou volte para a página inicial.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-[#1a3a6b] text-white font-bold text-sm px-6 py-3 no-underline transition-colors hover:bg-[#12294d]"
        >
          Voltar para a home
        </Link>
        <Link
          to="/mais-baratos"
          className="inline-flex items-center justify-center rounded-full border-2 border-[#1a3a6b] text-[#1a3a6b] font-bold text-sm px-6 py-3 no-underline transition-colors hover:bg-[#1a3a6b] hover:text-white"
        >
          Ver ingressos
        </Link>
      </div>
    </div>
  );
}
