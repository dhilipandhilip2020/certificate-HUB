CREATE POLICY "public generated cert storage signed urls anon" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'generated-certificates');
