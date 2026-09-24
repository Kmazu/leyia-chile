import OpenAI from 'openai';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export async function processWithOpenAI(systemPrompt, userQuery) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no está configurada.');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const schema = {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "category": { "type": "string" },
      "summary": { "type": "string" },
      "facts": { "type": "array", "items": { "type": "string" } },
      "legalIssues": { "type": "array", "items": { "type": "string" } },
      "applicableLaw": { "type": "array", "items": { "type": "string" } },
      "jurisprudence": { "type": "array", "items": { "type": "string" } },
      "deadlines": { "type": "array", "items": { "type": "string" } },
      "procedure": { "type": "array", "items": { "type": "string" } },
      "evidence": { "type": "array", "items": { "type": "string" } },
      "risks": { "type": "array", "items": { "type": "string" } },
      "recommendations": { "type": "array", "items": { "type": "string" } },
      "sources": { "type": "array", "items": { "type": "string" } },
      "documents": { "type": "array", "items": { "type": "string" } },
      "disclaimer": { "type": "string" }
    },
    "required": ["title", "category", "summary", "facts", "legalIssues", "applicableLaw", "recommendations", "disclaimer"],
    "additionalProperties": false
  };

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'legal_response',
        strict: true,
        schema: schema
      }
    },
    temperature: 0.1
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);

  return {
    data: parsed,
    usage: {
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
      model: response.model
    }
  };
}
