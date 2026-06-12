import chatbotService from '../services/chatbot.service.js';

/**
 * Chat Controller - Handles chatbot API requests
 */

/**
 * POST /api/chat/message
 * Send a message to the chatbot and get a response
 */
export async function sendMessage(req, res) {
  try {
    const { message, conversationHistory } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    }

    // Check message length (max 1000 characters)
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long (max 1000 characters)',
      });
    }

    // Get user from request (if authenticated)
    const user = req.user || null;

    // Validate conversation history if provided
    let history = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Limit history to last 10 messages to avoid token limits
      history = conversationHistory.slice(-10);
    }

    // Generate AI response
    const response = await chatbotService.generateResponse(
      message.trim(),
      history,
      user
    );

    // Get quick reply suggestions
    const quickReplies = chatbotService.getQuickReplies(message);

    // Return response
    return res.status(200).json({
      success: true,
      data: {
        message: response,
        quickReplies,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process message. Please try again.',
    });
  }
}

/**
 * GET /api/chat/health
 * Check if chatbot service is available
 */
export async function checkHealth(req, res) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        status: 'unavailable',
        error: 'Chatbot API key not configured',
      });
    }

    return res.status(200).json({
      success: true,
      status: 'available',
      message: 'Chatbot service is running',
      model: 'gemini-2.5-flash',
    });
  } catch (error) {
    console.error('Chat health check error:', error);
    return res.status(500).json({
      success: false,
      status: 'error',
      error: 'Health check failed',
    });
  }
}
