import { Router } from 'express';
import { register, login, getMe, generateApiKey } from '../controllers/authController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/api-key', requireAuth, generateApiKey);
router.get('/verify', optionalAuth, (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user || null,
  });
});

export default router;
