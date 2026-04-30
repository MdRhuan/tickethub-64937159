import { useEffect, useState } from 'react';

export default function GrupoPopup() {
  const [visible, setVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('grupoPopupDone')) return;
    const t = setTimeout(() => setVisible(true), 120000);
    return () => clearTimeout(t);
  }, []);

  function hide() {
    setVisible(false);
    if (!sessionStorage.getItem('grupoPopupDone')) {
      setTimeout(() => setVisible(true), 120000);
    }
  }

  function submit() {
    setVisible(false);
    sessionStorage.setItem('grupoPopupDone', '1');
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-7 right-7 w-[300px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] z-[9999] overflow-hidden">
      <button
        onClick={hide}
        className="absolute top-3 right-3 bg-transparent border-none text-[#aaa] text-xl cursor-pointer leading-none hover:text-[#333] transition-colors"
        aria-label="Fechar"
      >×</button>
      <div className="p-5">
        <p className="text-sm font-extrabold text-[#111] text-center mb-4 leading-snug">
          Tenha Acesso ao nosso Grupo Exclusivo
        </p>
        <div className="flex flex-col gap-[10px]">
          <input
            value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Seu nome"
            className="w-full px-[14px] py-[10px] border border-[#e0e0e0] rounded-lg text-[13px] text-[#333] outline-none focus:border-[#aaa] transition-colors"
          />
          <input
            value={tel} onChange={e => setTel(e.target.value)}
            type="tel" placeholder="WhatsApp"
            className="w-full px-[14px] py-[10px] border border-[#e0e0e0] rounded-lg text-[13px] text-[#333] outline-none focus:border-[#aaa] transition-colors"
          />
          <input
            value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="Seu e-mail"
            className="w-full px-[14px] py-[10px] border border-[#e0e0e0] rounded-lg text-[13px] text-[#333] outline-none focus:border-[#aaa] transition-colors"
          />
          <button
            onClick={submit}
            className="w-full py-3 bg-[#25d366] text-white border-none rounded-lg text-sm font-bold mt-1 cursor-pointer hover:bg-[#1ebe5a] transition-colors btn-pulse"
          >
            Entrar no Grupo
          </button>
        </div>
        <p className="text-[11px] text-[#bbb] text-center mt-[10px]">Receba ofertas e novidades exclusivas</p>
      </div>
    </div>
  );
}
