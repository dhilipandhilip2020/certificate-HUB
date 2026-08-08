ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS mobile_number TEXT UNIQUE;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public students lookup" ON public.students
  FOR SELECT TO anon USING (true);

CREATE POLICY "public certificates lookup" ON public.certificates
  FOR SELECT TO anon USING (true);

CREATE POLICY "public generated cert storage read" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'generated-certificates');

CREATE POLICY "public generated cert storage signed urls" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'generated-certificates');
