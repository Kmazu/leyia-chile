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

  const rawGemini = process.env.GEMINI_API_KEY;
  const rawVite = process.env.VITE_GEMINI_API_KEY;
  const apiKey = (rawGemini && rawGemini.trim()) || (rawVite && rawVite.trim());

  if (!apiKey) {
    return res.status(200).json({
      status: 'error',
      message: 'La variable GEMINI_API_KEY existe en Vercel pero su valor está VACÍO (0 caracteres) o invalido.',
      needApiKey: true,
      debugDetails: {
        geminiKeyPresent: 'GEMINI_API_KEY' in process.env,
        geminiKeyLength: rawGemini ? rawGemini.length : 0,
        viteKeyPresent: 'VITE_GEMINI_API_KEY' in process.env,
        viteKeyLength: rawVite ? rawVite.length : 0
      }
    });
  }

  try {
    const systemPrompt = `Eres "LeyIA Chile", un jurista de máximo nivel técnico y experto en el ordenamiento jurídico de la República de Chile (Código Penal, Civil, del Trabajo, Ley de Tránsito 18.290, Ley 21.461 Arriendos, Ley 19.496 SERNAC, Ley 21.389 Alimentos, Código Procesal Penal).

Tu tarea es realizar un análisis legal profundo, exhaustivo, profesional y realista de la consulta.

Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:

{
  "title": "Título técnico formal del caso legal en Chile",
  "category": "penal | laboral | civil | consumidor | familia | general",
  "subjectDetected": "Sujeto / Objeto afectado con su encuadre jurídico",
  "riskLevel": "CRÍTICO PENAL | ALTO RIESGO | MODERADO | RESPONSABILIDAD CIVIL | BAJO / FALTA MENOR | CORTESÍA / VIRTUAL",
  "riskColor": "#ef4444 para penal/grave, #f97316 para laboral/medio, #d97706 o #06b6d4 para civil/falta, #34d399 para bajo/saludo",
  "codesReferenced": ["Ley o Código Chileno 1", "Ley o Código Chileno 2"],
  "summary": "Análisis exhaustivo, completo y realista del caso según la legislación chilena (mínimo 2-3 párrafos explicativos con plazos, procedimientos ante fiscalía/juzgados y consecuencias).",
  "legalDetails": [
    { "article": "Artículo y Ley exacta (ej: Art. 399 del Código Penal / Art. 160 C. del Trabajo)", "description": "Explicación legal completa de lo que sanciona o establece este artículo para el hecho específico." }
  ],
  "actionSteps": [
    "Paso 1 procedural ante la institución chilena (ej: Inspección del Trabajo / Fiscalía / Juzgado de Policía Local / Notaría)",
    "Paso 2 recolección de pruebas o certificados (ej: Constatación de Lesiones / Finiquito / Liquidaciones)",
    "Paso 3 estrategia de resolución o querella"
  ],
  "documentsAvailable": [
    { "id": "doc_id", "title": "Nombre de la plantilla o borrador recomendado", "format": "PDF / Formulario Notarial" }
  ],
  "proStrategy": "Estrategia jurista técnica detallada para el usuario o su abogado patrocinante (procedimientos de sobreseimiento, suspensión condicional, acuerdos reparatorios, demanda ejecutiva o reclamo DT)."
}

Reglas estrictas de razonamiento para Chile:
1. Si el usuario saluda ("hola", "buenos días"), entrega una respuesta formal de bienvenida sin inventar delitos.
2. Aplica estricta PROPORCIONALIDAD jurídica conforme a los tribunales chilenos.
3. RESPONDE ÚNICAMENTE CON EL OBJETO JSON SIN BLOQUES DE TEXTO FUERA DEL JSON.`;

    const candidateModels = [
      'gemini-1.5-flash',
      'gemini-2.0-flash'
    ];

    let response = null;
    let lastErrorText = '';
    let selectedModel = '';

    for (const modelName of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nConsulta del Usuario: "${query}"` }] }
            ]
          })
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          response = res;
          selectedModel = modelName;
          break;
        } else {
          lastErrorText = await res.text();
        }
      } catch (e) {
        lastErrorText = e.message;
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Gemini API HTTP Error: ${lastErrorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Respuesta vacía recibida desde la API de Gemini');
    }

    const cleanedText = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const parsedJson = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText);

    return res.status(200).json({
      status: 'success',
      engine: `Google Gemini (${selectedModel})`,
      data: parsedJson
    });
  } catch (error) {
    console.error('Error procesando en Gemini Serverless:', error);
    
    if (error.message.includes('NOT_FOUND') || error.message.includes('404')) {
      return res.status(200).json({
        status: 'error',
        message: 'La API Key introducida en Vercel requiere habilitar el servicio de Gemini o ser una clave de Google AI Studio.',
        solution: 'Obtén tu API Key gratuita en https://aistudio.google.com/app/apikey (Generative Language API) e ingrésala en Vercel.',
        rawGoogleError: error.message,
        needApiKey: true
      });
    }

    return res.status(500).json({ 
      error: 'Error procesando respuesta con Gemini', 
      details: error.message 
    });
  }
}
