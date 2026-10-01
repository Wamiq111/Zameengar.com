-- =============================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- (Dashboard -> SQL Editor -> New Query -> Paste -> Run)
-- =============================================

-- PROPERTY-IMAGES BUCKET POLICIES (on storage.objects)

-- 1. Anyone can view/download property images
CREATE POLICY "Public read property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- 2. Authenticated users can upload property images
CREATE POLICY "Authenticated users upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- 3. Authenticated users can update their uploads
CREATE POLICY "Authenticated users update property images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- 4. Authenticated users can delete their uploads
CREATE POLICY "Authenticated users delete property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');


-- AVATARS BUCKET POLICIES

-- 5. Anyone can view avatars
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 6. Authenticated users can upload avatars
CREATE POLICY "Authenticated users upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 7. Authenticated users can update avatars
CREATE POLICY "Authenticated users update avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 8. Authenticated users can delete avatars
CREATE POLICY "Authenticated users delete avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
