import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import ReadingSession from '../models/ReadingSession.js';

const router = express.Router();
router.use(requireAuth);

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    const isFriend = user.friends.includes(req.userId);
    
    // Remove private fields before sending
    const userObj = user.toObject();
    delete userObj.friends;
    delete userObj.friendRequests;

    const recentSessions = await ReadingSession.find({ userId: user._id, completed: true })
      .populate('bookId', 'title author cover')
      .sort({ createdAt: -1 })
      .limit(3);
      
    res.json({ user: userObj, isFriend, recentSessions });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar perfil' });
  }
});



router.get('/leaderboard', async (req, res) => {
  const currentUser = await User.findById(req.userId);
  let users = await User.find({ _id: { $in: [...currentUser.friends, req.userId] } })
    .select('username avatar points')
    .sort({ points: -1 })
    .limit(10)
    .lean();

  for (let i = 0; i < users.length; i++) {
    const lastSession = await ReadingSession.findOne({ userId: users[i]._id })
      .sort({ createdAt: -1 })
      .populate('bookId', 'title');
      
    if (lastSession && lastSession.bookId) {
      users[i].currentBookTitle = lastSession.bookId.title;
    } else {
      users[i].currentBookTitle = 'Buscando su próxima lectura';
    }
  }

  res.json({ users });
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ users: [] });
  const users = await User.find({ 
    username: { $regex: q, $options: 'i' },
    _id: { $ne: req.userId }
  }).select('username avatar');
  res.json({ users });
});

router.get('/requests', async (req, res) => {
  const user = await User.findById(req.userId).populate('friendRequests', 'username avatar');
  res.json({ requests: user.friendRequests });
});

router.post('/friends/request', async (req, res) => {
  const { targetUserId } = req.body;
  if (targetUserId === req.userId) return res.status(400).json({ message: 'No puedes agregarte a ti mismo' });
  
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return res.status(404).json({ message: 'Usuario no encontrado' });
  
  if (targetUser.friendRequests.includes(req.userId) || targetUser.friends.includes(req.userId)) {
    return res.status(400).json({ message: 'Solicitud ya enviada o ya son amigos' });
  }

  targetUser.friendRequests.push(req.userId);
  await targetUser.save();
  res.json({ message: 'Solicitud enviada' });
});

router.post('/friends/accept', async (req, res) => {
  const { senderId } = req.body;
  const user = await User.findById(req.userId);
  
  if (!user.friendRequests.includes(senderId)) {
    return res.status(400).json({ message: 'No hay solicitud pendiente' });
  }

  // Remove from requests, add to friends for current user
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
  user.friends.push(senderId);
  await user.save();

  // Add to friends for sender user
  const sender = await User.findById(senderId);
  sender.friends.push(req.userId);
  await sender.save();

  res.json({ message: 'Solicitud aceptada' });
});

router.post('/friends/reject', async (req, res) => {
  const { senderId } = req.body;
  const user = await User.findById(req.userId);
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
  await user.save();
  res.json({ message: 'Solicitud rechazada' });
});

router.post('/friends/remove', async (req, res) => {
  const { targetUserId } = req.body;
  
  const user = await User.findById(req.userId);
  const targetUser = await User.findById(targetUserId);

  if (!user || !targetUser) return res.status(404).json({ message: 'Usuario no encontrado' });

  // Remove from both
  user.friends = user.friends.filter(id => id.toString() !== targetUserId);
  targetUser.friends = targetUser.friends.filter(id => id.toString() !== req.userId);

  await user.save();
  await targetUser.save();

  res.json({ message: 'Amigo eliminado' });
});

router.put('/profile', async (req, res) => {
  const { username, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId, 
    { $set: { username, avatar } }, 
    { new: true }
  ).select('-password');
  
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ user });
});

export default router;
