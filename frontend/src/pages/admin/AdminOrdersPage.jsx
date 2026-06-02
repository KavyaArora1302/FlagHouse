import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminOrders,
  updateAdminOrder,
} from '../../api/adminOrders';

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

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const AdminOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [paymentDraft, setPaymentDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const selected = orders.find((o) => o.id === selectedId) || null;

  const loadOrders = useCallback(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    fetchAdminOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const selectOrder = (order) => {
    setSelectedId(order.id);
    setStatusDraft(order.status);
    setPaymentDraft(order.paymentStatus);
    setSaveMessage(null);
  };

  const handleSaveStatus = async () => {
    if (!selected || !token) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const updated = await updateAdminOrder(token, selected.id, {
        status: statusDraft,
        paymentStatus: paymentDraft,
      });

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSaveMessage('Order updated successfully.');
    } catch (err) {
      setSaveMessage(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
        <p className="text-gray-500">View all customer orders and update fulfillment status</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
          <button type="button" onClick={loadOrders} className="ml-3 underline font-medium">
            Retry
          </button>
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Loading orders…</p>}

      {!loading && orders.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400">
          No orders yet. Orders appear here when customers checkout.
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/80">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ul className="divide-y divide-gray-50 max-h-[32rem] overflow-y-auto">
              {orders.map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => selectOrder(order)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedId === order.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.customerName}</p>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${
                          statusStyles[order.status] || statusStyles.confirmed
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{order.total.toLocaleString()}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            {!selected ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 h-full min-h-[16rem] flex items-center justify-center">
                Select an order to view details
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                      Order
                    </p>
                    <h2 className="text-xl font-bold text-gray-900">{selected.orderNumber}</h2>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(selected.createdAt)}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{selected.total.toLocaleString()}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-medium text-gray-900">{selected.customerName}</p>
                    <p className="text-gray-600">{selected.customerEmail}</p>
                    <p className="text-gray-600">{selected.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Payment</p>
                    <p className="text-gray-900">
                      {paymentLabels[selected.paymentMethod] || selected.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Update status
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Order status</span>
                      <select
                        value={statusDraft}
                        onChange={(e) => setStatusDraft(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Payment status</span>
                      <select
                        value={paymentDraft}
                        onChange={(e) => setPaymentDraft(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={saving}
                    className="mt-4 bg-gray-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  {saveMessage && (
                    <p
                      className={`mt-2 text-sm ${
                        saveMessage.includes('success') ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {saveMessage}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Items
                  </p>
                  <ul className="flex flex-col gap-2">
                    {selected.items.map((item, index) => (
                      <li
                        key={`${item.productId}-${item.size}-${index}`}
                        className="flex justify-between text-sm border border-gray-100 rounded-lg px-3 py-2"
                      >
                        <span className="text-gray-900">
                          {item.name} · {item.size} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Delivery address
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selected.shippingAddress?.address}
                    <br />
                    {selected.shippingAddress?.city}, {selected.shippingAddress?.state} –{' '}
                    {selected.shippingAddress?.pincode}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{selected.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {selected.shipping === 0 ? 'Free' : `₹${selected.shipping}`}
                    </span>
                  </div>
                  {selected.codCharge > 0 && (
                    <div className="flex justify-between">
                      <span>COD charge</span>
                      <span>₹{selected.codCharge}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
