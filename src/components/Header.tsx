import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/ingressos', label: 'Ingressos' },
  { to: '/calendario',label: 'Calendário' },
  { to: '/blog',      label: 'Blog' },
  { to: '/fotos',     label: 'Fotos' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header className="flex items-center justify-between px-10 py-4 sticky top-0 bg-white z-[100] border-b border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 font-black text-[18px] tracking-wide no-underline text-inherit">
        <img src="/Icon/Logo.png" alt="TicketHub" className="w-16 h-16 object-contain" />
        TICKET HUB
      </Link>

      {/* Nav desktop */}
      <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex gap-7">
        {NAV_LINKS.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`no-underline font-bold text-sm transition-colors ${
              loc.pathname === l.to
                ? 'text-[#111] border-b-2 border-[#1a3a6b]'
                : 'text-[#555] hover:text-[#111]'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Hamburger */}
      <button
        className="md:hidden flex flex-col justify-center gap-[5px] bg-transparent border-none cursor-pointer p-1 z-[200]"
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
      >
        <span className={`block w-[22px] h-[2px] bg-[#333] rounded transition-all duration-200 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
        <span className={`block w-[22px] h-[2px] bg-[#333] rounded transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-[22px] h-[2px] bg-[#333] rounded transition-all duration-200 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
      </button>

      {/* Nav mobile */}
      {open && (
        <nav className="md:hidden fixed top-[57px] left-0 right-0 bg-white flex flex-col items-start px-6 pt-5 pb-7 gap-0 border-b border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-[150]">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`no-underline font-bold text-base py-[10px] border-b border-gray-100 w-full transition-colors ${
                loc.pathname === l.to ? 'text-[#1a3a6b]' : 'text-[#555] hover:text-[#111]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
