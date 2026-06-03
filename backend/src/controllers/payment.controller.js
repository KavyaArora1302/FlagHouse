import { Order } from '../models/Order.js';
import { formatOrder, generateOrderNumber } from '../utils/formatOrder.js';
import { normalizeOrderPayload } from '../utils/orderValidation.js';
import {
  fulfillRazorpayOrder,
  findOrderByRazorpayOrderId,
  markRazorpayOrderFailed,
} from '../utils/razorpayOrder.js';
import {
  isWebhookConfigured,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '../utils/razorpayWebhook.js';
import { getRazorpay, getRazorpayKeyId, isRazorpayConfigured } from '../services/razorpay.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(503).json({ message: 'Online payments are not configured' });
    }

    const { error, data } = normalizeOrderPayload(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    if (data.paymentMethod === 'cod') {
      return res.status(400).json({ message: 'Use order API for cash on delivery' });
    }

    const orderNumber = generateOrderNumber();
    const amountPaise = Math.round(data.total * 100);

    if (amountPaise < 100) {
      return res.status(400).json({ message: 'Order amount is too low' });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        userId: req.user._id.toString(),
        paymentMethod: data.paymentMethod,
      },
    });

    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: data.items,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      subtotal: data.subtotal,
      shipping: data.shipping,
      codCharge: data.codCharge,
      total: data.total,
      status: 'pending',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      order: formatOrder(order),
      razorpay: {
        keyId: getRazorpayKeyId(),
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ message: 'Failed to start payment' });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(503).json({ message: 'Online payments are not configured' });
    }

    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = await findOrderByRazorpayOrderId(razorpayOrderId);

    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { alreadyPaid, order: updatedOrder } = await fulfillRazorpayOrder(
      order,
      razorpayPaymentId
    );

    res.json({
      message: alreadyPaid ? 'Payment already verified' : 'Payment successful',
      order: formatOrder(updatedOrder),
    });
  } catch (error) {
    console.error('verifyRazorpayPayment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

const handlePaymentCaptured = async (payment) => {
  const razorpayOrderId = payment?.order_id;
  const razorpayPaymentId = payment?.id;

  if (!razorpayOrderId || !razorpayPaymentId) {
    console.warn('[razorpay-webhook] payment.captured missing order_id or payment id');
    return;
  }

  const order = await findOrderByRazorpayOrderId(razorpayOrderId);

  if (!order) {
    console.warn(`[razorpay-webhook] No order for Razorpay order ${razorpayOrderId}`);
    return;
  }

  const { alreadyPaid } = await fulfillRazorpayOrder(order, razorpayPaymentId);
  console.log(
    `[razorpay-webhook] payment.captured ${razorpayPaymentId} → ${order.orderNumber}${alreadyPaid ? ' (already paid)' : ''}`
  );
};

const handlePaymentFailed = async (payment) => {
  const razorpayOrderId = payment?.order_id;
  const razorpayPaymentId = payment?.id;

  if (!razorpayOrderId) return;

  const order = await markRazorpayOrderFailed(razorpayOrderId, razorpayPaymentId);

  if (order) {
    console.log(`[razorpay-webhook] payment.failed → ${order.orderNumber}`);
  }
};

/**
 * Razorpay webhook — must receive raw JSON body (see app.js route registration).
 */
export const razorpayWebhook = async (req, res) => {
  try {
    if (!isWebhookConfigured()) {
      console.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not configured');
      return res.status(503).json({ message: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      console.error('[razorpay-webhook] Expected raw body buffer');
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('[razorpay-webhook] Invalid signature');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const eventName = event?.event;
    const payment = event?.payload?.payment?.entity;

    switch (eventName) {
      case 'payment.captured':
        await handlePaymentCaptured(payment);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payment);
        break;
      default:
        console.log(`[razorpay-webhook] Ignored event: ${eventName}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('razorpayWebhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};
