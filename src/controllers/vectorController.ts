import { Request, Response } from 'express';
import { vectorSearchByEmbedding, vectorSearchByText } from '../services/vectorService';

export async function vectorHandler(req: Request, res: Response) {
  const { embedding, text, k } = req.body ?? {};
  const topK = Number(k) || 10;

  if (!embedding && !text) {
    return res.status(400).json({ error: 'Request body must include `embedding` or `text`.' });
  }

  try {
    let results;
    if (embedding) {
      if (!Array.isArray(embedding)) return res.status(400).json({ error: '`embedding` must be an array of numbers' });
      results = await vectorSearchByEmbedding(embedding as number[], topK);
    } else {
      results = await vectorSearchByText(text as string, topK);
    }

    return res.status(200).json({ model: 'vector', count: results.length, results });
  } catch (err: any) {
    console.error('vectorHandler error', err);
    return res.status(500).json({ error: 'vector_search_failed', details: String(err?.message || err) });
  }
}
