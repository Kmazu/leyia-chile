/**
 * Backend Serverless Vercel para LeyIA Chile
 * Procesa el 100% de las consultas en vivo utilizando la API de Google Gemini (gemini-1.5-flash).
 * Entrega respuestas dinámicas, proporcionales y con razonamiento real según la legislación de Chile.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { query, category } = req.body;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'La consulta no puede estar vacía' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      status: 'error',
      message: 'La variable GEMINI_API_KEY o VITE_GEMINI_API_KEY no está configurada en las variables de entorno de Vercel.',
      needApiKey: true
    });
  }

  try {
    const systemPrompt = `Eres "LeyIA Chile", un abogado experto de clase mundial en el ordenamiento jurídico de la República de Chile (Código Penal, Código Civil, Código del Trabajo, Ley de Tránsito N° 18.290, Ley Emilia N° 20.770, Ley Cholito N° 21.020, Ley Devuélveme mi Casa N° 21.461, Ley 19.496 SERNAC, Ley 21.389 Alimentos, Código Procesal Penal).

Tu tarea es analizar la consulta del usuario en lenguaje natural y responder ÚNICAMENTE con un objeto JSON válido con exactamente la siguiente estructura:

{
  "title": "Título preciso y profesional del caso legal",
  "category": "penal | laboral | civil | consumidor | familia | general",
  "subjectDetected": "Sujeto/Objeto principal afectado (ej: Ser Humano, Mascota/Animal, Fruta/Hurto Menor, Vecino/Lesiones, Inmueble, Trabajador)",
  "riskLevel": "CRÍTICO PENAL | ALTO RIESGO | MODERADO | RESPONSABILIDAD CIVIL | BAJO / FALTA MENOR | CORTESÍA / VIRTUAL",
  "riskColor": "#ef4444 para crítico/alto penal, #f97316 para medio/alto laboral, #eab308 o #06b6d4 para civil/falta/JPL, #34d399 para bajo/saludo",
  "codesReferenced": ["Ley o Código Chileno 1", "Ley o Código Chileno 2"],
  "summary": "Síntesis clara, realista y jurídicamente exacta del caso según el Derecho Chileno.",
  "legalDetails": [
    { "article": "Artículo o Ley Chilena exacta (ej: Art. 399 Código Penal)", "description": "Explicación detallada de lo que sanciona o establece este artículo para este caso específico" }
  ],
  "actionSteps": ["Paso 1 sugerido", "Paso 2 sugerido", "Paso 3 sugerido"],
  "documentsAvailable": [
    { "id": "doc_id", "title": "Nombre de la minuta o documento borrador recomendado", "format": "DOCX / PDF" }
  ],
  "proStrategy": "Estrategia técnica para el usuario o su abogado defensor"
}

Reglas estrictas de razonamiento para Chile:
1. Si el usuario saluda ("hola", "buenos días", "chao"), entrega un JSON amable de bienvenida o despedida en lugar de inventar delitos.
2. Analiza con estricta PROPORCIONALIDAD el hecho real:
   - Robar objetos de ínfimo valor (una manzana, una fruta, golosinas) es una FALTA DE HURTO DE ESCASO VALOR (Art. 494 N° 19 del Código Penal, Multa de 1 a 4 UTM). NUNCA lo clasifiques como Robo a casa habitada de 5 a 10 años.
   - Golpear a un vecino o agresión física entre particulares se clasifica en LESIONES (Leves Art. 494 N° 5 CP; Menos Graves Art. 399 CP; Graves Art. 397 CP) con constatación de lesiones y opción de Acuerdo Reparatorio. NUNCA como consulta civil genérica.
   - Atropello fortuito a una mascota NO es delito de fuga de Ley Emilia (aplica Ley Cholito N° 21.020 / Policía Local).
   - En robos reales a casas o incendios con personas adentro, aplica presidio del Código Penal (Art. 440 o 474 CP) y explica el apercibimiento del Art. 26 CPP.
3. RESPONDE ÚNICAMENTE CON EL OBJETO JSON. NO AGREGUES TEXTO EXTRA NI BLOQUES MARKDOWN FUERA DEL JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nConsulta del Usuario: "${query}"` }] }
        ],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API HTTP Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Respuesta vacía recibida desde la API de Gemini');
    }

    const cleanedText = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleanedText);

    return res.status(200).json({
      status: 'success',
      engine: 'Google Gemini 1.5 Flash (Live Cloud API)',
      data: parsedJson
    });
  } catch (error) {
    console.error('Error procesando en Gemini Serverless:', error);
    return res.status(500).json({ 
      error: 'Error procesando respuesta con Gemini', 
      details: error.message 
    });
  }
}
