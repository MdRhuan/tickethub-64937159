
-- EVENTOS: replace permissive write policies with admin-only
DROP POLICY IF EXISTS "Qualquer um pode inserir eventos" ON public.eventos;
DROP POLICY IF EXISTS "Qualquer um pode atualizar eventos" ON public.eventos;
DROP POLICY IF EXISTS "Qualquer um pode apagar eventos" ON public.eventos;

CREATE POLICY "Apenas admins podem inserir eventos"
ON public.eventos FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar eventos"
ON public.eventos FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem apagar eventos"
ON public.eventos FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- POSTS
DROP POLICY IF EXISTS "Qualquer um pode inserir posts" ON public.posts;
DROP POLICY IF EXISTS "Qualquer um pode atualizar posts" ON public.posts;
DROP POLICY IF EXISTS "Qualquer um pode apagar posts" ON public.posts;

CREATE POLICY "Apenas admins podem inserir posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar posts"
ON public.posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem apagar posts"
ON public.posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ALBUNS
DROP POLICY IF EXISTS "Qualquer um pode inserir albuns" ON public.albuns;
DROP POLICY IF EXISTS "Qualquer um pode atualizar albuns" ON public.albuns;
DROP POLICY IF EXISTS "Qualquer um pode apagar albuns" ON public.albuns;

CREATE POLICY "Apenas admins podem inserir albuns"
ON public.albuns FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar albuns"
ON public.albuns FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem apagar albuns"
ON public.albuns FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Revoke direct EXECUTE on has_role from anon/authenticated.
-- RLS policies still work because they execute as the policy owner.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
