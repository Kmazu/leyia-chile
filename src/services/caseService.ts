import { supabase } from './supabaseClient';
import { authService } from './authService';

export const caseService = {
  /**
   * Obtiene todas las causas del usuario actual
   */
  async getMyCases() {
    try {
      const user = await authService.getUserSession();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching cases:', e);
      return [];
    }
  },

  /**
   * Crea una nueva causa
   * @param {{ title: string, description: string, category: string }} caseData 
   */
  async createCase(caseData) {
    try {
      const user = await authService.getUserSession();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('legal_cases')
        .insert([
          {
            user_id: user.id,
            title: caseData.title,
            description: caseData.description,
            category: caseData.category || 'otros',
            status: 'activo'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error creating case:', e);
      throw e;
    }
  },

  /**
   * Obtiene una causa específica (se valida RLS automáticamente)
   */
  async getCaseById(caseId) {
    try {
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error fetching case:', e);
      throw e;
    }
  },

  /**
   * Archiva una causa (soft delete o cambio de estado)
   */
  async archiveCase(caseId) {
    try {
      const { data, error } = await supabase
        .from('legal_cases')
        .update({ status: 'archivado', updated_at: new Date().toISOString() })
        .eq('id', caseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error archiving case:', e);
      throw e;
    }
  }
};
