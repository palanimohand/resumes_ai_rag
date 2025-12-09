import { Router } from 'express';
import { healthHandler } from '../controllers/healthController';
import { embeddingsHandler } from '../controllers/embeddingsController';
import { bm25Handler } from '../controllers/searchController';
import { vectorHandler } from '../controllers/vectorController';
import { hybridHandler } from '../controllers/hybridController';
import { rerankHandler } from '../controllers/rerankController';
import { summarizeHandler } from '../controllers/summarizeController';
import { searchHandler } from '../controllers/pipelineController';

const router = Router();

router.get('/health', healthHandler);

// Embeddings
router.post('/embeddings', embeddingsHandler);

// BM25 search (Atlas Search)
router.post('/search/bm25', bm25Handler);

// Vector search (application-side NN fallback)
router.post('/search/vector', vectorHandler);

// Hybrid search (BM25 + vector using RRF)
router.post('/search/hybrid', hybridHandler);

// LLM re-ranking of an existing candidate list
router.post('/search/rerank', rerankHandler);

// Summarization of documents
router.post('/search/summarize', summarizeHandler);

// End-to-end pipeline: hybrid search → rerank → summarize
router.post('/search', searchHandler);

export default router;
