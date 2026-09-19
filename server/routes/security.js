import { Router } from 'express';
import { encryptText, decryptText, hashData } from '../utils/encryption.js';

const router = Router();

/**
 * POST /api/security/encrypt
 * Body: { text: "Secret user message" }
 */
router.post('/encrypt', (req, res) => {
  const { text } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: 'Field "text" is required for encryption.' });
  }

  const encrypted = encryptText(text);
  const hash = hashData(text);

  return res.json({
    status: 'success',
    algorithm: 'AES-256-GCM',
    encrypted,
    hash,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/security/decrypt
 * Body: { encrypted: "iv:ciphertext:tag" }
 */
router.post('/decrypt', (req, res) => {
  const { encrypted } = req.body || {};
  if (!encrypted) {
    return res.status(400).json({ error: 'Field "encrypted" is required for decryption.' });
  }

  const decrypted = decryptText(encrypted);
  return res.json({
    status: 'success',
    algorithm: 'AES-256-GCM',
    decrypted,
  });
});

/**
 * GET /api/security/status
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    encryption: {
      standard: 'AES-256-GCM',
      keyLengthBits: 256,
      authenticatedTags: true,
      ivLengthBytes: 16,
    },
    authentication: {
      standard: 'JWT (JSON Web Tokens) with HMAC-SHA256',
      passwordHashing: 'bcrypt (salt rounds: 10)',
      headerType: 'Bearer',
    },
    tls: {
      enforced: process.env.NODE_ENV === 'production',
    },
  });
});

export default router;
