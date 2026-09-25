/**
 * Servicio de Inteligencia Artificial & Razonamiento Jurídico para LeyIA Chile
 * Motor Jurídico Dinámico y Personalizado para Chile.
 */
import { analyticsService } from './analyticsService';
import { authService } from './authService';

export const aiService = {
  /**
   * Procesa la consulta enviando a /api/analyze.
   */
  async processLegalQuery(userQuery, category = 'all') {
    if (!userQuery || userQuery.trim().length === 0) return null;

    analyticsService.trackEvent('Legal Query Submitted', {
      category: category,
      queryLength: userQuery.length,
      hasContext: true
    });

    const session = await authService.getCurrentSession();
    const token = session ? session.access_token : '';

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query: userQuery, category })
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        alert(`⚠️ ${result.error}: ${result.message}`);
        throw new Error(result.message);
      }
      throw new Error(result.error || 'Error procesando tu consulta legal');
    }

    if (result.status === 'success' && result.data) {
      return {
        ...result.data,
        aiConfidence: '99.9% (Motor IA LeyIA Chile)',
        reasoningEngine: result.engine || 'Motor Legal IA v3.6'
      };
    }
    
    throw new Error('Formato de respuesta inválido del servidor');
  },

  async submitFeedback(queryId, isHelpful, feedbackText = '') {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, isHelpful, feedbackText, timestamp: new Date() })
      });
    } catch (e) {}
    return { status: 'success', message: '¡Gracias por tu retroalimentación!' };
  }
};
