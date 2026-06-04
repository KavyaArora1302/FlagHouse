import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminStats } from '../../api/admin';

const formatMoney = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const statusStyles = {
  pending: 'text-yellow-700 bg-yellow-50',
  confirmed: 'text-green-700 bg-green-50',
  shipped: 'text-blue-700 bg-blue-50',
  delivered: 'text-gray-700 bg-gray-100',
  cancelled: 'text-red-700 bg-red-50',
};

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
  </div>
);

const AdminDashboardPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    fetchAdminStats(token)
      .then(setStats)
      .catch((err) => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, [token]);

  const byStatus = stats?.orders?.byStatus || {};

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Overview of orders and revenue for your store.
      </p>

      {loading && (
        <p className="text-sm text-gray-500">Loading stats…</p>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {stats && !loading && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Orders today" value={stats.orders.today} />
            <StatCard
              label="Orders this week"
              value={stats.orders.thisWeek}
              sub={`${stats.orders.total} all time`}
            />
            <StatCard label="Revenue (week)" value={formatMoney(stats.revenue.thisWeek)} />
            <StatCard
              label="Revenue (all time)"
              value={formatMoney(stats.revenue.total)}
              sub="Excludes cancelled"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Orders by status
              </h2>
              <ul className="flex flex-col gap-2">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-600">{status}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-xs capitalize ${
                        statusStyles[status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {byStatus[status] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Catalog
              </h2>
              <p className="text-3xl font-bold text-gray-900">{stats.products.total}</p>
              <p className="text-sm text-gray-500 mt-1">Products in database</p>
            </div>
          </div>

          {stats.recentOrders.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Recent orders
              </h2>
              <ul className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs capitalize text-gray-500">{order.status}</span>
                      <span className="text-sm font-bold text-gray-900">{formatMoney(order.total)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                to="/admin/orders"
                className="inline-block mt-4 text-sm font-medium text-gray-700 underline hover:no-underline"
              >
                View all orders →
              </Link>
            </div>
          )}
        </>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/admin/products"
          className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors"
        >
          <h3 className="font-bold text-gray-900 mb-1">Products</h3>
          <p className="text-sm text-gray-500">Add, edit, and delete catalog items</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors"
        >
          <h3 className="font-bold text-gray-900 mb-1">Orders</h3>
          <p className="text-sm text-gray-500">View all orders and update fulfillment status</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
