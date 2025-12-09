const DEFAULT_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
const API_KEY = process.env.GROQ_API_KEY;

export class LLMError extends Error {
  public transient: boolean;
  constructor(message: string, transient = false) {
    super(message);
    this.transient = transient;
    this.name = 'LLMError';
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class LLMService {
  // A small wrapper that posts a prompt to a configured Groq endpoint and
  // normalizes the OpenAI-compatible response.
  static async call(prompt: string, model?: string): Promise<string> {
    if (!API_KEY) throw new LLMError('GROQ_API_KEY is not set in environment', false);
    const url = DEFAULT_API_URL;
    if (!url) throw new LLMError('GROQ_API_URL is not configured', false);

    const useModel = model || DEFAULT_MODEL;
    const body: any = {
      messages: [{ role: 'user', content: prompt }],
      model: useModel
    };

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          const textBody = await resp.text();
          const transient = resp.status >= 500 && resp.status < 600;
          throw new LLMError(`LLM responded ${resp.status}: ${textBody}`, transient);
        }

        const json = await resp.json();

        // Groq uses OpenAI-compatible format with choices array
        if (Array.isArray(json?.choices) && json.choices.length > 0) {
          const c = json.choices[0];
          if (typeof c?.message?.content === 'string') return c.message.content;
          if (Array.isArray(c?.message?.content)) return c.message.content.join('\n');
        }

        // Fallback for other formats
        if (typeof json?.text === 'string') return json.text;
        if (typeof json === 'string') return json;
      } catch (err: any) {
        if (err instanceof LLMError && !err.transient) throw err;
        if (attempt < maxAttempts) {
          const backoff = 200 * Math.pow(2, attempt - 1);
          await sleep(backoff);
          continue;
        }
        if (err instanceof LLMError) throw err;
        throw new LLMError(String(err?.message || err), true);
      }
    }

    throw new LLMError('Failed to call LLM after retries', true);
  }
}

export default LLMService;
