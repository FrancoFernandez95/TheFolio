import express from 'express';
import Book from '../models/Book.js';
import ReadingSession from '../models/ReadingSession.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const books = await Book.find({ userId: req.userId }).sort({ updatedAt: -1 });
  res.json({ books });
});



router.post('/', async (req, res) => {
  const { externalId, title, author, year, isbn, cover, source } = req.body;
  if (!title || !author) return res.status(400).json({ message: 'Título y autor son obligatorios' });

  const book = await Book.create({ 
    userId: req.userId, 
    externalId, title, author, year, isbn, source, 
    cover: cover || '' 
  });
  res.status(201).json({ book });
});

router.patch('/:id', async (req, res) => {
  const book = await Book.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!book) return res.status(404).json({ message: 'Libro no encontrado' });
  res.json({ book });
});

router.delete('/:id', async (req, res) => {
  await Book.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: 'Libro eliminado' });
});

router.get('/:id/summaries', async (req, res) => {
  const sessions = await ReadingSession.find({
    bookId: req.params.id,
    userId: req.userId,
    completed: true,
    reflection: { $ne: '' }
  }).sort({ createdAt: -1 }).select('reflection createdAt pointsEarned duration');
  
  res.json({ summaries: sessions });
});

export default router;
