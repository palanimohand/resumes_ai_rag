import { Request, Response } from 'express';
import { searchBM25 } from '../services/bm25Service';

export async function bm25Handler(req: Request, res: Response) {
  const { query, limit, fields, skip } = req.body ?? {};

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Request body must include `query` string.' });
  }

  try {
    const results = await searchBM25(query, { limit: Number(limit) || 10, fields, skip: Number(skip) || 0 });
    return res.status(200).json({
      query,
      model: 'bm25',
      count: results.length,
      results
    });
  } catch (err: any) {
    console.error('bm25Handler error', err);
    return res.status(500).json({ error: 'bm25_search_failed', details: String(err?.message || err) });
  }
}
