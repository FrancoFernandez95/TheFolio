import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import sessionRoutes from './routes/session.routes.js';
import userRoutes from './routes/user.routes.js';
import dictionaryRoutes from './routes/dictionary.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '8mb' }));
app.use(cookieParser());

app.get('/', (req, res) => res.json({ ok: true, app: 'The Folio API' }));

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dictionary', dictionaryRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch((error) => {
    console.error('Error conectando MongoDB:', error.message);
    process.exit(1);
  });
