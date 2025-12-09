# Atlas Search — BM25 Index Configuration

Purpose
- Provide step-by-step instructions to create and configure an Atlas Search index suitable for BM25-style text search over resumes.

Overview
- Atlas Search ($search aggregation stage) uses Lucene analyzers and scoring. The service expects an index name matching `MONGODB_BM25_INDEX` in your `.env` (default: `resume_bm25_index`).

Recommended fields
- Fields to include from resume documents:
  - `name` (string)
  - `text` (string) — main resume text, stored as an array of chunks
  - (optional) `summary`, `skills`, `experience` if present in your schema

Create index using MongoDB Atlas UI
1. Open MongoDB Atlas → Clusters → Your cluster → Search (tab) → Create Search Index.
2. Select the correct `Database` and `Collection` (see `.env`: `MONGODB_DB_NAME`, `MONGODB_COLLECTION`).
3. Choose **Custom** for index definition and set `Index name` to the value of `MONGODB_BM25_INDEX`.
4. Use a mapping like the example below, adjusting fields to your schema.

Example index definition (JSON)
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "certifications": {
        "analyzer": "lucene.standard",
        "type": "string"
      },
      "currentOrganisation": {
        "analyzer": "lucene.standard",
        "type": "string"
      },
      "currentTitle": {
        "analyzer": "lucene.standard",
        "type": "string"
      },
      "educationLevel": {
        "analyzer": "lucene.keyword",
        "type": "string"
      },
      "email": {
        "analyzer": "lucene.keyword",
        "type": "string"
      },
      "locations": {
        "analyzer": "lucene.standard",
        "type": "string"
      },
      "name": {
        "analyzer": "lucene.standard",
        "type": "string"
      },
      "phone": {
        "analyzer": "lucene.keyword",
        "type": "string"
      },
      "relevantExperience": {
        "analyzer": "lucene.keyword",
        "type": "string"
      },
      "skills": {
        "analyzer": "lucene.standard",
        "type": "string"
      },
      "text": {
        "analyzer": "lucene.standard",
        "type": "string"
      },
      "totalExperience": {
        "analyzer": "lucene.keyword",
        "type": "string"
      }
    }
  }
}
```

Notes and tuning
- Analyzers: choose language-specific analyzers if your corpus is not English.
- Highlighting/snippets: use the `$search` `highlight` option in aggregations if you need snippets.
- Scores: use the returned `$meta: 'searchScore'` value as the BM25-like score.
- Index name: ensure `MONGODB_BM25_INDEX` in `.env` matches the created index.

Security and ops
- Index size: avoid indexing very large fields without chunking. The project uses `textChunks` to keep chunk sizes manageable.
- Changes to index mappings may require reindexing.
