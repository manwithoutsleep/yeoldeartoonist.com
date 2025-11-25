-- Create storage bucket for artwork images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'artwork',
    'artwork',
    true,  -- Public bucket (images are publicly accessible)
    10485760,  -- 10MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']  -- Allowed MIME types
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access for artwork images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artwork');

-- Allow authenticated users (admins) to insert files
CREATE POLICY "Authenticated users can upload artwork images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artwork');

-- Allow authenticated users (admins) to update files
CREATE POLICY "Authenticated users can update artwork images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'artwork');

-- Allow authenticated users (admins) to delete files
CREATE POLICY "Authenticated users can delete artwork images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'artwork');
