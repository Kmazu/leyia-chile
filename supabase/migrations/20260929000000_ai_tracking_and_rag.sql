-- Tracking and RAG extensions for LeyIA Chile (Fase 4)

-- Modificar legal_consultations para incluir modelo y metadata RAG
ALTER TABLE public.legal_consultations
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS request_id TEXT,
ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb;

-- Crear tabla ai_usage para el control de costos (rate limiting avanzado y auditoría)
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_id TEXT,
    model TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    duration_ms INTEGER,
    endpoint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS para ai_usage
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_usage (Solo lectura para el propio usuario)
CREATE POLICY "Users can view their own ai usage" 
ON public.ai_usage FOR SELECT 
USING (auth.uid() = user_id);

-- Inserción solo permitida mediante Service Role / backend (así evitamos que el cliente falsifique su uso)
-- Por lo tanto, no hay política de INSERT for ALL.
