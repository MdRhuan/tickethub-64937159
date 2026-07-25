import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Evento, Album } from '@/types';

interface DBContextType {
  eventos: Evento[]; albuns: Album[]; ready: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  addEvento: (ev: Evento) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  addAlbum: (al: Album) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
}

const DBContext = createContext<DBContextType | null>(null);

const LABELS: Record<string, string> = {
  eventos: 'eventos',
  albuns: 'álbuns',
};

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    const [evRes, alRes] = await Promise.allSettled([
      supabase.from('eventos').select('*').order('_ts', { ascending: true }),
      supabase.from('albuns').select('*').order('_ts', { ascending: true }),
    ]);

    const fails: string[] = [];

    if (evRes.status === 'fulfilled' && !evRes.value.error) {
      setEventos((evRes.value.data ?? []) as unknown as Evento[]);
    } else {
      fails.push('eventos');
      const reason = evRes.status === 'rejected' ? evRes.reason : evRes.value.error;
      console.error('[DB] Falha ao carregar eventos:', reason);
    }

    if (alRes.status === 'fulfilled' && !alRes.value.error) {
      setAlbuns((alRes.value.data ?? []) as unknown as Album[]);
    } else {
      fails.push('albuns');
      const reason = alRes.status === 'rejected' ? alRes.reason : alRes.value.error;
      console.error('[DB] Falha ao carregar álbuns:', reason);
    }

    if (fails.length) {
      console.error('[DB] Falha ao carregar:', fails);
      setLoadError(`Não foi possível carregar: ${fails.map(f => LABELS[f] ?? f).join(', ')}.`);
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

  const addAlbum = useCallback(async (al: Album) => {
    const data = { ...al, _ts: Date.now() };
    const { error } = await supabase.from('albuns').upsert(data as any);
    if (error) throw error;
    setAlbuns(prev => [...prev.filter(e => e.id !== al.id), data]);
  }, []);

  const deleteAlbum = useCallback(async (id: string) => {
    const { error } = await supabase.from('albuns').delete().eq('id', id);
    if (error) throw error;
    setAlbuns(prev => prev.filter(a => a.id !== id));
  }, []);

  const value = useMemo(() => ({
    eventos, albuns, ready, loadError, reload: loadAll,
    addEvento, deleteEvento, addAlbum, deleteAlbum,
  }), [eventos, albuns, ready, loadError, loadAll, addEvento, deleteEvento, addAlbum, deleteAlbum]);

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
