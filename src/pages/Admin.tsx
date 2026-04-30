import { useState, useRef, useEffect } from 'react';
import { useDB } from '@/contexts/DBContext';
import type { Evento, Post, Album, Atracao } from '@/types';
import { fmtDataBlog } from '@/lib/utils';

const PASS = 'tickethub';
type Tab = 'eventos' | 'blog' | 'albuns';

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
function useImgUpload() {
  const [preview, setPreview] = useState('');
  const [data, setData] = useState('');
  function handle(file: File) {
    const reader = new FileReader();
    reader.onload = e => { const r = e.target?.result as string; setPreview(r); setData(r); };
    reader.readAsDataURL(file);
  }
  function reset() { setPreview(''); setData(''); }
  return { preview, data, handle, reset };
}

// ── Main Admin component ───────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('th_admin') === '1');
  const [pass, setPass]     = useState('');
  const [passErr, setPassErr] = useState(false);
  const [tab, setTab] = useState<Tab>('eventos');
  const { toast, msg, show } = useToast();

  function doLogin() {
    if (pass === PASS) { sessionStorage.setItem('th_admin','1'); setAuthed(true); }
    else setPassErr(true);
  }

  function doLogout() { sessionStorage.removeItem('th_admin'); setAuthed(false); }

  if (!authed) return <LoginScreen pass={pass} setPass={setPass} passErr={passErr} onLogin={doLogin} />;

  return (
    <div className="flex min-h-screen bg-[#f0f2f7]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#1a3a6b] min-h-screen fixed top-0 left-0 flex flex-col z-50 max-md:w-full max-md:min-h-0 max-md:h-14 max-md:flex-row max-md:items-center max-md:justify-between max-md:px-3">
        <div className="flex items-center gap-[10px] px-5 py-[22px] font-black text-[13px] tracking-wide text-white border-b border-white/10 max-md:py-0 max-md:px-0 max-md:border-0">
          <img src="/Icon/Logo.png" alt="TH" className="w-[34px] h-[34px] object-contain" />
          TICKET HUB
        </div>
        <nav className="flex-1 flex flex-col p-3 gap-1 max-md:flex-row max-md:p-0 max-md:gap-1">
          {([['eventos','Eventos'],['blog','Blog'],['albuns','Fotos']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-3 px-[14px] py-[11px] border-none rounded-[10px] text-sm font-bold cursor-pointer text-left transition-all max-md:px-3 max-md:py-2 max-md:text-[12px] max-md:rounded-lg ${tab === t ? 'bg-white/15 text-white' : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 flex flex-col gap-[6px] max-md:flex-row max-md:border-0 max-md:p-0 max-md:gap-1">
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
            {tab === 'eventos' ? 'Eventos' : tab === 'blog' ? 'Blog' : 'Fotos'}
          </h1>
          <p className="text-[13px] text-[#999] mt-0.5">
            {tab === 'eventos' ? 'Gerencie os eventos do site' : tab === 'blog' ? 'Gerencie os posts do blog' : 'Gerencie os álbuns de fotos'}
          </p>
        </div>

        <div className="p-9 pb-16 max-md:p-5">
          {tab === 'eventos' && <TabEventos toast={toast} />}
          {tab === 'blog'    && <TabBlog    toast={toast} />}
          {tab === 'albuns'  && <TabAlbuns  toast={toast} />}
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
function LoginScreen({ pass, setPass, passErr, onLogin }: { pass: string; setPass: (v:string)=>void; passErr: boolean; onLogin: ()=>void }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0d1a2e] to-[#1a3a6b] flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-[20px] px-10 py-12 w-full max-w-[400px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col items-center gap-4">
        <div className="flex items-center gap-[10px] font-black text-base tracking-wide">
          <img src="/Icon/Logo.png" alt="TH" className="w-[42px] h-[42px] object-contain" />
          TICKET HUB
        </div>
        <h1 className="text-[22px] font-black text-[#111]">Painel Administrativo</h1>
        <p className="text-[13px] text-[#888]">Digite a senha para acessar o painel.</p>
        <div className="flex gap-2 w-full">
          <input
            type="password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
            placeholder="Senha"
            className="flex-1 px-4 py-3 border-2 border-[#e0e0e0] rounded-[10px] text-sm outline-none focus:border-[#1a3a6b] transition-colors"
          />
          <button onClick={onLogin} className="px-5 py-3 bg-[#1a3a6b] text-white border-none rounded-[10px] text-sm font-bold cursor-pointer hover:bg-[#102a4e] transition-colors whitespace-nowrap btn-pulse">
            Entrar
          </button>
        </div>
        {passErr && <p className="text-[13px] text-[#e74c3c]">Senha incorreta. Tente novamente.</p>}
      </div>
    </div>
  );
}

// ── TAB EVENTOS ────────────────────────────────────────────────────────────
function TabEventos({ toast }: { toast: (m:string)=>void }) {
  const { eventos, addEvento, deleteEvento } = useDB();
  const [saving, setSaving] = useState(false);
  const [atracoes, setAtracoes] = useState<Atracao[]>([]);
  const img = useImgUpload();
  const banner = useImgUpload();

  const [form, setForm] = useState({
    titulo:'', sobre:'', data:'', hora:'', local:'', mapaUrl:'',
    classificacao:'Livre', categoria:'', ing1Nome:'', ing1Link:'',
    ing2Nome:'', ing2Link:'', ing3Nome:'', ing3Link:'',
    tagCard:'', badge:'', preco:'', corCal:'azul',
  });

  function f(k: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(p => ({...p, [k]: e.target.value})); }

  function addAt() { if (atracoes.length < 7) setAtracoes(p => [...p, { nome:'', foto:'' }]); }
  function removeAt(i: number) { setAtracoes(p => p.filter((_,j) => j !== i)); }
  function setAt(i: number, key: keyof Atracao, val: string) {
    setAtracoes(p => p.map((a, j) => j === i ? { ...a, [key]: val } : a));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const ev: Evento = {
      id: Date.now().toString(),
      titulo: form.titulo, sobre: form.sobre,
      atracoes: atracoes.filter(a => a.nome || a.foto),
      data: form.data, hora: form.hora, local: form.local,
      mapaUrl: form.mapaUrl, classificacao: form.classificacao,
      categoria: form.categoria.toUpperCase(),
      imgUrl: img.data, imgBanner: banner.data,
      ing1: form.ing1Nome ? { nome: form.ing1Nome, link: form.ing1Link } : null,
      ing2: form.ing2Nome ? { nome: form.ing2Nome, link: form.ing2Link } : null,
      ing3: form.ing3Nome ? { nome: form.ing3Nome, link: form.ing3Link } : null,
      tagCard: form.tagCard.toUpperCase(), badge: form.badge,
      preco: form.preco, corCal: form.corCal as Evento['corCal'],
    };
    try {
      await addEvento(ev);
      setForm({ titulo:'', sobre:'', data:'', hora:'', local:'', mapaUrl:'', classificacao:'Livre', categoria:'', ing1Nome:'', ing1Link:'', ing2Nome:'', ing2Link:'', ing3Nome:'', ing3Link:'', tagCard:'', badge:'', preco:'', corCal:'azul' });
      setAtracoes([]); img.reset(); banner.reset();
      toast('Evento adicionado com sucesso!');
    } catch { toast('Erro ao salvar evento.'); }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Remover este evento?')) return;
    try { await deleteEvento(id); toast('Evento removido.'); }
    catch { toast('Erro ao remover evento.'); }
  }

  return (
    <div className="grid grid-cols-2 gap-6 items-start max-md:grid-cols-1">
      {/* Form */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-black text-[#111]">Novo Evento</h2>
        </div>
        <form onSubmit={submit} className="px-[22px] py-5 flex flex-col gap-[14px]">
          <FG label="Nome do evento *"><FI required value={form.titulo} onChange={f('titulo')} placeholder="Ex: Show do Artista XYZ" /></FG>
          <FG label="Sobre o evento"><textarea className="form-i resize-y min-h-[70px] leading-[1.5]" value={form.sobre} onChange={f('sobre')} placeholder="Descrição..." /></FG>

          <FG label={`Atrações (${atracoes.length}/7)`}>
            <div className="flex flex-col gap-2">
              {atracoes.map((at, i) => (
                <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                  <FI value={at.nome} onChange={e => setAt(i,'nome',e.target.value)} placeholder="Nome" />
                  <FI value={at.foto} onChange={e => setAt(i,'foto',e.target.value)} placeholder="URL da foto" />
                  <button type="button" onClick={() => removeAt(i)} className="w-8 h-8 bg-[#fee] text-[#c0392b] border-none rounded-lg cursor-pointer text-[13px] hover:bg-[#c0392b] hover:text-white transition-colors flex-shrink-0">✕</button>
                </div>
              ))}
              {atracoes.length < 7 && (
                <button type="button" onClick={addAt} className="px-[14px] py-[7px] bg-[#f0f4ff] text-[#1a3a6b] border border-dashed border-[#1a3a6b] rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#dce8ff] transition-colors self-start">+ Adicionar atração</button>
              )}
            </div>
          </FG>

          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Local & Data</div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Data *"><input type="date" required value={form.data} onChange={f('data')} className="form-i" /></FG>
            <FG label="Horário"><input type="time" value={form.hora} onChange={f('hora')} className="form-i" /></FG>
          </div>
          <FG label="Local"><FI value={form.local} onChange={f('local')} placeholder="Ex: Arena XYZ" /></FG>
          <FG label="Link Google Maps"><FI value={form.mapaUrl} onChange={f('mapaUrl')} placeholder="https://..." /></FG>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Classificação"><FSel value={form.classificacao} onChange={f('classificacao')} options={['Livre','12+','14+','16+','18+']} /></FG>
            <FG label="Estilo musical"><FSel value={form.categoria} onChange={f('categoria')} options={['','FUNK','SERTANEJO','PAGODE','ROCK','POP','ELETRÔNICO','MPB','TRAP','JAZZ']} /></FG>
          </div>

          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Imagens</div>
          <FG label="Capa (400×500 px)"><ImgUpload img={img} label="Subir imagem" /></FG>
          <FG label="Banner (1440×500 px)"><ImgUpload img={banner} label="Subir imagem" /></FG>

          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Ingressos</div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Ingresso 01"><FI value={form.ing1Nome} onChange={f('ing1Nome')} placeholder="Nome" /></FG>
            <FG label="Link de compra"><FI value={form.ing1Link} onChange={f('ing1Link')} placeholder="https://..." /></FG>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Lounge/Camarote"><FI value={form.ing2Nome} onChange={f('ing2Nome')} placeholder="Nome" /></FG>
            <FG label="Link de compra"><FI value={form.ing2Link} onChange={f('ing2Link')} placeholder="https://..." /></FG>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Condições Especiais"><FI value={form.ing3Nome} onChange={f('ing3Nome')} placeholder="Nome" /></FG>
            <FG label="Link"><FI value={form.ing3Link} onChange={f('ing3Link')} placeholder="https://..." /></FG>
          </div>

          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Card & Calendário</div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Tag do card"><FSel value={form.tagCard} onChange={f('tagCard')} options={['','DESTAQUE','NOVO','ESGOTANDO','ÚLTIMO LOTE','EXCLUSIVO']} /></FG>
            <FG label="Cor da tag"><FSel value={form.badge} onChange={f('badge')} options={['','destaque','esgotando']} labels={['Padrão (preto)','Azul','Laranja']} /></FG>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Preço a partir de"><FI value={form.preco} onChange={f('preco')} placeholder="R$ 50,00" /></FG>
            <FG label="Cor no calendário"><FSel value={form.corCal} onChange={f('corCal')} options={['azul','verde','vermelho']} labels={['Azul','Verde','Vermelho']} /></FG>
          </div>

          <button type="submit" disabled={saving} className="px-[22px] py-[11px] bg-[#1a3a6b] text-white border-none rounded-[9px] text-[13px] font-bold cursor-pointer hover:bg-[#102a4e] transition-colors self-start mt-[6px] disabled:opacity-60 btn-pulse">
            {saving ? 'Salvando...' : 'Adicionar Evento'}
          </button>
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
            <p className="text-[#bbb] text-[13px] text-center py-7">Nenhum evento cadastrado.</p>
          ) : [...eventos].reverse().map(ev => (
            <ListItem key={ev.id} img={ev.imgUrl} title={ev.titulo} meta={[ev.data ? fmtDataBlog(ev.data) : '', ev.hora].filter(Boolean).join(' • ')} sub={ev.preco} onDelete={() => del(ev.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TAB BLOG ───────────────────────────────────────────────────────────────
function TabBlog({ toast }: { toast: (m:string)=>void }) {
  const { posts, addPost, deletePost } = useDB();
  const [saving, setSaving] = useState(false);
  const img = useImgUpload();
  const [form, setForm] = useState({ titulo:'', subtitulo:'', tag:'', autor:'', data:'', conteudo:'', destaque: false });
  function f(k: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(p => ({...p, [k]: e.target.value})); }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const p: Post = {
      id: Date.now().toString(),
      titulo: form.titulo, subtitulo: form.subtitulo,
      tag: form.tag.toUpperCase(), autor: form.autor || 'Ticket Hub',
      data: form.data, imgUrl: img.data,
      conteudo: form.conteudo, destaque: form.destaque,
    };
    try {
      await addPost(p);
      setForm({ titulo:'', subtitulo:'', tag:'', autor:'', data:'', conteudo:'', destaque: false });
      img.reset();
      toast('Post adicionado com sucesso!');
    } catch { toast('Erro ao salvar post.'); }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Remover este post?')) return;
    try { await deletePost(id); toast('Post removido.'); }
    catch { toast('Erro ao remover post.'); }
  }

  return (
    <div className="grid grid-cols-2 gap-6 items-start max-md:grid-cols-1">
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-black text-[#111]">Novo Post</h2>
        </div>
        <form onSubmit={submit} className="px-[22px] py-5 flex flex-col gap-[14px]">
          <FG label="Título *"><FI required value={form.titulo} onChange={f('titulo')} placeholder="Ex: 5 dicas para aproveitar shows" /></FG>
          <FG label="Resumo / Subtítulo"><textarea className="form-i resize-y min-h-[70px]" value={form.subtitulo} onChange={f('subtitulo')} placeholder="Breve descrição..." /></FG>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Tag"><FSel value={form.tag} onChange={f('tag')} options={['','DICAS','MÚSICA','GUIA','NOTÍCIAS','EVENTOS','CULTURA','ENTRETENIMENTO']} /></FG>
            <FG label="Autor"><FI value={form.autor} onChange={f('autor')} placeholder="Ticket Hub" /></FG>
          </div>
          <FG label="Data de publicação *"><input type="date" required value={form.data} onChange={f('data')} className="form-i" /></FG>
          <FG label="Imagem (800×500 px)"><ImgUpload img={img} label="Subir imagem" /></FG>
          <FG label="Conteúdo"><textarea className="form-i resize-y min-h-[150px]" value={form.conteudo} onChange={f('conteudo')} placeholder="Escreva aqui o texto completo do post..." /></FG>
          <label className="flex items-center gap-[9px] cursor-pointer py-1">
            <input type="checkbox" checked={form.destaque} onChange={e => setForm(p => ({...p, destaque: e.target.checked}))} className="w-4 h-4 cursor-pointer accent-[#1a3a6b]" />
            <span className="text-[13px] text-[#555]">Marcar como post em destaque</span>
          </label>
          <button type="submit" disabled={saving} className="px-[22px] py-[11px] bg-[#1a3a6b] text-white border-none rounded-[9px] text-[13px] font-bold cursor-pointer hover:bg-[#102a4e] transition-colors self-start mt-[6px] disabled:opacity-60 btn-pulse">
            {saving ? 'Salvando...' : 'Adicionar Post'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-black text-[#111]">Posts Cadastrados</h2>
          <span className="inline-flex items-center justify-center bg-[#eef5ff] text-[#1a3a6b] text-[12px] font-bold px-[10px] py-[3px] rounded-full">{posts.length}</span>
        </div>
        <div className="p-3 flex flex-col gap-2 max-h-[560px] overflow-y-auto">
          {posts.length === 0 ? (
            <p className="text-[#bbb] text-[13px] text-center py-7">Nenhum post cadastrado.</p>
          ) : [...posts].reverse().map(p => (
            <ListItem key={p.id} img={p.imgUrl} title={p.titulo} meta={[fmtDataBlog(p.data), p.tag].filter(Boolean).join(' • ')} sub={p.destaque ? '⭐ DESTAQUE' : undefined} onDelete={() => del(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TAB ÁLBUNS ─────────────────────────────────────────────────────────────
function TabAlbuns({ toast }: { toast: (m:string)=>void }) {
  const { albuns, addAlbum, deleteAlbum } = useDB();
  const [saving, setSaving] = useState(false);
  const capa = useImgUpload();
  const [form, setForm] = useState({ nome: '', data: '', link: '' });
  const [fotos, setFotos] = useState<string[]>([]);

  function f(k: string) { return (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({...p, [k]: e.target.value})); }

  function addFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setFotos(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const al: Album = {
      id: Date.now().toString(),
      nome: form.nome, data: form.data,
      capa: capa.data, link: form.link.trim(),
      fotos: [...fotos],
    };
    try {
      await addAlbum(al);
      setForm({ nome:'', data:'', link:'' }); capa.reset(); setFotos([]);
      toast('Álbum criado com sucesso!');
    } catch { toast('Erro ao salvar álbum.'); }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Excluir este álbum?')) return;
    try { await deleteAlbum(id); toast('Álbum excluído.'); }
    catch { toast('Erro ao excluir álbum.'); }
  }

  return (
    <div className="grid grid-cols-2 gap-6 items-start max-md:grid-cols-1">
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-black text-[#111]">Novo Álbum</h2>
        </div>
        <form onSubmit={submit} className="px-[22px] py-5 flex flex-col gap-[14px]">
          <FG label="Nome do Evento *"><FI required value={form.nome} onChange={f('nome')} placeholder="Ex: Baile da Saudade" /></FG>
          <FG label="Data do Evento *"><input type="date" required value={form.data} onChange={f('data')} className="form-i" /></FG>
          <FG label="Link do Álbum (externo)"><FI type="url" value={form.link} onChange={f('link')} placeholder="https://..." /></FG>
          <FG label="Capa do Álbum"><ImgUpload img={capa} label="Subir imagem" /></FG>
          <div className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1a3a6b] border-b-2 border-[#e8edf5] pb-[6px] my-2">Fotos do Álbum</div>
          <FG label="Adicionar fotos">
            <label className="inline-flex items-center gap-2 px-4 py-[9px] bg-[#f0f0f0] border border-dashed border-[#ccc] rounded-lg text-[13px] font-semibold text-[#555] cursor-pointer hover:bg-[#e8edf5] hover:border-[#4a90e2] hover:text-[#1a3a6b] transition-all w-fit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Subir fotos (múltiplas)
              <input type="file" accept="image/*" multiple className="hidden" onChange={addFotos} />
            </label>
            {fotos.length > 0 && (
              <>
                <div className="grid gap-2 mt-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}>
                  {fotos.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-md border border-[#eee]" />
                  ))}
                </div>
                <p className="text-[12px] text-[#4a90e2] font-semibold mt-[6px]">{fotos.length} foto(s) adicionada(s)</p>
              </>
            )}
          </FG>
          <button type="submit" disabled={saving} className="px-[22px] py-[11px] bg-[#1a3a6b] text-white border-none rounded-[9px] text-[13px] font-bold cursor-pointer hover:bg-[#102a4e] transition-colors self-start mt-[6px] disabled:opacity-60 btn-pulse">
            {saving ? 'Salvando...' : 'Criar Álbum'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#f2f2f2]">
          <h2 className="text-[15px] font-black text-[#111]">Álbuns Cadastrados</h2>
          <span className="inline-flex items-center justify-center bg-[#eef5ff] text-[#1a3a6b] text-[12px] font-bold px-[10px] py-[3px] rounded-full">{albuns.length}</span>
        </div>
        <div className="p-3 flex flex-col gap-2 max-h-[560px] overflow-y-auto">
          {albuns.length === 0 ? (
            <p className="text-[#bbb] text-[13px] text-center py-7">Nenhum álbum cadastrado.</p>
          ) : [...albuns].reverse().map(al => (
            <ListItem key={al.id} img={al.capa} title={al.nome} meta={fmtDataBlog(al.data) + ' • ' + (al.fotos?.length || 0) + ' foto(s)'} onDelete={() => del(al.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared mini-components ─────────────────────────────────────────────────
function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-[0.3px]">{label}</label>
      {children}
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
      <label className="inline-flex items-center gap-2 px-4 py-[9px] bg-[#f0f0f0] border border-dashed border-[#ccc] rounded-lg text-[13px] font-semibold text-[#555] cursor-pointer hover:bg-[#e8edf5] hover:border-[#4a90e2] hover:text-[#1a3a6b] transition-all w-fit">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        {label}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) img.handle(f); }} />
      </label>
      {img.preview && <img src={img.preview} alt="preview" className="max-w-full max-h-[160px] rounded-lg object-cover border border-[#eee]" />}
    </div>
  );
}

function ListItem({ img, title, meta, sub, onDelete }: { img?: string; title: string; meta?: string; sub?: string; onDelete: ()=>void }) {
  return (
    <div className="flex items-center gap-3 bg-[#fafafa] border border-[#f0f0f0] rounded-[10px] px-3 py-[10px] hover:shadow-sm transition-shadow">
      <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-[#e0e0e0]" style={img ? { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
      <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
        <span className="text-[13px] font-bold text-[#111] truncate">{title}</span>
        {meta && <span className="text-[11px] text-[#999] truncate">{meta}</span>}
        {sub && <span className="text-[11px] font-bold text-[#1a3a6b]">{sub}</span>}
      </div>
      <button onClick={onDelete} className="w-8 h-8 flex-shrink-0 bg-[#fff0f0] border border-[#ffd0d0] rounded-lg cursor-pointer text-[#e74c3c] flex items-center justify-center hover:bg-[#e74c3c] hover:text-white hover:border-[#e74c3c] transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  );
}

// Global style for form inputs — injected via a style tag
// (Tailwind utility via a custom class in index.css would be ideal but this works for Lovable)
const FormInputStyle = () => (
  <style>{`
    .form-i {
      padding: 9px 13px;
      border: 1.5px solid #e0e0e0;
      border-radius: 8px;
      font-size: 13px;
      color: #333;
      background: #fafafa;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      font-family: Arial, sans-serif;
      width: 100%;
    }
    .form-i:focus { border-color: #4a90e2; background: #fff; }
  `}</style>
);

// Inject styles
export { FormInputStyle };
