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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if database has the user or if it's the demo account
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ email: normalizedEmail }).select('+password');
    }

    // Default mock demo credentials: user@example.com / password123
    const isMockAccount = normalizedEmail === 'user@example.com';

    if (!user && !isMockAccount) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Email invalid',
        field: 'email',
      });
    }

    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Incorrect password',
          field: 'password',
        });
      }
    } else if (isMockAccount) {
      if (password !== 'password123') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Incorrect password',
          field: 'password',
        });
      }
      user = {
        id: 'demo_user_123',
        name: 'Demo User',
        email: 'user@example.com',
        role: 'user',
        toSafeObject() {
          return { id: this.id, name: this.name, email: this.email, role: this.role };
        },
      };
    }

    user.lastLoginAt = new Date();
    if (typeof user.save === 'function') {
      await user.save().catch(() => {});
    }

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
