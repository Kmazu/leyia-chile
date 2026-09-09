/**
 * Función Serverless Backend en Vercel para LeyIA Chile
 * Conecta directamente con la API de Google Gemini (v1beta gemini-1.5-flash) en modo JSON estricto.
 * Entrega razonamiento jurídico chileno de máxima precisión en tiempo real.
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
      message: 'GEMINI_API_KEY no encontrada en Vercel. Se utilizará el motor local de respaldo.',
      useLocalEngine: true
    });
  }

  try {
    const systemPrompt = `Eres "LeyIA Chile", una Inteligencia Artificial experta en el ordenamiento jurídico de la República de Chile (Código Penal, Código Civil, Código del Trabajo, Ley de Tránsito N° 18.290, Ley Emilia N° 20.770, Ley Cholito N° 21.020, Ley Devuélveme mi Casa N° 21.461, Ley 19.496 SERNAC, Ley 21.389 Alimentos).

Tu tarea es analizar la consulta del usuario en lenguaje natural y responder ÚNICAMENTE con un objeto JSON válido con exactamente la siguiente estructura:

{
  "title": "Título descriptivo y exacto de la situación legal",
  "category": "penal | laboral | civil | consumidor | familia | general",
  "subjectDetected": "Sujeto u Objeto principal afectado (ej: Ser Humano, Mascota/Animal, Fruta/Hurto Menor, Inmueble, Trabajador, Consumidor)",
  "riskLevel": "CRÍTICO PENAL | ALTO RIESGO | MODERADO | RESPONSABILIDAD CIVIL | BAJO / FALTA MENOR | INFORMACIÓN VIRTUAL",
  "riskColor": "#ef4444 para crítico/alto, #f97316 para medio/alto, #eab308 o #06b6d4 para civil/falta, #34d399 para bajo/saludo",
  "codesReferenced": ["Norma o Código 1", "Norma o Código 2"],
  "summary": "Explicación breve, realista y jurídicamente exacta del caso según la legislación de Chile.",
  "legalDetails": [
    { "article": "Artículo o Ley exacta de Chile", "description": "Explicación de lo que establece este artículo específicamente para este caso" }
  ],
  "actionSteps": ["Paso 1 a seguir", "Paso 2 a seguir"],
  "documentsAvailable": [
    { "id": "doc_id", "title": "Nombre de la minuta o documento recomendado", "format": "DOCX / PDF" }
  ],
  "proStrategy": "Recomendación o estrategia técnica para el usuario o su abogado"
}

Reglas estrictas de razonamiento para Chile:
1. Si es un saludo ("hola", "buenos días", "chao"), entrega un JSON amable de bienvenida o despedida sin inventar delitos ni cárcel.
2. Analiza la proporcionalidad y cuantía real:
   - Robar una fruta (manzana) o algo de escaso valor es una FALTA MENOR DE HURTO (Art. 494 N° 19 del Código Penal, multa de 1 a 4 UTM). NUNCA lo clasifiques como Robo a casa habitada de 5 a 10 años de cárcel.
   - Atropellar a una mascota de forma accidental NO constituye delito de fuga de la Ley Emilia (aplica Ley Cholito N° 21.020 / Daños en Policía Local).
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

    // Limpiar posibles envoltorios markdown si existieran
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
      error: 'Error en respuesta de Gemini API', 
      details: error.message 
    });
  }
}
