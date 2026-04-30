import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import GrupoPopup from './GrupoPopup';

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <GrupoPopup />
    </>
  );
}
