-- Configurar Bucket 'documents' como privado y aplicar políticas RLS en storage.objects

-- 1. Asegurarnos de que el bucket 'documents' exista y sea privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Habilitar RLS en storage.objects (por defecto suele estar, pero es buena práctica)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Limpiar políticas previas en 'documents'
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- 4. Crear Políticas RLS Granulares para Storage
-- NOTA: El path típico de LeyIA Chile es 'user_id/...'
-- Supabase Storage path tokens: (storage.foldername(name))[1] === user_id

-- SELECT (Leer): Sólo el propietario del archivo puede leerlo
CREATE POLICY "Users can view their own documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- INSERT (Subir): Sólo el propietario puede subir a su carpeta
CREATE POLICY "Users can upload their own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- UPDATE (Actualizar): Sólo el propietario puede actualizar sus archivos
CREATE POLICY "Users can update their own documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE (Eliminar): Sólo el propietario puede eliminar sus archivos
CREATE POLICY "Users can delete their own documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
