const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Chat API - Handles chatbot communication
 */

/**
 * Send a message to the chatbot
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages (optional)
 * @returns {Promise<Object>} - Response with AI message and quick replies
 */
export async function sendChatMessage(message, conversationHistory = []) {
  try {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if user is logged in (optional for chatbot)
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/chat/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data.data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

/**
 * Check if chatbot service is available
 * @returns {Promise<Object>} - Health status
 */
export async function checkChatbotHealth() {
  try {
    const response = await fetch(`${API_URL}/api/chat/health`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Health check failed');
    }

    return data;
  } catch (error) {
    console.error('Chatbot health check error:', error);
    throw error;
  }
}
