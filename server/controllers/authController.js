import crypto from 'crypto';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { isDbConnected } from '../config/db.js';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (!isDbConnected()) {
      // Ephemeral fallback token when db is offline
      const mockUser = {
        id: 'user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        role: role === 'admin' ? 'admin' : 'user',
        createdAt: new Date(),
      };
      const token = signToken(mockUser);
      return res.status(201).json({
        status: 'success',
        message: 'User registered in autonomous mode',
        token,
        user: mockUser,
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'user',
      apiKey: 'ak_' + crypto.randomBytes(24).toString('hex'),
      lastLoginAt: new Date(),
    });

    await user.save();
    const token = signToken(user);

    return res.status(201).json({
      status: 'success',
      message: 'Account registered successfully',
      token,
      apiKey: user.apiKey,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('[auth] register error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Both email and password are required to log in.',
      });
    }

    if (!isDbConnected()) {
      // In-memory / guest demo login
      const mockUser = {
        id: 'user_demo_' + Date.now(),
        name: email.split('@')[0],
        email: email.toLowerCase(),
        role: 'user',
      };
      const token = signToken(mockUser);
      return res.json({
        status: 'success',
        message: 'Logged in successfully (autonomous mode)',
        token,
        user: mockUser,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    return res.json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      apiKey: user.apiKey,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function getMe(req, res) {
  return res.json({
    status: 'success',
    user: req.user,
    authenticated: true,
  });
}

export async function generateApiKey(req, res) {
  if (!isDbConnected() || !req.user?.id) {
    const newKey = 'ak_' + crypto.randomBytes(24).toString('hex');
    return res.json({ status: 'success', apiKey: newKey });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.apiKey = 'ak_' + crypto.randomBytes(24).toString('hex');
  await user.save();

  return res.json({
    status: 'success',
    message: 'New API key generated successfully',
    apiKey: user.apiKey,
  });
}
