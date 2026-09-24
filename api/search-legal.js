import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { query, category } = req.body || {};

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Consulta vacía' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  // Usamos Service Role para saltar posibles RLS restrictivos en RPC, o la ANON key si las leyes son publicas.
  // Las leyes son publicas según el RLS, podemos usar el Service Role o Anon.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!geminiApiKey || !supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Servicio no configurado' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Obtener Embedding de Gemini
    const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: query }] },
        outputDimensionality: 768
      })
    });

    if (!embedRes.ok) {
      throw new Error('Fallo al generar embedding: ' + await embedRes.text());
    }

    const embedData = await embedRes.json();
    const embedding = embedData.embedding?.values;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('No se pudo extraer el vector de embedding');
    }

    // 2. Buscar similitud en Supabase
    const { data: legalSources, error: rpcError } = await supabase.rpc('match_legal_sources', {
      query_embedding: embedding,
      match_threshold: 0.65, // Ajustar según precisión deseada
      match_count: 5,
      filter_category: category === 'all' ? null : category
    });

    if (rpcError) {
      // Si la función RPC no existe aún (Supabase no migrado localmente), retornamos un arreglo vacío
      console.warn('RPC match_legal_sources error (puede que no exista la función):', rpcError.message);
      return res.status(200).json({ sources: [] });
    }

    return res.status(200).json({ sources: legalSources || [] });

  } catch (error) {
    console.error('Error en legal-search:', error.message);
    return res.status(500).json({ error: 'Error en búsqueda jurídica' });
  }
}
