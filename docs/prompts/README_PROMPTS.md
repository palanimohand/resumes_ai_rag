# Prompt Files — README

What these files are
- `01_copilot_generate_prompts.md`: templates for generating new code and services.
- `02_copilot_edit_prompts.md`: templates for refactors and edits that preserve compatibility.
- `03_copilot_debug_prompts.md`: templates for debugging and producing safe, test-backed fixes.

Usage
- Open the appropriate file and copy the template into the Copilot Side Chat as the user message. Fill in the `Project context`, `Files`, and `Acceptance criteria` sections.

Best practices
- Keep prompts focused and limited in scope.
- Attach or paste only the minimal code needed to reproduce the issue.
- Ask for tests and small diffs.
- Always request a short rationale and migration notes for breaking changes.

Quick example (Generate)
```
Project context: Resume RAG search microservice. Need a small Express health endpoint.
Task: Create `src/controllers/healthController.ts` returning 200 with JSON `{status: 'ok'}`.
Acceptance criteria: TypeScript, unit test, route mounted at `/api/v1/health`.
```
