import LLMService, { LLMError } from './llmService';

type RerankOptions = {
  model?: string;
  topK?: number;
};

function snippetFromDoc(doc: any, maxLen = 300) {
  if (!doc) return '';
  if (doc.text && typeof doc.text === 'string') return doc.text.slice(0, maxLen);
  if (doc.summary && typeof doc.summary === 'string') return doc.summary.slice(0, maxLen);
  if (Array.isArray(doc.textChunks) && doc.textChunks.length > 0) {
    const t = doc.textChunks.map((c: any) => c.text).filter(Boolean).join(' ');
    return t.slice(0, maxLen);
  }
  return JSON.stringify(doc).slice(0, maxLen);
}

// Build a prompt requesting the LLM to return an ordered JSON array of candidate ids
function buildPrompt(query: string, candidates: any[]) {
  const header = `You are a search re-ranker. Given the user's query and a list of candidate documents, return a JSON array (only) containing the document ids ordered from most relevant to least relevant. Do not include any other text.`;

  let body = `${header}\n\nQuery: "${query.replace(/\"/g, '\\"')}"\n\nCandidates:`;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const id = c.id || c._id || (c.doc && c.doc._id) || `cand_${i}`;
    const doc = c.doc || c;
    const snip = snippetFromDoc(doc, 300).replace(/\n/g, ' ');
    body += `\n${i + 1}. id: ${id}\n   snippet: ${snip}\n`;
  }

  body += `\n\nReturn a JSON array of ids like ["id1","id2",...].`;
  return body;
}

function extractJsonArray(text: string): string[] | null {
  // Try direct parse
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch (e) {}

  // Try to extract first JSON array substring
  const m = text.match(/\[[\s\S]*?\]/);
  if (m) {
    try {
      const parsed = JSON.parse(m[0]);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch (e) {}
  }

  return null;
}

export async function rerankWithLLM(query: string, candidates: any[], opts: RerankOptions = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) return candidates;
  const topK = opts.topK && opts.topK > 0 ? Math.min(opts.topK, candidates.length) : candidates.length;
  const prompt = buildPrompt(query, candidates.slice(0, topK));

  try {
    const resp = await LLMService.call(prompt, opts.model);
    const ids = extractJsonArray(resp);
    if (!ids) return candidates; // fallback to original order

    // Map ids to original candidates order
    const idToCand = new Map<string, any>();
    for (const c of candidates) {
      const id = c.id || c._id || (c.doc && c.doc._id) || undefined;
      if (id) idToCand.set(String(id), c);
    }

    const ordered: any[] = [];
    for (const id of ids) {
      const c = idToCand.get(String(id));
      if (c) ordered.push(c);
    }

    // Append any candidates not returned by the model at the end, preserving original order
    for (const c of candidates) {
      if (!ordered.includes(c)) ordered.push(c);
    }

    return ordered;
  } catch (err: any) {
    if (err instanceof LLMError && !err.transient) throw err;
    // On error, return original candidates
    return candidates;
  }
}

export default {
  rerankWithLLM
};
