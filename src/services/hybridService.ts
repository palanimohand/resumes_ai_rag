import { searchBM25 } from './bm25Service';
import { vectorSearchByText, vectorSearchByEmbedding } from './vectorService';
import { ObjectId } from 'mongodb';

type HybridOptions = {
  limit?: number; // final number of results
  bm25Limit?: number; // how many bm25 candidates to fetch
  vectorTopK?: number; // how many vector candidates to fetch
  rrfK?: number; // RRF constant
  bm25Weight?: number; // weight multiplier for bm25 ranks
  vectorWeight?: number; // weight multiplier for vector ranks
  fields?: string[];
};

// Reciprocal Rank Fusion (RRF)
function rrfScore(rank: number, k = 60) {
  return 1 / (k + rank);
}

export async function hybridSearch(query: string, opts: HybridOptions = {}) {
  if (!query || typeof query !== 'string') throw new Error('query must be a non-empty string');

  const limit = Math.max(1, Math.min(100, opts.limit ?? 10));
  const bm25Limit = Math.max(limit, opts.bm25Limit ?? Math.max(50, limit * 5));
  const vectorTopK = Math.max(limit, opts.vectorTopK ?? Math.max(50, limit * 5));
  const rrfK = opts.rrfK ?? 60;
  const bm25Weight = opts.bm25Weight ?? 1;
  const vectorWeight = opts.vectorWeight ?? 1;

  // Fetch candidates in parallel
  const [bm25Results, vectorResults] = await Promise.all([
    searchBM25(query, { limit: bm25Limit, fields: opts.fields }),
    vectorSearchByText(query, vectorTopK)
  ]);

  // Build map of scores by document id
  type ScoreEntry = { id: string; doc: any; combined: number; sources: { bm25?: number; vector?: number } };
  const scores = new Map<string, ScoreEntry>();

  // Process BM25 results (they typically include `score` meta from $meta: 'searchScore')
  for (let i = 0; i < bm25Results.length; i++) {
    const r = bm25Results[i];
    const id = (r._id && r._id.toString) ? r._id.toString() : String(r._id || i);
    const add = rrfScore(i + 1, rrfK) * bm25Weight;
    const entry = scores.get(id) ?? ({ id, doc: r, combined: 0, sources: {} as { bm25?: number; vector?: number } } as ScoreEntry);
    entry.combined += add;
    entry.sources.bm25 = r.score ?? add; // preserve original score for debugging
    entry.doc = entry.doc || r;
    scores.set(id, entry);
  }

  // Process vector results (vectorResults is array of { score, doc })
  for (let i = 0; i < vectorResults.length; i++) {
    const r = vectorResults[i];
    const doc = r.doc || r;
    const id = (doc._id && doc._id.toString) ? doc._id.toString() : String(doc._id || `v${i}`);
    const add = rrfScore(i + 1, rrfK) * vectorWeight;
    const entry = scores.get(id) ?? ({ id, doc, combined: 0, sources: {} as { bm25?: number; vector?: number } } as ScoreEntry);
    entry.combined += add;
    entry.sources.vector = r.score ?? add;
    entry.doc = entry.doc || doc;
    scores.set(id, entry);
  }

  // Convert to array and sort by combined score desc
  const merged = Array.from(scores.values())
    .sort((a, b) => b.combined - a.combined)
    .slice(0, limit)
    .map((e) => ({ id: e.id, score: e.combined, sources: e.sources, doc: e.doc }));

  return merged;
}

export default {
  hybridSearch
};
