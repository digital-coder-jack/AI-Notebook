import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  updateUser,
} from '../store/dataStore.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { publicUser } from '../utils/serializers.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = createUser({ name, email, passwordHash });
  const token = signToken(user.id);

  return res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user.id);
  return res.json({ token, user: publicUser(user) });
});

router.get('/me', authMiddleware, (req, res) => {
  return res.json({ user: publicUser(req.user) });
});

router.patch('/me', authMiddleware, (req, res) => {
  const { name, defaultModelId } = req.body || {};
  const patch = {};
  if (typeof name === 'string' && name.trim()) patch.name = name.trim();
  if (typeof defaultModelId === 'string' && defaultModelId.trim()) {
    patch.defaultModelId = defaultModelId.trim();
  }
  const updated = updateUser(req.user.id, patch);
  return res.json({ user: publicUser(updated) });
});

export default router;
