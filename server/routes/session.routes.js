import express from 'express';
import ReadingSession from '../models/ReadingSession.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/', async (req, res) => {
  const { bookId, duration } = req.body;
  if (!bookId || !duration) return res.status(400).json({ message: 'Faltan datos' });

  const session = await ReadingSession.create({ userId: req.userId, bookId, duration });
  res.status(201).json({ session });
});

router.patch('/:id/finish', async (req, res) => {
  const { reflection, minutesRead, askedWords } = req.body;

  const session = await ReadingSession.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) return res.status(404).json({ message: 'Sesión no encontrada' });
  if (session.finalized) return res.status(400).json({ message: 'Sesión ya finalizada' });

  const user = await User.findById(req.userId);
  const actualMinutes = minutesRead || session.duration;
  const pointsEarned = Math.round(actualMinutes * 10);
  
  let streakEarned = 0;
  const now = new Date();
  
  if (actualMinutes >= 5) {
    if (!user.lastStreakUpdate) {
      streakEarned = 1;
    } else {
      const lastUpdate = new Date(user.lastStreakUpdate);
      if (
        lastUpdate.getFullYear() !== now.getFullYear() ||
        lastUpdate.getMonth() !== now.getMonth() ||
        lastUpdate.getDate() !== now.getDate()
      ) {
        streakEarned = 1;
      }
    }
  }

  session.reflection = reflection || '';
  session.pointsEarned = pointsEarned;
  session.actualMinutesRead = actualMinutes;
  session.completed = actualMinutes >= session.duration;
  session.askedWords = askedWords || [];
  session.finalized = true;
  
  await session.save();

  const updateOps = {
    $inc: { points: pointsEarned, totalMinutes: actualMinutes, totalWords: 60, streak: streakEarned }
  };
  if (streakEarned > 0) {
    updateOps.$set = { lastStreakUpdate: now };
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.userId,
    updateOps,
    { new: true }
  );

  await Book.findByIdAndUpdate(session.bookId, {
    $inc: { progress: 5 },
    $set: { lastSummary: session.reflection || '' }
  });

  res.json({ 
    session, 
    pointsEarned, 
    totalPoints: updatedUser.points,
    streakEarned,
    previousStreak: updatedUser.streak - streakEarned,
    newStreak: updatedUser.streak
  });
});

router.get('/', async (req, res) => {
  const sessions = await ReadingSession.find({ userId: req.userId })
    .populate('bookId')
    .sort({ createdAt: -1 });
  res.json({ sessions });
});

export default router;
