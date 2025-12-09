# Copilot Side Chat — Create Endpoint: `/v1/embeddings`

Purpose
- Provide a ready-to-use prompt for generating the `/v1/embeddings` endpoint and associated service that calls Mistral embeddings.

System message (recommended)
You are a senior Node.js/TypeScript engineer. Produce small, well-tested, and type-safe code following the project's architecture: service layer pattern, controllers, and routes. Keep diffs small and include unit tests using Jest and Supertest.

Goal
- Implement `POST /v1/embeddings` which accepts a single `text` string (and optional `model`) and returns a numeric embedding array produced by the Mistral embedding API.

Endpoint specification
- Method: `POST`
- Path: `/v1/embeddings` (also mounted at `/api/v1/embeddings`)
- Request JSON: `{ "text": "string", "model"?: "string" }`
- Response JSON: `{ "embedding": number[], "model": string|null, "dim": number }`
- Errors: `400` for bad input, `502` for transient upstream errors, `500` for unexpected server errors.

Implementation details
- Add service `src/services/embeddingService.ts` with method `embedText(text: string, model?: string): Promise<number[]>`.
- Service must read `MISTRAL_API_KEY` and `MISTRAL_API_URL` from env; default model from `EMBEDDING_MODEL`.
- Use global `fetch` (Node 18+). Retry transient failures (3 attempts, exponential backoff).
- Add controller `src/controllers/embeddingsController.ts` to validate input and return normalized response.
- Add route in `src/routes/api.v1.ts`: `router.post('/embeddings', embeddingsHandler)`.

Tests to add (recommended)
- Unit test for `EmbeddingService` mocking `fetch` for success and failure.
- Integration test for `/v1/embeddings` using Supertest and a mocked EmbeddingService.

Example prompt to give to Copilot Side Chat
```
Project context: Resume RAG microservice with Express + TypeScript. Use Mistral for embeddings. Node 18+ available.

Task: Create `EmbeddingService` + `embeddingsController` and add POST `/v1/embeddings` route.

Acceptance criteria:
- Service reads `MISTRAL_API_KEY` and throws a helpful error if missing.
- Service retries transient failures and normalizes response to `number[]`.
- Controller validates `text` and returns JSON `{embedding, model, dim}`.
- Add unit and integration tests (Jest + Supertest) that mock the external API.

Files to create/update:
- `src/services/embeddingService.ts`
- `src/controllers/embeddingsController.ts`
- `src/routes/api.v1.ts` (add route)
- `docs/prompts/create_endpoint.md` (this file)

Run tests locally:
```powershell
npm run test -- tests/embeddings.test.ts
```

Notes for reviewer
- Do not include real API keys; use placeholders in tests and `.env.example`.
- Keep handlers small and return helpful HTTP status codes for upstream failures.
