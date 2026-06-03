import { sendOrderConfirmationEmail } from '../services/email.js';

/** Send confirmation email without failing the order if email fails */
export const notifyOrderConfirmation = async (order) => {
  try {
    await sendOrderConfirmationEmail(order);
  } catch (error) {
    console.error(`Order confirmation email failed (${order.orderNumber}):`, error.message);
  }
};
