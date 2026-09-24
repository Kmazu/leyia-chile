export async function processWithGemini(systemPrompt, userQuery) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY no está configurada.');
  }

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ];

  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      category: { type: "STRING" },
      summary: { type: "STRING" },
      facts: { type: "ARRAY", items: { type: "STRING" } },
      legalIssues: { type: "ARRAY", items: { type: "STRING" } },
      applicableLaw: { type: "ARRAY", items: { type: "STRING" } },
      jurisprudence: { type: "ARRAY", items: { type: "STRING" } },
      deadlines: { type: "ARRAY", items: { type: "STRING" } },
      procedure: { type: "ARRAY", items: { type: "STRING" } },
      evidence: { type: "ARRAY", items: { type: "STRING" } },
      risks: { type: "ARRAY", items: { type: "STRING" } },
      recommendations: { type: "ARRAY", items: { type: "STRING" } },
      sources: { type: "ARRAY", items: { type: "STRING" } },
      documents: { type: "ARRAY", items: { type: "STRING" } },
      disclaimer: { type: "STRING" }
    },
    required: ["title", "category", "summary", "facts", "legalIssues", "applicableLaw", "recommendations", "disclaimer"]
  };

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
            { role: 'user', parts: [{ text: `${systemPrompt}\\n\\nConsulta del Usuario: "${userQuery}"` }] }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.1
          }
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

  const parsed = JSON.parse(candidateText);

  return {
    data: parsed,
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: data.usageMetadata?.totalTokenCount || 0,
      model: selectedModel
    }
  };
}
