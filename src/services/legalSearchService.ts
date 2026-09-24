/**
 * Servicio frontend de Búsqueda Jurídica RAG
 * Responsable de obtener contexto verificable antes de llamar a Gemini.
 */

export const legalSearchService = {
  /**
   * Busca artículos y leyes relevantes para una consulta usando Embeddings y pgvector.
   * @param {string} query Consulta del usuario
   * @param {string} category Categoría legal (opcional)
   * @returns {Promise<Array>} Lista de fuentes legales encontradas
   */
  async searchLegalSources(query, category = 'all') {
    try {
      const response = await fetch('/api/search-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category })
      });

      if (!response.ok) {
        throw new Error('Error al buscar fuentes legales');
      }

      const data = await response.json();
      return data.sources || [];
    } catch (error) {
      console.warn('Advertencia en legalSearchService:', error.message);
      // Retornamos array vacío si el backend falla o la BD no está configurada,
      // para no bloquear el flujo principal de análisis.
      return [];
    }
  },

  /**
   * Formatea los fragmentos recuperados en un texto de contexto inyectable al prompt.
   * @param {Array} sources Lista de fuentes legales
   * @returns {string} Contexto formateado
   */
  formatContext(sources) {
    if (!sources || sources.length === 0) return '';
    
    let contextStr = '\\n\\n--- CONTEXTO LEGAL RECUPERADO (RAG) ---\\n';
    sources.forEach(src => {
      contextStr += `\\n[Fuente: ${src.ley} - ${src.articulo || ''}]\\n`;
      contextStr += `Título: ${src.titulo || ''}\\n`;
      contextStr += `Contenido: ${src.contenido}\\n`;
      if (src.url_fuente) contextStr += `URL: ${src.url_fuente}\\n`;
      contextStr += `-------------------------------------------\\n`;
    });
    
    return contextStr;
  }
};
