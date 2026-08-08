
CREATE POLICY "admins read cert files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('certificate-templates','generated-certificates') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert cert files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('certificate-templates','generated-certificates') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update cert files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('certificate-templates','generated-certificates') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete cert files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('certificate-templates','generated-certificates') AND public.has_role(auth.uid(),'admin'));
