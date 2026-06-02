import { Order } from '../models/Order.js';
import { formatOrder } from '../utils/formatOrder.js';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

export const formatAdminOrder = (order) => {
  const base = formatOrder(order);
  const addr = order.shippingAddress || {};

  return {
    ...base,
    customerName: `${addr.firstName || ''} ${addr.lastName || ''}`.trim(),
    customerEmail: addr.email || '',
    customerPhone: addr.phone || '',
  };
};

export const listAdminOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders.map(formatAdminOrder));
  } catch (error) {
    console.error('listAdminOrders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(formatAdminOrder(order));
  } catch (error) {
    console.error('getAdminOrderById error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

export const updateAdminOrder = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updates = {};

    if (status !== undefined) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      updates.status = status;
    }

    if (paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      updates.paymentStatus = paymentStatus;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(formatAdminOrder(order));
  } catch (error) {
    console.error('updateAdminOrder error:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
};
