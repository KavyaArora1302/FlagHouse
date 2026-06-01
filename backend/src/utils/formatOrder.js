export const formatOrder = (order) => ({
  id: order._id.toString(),
  orderNumber: order.orderNumber,
  items: order.items,
  shippingAddress: order.shippingAddress,
  paymentMethod: order.paymentMethod,
  subtotal: order.subtotal,
  shipping: order.shipping,
  codCharge: order.codCharge,
  total: order.total,
  status: order.status,
  paymentStatus: order.paymentStatus,
  itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  createdAt: order.createdAt,
});

export const generateOrderNumber = () => {
  const suffix = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `FH${suffix}${random}`;
};
