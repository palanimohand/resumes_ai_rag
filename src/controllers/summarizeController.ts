import { Request, Response } from 'express';
import { summarizeDocuments, summarizeWithQuery } from '../services/summarizeService';

export async function summarizeHandler(req: Request, res: Response) {
  const { docs, query, model, template } = req.body || {};
  if (!Array.isArray(docs) || docs.length === 0) {
    return res.status(400).json({ error: '`docs` array required' });
  }

  try {
    const result = query
      ? await summarizeWithQuery(docs, query, { model, template })
      : await summarizeDocuments(docs, { model, template });

    return res.status(200).json({
      model: 'summarize',
      source: result.source,
      summary: result.summary,
      docCount: result.docs.length
    });
  } catch (err: any) {
    console.error('summarizeHandler error', err);
    return res.status(500).json({ error: 'summarize_failed', details: String(err?.message || err) });
  }
}

export default {
  summarizeHandler
};
