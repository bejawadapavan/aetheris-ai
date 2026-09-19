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

    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email invalid',
        field: 'email',
      });
    }

    if (!password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Incorrect password',
        field: 'password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check basic email syntax format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Email invalid',
        field: 'email',
      });
    }

    // 1. Standard mock demo account check
    const isMockAccount = normalizedEmail === 'user@example.com';
    if (isMockAccount) {
      if (password !== 'password123') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Incorrect password',
          field: 'password',
        });
      }
      const demoUser = {
        id: 'demo_user_123',
        name: 'Demo User',
        email: 'user@example.com',
        role: 'user',
        toSafeObject() {
          return { id: this.id, name: this.name, email: this.email, role: this.role };
        },
      };
      const token = signToken(demoUser);
      return res.json({
        status: 'success',
        message: 'Logged in successfully',
        token,
        apiKey: 'ak_demo_' + Date.now(),
        user: demoUser.toSafeObject(),
      });
    }

    // 2. Database lookup for personal accounts
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ email: normalizedEmail }).select('+password');
    }

    if (user) {
      // Existing user: check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Incorrect password',
          field: 'password',
        });
      }
      user.lastLoginAt = new Date();
      await user.save().catch(() => {});
    } else {
      // 3. User does not exist yet -> Automatically register personal account!
      const rawName = normalizedEmail.split('@')[0];
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      if (isDbConnected()) {
        user = new User({
          name: displayName,
          email: normalizedEmail,
          password: password,
          role: 'user',
          apiKey: 'ak_' + crypto.randomBytes(24).toString('hex'),
          lastLoginAt: new Date(),
        });
        await user.save();
      } else {
        // Standalone offline representation
        user = {
          id: 'user_' + Date.now(),
          name: displayName,
          email: normalizedEmail,
          role: 'user',
          apiKey: 'ak_' + crypto.randomBytes(24).toString('hex'),
          toSafeObject() {
            return { id: this.id, name: this.name, email: this.email, role: this.role };
          },
        };
      }
    }

    const token = signToken(user);
    return res.json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      apiKey: user.apiKey,
      user: typeof user.toSafeObject === 'function' ? user.toSafeObject() : user,
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
