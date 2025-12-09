import { hybridSearch } from './hybridService';
import { rerankWithLLM } from './rerankService';
import { summarizeWithQuery } from './summarizeService';

export type PipelineOptions = {
  // Hybrid search params
  limit?: number;
  bm25Limit?: number;
  vectorTopK?: number;
  rrfK?: number;
  bm25Weight?: number;
  vectorWeight?: number;
  fields?: string[];

  // Reranking params
  rerank?: boolean;
  rerankModel?: string;
  rerankTopK?: number;

  // Summarization params
  summarize?: boolean;
  summarizeModel?: string;
  summarizeTemplate?: 'brief' | 'detailed';

  // Include raw results in response
  includeRaw?: boolean;
};

export async function endToEndSearch(query: string, opts: PipelineOptions = {}) {
  if (!query || typeof query !== 'string') {
    throw new Error('query must be a non-empty string');
  }

  const limit = Math.max(1, Math.min(100, opts.limit ?? 10));
  const shouldRerank = opts.rerank !== false; // default true
  const shouldSummarize = opts.summarize ?? false; // default false
  const includeRaw = opts.includeRaw ?? false;

  // Step 1: Hybrid search
  const hybridResults = await hybridSearch(query, {
    limit: opts.bm25Limit || limit * 5,
    bm25Limit: opts.bm25Limit,
    vectorTopK: opts.vectorTopK,
    rrfK: opts.rrfK,
    bm25Weight: opts.bm25Weight,
    vectorWeight: opts.vectorWeight,
    fields: opts.fields
  });

  let results = hybridResults.slice(0, limit);

  // Step 2: Reranking (optional, default enabled)
  if (shouldRerank && results.length > 0) {
    try {
      const rerankResults = await rerankWithLLM(query, results, {
        model: opts.rerankModel,
        topK: opts.rerankTopK || limit
      });
      results = rerankResults.slice(0, limit);
    } catch (err: any) {
      console.warn('Reranking failed, continuing with hybrid results:', err?.message);
    }
  }

  // Step 3: Summarization (optional, default disabled)
  let summaries: any[] = [];
  if (shouldSummarize && results.length > 0) {
    try {
      const docs = results.map((r) => r.doc || r);
      const summarizeResult = await summarizeWithQuery(docs, query, {
        model: opts.summarizeModel,
        template: opts.summarizeTemplate
      });
      summaries = [{ summary: summarizeResult.summary, source: summarizeResult.source }];
    } catch (err: any) {
      console.warn('Summarization failed, skipping:', err?.message);
    }
  }

  // Build response
  return {
    query,
    pipeline: {
      hybrid: true,
      rerank: shouldRerank,
      summarize: shouldSummarize
    },
    resultCount: results.length,
    results: results.map((r) => ({
      id: r.id,
      score: r.score,
      sources: r.sources,
      doc: includeRaw ? r.doc : r.doc ? { _id: r.doc._id, name: r.doc.name, email: r.doc.email } : r
    })),
    summaries: summaries.length > 0 ? summaries : undefined
  };
}

export default {
  endToEndSearch
};
