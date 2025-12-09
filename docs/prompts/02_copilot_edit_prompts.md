# Copilot Side Chat — Edit / Refactor Prompt Templates

Purpose
- Provide structured prompts for asking Copilot to edit, refactor, or extend existing code while preserving API contracts and tests.

System message (recommended)
You are a senior engineer and refactorer. When editing code, preserve public function signatures unless the request explicitly allows breaking changes. Provide minimal diffs, update tests, and include a short rationale for changes. Maintain TypeScript types and add or update unit tests.

Edit prompt template
- Project context: short reminder of architecture and constraints.
- Target files: list files or paths to edit.
- Change request: explicit description of change (e.g., "make embedding calls cancellable", "replace in-memory cache with Redis-backed cache").
- Backward compatibility: note if breaking changes are allowed.
- Tests to modify/add: list of tests that must be updated.
- Performance/resource considerations: memory, cold-start, concurrency.

Diff & patch expectation
- Ask for a patch in unified diff format or a list of `*** Update File:` style edits you can apply directly.
- Prefer small, atomic changes per patch.

Example request
Project context: Resume RAG, embeddings cached in memory.

Target files:
- `src/services/embeddingService.ts`
- `src/services/__tests__/embeddingService.test.ts`

Change request: Replace the in-memory LRU cache with a Redis-backed cache implementation behind the same `Cache` interface. Keep public method signatures unchanged. Add integration test that uses a local Redis test container (or mocked client).

Acceptance criteria
- New Redis-based `Cache` implementation under `src/lib/cache/redisCache.ts`.
- `EmbeddingService` uses the new cache via dependency injection.
- Unit + integration tests added/updated and passing.
- Provide migration notes and `.env.example` additions.

Commit message guideline
- `feat(cache): add redis-backed cache and wire into EmbeddingService` plus short scope and note about tests added.

Reviewer notes
- Ensure secrets are read from env; do not hardcode credentials.
- Add documentation to `docs/operations.md` if the change affects deployment.
