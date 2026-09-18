import { Router } from 'express';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from '../controllers/conversationController.js';

const router = Router();

router.get('/', listConversations);
router.get('/:id', getConversation);
router.post('/', createConversation);
router.patch('/:id', updateConversation);
router.delete('/:id', deleteConversation);

export default router;
