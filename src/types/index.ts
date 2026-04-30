export interface Atracao {
  nome: string;
  foto: string;
}

export interface Ingresso {
  nome: string;
  link: string;
}

export interface Evento {
  id: string;
  titulo: string;
  sobre: string;
  atracoes: Atracao[];
  data: string;
  hora: string;
  local: string;
  mapaUrl: string;
  classificacao: string;
  categoria: string;
  imgUrl: string;
  imgBanner: string;
  ing1: Ingresso | null;
  ing2: Ingresso | null;
  ing3: Ingresso | null;
  tagCard: string;
  badge: string;
  preco: string;
  corCal: 'azul' | 'verde' | 'vermelho';
  _ts?: number;
}

export interface Post {
  id: string;
  titulo: string;
  subtitulo: string;
  tag: string;
  autor: string;
  data: string;
  imgUrl: string;
  conteudo: string;
  destaque: boolean;
  _ts?: number;
}

export interface Album {
  id: string;
  nome: string;
  data: string;
  capa: string;
  link?: string;
  fotos: string[];
  _ts?: number;
}
