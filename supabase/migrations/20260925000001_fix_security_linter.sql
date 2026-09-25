-- Fix Linter Issues

-- 1. Mover pgvector al schema extensions
CREATE SCHEMA IF NOT EXISTS extensions;
-- Por si está en public y queremos moverla
ALTER EXTENSION vector SET SCHEMA extensions;

-- 2. Asegurar search_path = public en handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nombre', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text FROM 1 FOR 4)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    username = EXCLUDED.username,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revocar permisos innecesarios
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- 3. Asegurar search_path = public en match_legal_sources
CREATE OR REPLACE FUNCTION public.match_legal_sources(
    query_embedding extensions.vector(768),
    match_threshold float,
    match_count int,
    filter_category text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    titulo text,
    ley text,
    articulo text,
    contenido text,
    url_fuente text,
    categoria text,
    similitud float
)
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ls.id,
        ls.titulo,
        ls.ley,
        ls.articulo,
        ls.contenido,
        ls.url_fuente,
        ls.categoria,
        1 - (ls.embedding <=> query_embedding) AS similitud
    FROM
        public.legal_sources ls
    WHERE
        1 - (ls.embedding <=> query_embedding) > match_threshold
        AND (filter_category IS NULL OR ls.categoria = filter_category)
    ORDER BY
        ls.embedding <=> query_embedding
    LIMIT
        match_count;
END;
$$;
