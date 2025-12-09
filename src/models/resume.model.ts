import mongoose, { Schema, Document } from 'mongoose';

export interface ITextChunk {
  text: string;
  chunkIndex: number;
  embedding?: number[];
}

export interface IResume extends Document {
  name: string;
  email?: string;
  textChunks: ITextChunk[];
  createdAt: Date;
}

const TextChunkSchema = new Schema<ITextChunk>({
  text: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  embedding: { type: [Number], required: false }
});

const ResumeSchema = new Schema<IResume>({
  name: { type: String, required: true },
  email: { type: String },
  textChunks: { type: [TextChunkSchema], default: [] }
}, { timestamps: true });

export const ResumeModel = mongoose.model<IResume>('Resume', ResumeSchema);
