import { Order } from '../models/Order.js';
import { formatOrder, generateOrderNumber } from '../utils/formatOrder.js';

const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'cod'];

const validateShippingAddress = (address) => {
  const required = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'pincode',
  ];

  for (const field of required) {
    if (!address?.[field]?.trim()) {
      return `Missing required field: ${field}`;
    }
  }

  return null;
};

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      codCharge = 0,
      total,
    } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    if (
      typeof subtotal !== 'number' ||
      typeof shipping !== 'number' ||
      typeof total !== 'number'
    ) {
      return res.status(400).json({ message: 'Invalid order totals' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId ?? item.id,
      name: item.name,
      category: item.category,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const order = await Order.create({
      user: req.user._id,
      orderNumber: generateOrderNumber(),
      items: normalizedItems,
      shippingAddress: {
        firstName: shippingAddress.firstName.trim(),
        lastName: shippingAddress.lastName.trim(),
        email: shippingAddress.email.trim().toLowerCase(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      paymentMethod,
      subtotal,
      shipping,
      codCharge: codCharge || 0,
      total,
      status: 'confirmed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
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
