import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

const SECRET_SEED = process.env.ENCRYPTION_KEY || 'aetheris-super-secret-production-encryption-seed-2026';
const KEY = crypto.createHash('sha256').update(SECRET_SEED).digest();

/**
 * Encrypts plain text using AES-256-GCM.
 * Output format: iv:ciphertext:authTag (hex encoded)
 */
export function encryptText(text) {
  if (!text || typeof text !== 'string') return text;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  } catch (err) {
    console.error('[encryption] Error encrypting text:', err.message);
    return text;
  }
}

/**
 * Decrypts AES-256-GCM encrypted string (iv:ciphertext:authTag).
 */
export function decryptText(encryptedString) {
  if (!encryptedString || typeof encryptedString !== 'string') return encryptedString;

  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    return encryptedString;
  }

  try {
    const [ivHex, encryptedHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[encryption] Error decrypting text:', err.message);
    return encryptedString;
  }
}

/**
 * Creates SHA-256 hash for signatures and data verification.
 */
export function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}
