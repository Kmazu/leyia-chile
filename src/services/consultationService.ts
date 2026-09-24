import { supabase } from './supabaseClient';
import { authService } from './authService';

export const consultationService = {
  /**
   * Obtiene las consultas del usuario actual (opcionalmente filtradas por case_id)
   */
  async getMyConsultations(caseId = null) {
    try {
      const user = await authService.getUserSession();
      if (!user) throw new Error('Usuario no autenticado');

      let query = supabase
        .from('legal_consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (caseId) {
        query = query.eq('case_id', caseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching consultations:', e);
      return [];
    }
  },

  /**
   * Guarda una nueva consulta realizada a Gemini
   */
  async saveConsultation({ question, response, category, caseId = null }) {
    try {
      const user = await authService.getUserSession();
      if (!user) {
        console.warn('Usuario no autenticado, no se guarda historial en DB.');
        return null;
      }

      const { data, error } = await supabase
        .from('legal_consultations')
        .insert([
          {
            user_id: user.id,
            case_id: caseId,
            question,
            response,
            category: category || 'general'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error saving consultation:', e);
      // No lanzamos el error para no interrumpir el flujo del usuario si solo falla el guardado
      return null;
    }
  }
};
