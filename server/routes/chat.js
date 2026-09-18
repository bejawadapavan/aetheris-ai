import { Router } from 'express';
import { handleChatStream } from '../controllers/chatController.js';

const router = Router();

router.post('/', handleChatStream);

export default router;
