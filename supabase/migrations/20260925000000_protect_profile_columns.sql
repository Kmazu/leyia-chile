-- Proteger columnas críticas en perfiles: plan, role, query_count
-- Solo el rol service_role (backend/admin de supabase) puede modificarlas.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'protect_profile_privileged_columns') THEN
        CREATE FUNCTION public.protect_profile_privileged_columns()
        RETURNS TRIGGER AS $func$
        BEGIN
            -- Si la modificación proviene de un usuario normal (anon, authenticated, etc)
            -- revertimos silenciosamente los cambios en estas 3 columnas a su valor anterior.
            IF auth.role() <> 'service_role' THEN
                NEW.plan := OLD.plan;
                NEW.role := OLD.role;
                NEW.query_count := OLD.query_count;
            END IF;
            
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'protect_profile_privileged_columns_trg' 
        AND tgrelid = 'public.profiles'::regclass
    ) THEN
        CREATE TRIGGER protect_profile_privileged_columns_trg
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();
    END IF;
END $$;
