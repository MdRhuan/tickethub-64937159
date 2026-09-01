import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { registerEventoSlugs } from '@/lib/utils';
import type { Evento, Grupo } from '@/types';


interface DBContextType {
  eventos: Evento[]; ready: boolean;
  eventosAll: Evento[];
  grupos: Grupo[];
  loadError: string | null;
  reload: () => Promise<void>;
  addEvento: (ev: Evento) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  reviewEvento: (id: string, status: 'aprovado' | 'rejeitado', motivo?: string) => Promise<void>;
  saveGrupo: (g: Omit<Grupo, 'id'> & { id?: string }) => Promise<void>;
  deleteGrupo: (id: string) => Promise<void>;
}

const DBContext = createContext<DBContextType | null>(null);

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [eventosAll, setEventosAll] = useState<Evento[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGrupos = useCallback(async () => {
    const { data, error } = await supabase.from('grupos').select('*').order('ordem', { ascending: true });
    if (error) {
      console.error('[DB] Falha ao carregar grupos:', error);
      return;
    }
    setGrupos((data ?? []) as unknown as Grupo[]);
  }, []);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    const { data, error } = await supabase.from('eventos').select('*').order('_ts', { ascending: true });
    if (error) {
      console.error('[DB] Falha ao carregar eventos:', error);
      setLoadError('Não foi possível carregar: eventos.');
    } else {
      const rows = (data ?? []) as unknown as Evento[];
      registerEventoSlugs(rows.filter(e => (e.status ?? 'aprovado') === 'aprovado'));
      setEventosAll(rows);
    }
    await loadGrupos();
    setReady(true);
  }, [loadGrupos]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const eventos = useMemo(
    () => eventosAll.filter(e => (e.status ?? 'aprovado') === 'aprovado'),
    [eventosAll],
  );

  const addEvento = useCallback(async (ev: Evento) => {
    const data = { ...ev, _ts: Date.now() };
    const { data: saved, error } = await supabase.from('eventos').upsert(data as any).select().maybeSingle();
    if (error) throw error;
    const row = (saved ?? data) as unknown as Evento;
    setEventosAll(prev => {
      const next = [...prev.filter(e => e.id !== ev.id), row];
      registerEventoSlugs(next.filter(e => (e.status ?? 'aprovado') === 'aprovado'));
      return next;
    });
  }, []);

  const deleteEvento = useCallback(async (id: string) => {
    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (error) throw error;
    setEventosAll(prev => {
      const next = prev.filter(e => e.id !== id);
      registerEventoSlugs(next.filter(e => (e.status ?? 'aprovado') === 'aprovado'));
      return next;
    });
  }, []);

  const reviewEvento = useCallback(async (id: string, status: 'aprovado' | 'rejeitado', motivo = '') => {
    const { data: userData } = await supabase.auth.getUser();
    const patch = {
      status,
      motivo_rejeicao: status === 'rejeitado' ? motivo : '',
      revisado_em: new Date().toISOString(),
      revisado_por: userData.user?.id ?? null,
    };
    const { error } = await supabase.from('eventos').update(patch as any).eq('id', id);
    if (error) throw error;
    setEventosAll(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...patch } as Evento : e);
      registerEventoSlugs(next.filter(e => (e.status ?? 'aprovado') === 'aprovado'));
      return next;
    });
  }, []);


  const saveGrupo = useCallback(async (g: Omit<Grupo, 'id'> & { id?: string }) => {
    const row: Record<string, unknown> = {
      nome: g.nome, descricao: g.descricao, foto: g.foto, link: g.link, ordem: g.ordem,
    };
    if (g.id) row.id = g.id;
    const { error } = await supabase.from('grupos').upsert(row as any);
    if (error) throw error;
    await loadGrupos();
  }, [loadGrupos]);

  const deleteGrupo = useCallback(async (id: string) => {
    const { error } = await supabase.from('grupos').delete().eq('id', id);
    if (error) throw error;
    setGrupos(prev => prev.filter(g => g.id !== id));
  }, []);

  const value = useMemo(() => ({
    eventos, grupos, ready, loadError, reload: loadAll,
    addEvento, deleteEvento, saveGrupo, deleteGrupo,
  }), [eventos, grupos, ready, loadError, loadAll, addEvento, deleteEvento, saveGrupo, deleteGrupo]);

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
