import express from 'express';
import { sendMessage, checkHealth } from '../controllers/chat.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Chat Routes
 * Base path: /api/chat
 */

// Health check for chatbot service
router.get('/health', checkHealth);

// Send message to chatbot (with optional authentication)
// If user is logged in, chatbot can access their order history
router.post('/message', optionalAuth, sendMessage);

export default router;
