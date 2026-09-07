import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

function usePageViews() {
  const location = useLocation();
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  }, [location.pathname, location.search]);
}

import { DBProvider } from '@/contexts/DBContext';
import Layout from '@/components/Layout';

const Home = lazy(() => import('@/pages/Home'));
const EventoDetalhe = lazy(() => import('@/pages/EventoDetalhe'));
const Calendario = lazy(() => import('@/pages/Calendario'));
const Grupos = lazy(() => import('@/pages/Grupos'));
const Admin = lazy(() => import('@/pages/Admin'));
const Link = lazy(() => import('@/pages/Link'));
const MaisBaratos = lazy(() => import('@/pages/MaisBaratos'));
const Local = lazy(() => import('@/pages/Local'));
const Guias = lazy(() => import('@/pages/Guias'));
const Guia = lazy(() => import('@/pages/Guia'));
const Sobre = lazy(() => import('@/pages/Sobre'));
const ComoFunciona = lazy(() => import('@/pages/ComoFunciona'));
const Contato = lazy(() => import('@/pages/Contato'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const Loading = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'system-ui, sans-serif' }}>
    Carregando…
  </div>
);

// /ingressos foi unificado em /mais-baratos (o catálogo). Redirect client-side;
// o 301 de verdade vem do public/_redirects no host.
function RedirectIngressoGenero() {
  const { genero } = useParams<{ genero?: string }>();
  return <Navigate to={genero ? `/mais-baratos/${genero}` : '/mais-baratos'} replace />;
}

function AppRoutes() {
  const location = useLocation();
  usePageViews();


  if (location.pathname === '/link') {
    return (
      <Routes>
        <Route path="/link" element={<Link />} />
      </Routes>
    );
  }

  return (
    <DBProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mais-baratos" element={<MaisBaratos />} />
          <Route path="/mais-baratos/:genero" element={<MaisBaratos />} />
          <Route path="/ingressos" element={<Navigate to="/mais-baratos" replace />} />
          <Route path="/ingressos/:genero" element={<RedirectIngressoGenero />} />
          <Route path="/local/:slug" element={<Local />} />
          <Route path="/guias" element={<Guias />} />
          <Route path="/guias/:slug" element={<Guia />} />
          <Route path="/ingresso/:slug" element={<EventoDetalhe />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </DBProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
