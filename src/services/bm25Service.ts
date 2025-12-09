import mongoose from 'mongoose';

const COLLECTION = process.env.MONGODB_COLLECTION || 'resumes';
const INDEX = process.env.MONGODB_BM25_INDEX || 'resume_bm25_index';

export type BM25Options = {
  limit?: number;
  fields?: string[];
  skip?: number;
};

export async function searchBM25(query: string, options: BM25Options = {}) {
  if (!query || typeof query !== 'string') {
    throw new Error('query must be a non-empty string');
  }

  const limit = Math.max(1, Math.min(100, options.limit ?? 10));
  const skip = Math.max(0, options.skip ?? 0);
  // Support both flat `text` field and chunked `textChunks.text` depending on your schema/index.
  // Also include other commonly indexed resume fields from the Atlas mapping.
  const fields = (options.fields && options.fields.length) ? options.fields : [
    'name',
    'text',
    'textChunks.text',
    'skills',
    'currentTitle',
    'currentOrganisation',
    'summary',
    'certifications',
    'locations'
  ];

  const db = mongoose.connection.db;
  const coll = db.collection(COLLECTION);

  const pipeline: any[] = [
    {
      $search: {
        index: INDEX,
        text: {
          query,
          path: fields
        }
      }
    },
    { $addFields: { score: { $meta: 'searchScore' } } },
    {
      $project: {
        score: 1,
        name: 1,
        email: 1,
        certifications: 1,
        currentOrganisation: 1,
        currentTitle: 1,
        educationLevel: 1,
        locations: 1,
        skills: 1,
        text: 1,
        textChunks: 1,
        totalExperience: 1,
        createdAt: 1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  const results = await coll.aggregate(pipeline).toArray();
  return results;
}
