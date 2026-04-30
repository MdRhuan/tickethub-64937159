import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection, getDocs, doc, setDoc, deleteDoc, orderBy, query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
      const [evSnap, poSnap, alSnap] = await Promise.all([
        getDocs(query(collection(db, 'eventos'), orderBy('_ts', 'asc'))),
        getDocs(query(collection(db, 'posts'), orderBy('_ts', 'asc'))),
        getDocs(query(collection(db, 'albuns'), orderBy('_ts', 'asc'))),
      ]);
      setEventos(evSnap.docs.map(d => d.data() as Evento));
      setPosts(poSnap.docs.map(d => d.data() as Post));
      setAlbuns(alSnap.docs.map(d => d.data() as Album));
      setReady(true);
    };
    loadAll().catch(() => setReady(true));
  }, []);

  const addEvento = async (ev: Evento) => {
    const data = { ...ev, _ts: Date.now() };
    await setDoc(doc(db, 'eventos', ev.id), data);
    setEventos(prev => [...prev, data]);
  };

  const deleteEvento = async (id: string) => {
    await deleteDoc(doc(db, 'eventos', id));
    setEventos(prev => prev.filter(e => e.id !== id));
  };

  const addPost = async (p: Post) => {
    const data = { ...p, _ts: Date.now() };
    await setDoc(doc(db, 'posts', p.id), data);
    setPosts(prev => [...prev, data]);
  };

  const deletePost = async (id: string) => {
    await deleteDoc(doc(db, 'posts', id));
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const addAlbum = async (al: Album) => {
    const data = { ...al, _ts: Date.now() };
    await setDoc(doc(db, 'albuns', al.id), data);
    setAlbuns(prev => [...prev, data]);
  };

  const deleteAlbum = async (id: string) => {
    await deleteDoc(doc(db, 'albuns', id));
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
