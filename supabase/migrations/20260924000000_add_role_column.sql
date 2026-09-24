-- Add role column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin'));
    END IF;
END $$;

-- Add query_count column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='query_count') THEN
        ALTER TABLE public.profiles ADD COLUMN query_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add query_reset_date column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='query_reset_date') THEN
        ALTER TABLE public.profiles ADD COLUMN query_reset_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Add RLS policy for admin read access
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can read all profiles'
    ) THEN
        CREATE POLICY "Admins can read all profiles" ON public.profiles
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin'
                )
            );
    END IF;
END $$;

-- Update Glenn Montiel's profile to superadmin
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE email ILIKE '%montielglenn%' OR nombre ILIKE '%glenn%';
