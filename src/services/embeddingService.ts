/*
  EmbeddingService
  - Calls Mistral embedding API using global fetch (Node 18+)
  - Retries transient errors with exponential backoff
  - Normalizes response to return a numeric array
*/

const DEFAULT_API_URL = process.env.MISTRAL_API_URL || 'https://api.mistral.ai/v1/embeddings';
const DEFAULT_MODEL = process.env.EMBEDDING_MODEL || 'mistral-embed';
const API_KEY = process.env.MISTRAL_API_KEY;

export class EmbeddingError extends Error {
  public transient: boolean;
  constructor(message: string, transient = false) {
    super(message);
    this.transient = transient;
    this.name = 'EmbeddingError';
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class EmbeddingService {
  static async embedText(text: string, model?: string): Promise<number[]> {
    if (!API_KEY) {
      throw new EmbeddingError('MISTRAL_API_KEY is not set in environment', false);
    }
    const url = DEFAULT_API_URL;
    const useModel = model || DEFAULT_MODEL;

    const body = { input: text, model: useModel };

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          const textBody = await resp.text();
          // treat 5xx as transient
          const transient = resp.status >= 500 && resp.status < 600;
          throw new EmbeddingError(`Mistral responded ${resp.status}: ${textBody}`, transient);
        }

        const json = await resp.json();

        // Normalize common response shapes
        // e.g. { data: [{ embedding: [...] }], model }
        if (json && Array.isArray(json.data) && json.data.length > 0 && Array.isArray(json.data[0].embedding)) {
          return json.data[0].embedding as number[];
        }

        // e.g. { embedding: [...] }
        if (json && Array.isArray(json.embedding)) {
          return json.embedding as number[];
        }

        throw new EmbeddingError('Unexpected embedding response shape from Mistral', false);
      } catch (err: any) {
        // If it's our EmbeddingError and not transient -> rethrow immediately
        if (err instanceof EmbeddingError && !err.transient) throw err;

        if (attempt < maxAttempts) {
          const backoffMs = 200 * Math.pow(2, attempt - 1);
          await sleep(backoffMs);
          continue;
        }

        // final attempt failed
        if (err instanceof EmbeddingError) throw err;
        throw new EmbeddingError(String(err?.message || err), true);
      }
    }

    throw new EmbeddingError('Failed to obtain embedding after retries', true);
  }
}
