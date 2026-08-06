import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { GA_MEASUREMENT_ID, initAnalytics } from '@/lib/analytics';

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
const Ingressos = lazy(() => import('@/pages/Ingressos'));
const EventoDetalhe = lazy(() => import('@/pages/EventoDetalhe'));
const Calendario = lazy(() => import('@/pages/Calendario'));
const Grupos = lazy(() => import('@/pages/Grupos'));
const Admin = lazy(() => import('@/pages/Admin'));
const Link = lazy(() => import('@/pages/Link'));

const Loading = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'system-ui, sans-serif' }}>
    Carregando…
  </div>
);

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
          <Route path="/ingressos" element={<Ingressos />} />
          <Route path="/ingresso/:slug" element={<EventoDetalhe />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/grupos" element={<Grupos />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </DBProvider>
  );
}

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
