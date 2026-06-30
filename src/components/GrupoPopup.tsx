import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

export default function GrupoPopup() {
  const [website, setWebsite] = useState(''); // honeypot
  const [visible, setVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('grupoPopupDone')) return;
    const t = setTimeout(() => setVisible(true), 120000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visible) setErro('');
  }, [visible]);

  function hide() {
    setVisible(false);
    if (!sessionStorage.getItem('grupoPopupDone')) {
      setTimeout(() => setVisible(true), 120000);
    }
  }

  function validar(): string {
    const n = nome.trim();
    const w = tel.trim();
    const e = email.trim();
    const nasc = nascimento.trim();
    if (n.length < 1 || n.length > 120) return 'Informe um nome válido (até 120 caracteres).';
    if (w.length < 6 || w.length > 30) return 'Informe um WhatsApp válido (entre 6 e 30 caracteres).';
    if (e.length < 3 || e.length > 200) return 'Informe um e-mail válido.';
    if (!EMAIL_REGEX.test(e)) return 'Informe um e-mail válido.';
    if (nasc.length > 20) return 'Data de nascimento inválida.';
    return '';
  }

  async function submit() {
    setErro('');
    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: {
          nome: nome.trim(),
          whatsapp: tel.trim(),
          email: email.trim(),
          nascimento: nascimento.trim(),
          website, // honeypot
        },
      });
      if (error) {
        console.error('Erro ao salvar lead', error);
        // Tenta extrair mensagem PT do corpo da resposta da função
        let msg = 'Não foi possível salvar seus dados. Tente novamente.';
        const ctx: any = (error as any)?.context;
        try {
          if (ctx && typeof ctx.json === 'function') {
            const j = await ctx.json();
            if (j?.error) msg = j.error;
          } else if (ctx?.body) {
            const j = JSON.parse(ctx.body);
            if (j?.error) msg = j.error;
          }
        } catch { /* ignore */ }
        setErro(msg);
        setSaving(false);
        return;
      }
      if (!data || (data as any).ok !== true) {
        const msg = (data as any)?.error || 'Não foi possível salvar seus dados. Tente novamente.';
        setErro(msg);
        setSaving(false);
        return;
      }
    } catch (e) {
      console.error('Erro de rede ao salvar lead', e);
      setErro('Falha na conexão. Verifique sua internet e tente novamente.');
      setSaving(false);
      return;
    }
    setSaving(false);
    setVisible(false);
    sessionStorage.setItem('grupoPopupDone', '1');
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-7 sm:right-7 sm:w-[300px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] z-[9999] overflow-hidden">
      <button
        onClick={hide}
        className="absolute top-3 right-3 bg-transparent border-none text-[#666] text-xl cursor-pointer leading-none hover:text-[#333] transition-colors"
        aria-label="Fechar"
      >×</button>
      <div className="p-5">
        <p className="text-sm font-extrabold text-[#111] text-center mb-4 leading-snug">
          Tenha Acesso ao nosso Grupo Exclusivo
        </p>
        {/* Honeypot anti-bot: posicionado fora da tela, sem tabindex e oculto a leitores de tela */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
          <label>
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-col gap-[10px]">
          <input
            value={nome} onChange={e => { setNome(e.target.value); if (erro) setErro(''); }}
            placeholder="Seu nome"
            className="w-full px-[14px] py-[10px] border border-[#e0e0e0] rounded-lg text-[13px] text-[#333] outline-none focus:border-[#aaa] transition-colors"
          />
          <input
            value={tel} onChange={e => { setTel(e.target.value); if (erro) setErro(''); }}
            type="tel" placeholder="WhatsApp"
            className="w-full px-[14px] py-[10px] border border-[#e0e0e0] rounded-lg text-[13px] text-[#333] outline-none focus:border-[#aaa] transition-colors"
          />
          <input
            value={email} onChange={e => { setEmail(e.target.value); if (erro) setErro(''); }}
            type="email" placeholder="Seu e-mail"
            className="w-full px-[14px] py-[10px] border border-[#e0e0e0] rounded-lg text-[13px] text-[#333] outline-none focus:border-[#aaa] transition-colors"
          />
          <input
            value={nascimento}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
              let out = digits;
              if (digits.length > 4) out = `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
              else if (digits.length > 2) out = `${digits.slice(0,2)}/${digits.slice(2)}`;
              setNascimento(out);
              if (erro) setErro('');
            }}
            inputMode="numeric"
            maxLength={10}
            placeholder="Data de nascimento (dd/mm/aaaa)"
            className="w-full px-[14px] py-[10px] border border-[#e0e0e0] rounded-lg text-[13px] text-[#333] outline-none focus:border-[#aaa] transition-colors"
          />
          {erro && (
            <p className="text-[12px] text-[#e74c3c] text-center -mt-1" role="alert">{erro}</p>
          )}
          <button
            onClick={submit}
            disabled={saving}
            className="w-full py-3 bg-[#25d366] text-white border-none rounded-lg text-sm font-bold mt-1 cursor-pointer hover:bg-[#1ebe5a] transition-colors btn-pulse disabled:opacity-60"
          >
            {saving ? 'Enviando...' : 'Entrar no Grupo'}
          </button>
        </div>
        <p className="text-[11px] text-[#666] text-center mt-[10px]">Receba ofertas e novidades exclusivas</p>
      </div>
    </div>
  );
}
