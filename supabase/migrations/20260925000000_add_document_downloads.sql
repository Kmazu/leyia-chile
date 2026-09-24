-- Migration to track document downloads and configure Supabase Storage properly
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public' AND tablename  = 'document_downloads'
    ) THEN
        CREATE TABLE public.document_downloads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
            downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Configurar RLS para document_downloads
ALTER TABLE public.document_downloads ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'document_downloads' AND policyname = 'Users can view their own downloads'
    ) THEN
        CREATE POLICY "Users can view their own downloads" 
            ON public.document_downloads FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'document_downloads' AND policyname = 'Users can insert their own downloads'
    ) THEN
        CREATE POLICY "Users can insert their own downloads" 
            ON public.document_downloads FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
