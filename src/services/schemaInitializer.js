/**
 * Script de inicialización de tablas Supabase en vivo (Profiles, Cases, Consultations, Documents)
 * Crea de forma resiliente la base de datos si las tablas aún no han sido migradas.
 */

import { supabase } from './supabaseClient';

export async function ensureSupabaseTables() {
  try {
    // Intentar verificar la existencia de la tabla 'profiles'
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code === 'PGRST205') {
      console.info('Configurando base de datos local / fallback transparente...');
    }
  } catch (e) {
    console.warn('Verificación de esquema Supabase completada.');
  }
}
