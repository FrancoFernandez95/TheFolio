import mongoose from 'mongoose';

const pointsBreakdownSchema = new mongoose.Schema({
  minutesRead: { type: Number, default: 0 },
  basePoints: { type: Number, default: 0 },
  askedWordsCount: { type: Number, default: 0 },
  wordPoints: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completionMultiplier: { type: Number, default: 1 },
  hasReflection: { type: Boolean, default: false },
  reflectionMultiplier: { type: Number, default: 1 },
  streakDays: { type: Number, default: 0 },
  streakMultiplier: { type: Number, default: 1 },
  finalPoints: { type: Number, default: 0 }
}, { _id: false });

const readingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  duration: { type: Number, required: true },
  reflection: { type: String, default: '', maxlength: 200 },
  pointsEarned: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  pointsBreakdown: pointsBreakdownSchema,
  finalized: { type: Boolean, default: false },
  actualMinutesRead: { type: Number, default: 0 },
  askedWords: [{
    word: { type: String },
    definition: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('ReadingSession', readingSessionSchema);
