CREATE TABLE public.grupos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  foto text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.grupos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grupos TO authenticated;
GRANT ALL ON public.grupos TO service_role;

ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grupos publicos para leitura"
  ON public.grupos FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem inserir grupos"
  ON public.grupos FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar grupos"
  ON public.grupos FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem apagar grupos"
  ON public.grupos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_grupos_updated_at
BEFORE UPDATE ON public.grupos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();