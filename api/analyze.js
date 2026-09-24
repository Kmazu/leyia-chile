/**
 * Backend Serverless Vercel para LeyIA Chile
 * Procesa consultas legales utilizando Proveedores de IA (OpenAI / Gemini).
 * SEGURIDAD: La API Key se lee EXCLUSIVAMENTE desde process.env (Vercel Dashboard).
 */

import { createClient } from '@supabase/supabase-js';
import { processWithOpenAI } from './lib/openai.js';
import { processWithGemini } from './lib/gemini.js';

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

  // 1. Validación de Autenticación JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Se requiere token JWT.' });
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Configuración de Supabase faltante en servidor.' });
  }

  // Cliente de Supabase autenticado como el usuario
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
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

  // Verificación de Plan (Límites) en Backend
  // Utilizamos service_role para operaciones administrativas si fuera necesario, pero aquí basta leer de profiles
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: profile } = await supabaseAdmin.from('profiles').select('plan, query_count').eq('id', user.id).single();
  
  const plan = profile?.plan || 'starter';
  const queryCount = profile?.query_count || 0;
  const monthlyLimit = plan === 'starter' ? 5 : (plan === 'pro' ? 50 : 500);

  if (queryCount >= monthlyLimit) {
    return res.status(403).json({ 
      error: 'Límite alcanzado',
      message: 'Has superado el límite de consultas mensuales de tu plan.'
    });
  }

  const { query, category, legalContext } = req.body || {};

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'La consulta no puede estar vacía' });
  }

  const sanitizedQuery = query.trim().slice(0, 2000);
  const provider = process.env.AI_PROVIDER || 'gemini';

  const defaultMockContext = `--- CONTEXTO LEGAL (RAG MOCK) ---
Sección: Código del Trabajo (Art. 159, 160, 161) - Causales de terminación de contrato, despido injustificado, necesidades de la empresa.
Sección: Ley del Consumidor 19.496 - Derecho a garantía legal (6 meses), derecho a retracto.
Sección: Código Civil - Contratos de arrendamiento, Ley 21.461 (Devuélveme mi casa), indemnización de perjuicios.
Sección: Código Penal - Delitos contra la propiedad (Robo, Hurto), lesiones, amenazas.
---------------------------------`;

  const contextToUse = legalContext || defaultMockContext;

  const systemPrompt = `Eres "LeyIA Chile", un jurista técnico especializado en el ordenamiento jurídico de la República de Chile (Código Penal, Civil, del Trabajo, Ley de Tránsito 18.290, Ley 21.461 Arriendos, Ley 19.496 SERNAC, Ley 21.389 Alimentos, Código Procesal Penal, etc.).

Reglas críticas y obligatorias:
1. JURISDICCIÓN: Todo tu análisis DEBE basarse exclusivamente en la legislación de la República de Chile. Idioma: Español.
2. RIGOR FACTUAL: Distingue claramente los hechos reportados por el usuario de las inferencias jurídicas. Indica incertidumbre si faltan antecedentes.
3. NO INVENTAR: No inventes fuentes, artículos, leyes, sentencias, jurisprudencia ni URLs oficiales. Si no existe información suficiente, indícalo.
4. USO DE FUENTES: Utiliza las fuentes recuperadas en el CONTEXTO LEGAL. Advierte cuando una fuente requiera verificación en fuentes oficiales (BCN, Poder Judicial).
5. ROL: No te presentes como un abogado que está asumiendo la representación del caso. Entrega orientación jurídica estructurada y recomienda asesoría profesional humana cuando corresponda.
6. CLARIDAD: Explica de manera clara pero técnicamente impecable.

Tu tarea es analizar la consulta y devolver una respuesta legal en formato JSON según el esquema proporcionado. 
Asegúrate de llenar los campos "facts", "legalIssues", "applicableLaw", "jurisprudence" y "procedure" basándote estrictamente en el derecho chileno y el contexto recuperado.
Incluye siempre este descargo de responsabilidad (disclaimer) al final:
"LEYIA CHILE ENTREGA INFORMACIÓN Y ORIENTACIÓN JURÍDICA GENERAL BASADA EN LAS FUENTES DISPONIBLES. NO SUSTITUYE LA ASESORÍA DE UN ABOGADO. LA INFORMACIÓN PUEDE REQUERIR VERIFICACIÓN SEGÚN LA FECHA, JURISDICCIÓN Y ANTECEDENTES DEL CASO."

CONTEXTO LEGAL RECUPERADO:
${contextToUse}`;

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    let aiResponse;
    if (provider === 'openai') {
      aiResponse = await processWithOpenAI(systemPrompt, sanitizedQuery);
    } else {
      aiResponse = await processWithGemini(systemPrompt, sanitizedQuery);
    }
    const durationMs = Date.now() - startTime;

    // Registrar consumo
    await supabaseAdmin.from('ai_usage').insert([{
      user_id: user.id,
      request_id: requestId,
      model: aiResponse.usage.model,
      prompt_tokens: aiResponse.usage.prompt_tokens,
      completion_tokens: aiResponse.usage.completion_tokens,
      total_tokens: aiResponse.usage.total_tokens,
      duration_ms: durationMs,
      endpoint: '/api/analyze'
    }]);

    return res.status(200).json({
      status: 'success',
      engine: provider,
      request_id: requestId,
      data: aiResponse.data
    });
  } catch (error) {
    console.error(`Error procesando consulta legal (${provider}):`, error.message);
    
    // Registrar error internamente pero no devolver el stacktrace al cliente
    await supabaseAdmin.from('ai_usage').insert([{
      user_id: user.id,
      request_id: requestId,
      model: provider,
      endpoint: '/api/analyze_error'
    }]);

    if (error.message.includes('API_KEY')) {
      return res.status(503).json({
        status: 'error',
        message: 'El servicio de IA requiere configuración. Contacta al administrador.',
        needApiKey: true
      });
    }

    return res.status(500).json({
      error: 'Error procesando tu consulta legal',
      message: 'El análisis no pudo completarse. Inténtalo nuevamente.'
    });
  }
}
