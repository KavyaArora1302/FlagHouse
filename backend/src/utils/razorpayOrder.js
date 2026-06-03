import { Order } from '../models/Order.js';
import { notifyOrderConfirmation } from './orderEmail.js';

/**
 * Mark a Razorpay order as paid (idempotent).
 * Sends confirmation email only on first transition to paid.
 */
export const fulfillRazorpayOrder = async (order, razorpayPaymentId) => {
  if (order.paymentStatus === 'paid') {
    return { alreadyPaid: true, order };
  }

  order.status = 'confirmed';
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpayPaymentId;
  await order.save();

  await notifyOrderConfirmation(order);

  return { alreadyPaid: false, order };
};

export const markRazorpayOrderFailed = async (razorpayOrderId, razorpayPaymentId) => {
  const order = await Order.findOne({ razorpayOrderId });

  if (!order || order.paymentStatus === 'paid') {
    return null;
  }

  order.paymentStatus = 'failed';
  if (razorpayPaymentId) {
    order.razorpayPaymentId = razorpayPaymentId;
  }
  await order.save();

  return order;
};

export const findOrderByRazorpayOrderId = (razorpayOrderId) =>
  Order.findOne({ razorpayOrderId });
