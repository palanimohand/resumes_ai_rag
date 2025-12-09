import { Request, Response } from 'express';
import { EmbeddingService, EmbeddingError } from '../services/embeddingService';

export async function embeddingsHandler(req: Request, res: Response) {
  const { text, model } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Request body must include `text` string.' });
  }

  try {
    const embedding = await EmbeddingService.embedText(text, model);
    return res.status(200).json({
      embedding,
      model: model || process.env.EMBEDDING_MODEL || null,
      dim: embedding.length
    });
  } catch (err: any) {
    if (err instanceof EmbeddingError) {
      const status = err.transient ? 502 : 400;
      return res.status(status).json({ error: err.message });
    }
    console.error('embeddingsHandler error', err);
    return res.status(500).json({ error: 'internal_error', details: String(err?.message || err) });
  }
}
