import { supabase } from './supabaseClient';
import { authService } from './authService';
import { analyticsService } from './analyticsService';

export const documentService = {
  /**
   * Sube un documento al storage privado de Supabase
   */
  async uploadDocument(file, path) {
    try {
      const user = await authService.getUserSession();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`${user.id}/${path}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      return data.path;
    } catch (e) {
      console.error('Error uploading document:', e);
      throw e;
    }
  },

  /**
   * Genera una URL firmada (temporal) para descargar/ver un documento
   */
  async getSignedUrl(filePath, expiresIn = 60) {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (e) {
      console.error('Error generating signed URL:', e);
      throw e;
    }
  },

  /**
   * Registra una descarga en la base de datos
   */
  async logDownload(documentId) {
    try {
      const user = await authService.getUserSession();
      if (!user) return; // No registramos si no hay usuario logueado

      const { error } = await supabase
        .from('document_downloads')
        .insert([
          {
            user_id: user.id,
            document_id: documentId
          }
        ]);

      analyticsService.trackEvent('Document Downloaded', { documentId: documentId });

      if (error) console.error('Error logging document download:', error);
    } catch (e) {
      console.error('Exception logging document download:', e);
    }
  },

  /**
   * Obtiene todos los documentos de la BD del usuario actual
   */
  async getMyDocuments() {
    try {
      const user = await authService.getUserSession();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching documents:', e);
      return [];
    }
  }
};
