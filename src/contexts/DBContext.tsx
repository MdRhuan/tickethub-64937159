import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Evento } from '@/types';

interface DBContextType {
  eventos: Evento[]; ready: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  addEvento: (ev: Evento) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
}

const DBContext = createContext<DBContextType | null>(null);

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    const { data, error } = await supabase.from('eventos').select('*').order('_ts', { ascending: true });
    if (error) {
      console.error('[DB] Falha ao carregar eventos:', error);
      setLoadError('Não foi possível carregar: eventos.');
    } else {
      setEventos((data ?? []) as unknown as Evento[]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const addEvento = useCallback(async (ev: Evento) => {
    const data = { ...ev, _ts: Date.now() };
    const { error } = await supabase.from('eventos').upsert(data as any);
    if (error) throw error;
    setEventos(prev => [...prev.filter(e => e.id !== ev.id), data]);
  }, []);

  const deleteEvento = useCallback(async (id: string) => {
    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (error) throw error;
    setEventos(prev => prev.filter(e => e.id !== id));
  }, []);

  const value = useMemo(() => ({
    eventos, ready, loadError, reload: loadAll,
    addEvento, deleteEvento,
  }), [eventos, ready, loadError, loadAll, addEvento, deleteEvento]);

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
