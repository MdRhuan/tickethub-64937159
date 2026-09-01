ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS criado_por uuid,
  ADD COLUMN IF NOT EXISTS motivo_rejeicao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS revisado_em timestamptz,
  ADD COLUMN IF NOT EXISTS revisado_por uuid;

UPDATE public.eventos SET status = 'aprovado' WHERE status = 'pendente';

ALTER TABLE public.eventos
  ADD CONSTRAINT eventos_status_check CHECK (status IN ('pendente','aprovado','rejeitado'));

CREATE INDEX IF NOT EXISTS eventos_status_idx ON public.eventos (status);

-- trigger: editores só podem gravar status 'pendente'
CREATE OR REPLACE FUNCTION public.eventos_enforce_editor_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'editor') THEN
    NEW.status := 'pendente';
    NEW.motivo_rejeicao := '';
    NEW.revisado_em := NULL;
    NEW.revisado_por := NULL;
    IF TG_OP = 'INSERT' THEN
      NEW.criado_por := auth.uid();
    ELSE
      NEW.criado_por := OLD.criado_por;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Sem permissao para modificar eventos';
END;
$$;

DROP TRIGGER IF EXISTS eventos_enforce_editor_status_trg ON public.eventos;
CREATE TRIGGER eventos_enforce_editor_status_trg
  BEFORE INSERT OR UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.eventos_enforce_editor_status();

-- políticas
DROP POLICY IF EXISTS "Eventos publicos para leitura" ON public.eventos;
DROP POLICY IF EXISTS "Apenas admins podem inserir eventos" ON public.eventos;
DROP POLICY IF EXISTS "Apenas admins podem atualizar eventos" ON public.eventos;

CREATE POLICY "Eventos aprovados sao publicos"
  ON public.eventos FOR SELECT TO anon, authenticated
  USING (
    status = 'aprovado'
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins e editores podem inserir eventos"
  ON public.eventos FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins e editores podem atualizar eventos"
  ON public.eventos FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
