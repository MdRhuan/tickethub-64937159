DROP POLICY IF EXISTS "Apenas admins podem ver lead_attempts" ON public.lead_attempts;
DROP POLICY IF EXISTS "Apenas admins podem ver leads" ON public.leads;
DROP POLICY IF EXISTS "Apenas admins podem apagar leads" ON public.leads;
DROP POLICY IF EXISTS "Qualquer um pode inserir leads" ON public.leads;
DROP POLICY IF EXISTS "Leads publicos para leitura" ON public.leads;
DROP POLICY IF EXISTS "Qualquer um pode apagar leads" ON public.leads;

DROP TABLE IF EXISTS public.lead_attempts;
DROP TABLE IF EXISTS public.leads;