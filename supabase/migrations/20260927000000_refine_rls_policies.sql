-- Refinamiento de Políticas RLS para LeyIA Chile (Fase 2 de Seguridad)

-- Limpiar políticas FOR ALL genéricas anteriores en legal_cases
DROP POLICY IF EXISTS "Users can manage their own cases" ON public.legal_cases;
DROP POLICY IF EXISTS "Users can manage their own cases v2" ON public.legal_cases;

CREATE POLICY "Users can select own cases" ON public.legal_cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON public.legal_cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.legal_cases FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON public.legal_cases FOR DELETE USING (auth.uid() = user_id);

-- Limpiar políticas FOR ALL en legal_consultations
DROP POLICY IF EXISTS "Users can manage their own consultations" ON public.legal_consultations;

CREATE POLICY "Users can select own consultations" ON public.legal_consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consultations" ON public.legal_consultations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consultations" ON public.legal_consultations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own consultations" ON public.legal_consultations FOR DELETE USING (auth.uid() = user_id);

-- Limpiar políticas FOR ALL en documents
DROP POLICY IF EXISTS "Users can manage their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;

CREATE POLICY "Users can select own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Políticas para Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can select own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Profile update usually handled by service_role, but if allowed:
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Prevent users from inserting/deleting profiles directly (handled via auth triggers)
