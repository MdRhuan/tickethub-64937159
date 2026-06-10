ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS "homeDestaque" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "homeOrdem" integer NOT NULL DEFAULT 0;