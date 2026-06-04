import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getAdminStats = async (_req, res) => {
  try {
    const todayStart = startOfToday();
    const weekStart = daysAgo(7);
    const notCancelled = { status: { $ne: 'cancelled' } };

    const [
      totalOrders,
      ordersToday,
      ordersThisWeek,
      totalProducts,
      revenueAll,
      revenueWeek,
      statusBreakdown,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: notCancelled },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { ...notCancelled, createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber total status createdAt paymentStatus')
        .lean(),
    ]);

    const byStatus = Object.fromEntries(
      statusBreakdown.map((row) => [row._id, row.count])
    );

    res.json({
      orders: {
        total: totalOrders,
        today: ordersToday,
        thisWeek: ordersThisWeek,
        byStatus: byStatus,
      },
      revenue: {
        total: revenueAll[0]?.total ?? 0,
        thisWeek: revenueWeek[0]?.total ?? 0,
      },
      products: {
        total: totalProducts,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};
