import LLMService, { LLMError } from './llmService';

type SummarizeOptions = {
  model?: string;
  maxTokens?: number;
  template?: 'brief' | 'detailed';
};

// Extract key fields from a document for template-based fallback
function templateSummary(doc: any, template: 'brief' | 'detailed' = 'brief'): string {
  const fields = {
    name: doc?.name || 'Unknown',
    title: doc?.currentTitle || 'Not specified',
    company: doc?.currentOrganisation || 'Not specified',
    skills: Array.isArray(doc?.skills) ? doc.skills.slice(0, 5).join(', ') : 'Not specified',
    experience: doc?.totalExperience || 'Not specified',
    email: doc?.email || 'Not provided',
    locations: Array.isArray(doc?.locations) ? doc.locations.join(', ') : 'Not specified',
    education: doc?.educationLevel || 'Not specified'
  };

  if (template === 'brief') {
    return `${fields.name} is a ${fields.title} at ${fields.company} with ${fields.experience} years of experience. Key skills: ${fields.skills}.`;
  }

  return `
Name: ${fields.name}
Current Title: ${fields.title}
Current Organization: ${fields.company}
Email: ${fields.email}
Locations: ${fields.locations}
Education Level: ${fields.education}
Total Experience: ${fields.experience} years
Key Skills: ${fields.skills}
`.trim();
}

// Build a prompt for LLM to summarize the document(s)
function buildSummarizePrompt(docs: any[], query?: string): string {
  const docTexts = docs
    .map((d, i) => {
      const text = d.text || (Array.isArray(d.textChunks) ? d.textChunks.map((c: any) => c.text).join(' ') : '');
      return `Document ${i + 1}:\nName: ${d.name || 'N/A'}\nContent: ${text.slice(0, 1000)}`;
    })
    .join('\n\n');

  let prompt = `Summarize the following document(s) in a concise, professional manner focusing on key skills, experience, and qualifications.`;
  if (query) prompt += ` Consider the query: "${query}"`;
  prompt += `\n\n${docTexts}\n\nProvide a 2-3 sentence summary.`;

  return prompt;
}

export async function summarizeDocuments(docs: any[], opts: SummarizeOptions = {}) {
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error('docs must be a non-empty array');
  }

  const template = opts.template || 'brief';

  // Try LLM first if available
  try {
    const prompt = buildSummarizePrompt(docs);
    const summary = await LLMService.call(prompt, opts.model);
    return { summary, source: 'llm', docs };
  } catch (err: any) {
    if (err instanceof LLMError && !err.transient) throw err;
    // Fall back to template-based summary
    console.warn('LLM summarization failed, using template fallback:', err?.message);
  }

  // Template fallback: summarize each doc and return array
  const summaries = docs.map((d) => templateSummary(d, template));
  return { summary: summaries.join('\n\n'), source: 'template', docs };
}

export async function summarizeWithQuery(docs: any[], query: string, opts: SummarizeOptions = {}) {
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error('docs must be a non-empty array');
  }
  if (!query || typeof query !== 'string') {
    throw new Error('query must be a non-empty string');
  }

  try {
    const prompt = buildSummarizePrompt(docs, query);
    const summary = await LLMService.call(prompt, opts.model);
    return { summary, source: 'llm', query, docs };
  } catch (err: any) {
    if (err instanceof LLMError && !err.transient) throw err;
    console.warn('LLM summarization with query failed, using template fallback:', err?.message);
  }

  const template = opts.template || 'brief';
  const summaries = docs.map((d) => templateSummary(d, template));
  return { summary: summaries.join('\n\n'), source: 'template', query, docs };
}

export default {
  summarizeDocuments,
  summarizeWithQuery
};
