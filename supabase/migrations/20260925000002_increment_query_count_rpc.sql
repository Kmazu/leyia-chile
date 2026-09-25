-- Migración para crear función RPC de incremento atómico del contador de consultas
-- Soluciona la condición de carrera (race condition) al usar el servicio de IA concurrente.

CREATE OR REPLACE FUNCTION increment_query_count(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios del creador de la función para saltar RLS en este campo específico
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET query_count = query_count + 1
  WHERE id = user_id;
END;
$$;

-- Revocar acceso público (anon/authenticated) por seguridad, sólo service_role podrá llamarlo desde el backend
REVOKE EXECUTE ON FUNCTION increment_query_count(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_query_count(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION increment_query_count(UUID) FROM anon;

-- Solo permitir al rol de servicio
GRANT EXECUTE ON FUNCTION increment_query_count(UUID) TO service_role;
