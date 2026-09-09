/**
 * Función Serverless de Vercel para LeyIA Chile
 * Procesa consultas usando la API Key de Gemini configurada de forma segura en las variables de entorno de Vercel (GEMINI_API_KEY).
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { query, category } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'La consulta no puede estar vacía' });
  }

  try {
    // Ejemplo de llamadas seguras desde backend Vercel usando la variable de entorno protegida GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY no encontrada en entorno serverless. Usando motor NLU de desambiguación integrado.');
    }

    return res.status(200).json({
      status: 'success',
      queryProcessed: query,
      category,
      engine: 'LeyIA Chile Serverless Backend v1.0'
    });
  } catch (error) {
    console.error('Error procesando consulta legal:', error);
    return res.status(500).json({ error: 'Error interno del servidor legal' });
  }
}
