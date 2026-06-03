import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../api/orders';
import ProductLoadState, { ProductErrorState } from '../components/ProductLoadState';
import ProductImage from '../components/ProductImage';

const paymentLabels = {
  upi: 'UPI',
  card: 'Credit / Debit Card',
  netbanking: 'Net Banking',
  cod: 'Cash on Delivery',
};

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-100',
  confirmed: 'bg-green-50 text-green-800 border-green-100',
  shipped: 'bg-blue-50 text-blue-800 border-blue-100',
  delivered: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-50 text-red-800 border-red-100',
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Order
            </p>
            <h2 className="text-lg font-bold text-gray-900">{order.orderNumber}</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                statusStyles[order.status] || statusStyles.confirmed
              }`}
            >
              {order.status}
            </span>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              {paymentLabels[order.paymentMethod] || order.paymentMethod}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{order.itemCount}</span> item
            {order.itemCount !== 1 ? 's' : ''} ·{' '}
            {order.shippingAddress?.city}, {order.shippingAddress?.state}
          </div>
          <p className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1 py-2"
        >
          {expanded ? 'Hide details' : 'View details'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-50 bg-gray-50/50">
          <div className="pt-5 flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
              <ul className="flex flex-col gap-3">
                {order.items.map((item, index) => (
                  <li
                    key={`${item.productId}-${item.size}-${index}`}
                    className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100"
                  >
                    <ProductImage
                      productId={item.productId}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg shrink-0"
                      fallbackClassName="text-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-sm font-semibold text-gray-900 hover:text-gray-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery address</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                <br />
                {order.shippingAddress?.address}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} –{' '}
                {order.shippingAddress?.pincode}
                <br />
                {order.shippingAddress?.phone}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
              </div>
              {order.codCharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>COD charge</span>
                  <span>₹{order.codCharge}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-1">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    fetchMyOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  return (
    <div className="w-full px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">My Orders</h1>
        <p className="text-base text-gray-500">Track and review your past FlagHouse orders</p>
      </div>

      {loading && <ProductLoadState message="Loading your orders..." />}

      {error && !loading && (
        <ProductErrorState message={error} onRetry={loadOrders} />
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <span className="text-5xl">📦</span>
          <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
          <p className="text-base text-gray-500 max-w-sm">
            When you place an order, it will show up here with full details.
          </p>
          <Link
            to="/shop"
            className="mt-2 bg-black text-white font-semibold text-base px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="flex flex-col gap-6 max-w-3xl">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
