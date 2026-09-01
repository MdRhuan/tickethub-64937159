import { useMemo, useState } from 'react';
import { useDB } from '@/contexts/DBContext';
import { fmtDataBlog } from '@/lib/utils';
import type { Evento, EventoStatus } from '@/types';

const FILTROS: { key: EventoStatus; label: string }[] = [
  { key: 'pendente', label: 'Pendentes' },
  { key: 'rejeitado', label: 'Rejeitados' },
  { key: 'aprovado', label: 'Aprovados' },
];

export default function TabAprovacoes({ toast }: { toast: (m: string) => void }) {
  const { eventosAll, reviewEvento } = useDB();
  const [filtro, setFiltro] = useState<EventoStatus>('pendente');
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const lista = useMemo(
    () => eventosAll
      .filter(e => (e.status ?? 'aprovado') === filtro)
      .sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0)),
    [eventosAll, filtro],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { pendente: 0, aprovado: 0, rejeitado: 0 };
    eventosAll.forEach(e => { c[e.status ?? 'aprovado'] = (c[e.status ?? 'aprovado'] ?? 0) + 1; });
    return c;
  }, [eventosAll]);

  async function review(ev: Evento, status: 'aprovado' | 'rejeitado') {
    const motivo = (motivos[ev.id] || '').trim();
    if (status === 'rejeitado' && !confirm(`Rejeitar "${ev.titulo}"?`)) return;
    setBusyId(ev.id);
    try {
      await reviewEvento(ev.id, status, motivo);
      toast(status === 'aprovado' ? `Evento "${ev.titulo}" publicado.` : `Evento "${ev.titulo}" rejeitado.`);
      setMotivos(p => ({ ...p, [ev.id]: '' }));
    } catch (err: any) {
      console.error('[Admin] Erro ao revisar evento:', err);
      toast(err?.message ? `Erro: ${err.message}` : 'Erro ao atualizar o evento.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-colors ${
              filtro === f.key
                ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                : 'bg-white text-[#555] border-[#e2e6ee] hover:border-[#1a3a6b]'
            }`}
          >
            {f.label} ({counts[f.key] ?? 0})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-3 flex flex-col gap-3">
        {lista.length === 0 ? (
          <p className="text-[#666] text-[13px] text-center py-10">
            {filtro === 'pendente' ? 'Nenhum evento aguardando aprovação.' : 'Nenhum evento nesta lista.'}
          </p>
        ) : lista.map(ev => (
          <div key={ev.id} className="flex gap-3 border border-[#f0f0f0] bg-[#fafafa] rounded-xl p-3 max-md:flex-col">
            <div
              className="w-16 h-20 rounded-lg flex-shrink-0 bg-[#e0e0e0] max-md:w-full max-md:h-32"
              style={ev.imgUrl ? { backgroundImage: `url(${ev.imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-black text-[#111]">{ev.titulo || '(sem título)'}</span>
                <StatusPill status={(ev.status ?? 'aprovado') as EventoStatus} />
              </div>
              <span className="text-[12px] text-[#666]">
                {[ev.data ? fmtDataBlog(ev.data) : '', ev.hora, ev.local].filter(Boolean).join(' • ')}
              </span>
              {ev.sobre && <p className="text-[12px] text-[#555] line-clamp-3 whitespace-pre-line">{ev.sobre}</p>}
              {ev.motivo_rejeicao && (
                <p className="text-[12px] text-[#c0392b] bg-[#fff2f2] border border-[#ffd6d6] rounded-lg px-2 py-1.5">
                  Motivo da rejeição: {ev.motivo_rejeicao}
                </p>
              )}

              {(ev.status ?? 'aprovado') !== 'aprovado' && (
                <input
                  value={motivos[ev.id] ?? ''}
                  onChange={e => setMotivos(p => ({ ...p, [ev.id]: e.target.value }))}
                  placeholder="Motivo da rejeição (opcional)"
                  className="form-i mt-1"
                />
              )}

              <div className="flex gap-2 mt-1 flex-wrap">
                {(ev.status ?? 'aprovado') !== 'aprovado' && (
                  <button
                    onClick={() => review(ev, 'aprovado')}
                    disabled={busyId === ev.id}
                    className="px-4 py-2 rounded-lg bg-[#1b7a3d] text-white text-[12px] font-bold hover:bg-[#146030] transition-colors disabled:opacity-60"
                  >
                    Aprovar e publicar
                  </button>
                )}
                {(ev.status ?? 'aprovado') !== 'rejeitado' && (
                  <button
                    onClick={() => review(ev, 'rejeitado')}
                    disabled={busyId === ev.id}
                    className="px-4 py-2 rounded-lg bg-[#fff0f0] text-[#c0392b] border border-[#ffd0d0] text-[12px] font-bold hover:bg-[#c0392b] hover:text-white transition-colors disabled:opacity-60"
                  >
                    {(ev.status ?? 'aprovado') === 'aprovado' ? 'Despublicar (rejeitar)' : 'Rejeitar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: EventoStatus }) {
  const map: Record<EventoStatus, string> = {
    pendente: 'bg-[#fff6e0] text-[#9a6700] border-[#f3dfae]',
    aprovado: 'bg-[#e6f7ec] text-[#1b7a3d] border-[#bfe6cd]',
    rejeitado: 'bg-[#fff0f0] text-[#c0392b] border-[#ffd0d0]',
  };
  const label: Record<EventoStatus, string> = {
    pendente: 'Pendente', aprovado: 'Publicado', rejeitado: 'Rejeitado',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-[3px] rounded-full border ${map[status]}`}>
      {label[status]}
    </span>
  );
}
