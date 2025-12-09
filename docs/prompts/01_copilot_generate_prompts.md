# Copilot Side Chat — Generate Code Prompt Templates

Purpose
- Provide structured, enterprise-grade prompt templates for generating new code, services, or components in the Resume Search (RAG) project.

How to use
- Paste the template into Copilot Side Chat as the user message. Fill placeholders and attach or paste small, relevant files or snippets when asked.

System message (recommended)
You are a senior Node.js/TypeScript engineer and reviewer. Produce secure, testable, and well-documented code following the project's architecture and conventions. Prioritize correctness, types, error handling, and minimal, reviewable diffs. Do not include private secrets or PII in your response.

Generate prompt template
- Project context: Briefly state the system architecture and important constraints (e.g., MongoDB vector index, Mistral embeddings, BM25 hybrid search, API path `/api/v1`).
- Task: One-sentence summary of what to generate.
- Acceptance criteria: bullet list of specific requirements (types, API contracts, tests, lint rules, performance targets).
- Files to create: list of file paths and short description for each.
- Example input/output: small examples for function behavior or sample API request/response.
- Tests to add: unit + integration test targets (framework: Jest recommended).
- Security & privacy constraints: e.g., no embedding of raw PII in prompts, sanitize inputs.
- Performance expectations: e.g., latency targets for embeddings and search operations.

Example
Project context: Resume RAG search microservice. Node.js + Express + TypeScript. MongoDB stores text chunks and vector embeddings. Re-rank top-N with cross-encoder.

Task: Implement `services/embeddingService.ts` — wrapper around Mistral embeddings API with caching and retry.

Acceptance criteria:
- Export TypeScript class `EmbeddingService` with methods `embedText(text: string): Promise<number[]>` and `embedBatch(texts: string[]): Promise<number[][]>`.
- Use `fetch` or `axios`, have retry logic with exponential backoff (3 attempts), and caching using an in-memory LRU (max 10k entries) interface.
- Throw typed errors for transient vs permanent failures.
- Add unit tests covering success, retry on transient errors, and cache hit.

Files to create:
- `src/services/embeddingService.ts` — implementation.
- `src/services/__tests__/embeddingService.test.ts` — Jest tests.

Example input/output snippet:
Input: `embedText('senior backend engineer with node.js and mongodb')`
Output: `Promise` resolving to an array of floats (length matches model embedding size).

Tests to run locally
```powershell
npm run test -- src/services/__tests__/embeddingService.test.ts
```

Notes for reviewer
- Keep diffs small and explain trade-offs in comments. Add typed errors and document env variables required in `.env.example`.
