import { useRef, useState } from 'react';
import { useDB } from '@/contexts/DBContext';
import type { Grupo } from '@/types';
import { uploadImage } from '@/lib/imageUpload';
import { safeExternalUrl } from '@/lib/utils';

const EMPTY = { nome: '', descricao: '', foto: '', link: '', ordem: 0 };

export default function TabGrupos({ toast }: { toast: (m: string) => void }) {
  const { grupos, saveGrupo, deleteGrupo } = useDB();
  const [form, setForm] = useState<Omit<Grupo, 'id'> & { id?: string }>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function novo() {
    setForm({ ...EMPTY, ordem: grupos.length });
    setErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function editar(g: Grupo) {
    setForm({ ...g });
    setErr('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleFile(file: File) {
    setUploading(true); setErr('');
    try {
      const url = await uploadImage(file, 'grupos');
      set('foto', url);
    } catch (e: any) {
      setErr(e?.message || 'Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  }

  async function salvar() {
    setErr('');
    if (!form.nome.trim()) { setErr('Informe o nome do grupo.'); return; }
    if (!safeExternalUrl(form.link.trim())) { setErr('Informe um link de convite válido (https://chat.whatsapp.com/...).'); return; }
    setSaving(true);
    try {
      await saveGrupo({ ...form, nome: form.nome.trim(), descricao: form.descricao.trim(), link: form.link.trim(), ordem: Number(form.ordem) || 0 });
      toast(form.id ? 'Grupo atualizado!' : 'Grupo adicionado!');
      novo();
    } catch (e: any) {
      setErr(e?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function remover(g: Grupo) {
    if (!confirm(`Remover o grupo "${g.nome}"?`)) return;
    try {
      await deleteGrupo(g.id);
      if (form.id === g.id) novo();
      toast('Grupo removido.');
    } catch (e: any) {
      setErr(e?.message || 'Erro ao remover.');
    }
  }

  /** Move o grupo para cima/baixo, reescrevendo a ordem dos dois envolvidos. */
  async function mover(g: Grupo, dir: -1 | 1) {
    const list = [...grupos].sort((a, b) => a.ordem - b.ordem);
    const i = list.findIndex(x => x.id === g.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    try {
      await saveGrupo({ ...a, ordem: j });
      await saveGrupo({ ...b, ordem: i });
    } catch (e: any) {
      setErr(e?.message || 'Erro ao reordenar.');
    }
  }

  const input = 'w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-[10px] text-sm outline-none focus:border-[#1a3a6b] transition-colors';
  const ordered = [...grupos].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="flex flex-col gap-6">
      {/* Formulário */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e8e8] flex flex-col gap-3 max-w-3xl">
        <h2 className="text-base font-black text-[#111]">{form.id ? 'Editar grupo' : 'Novo grupo'}</h2>

        <label className="text-[12px] font-bold text-[#666]">Nome do grupo</label>
        <input className={input} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Grupo de Ofertas BH" />

        <label className="text-[12px] font-bold text-[#666]">Descrição (2 linhas no card)</label>
        <textarea className={`${input} min-h-[80px] resize-y`} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Promoções e cupons de ingressos..." />

        <label className="text-[12px] font-bold text-[#666]">Link de convite</label>
        <input className={input} value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://chat.whatsapp.com/..." />

        <label className="text-[12px] font-bold text-[#666]">Ordem de exibição (menor aparece primeiro)</label>
        <input type="number" className={input} value={form.ordem} onChange={e => set('ordem', Number(e.target.value))} />

        <label className="text-[12px] font-bold text-[#666]">Foto do grupo</label>
        <div className="flex items-center gap-4 flex-wrap">
          {form.foto && <img src={form.foto} alt="Prévia" className="w-20 h-20 rounded-xl object-cover border border-[#e0e0e0]" />}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="text-[13px]"
          />
          {uploading && <span className="text-[12px] text-[#666]">Enviando…</span>}
          {form.foto && (
            <button onClick={() => set('foto', '')} className="text-[12px] font-bold text-[#e74c3c] bg-transparent border-none cursor-pointer">
              Remover foto
            </button>
          )}
        </div>

        {err && <p className="text-[13px] text-[#e74c3c]">{err}</p>}

        <div className="flex gap-2 mt-1 flex-wrap">
          <button onClick={salvar} disabled={saving || uploading} className="px-5 py-3 bg-[#1a3a6b] text-white border-none rounded-[10px] text-sm font-bold cursor-pointer hover:bg-[#102a4e] transition-colors disabled:opacity-60">
            {saving ? 'Salvando…' : form.id ? 'Salvar alterações' : 'Adicionar grupo'}
          </button>
          {form.id && (
            <button onClick={novo} className="px-5 py-3 bg-[#eee] text-[#333] border-none rounded-[10px] text-sm font-bold cursor-pointer hover:bg-[#e0e0e0] transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e8e8] max-w-3xl">
        <h2 className="text-base font-black text-[#111] mb-4">Grupos ({ordered.length})</h2>
        {ordered.length === 0 && <p className="text-[13px] text-[#888]">Nenhum grupo cadastrado ainda.</p>}
        <div className="flex flex-col gap-2">
          {ordered.map((g, i) => (
            <div key={g.id} className="flex items-center gap-3 p-3 border border-[#eee] rounded-xl">
              <div className="flex flex-col gap-1">
                <button onClick={() => mover(g, -1)} disabled={i === 0} className="w-7 h-6 rounded bg-[#f0f2f7] border-none cursor-pointer text-[11px] font-bold disabled:opacity-30" aria-label="Mover para cima">▲</button>
                <button onClick={() => mover(g, 1)} disabled={i === ordered.length - 1} className="w-7 h-6 rounded bg-[#f0f2f7] border-none cursor-pointer text-[11px] font-bold disabled:opacity-30" aria-label="Mover para baixo">▼</button>
              </div>
              {g.foto
                ? <img src={g.foto} alt="" className="w-12 h-12 rounded-lg object-cover" />
                : <div className="w-12 h-12 rounded-lg bg-[#e5e5e5]" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111] truncate">{g.nome}</p>
                <p className="text-[12px] text-[#777] truncate">{g.descricao || '—'}</p>
              </div>
              <button onClick={() => editar(g)} className="px-3 py-2 bg-[#f0f2f7] border-none rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#e2e6ef] transition-colors">Editar</button>
              <button onClick={() => remover(g)} className="px-3 py-2 bg-[#fdecea] text-[#c0392b] border-none rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#f9d6d2] transition-colors">Excluir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
