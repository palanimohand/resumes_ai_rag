import { Request, Response } from 'express';
import { hybridSearch } from '../services/hybridService';

export async function hybridHandler(req: Request, res: Response) {
  const { query, limit, bm25Limit, vectorTopK, rrfK, fields } = req.body || {};
  if (!query || typeof query !== 'string') return res.status(400).json({ error: '`query` string required' });

  try {
    const results = await hybridSearch(query, {
      limit: Number(limit) || 10,
      bm25Limit: Number(bm25Limit) || undefined,
      vectorTopK: Number(vectorTopK) || undefined,
      rrfK: rrfK ? Number(rrfK) : undefined,
      fields: Array.isArray(fields) ? fields : undefined
    });

    return res.status(200).json({ model: 'hybrid', count: results.length, results });
  } catch (err: any) {
    console.error('hybridHandler error', err);
    return res.status(500).json({ error: 'hybrid_search_failed', details: String(err?.message || err) });
  }
}

export default {
  hybridHandler
};
