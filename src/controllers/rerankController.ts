import { Request, Response } from 'express';
import { rerankWithLLM } from '../services/rerankService';

export async function rerankHandler(req: Request, res: Response) {
  const { query, candidates, model, topK } = req.body || {};
  if (!query || typeof query !== 'string') return res.status(400).json({ error: '`query` required' });
  if (!Array.isArray(candidates) || candidates.length === 0) return res.status(400).json({ error: '`candidates` array required' });

  try {
    const ordered = await rerankWithLLM(query, candidates, { model, topK: Number(topK) || undefined });
    return res.status(200).json({ model: 'llm-rerank', count: ordered.length, results: ordered });
  } catch (err: any) {
    console.error('rerankHandler error', err);
    return res.status(500).json({ error: 'rerank_failed', details: String(err?.message || err) });
  }
}

export default {
  rerankHandler
};
