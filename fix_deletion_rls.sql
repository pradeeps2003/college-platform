  -- FIX: Allow users to delete their own resources from the database
  DROP POLICY IF EXISTS "Users can delete own resources" ON resources;
  CREATE POLICY "Users can delete own resources" 
  ON public.resources FOR DELETE 
  USING (auth.uid() = uploaded_by);

  -- FIX: Allow users to delete their own files from storage (bucket: resources)
  -- Note: 'storage.objects' uses 'owner' (UUID) to track who uploaded the file
  DROP POLICY IF EXISTS "Users can delete own storage files" ON storage.objects;
  CREATE POLICY "Users can delete own storage files" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'resources' AND 
    (auth.uid()::text = owner OR auth.uid() = owner)
  );

  -- FIX: Allow users to update their own resources (e.g. for status changes or metadata)
  DROP POLICY IF EXISTS "Users can update own resources" ON resources;
  CREATE POLICY "Users can update own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

  -- Ensure admins still have full control (backup)
  DROP POLICY IF EXISTS "Admins can delete everything" ON resources;
  CREATE POLICY "Admins can delete everything" 
  ON resources FOR DELETE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

  DROP POLICY IF EXISTS "Admins can delete any file" ON storage.objects;
  CREATE POLICY "Admins can delete any file" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'resources' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
