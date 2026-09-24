import { createClient } from '@supabase/supabase-js';

// Helper básico para decodificar entidades HTML del XML de BCN
function decodeEntities(encodedString) {
  return encodedString
    .replace(/&#225;/g, 'á')
    .replace(/&#233;/g, 'é')
    .replace(/&#237;/g, 'í')
    .replace(/&#243;/g, 'ó')
    .replace(/&#250;/g, 'ú')
    .replace(/&#193;/g, 'Á')
    .replace(/&#201;/g, 'É')
    .replace(/&#205;/g, 'Í')
    .replace(/&#211;/g, 'Ó')
    .replace(/&#218;/g, 'Ú')
    .replace(/&#241;/g, 'ñ')
    .replace(/&#209;/g, 'Ñ')
    .replace(/&#176;/g, '°')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export default async function handler(req, res) {
  // CORS admin
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { idNorma, email } = req.body;

  if (!idNorma) {
    return res.status(400).json({ error: 'Falta idNorma' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
    return res.status(503).json({ error: 'Faltan credenciales de entorno en el servidor' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verificación SECURE de JWT Auth Token (Evita IDOR/Spoofing)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: Falta token de acceso' });
  }
  const token = authHeader.split(' ')[1];
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Verificar rol superadmin en profiles
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (!userProfile || userProfile.role !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado. No eres superusuario.' });
  }

  try {
    // 1. Descargar XML desde la Biblioteca del Congreso Nacional
    const bcnUrl = `https://www.bcn.cl/leychile/Consulta/obtxml?opt=7&idNorma=${idNorma}`;
    const xmlResponse = await fetch(bcnUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 LeyIA-Chile-Ingestor' }
    });
    
    if (!xmlResponse.ok) {
      throw new Error('Fallo al contactar BCN API');
    }

    const xmlText = await xmlResponse.text();
    
    if (!xmlText.includes('<Norma')) {
      throw new Error('XML de norma inválido o no encontrado');
    }

    // 2. Extraer Título de la Ley
    const titleMatch = xmlText.match(/<TituloNorma>([\s\S]*?)<\/TituloNorma>/);
    let title = titleMatch ? titleMatch[1].trim() : `Norma ID ${idNorma}`;
    title = decodeEntities(title);

    // 3. Extraer Artículos (EstructuraFuncional tipoParte="Artículo")
    // Consideramos posibles variaciones de caracteres en la etiqueta xml (ej: Art&#237;culo)
    const articlesPattern = /<EstructuraFuncional[^>]*tipoParte="Art(?:í|&#237;)culo"[^>]*>([\s\S]*?)<\/EstructuraFuncional>/g;
    let match;
    const articles = [];

    while ((match = articlesPattern.exec(xmlText)) !== null) {
      const block = match[1];
      const textMatch = block.match(/<Texto>([\s\S]*?)<\/Texto>/);
      if (textMatch) {
        let content = decodeEntities(textMatch[1].trim());
        if (content.length > 20) {
          articles.push(content);
        }
      }
    }

    if (articles.length === 0) {
      return res.status(200).json({ status: 'warning', message: 'No se encontraron artículos analizables en esta norma.' });
    }

    // Limitar para evitar Vercel timeout (Max 20 articulos por batch en esta V1).
    // Para procesar una ley completa de 2000 artículos se requiere cron o queues, pero para la prueba basta con procesar los primeros 30.
    const maxArticlesToProcess = Math.min(articles.length, 30);
    const articlesToProcess = articles.slice(0, maxArticlesToProcess);

    let insertedCount = 0;

    // 4. Vectorizar e insertar (Secuencial para no rate-limitar a Gemini)
    for (let i = 0; i < articlesToProcess.length; i++) {
      const content = articlesToProcess[i];
      // Pequeño parser para el numero de articulo
      const articleNumMatch = content.match(/^"?Art(?:í|i)culo\s*(\d+[^\.\-]*)/i);
      const articleLabel = articleNumMatch ? `Artículo ${articleNumMatch[1].trim()}` : `Artículo ${i+1}`;

      // Llamada a Gemini para Embedding
      const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: `Ley: ${title}\n${articleLabel}\nContenido: ${content}` }] },
          outputDimensionality: 768
        })
      });

      if (embedRes.ok) {
        const embedData = await embedRes.json();
        const embedding = embedData.embedding?.values;

        if (embedding) {
          // Insertar en Supabase legal_sources
          const { error: insertError } = await supabase.from('legal_sources').insert({
            titulo: title,
            ley: title.slice(0, 50), // Categorización corta
            articulo: articleLabel,
            contenido: content,
            url_fuente: bcnUrl,
            categoria: 'general',
            embedding: embedding
          });

          if (!insertError) {
            insertedCount++;
          } else {
            console.error('Error insertando articulo en DB:', insertError);
          }
        }
      }
    }

    return res.status(200).json({ 
      status: 'success', 
      message: `Ingestión completada. Se procesaron e insertaron ${insertedCount} artículos de un total de ${articles.length} detectados en la norma. (Límite actual: 30 por batch).`,
      ley: title
    });

  } catch (error) {
    console.error('Error en ingestor BCN:', error);
    return res.status(500).json({ error: error.message });
  }
}
