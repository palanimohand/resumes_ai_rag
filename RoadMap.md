Phase1:
Create a Node.js + Express application with:
- Service layer architecture (controllers → services)
- Environment-based configuration management
- URL path versioning (/api/v1/*)
- Simple console logging with levels
- Basic health check endpoint returning 200 OK

Phase2:
Implement MongoDB connectivity with:
- Single global connection instance
- Resume schema: single collection with embedded arrays for text chunks and vector embeddings
- Separate indexes: text index for BM25 and vector index for embeddings
- Connectivity check endpoint

Phase3:
Add AI-powered features:
- LLM re-ranking for top-N hybrid results (configurable model)
- Template-based summarization focusing on predefined fields
- Fail-fast error handling - return immediately on any component failure

Phase4:
Create end-to-end resume search pipeline:
- Orchestrates BM25 → vector → hybrid → re-ranking → summarization
- Maintains service layer separation
- Uses environment variables for all configurable parameters
- Implements basic response time logging