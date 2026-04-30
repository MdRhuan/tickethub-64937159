
CREATE TABLE public.eventos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL DEFAULT '',
  sobre TEXT NOT NULL DEFAULT '',
  atracoes JSONB NOT NULL DEFAULT '[]'::jsonb,
  data TEXT NOT NULL DEFAULT '',
  hora TEXT NOT NULL DEFAULT '',
  local TEXT NOT NULL DEFAULT '',
  "mapaUrl" TEXT NOT NULL DEFAULT '',
  classificacao TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL DEFAULT '',
  "imgUrl" TEXT NOT NULL DEFAULT '',
  "imgBanner" TEXT NOT NULL DEFAULT '',
  ing1 JSONB,
  ing2 JSONB,
  ing3 JSONB,
  "tagCard" TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  preco TEXT NOT NULL DEFAULT '',
  "corCal" TEXT NOT NULL DEFAULT 'azul',
  _ts BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::bigint,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.posts (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL DEFAULT '',
  subtitulo TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  autor TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL DEFAULT '',
  "imgUrl" TEXT NOT NULL DEFAULT '',
  conteudo TEXT NOT NULL DEFAULT '',
  destaque BOOLEAN NOT NULL DEFAULT false,
  _ts BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::bigint,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.albuns (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL DEFAULT '',
  capa TEXT NOT NULL DEFAULT '',
  fotos JSONB NOT NULL DEFAULT '[]'::jsonb,
  _ts BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::bigint,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albuns ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Eventos publicos para leitura" ON public.eventos FOR SELECT USING (true);
CREATE POLICY "Posts publicos para leitura" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Albuns publicos para leitura" ON public.albuns FOR SELECT USING (true);

-- Public write (matches Firestore-no-auth behavior; should be tightened with auth later)
CREATE POLICY "Qualquer um pode inserir eventos" ON public.eventos FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar eventos" ON public.eventos FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode apagar eventos" ON public.eventos FOR DELETE USING (true);

CREATE POLICY "Qualquer um pode inserir posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar posts" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode apagar posts" ON public.posts FOR DELETE USING (true);

CREATE POLICY "Qualquer um pode inserir albuns" ON public.albuns FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar albuns" ON public.albuns FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode apagar albuns" ON public.albuns FOR DELETE USING (true);
