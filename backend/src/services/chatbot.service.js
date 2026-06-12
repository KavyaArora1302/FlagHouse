import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildChatbotContext } from '../utils/chatbotContext.js';

/**
 * Chatbot Service - Handles AI conversation logic
 */
class ChatbotService {
  constructor() {
    this.model = null;
  }

  /**
   * Get or initialize the Gemini model
   * Lazy initialization ensures API key is loaded from environment
   */
  getModel() {
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found in environment variables');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    return this.model;
  }

  /**
   * Generate a response to user message
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous conversation (optional)
   * @param {Object} user - Logged in user object (optional)
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(userMessage, conversationHistory = [], user = null) {
    try {
      // Build context with product knowledge and user info
      const context = await buildChatbotContext(user);

      // Create the system prompt
      const systemPrompt = `You are FlagBot, a helpful and friendly AI assistant for FlagHouse, an e-commerce store that sells decorative wall flags.

${context}

Your role:
- Help customers find the perfect flags for their needs
- Answer questions about products, pricing, shipping, and policies
- Provide enthusiastic and friendly customer service
- Keep responses concise (2-3 sentences max unless asked for details)
- Use emojis sparingly and appropriately
- If asked about an order status and the user is logged in, tell them to check their "My Orders" page
- If you don't know something specific, be honest and suggest they contact support

Important guidelines:
- Never make up product information - only use the products listed above
- Never invent prices or availability
- Always be polite and professional
- If a user asks about something not in our catalog, politely suggest browsing our categories
- Encourage users to check out our featured products

Current conversation context:
User is ${user ? 'logged in as ' + user.name : 'not logged in (guest)'}
`;

      // Build the full conversation
      let fullPrompt = systemPrompt + '\n\n';

      // Add conversation history if exists
      if (conversationHistory && conversationHistory.length > 0) {
        fullPrompt += 'Previous conversation:\n';
        conversationHistory.forEach((msg) => {
          fullPrompt += `${msg.role === 'user' ? 'Customer' : 'FlagBot'}: ${msg.content}\n`;
        });
        fullPrompt += '\n';
      }

      // Add current user message
      fullPrompt += `Customer: ${userMessage}\nFlagBot:`;

      // Generate response
      const model = this.getModel();
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();

      return response.trim();
    } catch (error) {
      console.error('Chatbot service error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        errorDetails: error.errorDetails,
      });
      
      // Return a friendly error message
      if (error.message.includes('quota') || error.message.includes('429')) {
        return "I'm experiencing high demand right now. Please try again in a moment! 😊";
      }
      
      return "I'm having trouble connecting right now. Please try again or contact our support team for immediate assistance! 📧";
    }
  }

  /**
   * Generate quick reply suggestions based on context
   * @param {string} lastMessage - Last user message
   * @returns {Array<string>} - Suggested quick replies
   */
  getQuickReplies(lastMessage) {
    const lowerMessage = lastMessage.toLowerCase();

    // Context-based suggestions
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return [
        'Show me featured flags',
        'What categories do you have?',
        'Tell me about your products',
      ];
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return [
        'Do you offer discounts?',
        'What are your bestsellers?',
        'Tell me about shipping costs',
      ];
    }

    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return [
        'What are your payment methods?',
        'Do you ship internationally?',
        'What is your return policy?',
      ];
    }

    // Default suggestions
    return [
      'Show me Sports flags',
      'What are your bestsellers?',
      'Tell me about shipping',
    ];
  }
}

export default new ChatbotService();
