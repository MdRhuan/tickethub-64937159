
-- Enum de papéis
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de papéis (separada para evitar privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função security definer para verificar papel (evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies em user_roles: apenas o próprio usuário pode ver seus papéis
CREATE POLICY "Usuarios podem ver seus proprios papeis"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Atualizar policies da tabela leads
DROP POLICY IF EXISTS "Leads publicos para leitura" ON public.leads;
DROP POLICY IF EXISTS "Qualquer um pode apagar leads" ON public.leads;

CREATE POLICY "Apenas admins podem ver leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem apagar leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- A policy de INSERT pública continua existindo (popup do site)
