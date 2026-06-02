import { Order } from '../models/Order.js';
import { formatOrder, generateOrderNumber } from '../utils/formatOrder.js';
import { normalizeOrderPayload } from '../utils/orderValidation.js';

export const createOrder = async (req, res) => {
  try {
    const { error, data } = normalizeOrderPayload(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    if (data.paymentMethod !== 'cod') {
      return res.status(400).json({
        message: 'Online payments must use Razorpay checkout',
      });
    }

    const order = await Order.create({
      user: req.user._id,
      orderNumber: generateOrderNumber(),
      items: data.items,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      subtotal: data.subtotal,
      shipping: data.shipping,
      codCharge: data.codCharge,
      total: data.total,
      status: 'confirmed',
      paymentStatus: 'pending',
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order: formatOrder(order),
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders.map(formatOrder));
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};
