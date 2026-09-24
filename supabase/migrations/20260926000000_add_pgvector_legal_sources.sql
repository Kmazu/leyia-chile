-- Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla para almacenar fragmentos de leyes y fuentes jurídicas
CREATE TABLE IF NOT EXISTS public.legal_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    ley TEXT NOT NULL,
    articulo TEXT,
    contenido TEXT NOT NULL,
    url_fuente TEXT,
    categoria TEXT,
    embedding vector(768), -- Gemini gemini-embedding-001 con outputDimensionality=768
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS
ALTER TABLE public.legal_sources ENABLE ROW LEVEL SECURITY;

-- Políticas: Cualquiera puede leer (anon y authenticated)
CREATE POLICY "Leyes son públicas para lectura" 
    ON public.legal_sources FOR SELECT 
    USING (true);

-- Políticas: Solo Superadmins pueden insertar/actualizar/eliminar
CREATE POLICY "Superadmin puede gestionar leyes"
    ON public.legal_sources FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'superadmin'
        )
    );

-- Crear índice para acelerar búsqueda por similitud de coseno
CREATE INDEX IF NOT EXISTS legal_sources_embedding_idx ON public.legal_sources USING hnsw (embedding vector_cosine_ops);

-- Función RPC para buscar artículos similares
CREATE OR REPLACE FUNCTION match_legal_sources(
    query_embedding vector(768),
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
