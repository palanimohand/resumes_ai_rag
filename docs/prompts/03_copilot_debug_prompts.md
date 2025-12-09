# Copilot Side Chat — Debugging Prompt Templates

Purpose
- Provide structured prompts for debugging runtime issues, test failures, or performance regressions in the Resume RAG project.

System message (recommended)
You are a senior engineer focused on debugging Node.js/TypeScript systems. Provide clear reproduction steps, root-cause hypotheses, and a minimal, test-backed patch. Prioritize safe fixes and include roll-back/migration guidance where relevant.

Debug prompt template
- Environment: Node version, OS, important env vars (MongoDB URI, API keys, Redis/Cache), branch or commit hash.
- Reproduction steps: exact commands, sample payloads, and expected vs actual behavior.
- Logs & traces: paste relevant error logs, stack traces, and test output.
- Time window and frequency: when it started and how often it happens.
- Hypothesis: what you think the cause might be (optional).
- Quick mitigations: config flags, toggles, or circuit-breakers to apply while investigating.
- Requested output: ask Copilot for a patch, unit test, or a sequence of investigative CLI commands.

Example request
Environment:
- `node v18.17`, Windows PowerShell v5.1
- MongoDB: `mongodb://localhost:27017/resumes`

Reproduction steps:
1. Run `npm run dev` and `curl -X POST http://localhost:3000/api/v1/search -d '{"q":"data engineer"}'`
2. Observe 500 error with stack trace `TypeError: Cannot read property 'map' of undefined` in `src/services/hybridService.ts:87`

Logs (paste):
```
TypeError: Cannot read property 'map' of undefined
    at HybridService.recombine (/src/services/hybridService.ts:87:25)
    at processTicksAndRejections (internal/process/task_queues.js:...)
```

Requested output
- A minimal patch that guards against undefined and a unit test reproducing the bug. Explain root cause and potential impact.

Commands Copilot can suggest for investigation
- `node --enable-source-maps ./node_modules/.bin/jest src/services/hybridService.test.ts -t "recombine"`
- Add additional logging around inputs to `recombine`.

Security & Safety
- Do not include or request real API keys or secrets. Replace secrets with placeholders in any returned code.
