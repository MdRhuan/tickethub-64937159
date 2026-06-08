import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Evento, Post, Album } from '@/types';

interface DBContextType {
  eventos: Evento[]; posts: Post[]; albuns: Album[]; ready: boolean;
  addEvento: (ev: Evento) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  addPost: (p: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addAlbum: (al: Album) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
}

const DBContext = createContext<DBContextType | null>(null);

// Listagem do blog não precisa do texto completo do post.
const POST_LIST_COLUMNS = 'id,titulo,subtitulo,tag,autor,data,imgUrl,destaque,_ts';

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      const [evRes, poRes, alRes] = await Promise.all([
        supabase.from('eventos').select('*').order('_ts', { ascending: true }),
        supabase.from('posts').select(POST_LIST_COLUMNS).order('_ts', { ascending: true }),
        supabase.from('albuns').select('*').order('_ts', { ascending: true }),
      ]);
      if (evRes.data) setEventos(evRes.data as unknown as Evento[]);
      if (poRes.data) setPosts(poRes.data as unknown as Post[]);
      if (alRes.data) setAlbuns(alRes.data as unknown as Album[]);
      setReady(true);
    };
    loadAll().catch(() => setReady(true));
  }, []);

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

  const addPost = useCallback(async (p: Post) => {
    const data = { ...p, _ts: Date.now() };
    const { error } = await supabase.from('posts').upsert(data as any);
    if (error) throw error;
    setPosts(prev => [...prev.filter(e => e.id !== p.id), data]);
  }, []);

  const deletePost = useCallback(async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    setPosts(prev => prev.filter(p => p.id !== id));
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
    eventos, posts, albuns, ready,
    addEvento, deleteEvento, addPost, deletePost, addAlbum, deleteAlbum,
  }), [eventos, posts, albuns, ready, addEvento, deleteEvento, addPost, deletePost, addAlbum, deleteAlbum]);

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
