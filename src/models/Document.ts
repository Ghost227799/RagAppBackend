import { Schema, model, Document } from 'mongoose';

interface IDocument extends Document {
  id: string;
  text: string;
  userId: string;
  embedding: number[];
}

const DocumentSchema = new Schema<IDocument>({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  userId: { type: String, required: true },
  embedding: { type: [Number], required: true },
});

const DocumentModel = model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
