
-- Add server-side validation constraints on leads table
ALTER TABLE public.leads
  ADD CONSTRAINT leads_nome_length CHECK (char_length(nome) BETWEEN 1 AND 120),
  ADD CONSTRAINT leads_whatsapp_length CHECK (char_length(whatsapp) BETWEEN 6 AND 30),
  ADD CONSTRAINT leads_email_length CHECK (char_length(email) BETWEEN 3 AND 200),
  ADD CONSTRAINT leads_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT leads_nascimento_length CHECK (char_length(nascimento) <= 20),
  ADD CONSTRAINT leads_id_length CHECK (char_length(id) BETWEEN 1 AND 64);
