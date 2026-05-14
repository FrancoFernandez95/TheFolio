import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  externalId: { type: String, default: null },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  cover: { type: String, default: '' },
  year: { type: Number, default: null },
  isbn: { type: String, default: null },
  source: { type: String, default: 'manual' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  lastSummary: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
