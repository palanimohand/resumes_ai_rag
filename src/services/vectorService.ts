import mongoose from 'mongoose';
import { EmbeddingService } from './embeddingService';

const COLLECTION = process.env.MONGODB_COLLECTION || 'resumes';
const CANDIDATE_LIMIT = Number(process.env.MONGODB_VECTOR_CANDIDATE_LIMIT || '1000');

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

function cosine(a: number[], b: number[]) {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}

// Average chunk embeddings into a single vector per document
function averageEmbedding(chunks: any[]): number[] | null {
  if (!Array.isArray(chunks) || chunks.length === 0) return null;
  const vectors = chunks
    .map((c) => c?.embedding)
    .filter((e) => Array.isArray(e) && e.length > 0) as number[][];
  if (vectors.length === 0) return null;
  const dim = vectors[0].length;
  const acc = new Array(dim).fill(0);
  for (const v of vectors) {
    if (v.length !== dim) continue;
    for (let i = 0; i < dim; i++) acc[i] += v[i];
  }
  for (let i = 0; i < dim; i++) acc[i] = acc[i] / vectors.length;
  return acc;
}

export async function vectorSearchByEmbedding(embedding: number[], k = 10) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('embedding must be a non-empty array');
  }

  const db = mongoose.connection.db;
  const coll = db.collection(COLLECTION);

  // Fetch candidate documents which have at least one chunk embedding
  // Use a non-positional $exists check so documents where the first chunk
  // isn't embedded still match (common when embeddings are added later).
  // Match documents that either have a top-level `embedding` (used by the
  // Atlas vector index) or per-chunk embeddings under `textChunks.embedding`.
  const filter = { $or: [ { embedding: { $exists: true } }, { 'textChunks.embedding': { $exists: true } } ] };
  const cursor = coll.find(filter, {
    projection: {
      name: 1,
      email: 1,
      embedding: 1,
      // only request chunk embeddings to reduce payload when top-level missing
      'textChunks.embedding': 1,
      createdAt: 1
    },
    limit: CANDIDATE_LIMIT
  });

  const results: any[] = [];
  await cursor.forEach((doc) => {
    // Prefer top-level `embedding` if present (this aligns with the index)
    const docEmb = Array.isArray(doc.embedding) && doc.embedding.length > 0 ? doc.embedding : null;
    const avg = docEmb || averageEmbedding(doc.textChunks || []);
    if (avg && avg.length === embedding.length) {
      const score = cosine(embedding, avg);
      results.push({ doc, score });
    }
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k).map((r) => ({ score: r.score, doc: r.doc }));
}

export async function vectorSearchByText(text: string, k = 10) {
  // compute embedding then call vectorSearchByEmbedding
  const emb = await EmbeddingService.embedText(text);
  return vectorSearchByEmbedding(emb, k);
}
