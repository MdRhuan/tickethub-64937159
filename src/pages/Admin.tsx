import { useState, useRef, useEffect } from 'react';
import { useDB } from '@/contexts/DBContext';
import { supabase } from '@/integrations/supabase/client';
import type { Evento, Atracao, Ingresso } from '@/types';
import { fmtDataBlog } from '@/lib/utils';
import { uploadImage } from '@/lib/imageUpload';
import logoIcon from '@/assets/icons/logo.webp';
import TabGrupos from '@/pages/admin/TabGrupos';
import TabAprovacoes from '@/pages/admin/TabAprovacoes';

type Tab = 'eventos' | 'grupos' | 'aprovacoes';
type Role = 'admin' | 'editor';


// ── Toast ──────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  function toast(m: string) {
    setMsg(m); setShow(true);
    setTimeout(() => setShow(false), 2500);
  }
  return { msg, show, toast };
}

// ── Image Upload helper ────────────────────────────────────────────────────
function useImgUpload(folder = 'uploads') {
  const [preview, setPreview] = useState('');
  const [data, setData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  async function handle(file: File) {
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      setData(url);
      setPreview(url);
      URL.revokeObjectURL(localUrl);
    } catch (e: any) {
      console.error('[Admin] Falha no upload da imagem:', e);
      setError(e?.message || 'Erro ao enviar imagem.');
      setData('');
    } finally {
      setUploading(false);
    }
  }
  function setExisting(url: string) { setPreview(url); setData(url); setError(''); }
  function reset() { setPreview(''); setData(''); setError(''); setUploading(false); }
  return { preview, data, uploading, error, handle, setExisting, reset };
}

// ── Main Admin component ───────────────────────────────────────────────────
export default function Admin() {
  const [role, setRole] = useState<Role | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passErr, setPassErr] = useState('');
  const [tab, setTab] = useState<Tab>('eventos');
  const { toast, msg, show } = useToast();
  const { reload, eventosAll } = useDB();

  const authed = role !== null;
  const isAdmin = role === 'admin';
  const pendentes = eventosAll.filter(e => (e.status ?? 'aprovado') === 'pendente').length;

  useEffect(() => {
    let mounted = true;

    async function checkRole(userId: string | undefined) {
      if (!userId) { if (mounted) { setRole(null); setChecking(false); } return; }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      const roles = (data ?? []).map(r => r.role as string);
      const resolved: Role | null = roles.includes('admin') ? 'admin' : roles.includes('editor') ? 'editor' : null;
      if (mounted) {
        setRole(resolved);
        setChecking(false);
        if (resolved) reload();
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      checkRole(session?.user?.id);
    });
    supabase.auth.getSession().then(({ data }) => checkRole(data.session?.user?.id));

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [reload]);

  useEffect(() => {
    if (!isAdmin && tab === 'aprovacoes') setTab('eventos');
  }, [isAdmin, tab]);

  async function doLogin() {
    setPassErr('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error || !data.user) { setPassErr('Email ou senha incorretos.'); return; }
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);
    const roles = (roleData ?? []).map(r => r.role as string);
    const resolved: Role | null = roles.includes('admin') ? 'admin' : roles.includes('editor') ? 'editor' : null;
    if (!resolved) {
      await supabase.auth.signOut();
      setPassErr('Esta conta não tem permissão de acesso ao painel.');
      return;
    }
    setRole(resolved);
    reload();
  }

  async function doLogout() {
    await supabase.auth.signOut();
    setRole(null);
  }

  if (checking) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0d1a2e] to-[#1a3a6b] flex items-center justify-center z-[1000]">
        <p className="text-white text-sm">Carregando...</p>
      </div>
    );
  }

  if (!authed) return <LoginScreen email={email} setEmail={setEmail} pass={pass} setPass={setPass} passErr={passErr} onLogin={doLogin} />;


  return (
    <div className="flex min-h-screen bg-[#f0f2f7]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#1a3a6b] min-h-screen fixed top-0 left-0 flex flex-col z-50 max-md:w-full max-md:min-h-0 max-md:h-14 max-md:flex-row max-md:items-center max-md:justify-between max-md:px-3">
        <div className="flex items-center gap-[10px] px-5 py-[22px] font-black text-[13px] tracking-wide text-white border-b border-white/10 max-md:py-0 max-md:px-0 max-md:border-0">
          <img src={logoIcon} alt="TH" className="w-[34px] h-[34px] object-contain" />
          TICKET HUB
        </div>
        <nav className="flex-1 flex flex-col p-3 gap-1 max-md:flex-row max-md:p-0 max-md:gap-1">
          <button
            onClick={() => setTab('eventos')}
            className={`flex items-center gap-3 px-[14px] py-[11px] border-none rounded-[10px] text-sm font-bold cursor-pointer text-left transition-all max-md:px-3 max-md:py-2 max-md:text-[12px] max-md:rounded-lg ${tab === 'eventos' ? 'bg-white/15 text-white' : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}
          >
            Eventos
          </button>
          <button
            onClick={() => setTab('grupos')}
            className={`flex items-center gap-3 px-[14px] py-[11px] border-none rounded-[10px] text-sm font-bold cursor-pointer text-left transition-all max-md:px-3 max-md:py-2 max-md:text-[12px] max-md:rounded-lg ${tab === 'grupos' ? 'bg-white/15 text-white' : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}
          >
            Grupos
          </button>
          {isAdmin && (
            <button
              onClick={() => setTab('aprovacoes')}
              className={`flex items-center gap-2 px-[14px] py-[11px] border-none rounded-[10px] text-sm font-bold cursor-pointer text-left transition-all max-md:px-3 max-md:py-2 max-md:text-[12px] max-md:rounded-lg ${tab === 'aprovacoes' ? 'bg-white/15 text-white' : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              Aprovações
              {pendentes > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#e74c3c] text-white text-[11px] font-black">
                  {pendentes}
                </span>
              )}
            </button>
          )}
        </nav>
        <div className="p-3 border-t border-white/10 flex flex-col gap-[6px] max-md:flex-row max-md:border-0 max-md:p-0 max-md:gap-1">
          <span className="text-white/40 text-[11px] px-[14px] max-md:hidden">
            Perfil: {isAdmin ? 'Administrador' : 'Editor'}
          </span>
          <a href="/" className="flex items-center gap-2 text-white/50 no-underline text-[12px] px-[14px] py-2 rounded-lg hover:text-white hover:bg-white/10 transition-all max-md:text-[11px] max-md:px-[10px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Ver site
          </a>
          <button onClick={doLogout} className="w-full px-[14px] py-[9px] bg-white/8 border-none rounded-lg text-white/60 text-[13px] font-bold cursor-pointer text-left hover:bg-white/18 hover:text-white transition-all max-md:text-[11px] max-md:px-[10px]">
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen max-md:ml-0 max-md:pt-14">
        <div className="bg-white px-9 py-[22px] border-b border-[#e8e8e8] shadow-sm max-md:px-5 max-md:py-4">
          <h1 className="text-[20px] font-black text-[#111]">
            {tab === 'eventos' ? 'Eventos' : tab === 'grupos' ? 'Grupos de WhatsApp' : 'Aprovações'}
          </h1>
          <p className="text-[13px] text-[#666] mt-0.5">
            {tab === 'eventos'
              ? (isAdmin ? 'Gerencie os eventos do site' : 'Crie e edite eventos — publicação depende de aprovação')
              : tab === 'grupos' ? 'Adicione, edite, reordene e remova os grupos'
              : 'Revise os eventos enviados para publicação'}
          </p>
        </div>

        <div className="p-9 pb-16 max-md:p-5">
          {isAdmin && pendentes > 0 && tab !== 'aprovacoes' && (
            <button
              onClick={() => setTab('aprovacoes')}
              className="w-full mb-5 text-left px-4 py-3 rounded-xl bg-[#fff6e0] border border-[#f3dfae] text-[#9a6700] text-[13px] font-bold hover:bg-[#ffefcc] transition-colors"
            >
              {pendentes} evento{pendentes > 1 ? 's' : ''} aguardando sua aprovação — clique para revisar.
            </button>
          )}
          {tab === 'eventos'
            ? <TabEventos toast={toast} isAdmin={isAdmin} />
            : tab === 'grupos'
              ? <TabGrupos toast={toast} />
              : <TabAprovacoes toast={toast} />}
        </div>
      </div>



      {/* Toast */}
      <div className={`fixed bottom-6 right-6 bg-[#111] text-white px-5 py-[11px] rounded-[10px] text-[13px] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 z-[9999] pointer-events-none ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {msg}
      </div>
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────
function LoginScreen({ email, setEmail, pass, setPass, passErr, onLogin }: {
  email: string; setEmail: (v:string)=>void;
  pass: string; setPass: (v:string)=>void;
  passErr: string; onLogin: ()=>void;
}) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0d1a2e] to-[#1a3a6b] flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-[20px] px-10 py-12 w-full max-w-[400px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col items-center gap-4">
        <div className="flex items-center gap-[10px] font-black text-base tracking-wide">
          <img src={logoIcon} alt="TH" className="w-[42px] h-[42px] object-contain" />
          TICKET HUB
        </div>
        <h1 className="text-[22px] font-black text-[#111]">Painel Administrativo</h1>
        <p className="text-[13px] text-[#888]">Entre com seu email e senha de admin.</p>
        <div className="flex flex-col gap-2 w-full">
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
            placeholder="Email"
            className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-[10px] text-sm outline-none focus:border-[#1a3a6b] transition-colors"
          />
          <input
            type="password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
            placeholder="Senha"
            className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-[10px] text-sm outline-none focus:border-[#1a3a6b] transition-colors"
          />
          <button onClick={onLogin} className="w-full px-5 py-3 bg-[#1a3a6b] text-white border-none rounded-[10px] text-sm font-bold cursor-pointer hover:bg-[#102a4e] transition-colors whitespace-nowrap btn-pulse mt-1">
            Entrar
          </button>
        </div>
        {passErr && <p className="text-[13px] text-[#e74c3c]">{passErr}</p>}
      </div>
    </div>
  );
}

// ── TAB EVENTOS ────────────────────────────────────────────────────────────
function TabEventos({ toast, isAdmin }: { toast: (m:string)=>void; isAdmin: boolean }) {
  const { eventosAll, addEvento, deleteEvento } = useDB();
  const eventos = eventosAll;
  const [saving, setSaving] = useState(false);
  const [savedLabel, setSavedLabel] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [atracoes, setAtracoes] = useState<Atracao[]>([]);
  const [datas, setDatas] = useState<string[]>(['']);
  const [ingressos, setIngressos] = useState<Ingresso[]>([{ nome:'', link:'' }]);
  const img = useImgUpload();
  const banner = useImgUpload();
  const formRef = useRef<HTMLDivElement>(null);

  const emptyForm = {
    titulo:'', sobre:'', hora:'', local:'', mapaUrl:'',
    classificacao:'Livre', categoria:'',
    tagCard:'', badge:'', preco:'', corCal:'azul',
    btnLabel:'', btnUrl:'',
    homeDestaque: false, homeOrdem: 0,
  };
  const [form, setForm] = useState(emptyForm);

  function f(k: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(p => ({...p, [k]: e.target.value})); }

  // Validações inline
  function parsePreco(raw: string): number {
    if (!raw) return NaN;
    const cleaned = raw.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
    return parseFloat(cleaned);
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const datasClean = datas.map(d => d.trim()).filter(Boolean);
  const errors = {
    titulo: !form.titulo.trim() ? 'Informe o nome do evento.' : '',
    data: datasClean.length === 0
      ? 'Adicione pelo menos uma data.'
      : datasClean.every(d => d < todayStr)
        ? 'A data não pode estar no passado.'
        : '',
    local: !form.local.trim()
      ? 'Informe o local do evento.'
      : form.local.trim().length < 3
        ? 'O local deve ter pelo menos 3 caracteres.'
        : '',
    preco: '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function addAt() { if (atracoes.length < 7) setAtracoes(p => [...p, { nome:'', foto:'' }]); }
  function removeAt(i: number) { setAtracoes(p => p.filter((_,j) => j !== i)); }
  function setAt(i: number, key: keyof Atracao, val: string) {
    setAtracoes(p => p.map((a, j) => j === i ? { ...a, [key]: val } : a));
  }
  async function uploadAtFoto(i: number, file: File) {
    const localUrl = URL.createObjectURL(file);
    setAt(i, 'foto', localUrl);
    try {
      const url = await uploadImage(file, 'atracoes');
      setAt(i, 'foto', url);
      URL.revokeObjectURL(localUrl);
    } catch (e: any) {
      console.error('[Admin] Falha no upload da foto da atração:', e);
      setAt(i, 'foto', '');
    }
  }

  function setDataAt(i: number, val: string) { setDatas(p => p.map((d, j) => j === i ? val : d)); }
  function addDataRow() { setDatas(p => [...p, '']); }
  function removeDataRow(i: number) { setDatas(p => p.length === 1 ? [''] : p.filter((_, j) => j !== i)); }

  function resetAll() {
    setEditId(null);
    setForm(emptyForm);
    setAtracoes([]);
    setDatas(['']);
    setIngressos([{ nome:'', link:'' }]);
    img.reset();
    banner.reset();
  }

  function setIng(i: number, key: keyof Ingresso, val: string) {
    setIngressos(p => p.map((x, j) => j === i ? { ...x, [key]: val } : x));
  }
  function addIng() { setIngressos(p => [...p, { nome:'', link:'' }]); }
  function removeIng(i: number) { setIngressos(p => p.length === 1 ? [{ nome:'', link:'' }] : p.filter((_, j) => j !== i)); }

  function startEdit(ev: Evento) {
    setEditId(ev.id);
    setForm({
      titulo: ev.titulo || '', sobre: ev.sobre || '',
      hora: ev.hora || '',
      local: ev.local || '', mapaUrl: ev.mapaUrl || '',
      classificacao: ev.classificacao || 'Livre',
      categoria: ev.categoria || '',
      tagCard: ev.tagCard || '', badge: ev.badge || '',
      preco: ev.preco || '', corCal: ev.corCal || 'azul',
      btnLabel: ev.btnLabel || '', btnUrl: ev.btnUrl || '',
      homeDestaque: ev.homeDestaque ?? false, homeOrdem: ev.homeOrdem ?? 0,
    });
    setAtracoes(ev.atracoes || []);
    const ds = ev.datas && ev.datas.length > 0 ? ev.datas : (ev.data ? [ev.data] : ['']);
    setDatas(ds);
    const ings = (ev.ingressos && ev.ingressos.length > 0)
      ? ev.ingressos
      : [ev.ing1, ev.ing2, ev.ing3].filter(Boolean) as Ingresso[];
    setIngressos(ings.length > 0 ? ings : [{ nome:'', link:'' }]);
    if (ev.imgUrl) img.setExisting(ev.imgUrl); else img.reset();
    if (ev.imgBanner) banner.setExisting(ev.imgBanner); else banner.reset();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (hasErrors) {
      const firstError = Object.values(errors).find(Boolean);
      if (firstError) toast(firstError);
      return;
    }
    const datasSorted = datasClean.slice().sort();
    const ingsClean = ingressos
      .map(i => ({ nome: i.nome.trim(), link: i.link.trim(), btnLabel: (i.btnLabel || '').trim() }))
      .filter(i => i.nome || i.link);
    setSaving(true);
    const tituloFinal = form.titulo.trim();
    const ev: Evento = {
      id: editId ?? Date.now().toString(),
      titulo: tituloFinal, sobre: form.sobre,
      atracoes: atracoes.filter(a => a.nome || a.foto),
      data: datasSorted[0], datas: datasSorted,
      hora: form.hora, local: form.local.trim(),
      mapaUrl: form.mapaUrl, classificacao: form.classificacao,
      categoria: form.categoria.toUpperCase(),
      imgUrl: img.data, imgBanner: banner.data,
      ingressos: ingsClean,
      ing1: ingsClean[0] || null,
      ing2: ingsClean[1] || null,
      ing3: ingsClean[2] || null,
      tagCard: form.tagCard.toUpperCase(), badge: form.badge,
      preco: form.preco, corCal: form.corCal as Evento['corCal'],
      btnLabel: form.btnLabel.trim(), btnUrl: form.btnUrl.trim(),
      homeDestaque: form.homeDestaque, homeOrdem: Number(form.homeOrdem) || 0,
      status: isAdmin
        ? (editId ? (eventos.find(e => e.id === editId)?.status ?? 'aprovado') : 'aprovado')
        : 'pendente',
      motivo_rejeicao: isAdmin ? undefined : '',
    };
    try {
      await addEvento(ev);
      toast(isAdmin
        ? `Evento "${tituloFinal}" salvo com sucesso!`
        : `Evento "${tituloFinal}" enviado para aprovação.`);

      setSavedLabel(tituloFinal);
      setTimeout(() => setSavedLabel(s => s === tituloFinal ? '' : s), 3000);
      resetAll();
    } catch (err: any) {
      console.error('[Admin] Erro ao salvar evento:', err);
      const raw = err?.message || '';
      const friendly = /permission denied|row-level security|not authorized/i.test(raw)
        ? 'Sem permissão para salvar. Verifique seu login de admin e tente novamente.'
        : raw
          ? `Erro ao salvar: ${raw}`
          : 'Erro ao salvar evento. Tente novamente.';
      toast(friendly);
    } finally {
      setSaving(false);
    }
  }


  async function del(id: string) {
    if (!confirm('Remover este evento?')) return;
    try {
      await deleteEvento(id);
      if (editId === id) resetAll();
      toast('Evento removido.');
    }
    catch { toast('Erro ao remover evento.'); }
  }

  return (
    <div className="grid grid-cols-2 gap-6 items-start max-md:grid-cols-1">
      {/* Form */}
      <div ref={formRef} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-black text-[#111]">{editId ? 'Editar Evento' : 'Novo Evento'}</h2>
          {editId && (
            <button type="button" onClick={resetAll} className="text-[12px] font-bold text-[#888] hover:text-[#111] bg-transparent border-none cursor-pointer">
              Cancelar edição
            </button>
          )}
        </div>
        <form onSubmit={submit} className="px-[22px] py-5 flex flex-col gap-[14px]">
          <FG label="Nome do evento *"><FI required value={form.titulo} onChange={f('titulo')} placeholder="Ex: Show do Artista XYZ" /></FG>
          <FG label="Sobre o evento"><textarea className="form-i resize-y min-h-[70px] leading-[1.5]" value={form.sobre} onChange={f('sobre')} placeholder="Descrição..." /></FG>

          <FG label={`Atrações (${atracoes.length}/7)`}>
            <div className="flex flex-col gap-3">
              {atracoes.map((at, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#fafafa] border border-[#eee] rounded-lg p-2">
                  <div className="relative w-[60px] h-[60px] flex-shrink-0 rounded-md overflow-hidden border border-[#e0e0e0] bg-[#eef0f4]">
                    {at.foto ? (
                      <img src={at.foto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#666] text-center px-1">Sem foto</div>
                    )}
                    <label className="absolute inset-0 cursor-pointer flex items-end justify-center bg-black/0 hover:bg-black/40 transition-colors group">
                      <span className="text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 pb-1">Trocar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) uploadAtFoto(i, file); }} />
                    </label>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <FI value={at.nome} onChange={e => setAt(i,'nome',e.target.value)} placeholder="Nome da atração" />
                    <FI value={at.foto.startsWith('data:') ? '' : at.foto} onChange={e => setAt(i,'foto',e.target.value)} placeholder="ou cole URL da foto" />
                  </div>
                  <button type="button" onClick={() => removeAt(i)} className="w-8 h-8 bg-[#fee] text-[#c0392b] border-none rounded-lg cursor-pointer text-[13px] hover:bg-[#c0392b] hover:text-white transition-colors flex-shrink-0">✕</button>
                </div>
              ))}
              {atracoes.length < 7 && (
                <button type="button" onClick={addAt} className="px-[14px] py-[7px] bg-[#f0f4ff] text-[#1a3a6b] border border-dashed border-[#1a3a6b] rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#dce8ff] transition-colors self-start">+ Adicionar atração</button>
              )}
            </div>
          </FG>

          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Local & Data</div>
          <FG label={`Datas do evento * (${datas.filter(Boolean).length})`} error={errors.data}>
            <div className="flex flex-col gap-2">
              {datas.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="date" required={i === 0} value={d} onChange={e => setDataAt(i, e.target.value)} className="form-i" />
                  {datas.length > 1 ? (
                    <button type="button" onClick={() => removeDataRow(i)} className="w-9 h-9 bg-[#fee] text-[#c0392b] border-none rounded-lg cursor-pointer text-[14px] hover:bg-[#c0392b] hover:text-white transition-colors flex-shrink-0">✕</button>
                  ) : (
                    <span className="w-9 h-9 flex-shrink-0" />
                  )}
                </div>
              ))}
              <button type="button" onClick={addDataRow} className="px-[14px] py-[7px] bg-[#f0f4ff] text-[#1a3a6b] border border-dashed border-[#1a3a6b] rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#dce8ff] transition-colors self-start">+ Adicionar outra data</button>
            </div>
          </FG>
          <FG label="Horário"><input type="time" value={form.hora} onChange={f('hora')} className="form-i" /></FG>
          <FG label="Local *" error={errors.local}><FI value={form.local} onChange={f('local')} placeholder="Ex: Arena XYZ" /></FG>
          <FG label="Link Google Maps"><FI value={form.mapaUrl} onChange={f('mapaUrl')} placeholder="https://..." /></FG>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Classificação"><FSel value={form.classificacao} onChange={f('classificacao')} options={['Livre','12+','14+','16+','18+']} /></FG>
            <FG label="Estilo musical"><FSel value={form.categoria} onChange={f('categoria')} options={['','FUNK','SERTANEJO','PAGODE','ROCK','POP','ELETRÔNICO','MPB','TRAP','JAZZ']} /></FG>
          </div>

          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Imagens</div>
          <FG label="Capa (400×500 px)"><ImgUpload img={img} label={img.preview ? 'Trocar imagem' : 'Subir imagem'} /></FG>
          <FG label="Banner (1440×500 px)"><ImgUpload img={banner} label={banner.preview ? 'Trocar imagem' : 'Subir imagem'} /></FG>

          <div className="flex items-center justify-between border-b-2 border-[#e8edf5] pb-[6px] my-2">
            <span className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b]">Ingressos</span>
            <button type="button" onClick={addIng} className="text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] hover:text-[#0a1f3d]">+ Adicionar ingresso</button>
          </div>
          {ingressos.map((ing, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
              <FG label={`Ingresso ${String(i+1).padStart(2,'0')}`}>
                <FI value={ing.nome} onChange={e => setIng(i, 'nome', e.target.value)} placeholder="Nome (ex: Pista, Camarote)" />
              </FG>
              <FG label="Link de compra">
                <FI value={ing.link} onChange={e => setIng(i, 'link', e.target.value)} placeholder="https://..." />
              </FG>
              <FG label="Texto do botão">
                <FI value={ing.btnLabel || ''} onChange={e => setIng(i, 'btnLabel', e.target.value)} placeholder='Padrão: "Garantir ingresso com desconto"' />
              </FG>
              <button
                type="button"
                onClick={() => removeIng(i)}
                disabled={ingressos.length === 1}
                className="h-[40px] px-3 rounded-lg border border-[#e8edf5] text-[#9ca3af] hover:text-red-500 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                aria-label="Remover ingresso"
              >✕</button>
            </div>
          ))}

          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Card & Calendário</div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Tag do card"><FSel value={form.tagCard} onChange={f('tagCard')} options={['','DESTAQUE','NOVO','ESGOTANDO','ÚLTIMO LOTE','EXCLUSIVO']} /></FG>
            <FG label="Cor da tag"><FSel value={form.badge} onChange={f('badge')} options={['','destaque','esgotando','verde','vermelho']} labels={['Padrão (preto)','Azul','Laranja','Verde','Vermelho']} /></FG>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Preço a partir de" error={errors.preco}><FI value={form.preco} onChange={f('preco')} placeholder="R$ 50,00" /></FG>
            <FG label="Cor no calendário"><FSel value={form.corCal} onChange={f('corCal')} options={['azul','verde','vermelho','laranja','roxo']} labels={['Azul','Verde','Vermelho','Laranja','Roxo']} /></FG>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Texto do botão"><FI value={form.btnLabel} onChange={f('btnLabel')} placeholder='Ex: Comprar agora (padrão: "Saiba mais")' /></FG>
            <FG label="Link do botão (abre em nova aba)"><FI value={form.btnUrl} onChange={f('btnUrl')} placeholder="https://... (deixe vazio para ocultar)" /></FG>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <FG label="Mostrar na Home">
              <label className="flex items-center gap-2 h-[40px] px-3 rounded-lg border border-[#e8edf5] bg-white cursor-pointer text-[13px] text-[#333]">
                <input
                  type="checkbox"
                  checked={!!form.homeDestaque}
                  onChange={e => setForm(p => ({ ...p, homeDestaque: e.target.checked }))}
                  className="w-4 h-4 accent-[#1a3a6b] cursor-pointer"
                />
                Exibir este evento na Home
              </label>
            </FG>
            <FG label="Ordem na Home (menor = primeiro)">
              <input
                type="number"
                value={form.homeOrdem}
                onChange={e => setForm(p => ({ ...p, homeOrdem: Number(e.target.value) || 0 }))}
                disabled={!form.homeDestaque}
                className="form-i disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0"
              />
            </FG>
          </div>

          <div className="flex gap-2 mt-[6px] items-center flex-wrap">
            <button
              type="submit"
              disabled={saving || hasErrors || img.uploading || banner.uploading}
              className="px-[22px] py-[11px] bg-[#1a3a6b] text-white border-none rounded-[9px] text-[13px] font-bold cursor-pointer hover:bg-[#102a4e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed btn-pulse inline-flex items-center gap-2"
            >
              {(saving || img.uploading || banner.uploading) && (
                <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
              )}
              {saving ? 'Salvando...' : (img.uploading || banner.uploading) ? 'Enviando imagens...' : editId ? 'Salvar Alterações' : 'Adicionar Evento'}
            </button>
            {editId && (
              <button type="button" onClick={resetAll} className="px-[18px] py-[11px] bg-[#eee] text-[#333] border-none rounded-[9px] text-[13px] font-bold cursor-pointer hover:bg-[#ddd] transition-colors">
                Cancelar
              </button>
            )}
            {savedLabel && (
              <span
                role="status"
                className="inline-flex items-center gap-1.5 px-3 py-[7px] bg-[#e6f7ec] text-[#1b7a3d] rounded-full text-[12px] font-bold border border-[#bfe6cd] animate-in fade-in"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Salvo: {savedLabel}
              </span>
            )}
          </div>
        </form>
      </div>


      {/* List */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-black text-[#111]">Eventos Cadastrados</h2>
          <span className="inline-flex items-center justify-center bg-[#eef5ff] text-[#1a3a6b] text-[12px] font-bold px-[10px] py-[3px] rounded-full">{eventos.length}</span>
        </div>
        <div className="p-3 flex flex-col gap-2 max-h-[560px] overflow-y-auto">
          {eventos.length === 0 ? (
            <p className="text-[#666] text-[13px] text-center py-7">Nenhum evento cadastrado.</p>
          ) : [...eventos].reverse().map(ev => {
            const st = (ev.status ?? 'aprovado') as 'pendente' | 'aprovado' | 'rejeitado';
            const stLabel = st === 'pendente' ? 'Pendente' : st === 'rejeitado' ? 'Rejeitado' : '';
            return (
              <ListItem
                key={ev.id}
                img={ev.imgUrl}
                title={ev.titulo}
                meta={[ev.data ? fmtDataBlog(ev.data) : '', ev.hora].filter(Boolean).join(' • ')}
                sub={ev.motivo_rejeicao ? `Rejeitado: ${ev.motivo_rejeicao}` : ev.preco}
                badge={stLabel || (ev.homeDestaque ? `Home #${ev.homeOrdem ?? 0}` : undefined)}
                active={editId === ev.id}
                onEdit={() => startEdit(ev)}
                onDelete={() => del(ev.id)}
              />
            );
          })}

        </div>
      </div>
    </div>
  );
}


// ── Shared mini-components ─────────────────────────────────────────────────
function FG({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-[0.3px]">{label}</label>
      {children}
      {error && <span className="text-[11px] font-bold text-[#e74c3c] mt-0.5">{error}</span>}
    </div>
  );
}

function FI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="form-i" />;
}

function FSel({ value, onChange, options, labels }: { value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>; options: string[]; labels?: string[] }) {
  return (
    <select value={value} onChange={onChange} className="form-i appearance-none cursor-pointer">
      {options.map((o, i) => <option key={o} value={o}>{labels?.[i] ?? (o || '— Selecione —')}</option>)}
    </select>
  );
}

function ImgUpload({ img, label }: { img: ReturnType<typeof useImgUpload>; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-[10px]">
      <label className={`inline-flex items-center gap-2 px-4 py-[9px] bg-[#f0f0f0] border border-dashed border-[#ccc] rounded-lg text-[13px] font-semibold text-[#555] transition-all w-fit ${img.uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-[#e8edf5] hover:border-[#4a90e2] hover:text-[#1a3a6b]'}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        {img.uploading ? 'Enviando...' : label}
        <input ref={ref} type="file" accept="image/*" disabled={img.uploading} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) img.handle(f); }} />
      </label>
      {img.preview && (
        <div className="relative w-fit">
          <img src={img.preview} alt="preview" className="max-w-full max-h-[160px] rounded-lg object-cover border border-[#eee]" />
          {img.uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-[11px] font-bold">Enviando...</div>
          )}
        </div>
      )}
      {img.error && <span className="text-[11px] font-bold text-[#e74c3c]">{img.error}</span>}
    </div>
  );
}

function ListItem({ img, title, meta, sub, badge, active, onEdit, onDelete }: { img?: string; title: string; meta?: string; sub?: string; badge?: string; active?: boolean; onEdit?: ()=>void; onDelete: ()=>void }) {
  return (
    <div className={`flex items-center gap-3 border rounded-[10px] px-3 py-[10px] transition-all ${active ? 'bg-[#eef5ff] border-[#1a3a6b] shadow-sm' : 'bg-[#fafafa] border-[#f0f0f0] hover:shadow-sm'}`}>
      <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-[#e0e0e0]" style={img ? { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
      <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
        <span className="text-[13px] font-bold text-[#111] truncate">{title}</span>
        {meta && <span className="text-[11px] text-[#666] truncate">{meta}</span>}
        {sub && <span className="text-[11px] font-bold text-[#1a3a6b]">{sub}</span>}
      </div>
      {badge && (
        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-[3px] rounded-full bg-[#eef5ff] text-[#1a3a6b] border border-[#cfe0ff]">{badge}</span>
      )}
      {onEdit && (
        <button onClick={onEdit} title="Editar" className="w-8 h-8 flex-shrink-0 bg-[#eef5ff] border border-[#cfe0ff] rounded-lg cursor-pointer text-[#1a3a6b] flex items-center justify-center hover:bg-[#1a3a6b] hover:text-white hover:border-[#1a3a6b] transition-all">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      )}
      <button onClick={onDelete} title="Excluir" className="w-8 h-8 flex-shrink-0 bg-[#fff0f0] border border-[#ffd0d0] rounded-lg cursor-pointer text-[#e74c3c] flex items-center justify-center hover:bg-[#e74c3c] hover:text-white hover:border-[#e74c3c] transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  );
}


