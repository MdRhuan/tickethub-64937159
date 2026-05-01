
CREATE TABLE public.leads (
  id text PRIMARY KEY,
  nome text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  nascimento text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  _ts bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::bigint
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads publicos para leitura" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode apagar leads" ON public.leads FOR DELETE USING (true);
