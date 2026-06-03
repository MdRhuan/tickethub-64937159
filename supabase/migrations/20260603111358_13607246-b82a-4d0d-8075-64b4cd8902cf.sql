
CREATE POLICY "Imagens leitura publica"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagens');

CREATE POLICY "Admins podem inserir imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagens' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins podem atualizar imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagens' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'imagens' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins podem apagar imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagens' AND public.has_role(auth.uid(), 'admin'::public.app_role));
