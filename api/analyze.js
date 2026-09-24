/**
 * Backend Serverless Vercel para LeyIA Chile
 * Procesa consultas legales utilizando la API de Google Gemini.
 * SEGURIDAD: La API Key se lee EXCLUSIVAMENTE desde process.env (Vercel Dashboard).
 */

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 5; // 5 peticiones por minuto por IP
const ipRequestMap = new Map();

export default async function handler(req, res) {
  // CORS y headers de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Rate Limiting por IP (Protección anti-abuso)
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (ip !== 'unknown') {
    const now = Date.now();
    const reqData = ipRequestMap.get(ip) || { count: 0, firstReq: now };
    
    if (now - reqData.firstReq > RATE_LIMIT_WINDOW) {
      reqData.count = 1;
      reqData.firstReq = now;
    } else {
      reqData.count++;
    }
    ipRequestMap.set(ip, reqData);

    if (reqData.count > MAX_REQUESTS) {
      console.warn(`Rate limit excedido para IP: ${ip}`);
      return res.status(429).json({ 
        error: 'Demasiadas peticiones', 
        message: 'Has excedido el límite de consultas por minuto. Por favor, espera un momento y vuelve a intentarlo.' 
      });
    }
  }

  const { query, category, legalContext } = req.body || {};

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'La consulta no puede estar vacía' });
  }

  // Limitar longitud de consulta para evitar abuso
  const sanitizedQuery = query.trim().slice(0, 2000);

  // Obtener API Key SOLO desde variables de entorno del servidor
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY no configurada en las variables de entorno de Vercel.');
    return res.status(503).json({
      error: 'Servicio no disponible',
      message: 'El servicio de IA no está configurado. Contacta al administrador.',
      needApiKey: true
    });
  }

  try {
    const defaultMockContext = `--- CONTEXTO LEGAL (RAG MOCK) ---
Sección: Código del Trabajo (Art. 159, 160, 161) - Causales de terminación de contrato, despido injustificado, necesidades de la empresa.
Sección: Ley del Consumidor 19.496 - Derecho a garantía legal (6 meses), derecho a retracto.
Sección: Código Civil - Contratos de arrendamiento, Ley 21.461 (Devuélveme mi casa), indemnización de perjuicios.
Sección: Código Penal - Delitos contra la propiedad (Robo, Hurto), lesiones, amenazas.
---------------------------------`;

    const contextToUse = legalContext || defaultMockContext;

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
3. RESPONDE ÚNICAMENTE CON EL OBJETO JSON SIN BLOQUES DE TEXTO FUERA DEL JSON.
4. BASA TU RESPUESTA EN EL CONTEXTO LEGAL PROPORCIONADO MÁS ABAJO (Simulación RAG). NO ALUCINES NI INVENTES ARTÍCULOS INEXISTENTES. Si el contexto no es suficiente, limítate a los principios generales del derecho chileno.

${contextToUse}`;

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ];

    let response = null;
    let lastErrorText = '';
    let selectedModel = '';

    for (const modelName of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\\n\\nConsulta del Usuario: "${sanitizedQuery}"` }] }
            ]
          })
        });
        clearTimeout(timeoutId);

        if (apiRes.ok) {
          response = apiRes;
          selectedModel = modelName;
          break;
        } else {
          lastErrorText = await apiRes.text();
        }
      } catch (e) {
        lastErrorText = e.message;
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Gemini API Error: ${lastErrorText}`);
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
      engine: `Motor Legal IA LeyIA Chile`,
      data: parsedJson
    });
  } catch (error) {
    // No exponer detalles internos en producción
    console.error('Error procesando consulta legal:', error.message);

    if (error.message.includes('NOT_FOUND') || error.message.includes('404')) {
      return res.status(503).json({
        status: 'error',
        message: 'El servicio de IA requiere configuración. Contacta al administrador.',
        needApiKey: true
      });
    }

    return res.status(500).json({
      error: 'Error procesando tu consulta legal',
      message: 'Por favor intenta nuevamente en unos segundos.'
    });
  }
}

