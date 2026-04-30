import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DBProvider } from '@/contexts/DBContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Ingressos from '@/pages/Ingressos';
import EventoDetalhe from '@/pages/EventoDetalhe';
import Blog from '@/pages/Blog';
import Fotos from '@/pages/Fotos';
import Galeria from '@/pages/Galeria';
import Calendario from '@/pages/Calendario';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <DBProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ingressos" element={<Ingressos />} />
            <Route path="/ingresso/:id" element={<EventoDetalhe />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/fotos" element={<Fotos />} />
            <Route path="/galeria/:id" element={<Galeria />} />
            <Route path="/calendario" element={<Calendario />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </DBProvider>
    </BrowserRouter>
  );
}
