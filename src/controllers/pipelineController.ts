import { Request, Response } from 'express';
import { endToEndSearch } from '../services/pipelineService';

export async function searchHandler(req: Request, res: Response) {
  const {
    query,
    limit,
    bm25Limit,
    vectorTopK,
    rrfK,
    bm25Weight,
    vectorWeight,
    fields,
    rerank,
    rerankModel,
    rerankTopK,
    summarize,
    summarizeModel,
    summarizeTemplate,
    includeRaw
  } = req.body || {};

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: '`query` string required' });
  }

  try {
    const result = await endToEndSearch(query, {
      limit: Number(limit) || 10,
      bm25Limit: bm25Limit ? Number(bm25Limit) : undefined,
      vectorTopK: vectorTopK ? Number(vectorTopK) : undefined,
      rrfK: rrfK ? Number(rrfK) : undefined,
      bm25Weight: bm25Weight ? Number(bm25Weight) : undefined,
      vectorWeight: vectorWeight ? Number(vectorWeight) : undefined,
      fields: Array.isArray(fields) ? fields : undefined,
      rerank: rerank !== false,
      rerankModel,
      rerankTopK: rerankTopK ? Number(rerankTopK) : undefined,
      summarize: summarize === true,
      summarizeModel,
      summarizeTemplate: summarizeTemplate || 'brief',
      includeRaw: includeRaw === true
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('searchHandler error', err);
    return res.status(500).json({ error: 'search_failed', details: String(err?.message || err) });
  }
}

export default {
  searchHandler
};
