/**
 * Función Serverless Backend en Vercel para LeyIA Chile
 * Procesa consultas legales llamando directamente a la API de Google Gemini en vivo
 * usando la variable protegida GEMINI_API_KEY.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { query, category } = req.body;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'La consulta no puede estar vacía' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      status: 'notice',
      message: 'GEMINI_API_KEY no configurada en Vercel. Operando con Motor de Inteligencia Legal NLU local.',
      useLocalEngine: true
    });
  }

  try {
    const systemPrompt = `Eres el asistente de inteligencia legal "LeyIA Chile", experto en el ordenamiento jurídico de la República de Chile (Código Penal, Código Civil, Código del Trabajo, Ley de Tránsito N° 18.290, Ley Emilia N° 20.770, Ley Cholito N° 21.020, Ley Devuélveme mi Casa N° 21.461, Ley 19.496 SERNAC, Ley 21.389 Alimentos).

Tus reglas de respuesta son:
1. Si el usuario solo saluda ("hola", "buenos días"), responde amablemente dándole la bienvenida y guiándolo a exponer su caso.
2. Identifica con exactitud el sujeto afectado (Ser Humano, Mascota/Animal, Inmueble, Trabajador, Consumidor).
3. IMPORTANTE: En atropellos a mascotas NO aplica la Ley Emilia ni penas de presidio por fuga (aplica Ley Cholito y Juzgado de Policía Local).
4. En incendios o robos en casas habitadas con personas, aplica presidio perpetuo o penas del Código Penal (Art. 474 / Art. 440) y explica el apercibimiento del Art. 26 CPP.
5. Devuelve un JSON estructurado con: title, riskLevel, riskColor, summary, legalDetails (artículos exactos), actionSteps (pasos a seguir) y proStrategy.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nConsulta del Usuario: "${query}"` }] }
        ]
      })
    });

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      status: 'success',
      engine: 'Google Gemini 1.5 Flash (Live Cloud API)',
      responseRaw: candidateText
    });
  } catch (error) {
    console.error('Error llamando a la API de Gemini:', error);
    return res.status(500).json({ error: 'Error al conectar con la API de Inteligencia Artificial' });
  }
}
