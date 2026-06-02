import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { formatOrder, generateOrderNumber } from '../utils/formatOrder.js';
import { normalizeOrderPayload } from '../utils/orderValidation.js';
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

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = await Order.findOne({
      razorpayOrderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({
        message: 'Payment already verified',
        order: formatOrder(order),
      });
    }

    order.status = 'confirmed';
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    res.json({
      message: 'Payment successful',
      order: formatOrder(order),
    });
  } catch (error) {
    console.error('verifyRazorpayPayment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};
