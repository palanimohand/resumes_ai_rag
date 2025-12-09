Technical Architecture Document: Node.js + Express RAG-Based Resume Search System
1. System Overview
Architecture Pattern: Service layer pattern with controllers delegating to specialized services (B)
API Versioning: URL path versioning (/api/v1/*) (A)
Configuration Management: Environment variables with default values and validation (A)

2. Data Layer Architecture
Database: MongoDB with single global connection instance (B)
Schema Design: Single collection with embedded arrays for text chunks and vector embeddings (A)
Indexing Strategy: Separate indexes - text index for BM25 and vector index for embeddings (A)

3. Search & AI Components
Embedding Service: Direct Mistral API calls from each service as needed (A)
BM25 Search: MongoDB text search on configured index names
Vector Search: MongoDB vector similarity search on configured index names
Hybrid Search: Reciprocal Rank Fusion (RRF) for combining ranked results (A)
Re-ranking: Re-rank only top-N results from hybrid search (B)
Summarization: Template-based summarization focusing on predefined fields only (D)

4. API Design & Orchestration
Health Check: Simple endpoint returning 200 OK when server is running (A)
Error Handling: Fail-fast - return error immediately if any component fails (A)
Payload Management: Limit total results with fixed maximum return count (B)

5. Operational Concerns
Logging: Simple console logging with different log levels (B)
Metrics: Basic response time logging without detailed metrics aggregation (D)

