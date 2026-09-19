import { Router } from 'express';
import { handleChatStream, getChatStatus } from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getChatStatus);
router.post('/', optionalAuth, handleChatStream);

export default router;
