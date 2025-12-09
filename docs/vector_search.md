# Vector Search — Application-side Nearest-Neighbor (Fallback)

Purpose
- Provide documentation for the `POST /v1/search/vector` endpoint and the chosen implementation strategy that avoids using MongoDB's `knnBeta` operator.

Overview
- For environments where the MongoDB `knnBeta` vector operator is not available or not desired, the service provides an application-side nearest-neighbor fallback:
  - Average chunk-level embeddings per document into a single document-level vector.
  - Compute cosine similarity between the query embedding and document vectors in the application.
  - Return the top-K matches.

Endpoint
- `POST /v1/search/vector`
- Request JSON options:
  - `{ "embedding": number[], "k"?: number }` — search by embedding
  - `{ "text": string, "k"?: number }` — compute embedding (using Mistral) then search
- Response JSON: `{ "model": "vector", "count": number, "results": [{ score: number, doc: { ... } }] }`

Implementation notes
- File: `src/services/vectorService.ts` — contains `vectorSearchByEmbedding` and `vectorSearchByText`.
- Candidate fetching: documents with `textChunks.embedding` are fetched (limited by `MONGODB_VECTOR_CANDIDATE_LIMIT`, default 1000).
- Per-document vector: average of chunk embeddings (`textChunks[].embedding`).
- Similarity: cosine similarity computed in Node.js.

Production recommendations
- For large collections or low latency requirements, prefer a native vector index (Atlas vector search or external ANN like Faiss/HNSW) rather than the application-side fallback.
- If you enable Atlas vector search in the future, replace the application-side method with a `$search` aggregation using a vector operator and an index referenced by `MONGODB_VECTOR_INDEX`.

Env vars
- `MONGODB_VECTOR_INDEX` — (optional) Atlas vector index name if using Atlas vector search later.
- `MONGODB_VECTOR_CANDIDATE_LIMIT` — candidate documents to fetch for application-side search (default 1000).
