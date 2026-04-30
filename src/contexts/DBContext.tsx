import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Evento, Post, Album } from '@/types';

interface DBContextType {
  eventos: Evento[];
  posts: Post[];
  albuns: Album[];
  ready: boolean;
  addEvento: (ev: Evento) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  addPost: (p: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addAlbum: (al: Album) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
}

const DBContext = createContext<DBContextType | null>(null);

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      const [evRes, poRes, alRes] = await Promise.all([
        supabase.from('eventos').select('*').order('_ts', { ascending: true }),
        supabase.from('posts').select('*').order('_ts', { ascending: true }),
        supabase.from('albuns').select('*').order('_ts', { ascending: true }),
      ]);
      if (evRes.data) setEventos(evRes.data as unknown as Evento[]);
      if (poRes.data) setPosts(poRes.data as unknown as Post[]);
      if (alRes.data) setAlbuns(alRes.data as unknown as Album[]);
      setReady(true);
    };
    loadAll().catch(() => setReady(true));
  }, []);

  const addEvento = async (ev: Evento) => {
    const data = { ...ev, _ts: Date.now() };
    const { error } = await supabase.from('eventos').upsert(data as any);
    if (error) throw error;
    setEventos(prev => {
      const without = prev.filter(e => e.id !== ev.id);
      return [...without, data];
    });
  };

  const deleteEvento = async (id: string) => {
    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (error) throw error;
    setEventos(prev => prev.filter(e => e.id !== id));
  };

  const addPost = async (p: Post) => {
    const data = { ...p, _ts: Date.now() };
    const { error } = await supabase.from('posts').upsert(data as any);
    if (error) throw error;
    setPosts(prev => {
      const without = prev.filter(e => e.id !== p.id);
      return [...without, data];
    });
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const addAlbum = async (al: Album) => {
    const data = { ...al, _ts: Date.now() };
    const { error } = await supabase.from('albuns').upsert(data as any);
    if (error) throw error;
    setAlbuns(prev => {
      const without = prev.filter(e => e.id !== al.id);
      return [...without, data];
    });
  };

  const deleteAlbum = async (id: string) => {
    const { error } = await supabase.from('albuns').delete().eq('id', id);
    if (error) throw error;
    setAlbuns(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DBContext.Provider value={{
      eventos, posts, albuns, ready,
      addEvento, deleteEvento,
      addPost, deletePost,
      addAlbum, deleteAlbum,
    }}>
      {children}
    </DBContext.Provider>
  );
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
