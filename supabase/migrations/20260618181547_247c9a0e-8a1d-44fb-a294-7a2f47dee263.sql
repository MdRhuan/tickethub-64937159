-- 1. Remove public INSERT policy on leads
DROP POLICY IF EXISTS "Qualquer um pode inserir leads" ON public.leads;

-- 2. Create lead_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.lead_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_attempts_ip_time
  ON public.lead_attempts (ip_hash, created_at);

-- Only service_role can touch this table
GRANT ALL ON public.lead_attempts TO service_role;

ALTER TABLE public.lead_attempts ENABLE ROW LEVEL SECURITY;
-- No policies: blocked for anon/authenticated; service_role bypasses RLS.