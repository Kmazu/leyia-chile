/**
 * Script de Ingesta Masiva de Leyes Chilenas desde BCN (Ley Chile)
 * Ejecutar con: node scripts/ingest-leyes.mjs
 * 
 * Descarga XML oficiales de la Biblioteca del Congreso Nacional,
 * extrae artículos, genera embeddings con Gemini y los inserta en Supabase.
 */

// ── Configuración ──
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || 'REMOVED_FOR_SECURITY';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'REMOVED_FOR_SECURITY';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REMOVED_FOR_SECURITY';

const EMBEDDING_MODEL = 'gemini-embedding-001';
const BATCH_DELAY_MS = 1200; // Espera entre llamadas a Gemini para no exceder rate limits

// ── Leyes principales de Chile con sus IDs de BCN ──
const LEYES_CHILE = [
  { idNorma: '207436', nombre: 'Código del Trabajo (DFL 1)', categoria: 'laboral' },
  { idNorma: '1984903', nombre: 'Código Penal', categoria: 'penal' },
  { idNorma: '172986', nombre: 'Código Civil', categoria: 'civil' },
  { idNorma: '277983', nombre: 'Ley 19.496 Protección del Consumidor', categoria: 'consumidor' },
  { idNorma: '1143272', nombre: 'Ley 21.461 Devuélveme Mi Casa (Arriendos)', categoria: 'civil' },
  { idNorma: '29268',  nombre: 'Ley 18.101 Arrendamiento Predios Urbanos', categoria: 'civil' },
  { idNorma: '1150893', nombre: 'Ley 21.389 Registro Deudores Pensión Alimentos', categoria: 'familia' },
  { idNorma: '276194', nombre: 'Ley 20.066 Violencia Intrafamiliar', categoria: 'familia' },
  { idNorma: '29726',  nombre: 'Ley 18.290 de Tránsito', categoria: 'general' },
  { idNorma: '176595', nombre: 'Código Procesal Penal (Ley 19.696)', categoria: 'penal' },
];

// ── Helpers ──
function decodeEntities(s) {
  return s
    .replace(/&#225;/g, 'á').replace(/&#233;/g, 'é').replace(/&#237;/g, 'í')
    .replace(/&#243;/g, 'ó').replace(/&#250;/g, 'ú').replace(/&#193;/g, 'Á')
    .replace(/&#201;/g, 'É').replace(/&#205;/g, 'Í').replace(/&#211;/g, 'Ó')
    .replace(/&#218;/g, 'Ú').replace(/&#241;/g, 'ñ').replace(/&#209;/g, 'Ñ')
    .replace(/&#176;/g, '°').replace(/&#252;/g, 'ü').replace(/&#220;/g, 'Ü')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#160;/g, ' ')
    .replace(/&#186;/g, 'º').replace(/&#170;/g, 'ª');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEmbedding(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: 768
      })
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Embedding error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return data.embedding?.values || null;
}

async function insertToSupabase(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/legal_sources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(row)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase insert error (${res.status}): ${errText}`);
  }
}

async function downloadAndParseNorma(idNorma) {
  const url = `https://www.bcn.cl/leychile/Consulta/obtxml?opt=7&idNorma=${idNorma}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 LeyIA-Chile-Ingestor/1.0' }
  });
  if (!res.ok) throw new Error(`BCN fetch failed for ${idNorma}: ${res.status}`);
  const xml = await res.text();
  if (!xml.includes('<Norma')) throw new Error(`Invalid XML for norma ${idNorma}`);

  // Extraer título
  const titleMatch = xml.match(/<TituloNorma>([\s\S]*?)<\/TituloNorma>/);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : `Norma ${idNorma}`;

  // Extraer artículos
  const articlesPattern = /<EstructuraFuncional[^>]*tipoParte="Art(?:í|&#237;)culo"[^>]*>([\s\S]*?)<\/EstructuraFuncional>/g;
  const articles = [];
  let match;
  while ((match = articlesPattern.exec(xml)) !== null) {
    const block = match[1];
    const textMatch = block.match(/<Texto>([\s\S]*?)<\/Texto>/);
    if (textMatch) {
      const content = decodeEntities(textMatch[1].trim());
      if (content.length > 20) {
        articles.push(content);
      }
    }
  }

  return { title, articles, url };
}

// ── Main ──
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🇨🇱 LEYIA CHILE — Ingestor Masivo de Leyes BCN');
  console.log('═══════════════════════════════════════════════════════\n');

  let totalInserted = 0;
  let totalErrors = 0;

  for (const ley of LEYES_CHILE) {
    console.log(`\n📜 Procesando: ${ley.nombre} (ID: ${ley.idNorma})`);
    console.log('─'.repeat(60));

    try {
      const { title, articles, url } = await downloadAndParseNorma(ley.idNorma);
      console.log(`   ✅ Descargado: "${title}" — ${articles.length} artículos encontrados`);

      if (articles.length === 0) {
        console.log('   ⚠️  No se encontraron artículos analizables. Saltando...');
        continue;
      }

      // Limitar a 50 artículos por ley para la carga inicial
      const maxArticles = Math.min(articles.length, 50);
      console.log(`   📦 Procesando ${maxArticles} de ${articles.length} artículos...\n`);

      for (let i = 0; i < maxArticles; i++) {
        const content = articles[i];
        const numMatch = content.match(/^"?Art(?:í|i)culo\s*(\d+[^\.\-]*)/i);
        const articleLabel = numMatch ? `Artículo ${numMatch[1].trim()}` : `Artículo ${i + 1}`;

        try {
          // Generar embedding
          const embeddingText = `Ley chilena: ${title}\n${articleLabel}\nContenido: ${content.slice(0, 2000)}`;
          const embedding = await getEmbedding(embeddingText);

          if (!embedding) {
            console.log(`   ❌ [${i + 1}/${maxArticles}] ${articleLabel} — Sin embedding`);
            totalErrors++;
            continue;
          }

          // Insertar en Supabase
          await insertToSupabase({
            titulo: title,
            ley: ley.nombre.slice(0, 80),
            articulo: articleLabel,
            contenido: content.slice(0, 5000),
            url_fuente: url,
            categoria: ley.categoria,
            embedding
          });

          totalInserted++;
          process.stdout.write(`   ✅ [${i + 1}/${maxArticles}] ${articleLabel}\r\n`);

          // Esperar entre llamadas para no exceder rate limits
          await sleep(BATCH_DELAY_MS);

        } catch (articleErr) {
          console.log(`   ❌ [${i + 1}/${maxArticles}] ${articleLabel} — ${articleErr.message.slice(0, 80)}`);
          totalErrors++;
          // Si es rate limit, esperar más
          if (articleErr.message.includes('429') || articleErr.message.includes('RATE')) {
            console.log('   ⏳ Rate limit detectado. Esperando 30 segundos...');
            await sleep(30000);
          }
        }
      }

    } catch (err) {
      console.log(`   ❌ Error procesando ${ley.nombre}: ${err.message}`);
      totalErrors++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  🏁 INGESTA COMPLETADA`);
  console.log(`  ✅ Artículos insertados: ${totalInserted}`);
  console.log(`  ❌ Errores: ${totalErrors}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
