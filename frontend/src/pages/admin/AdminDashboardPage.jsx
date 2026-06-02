import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminStatus } from '../../api/admin';

const AdminDashboardPage = () => {
  const { token } = useAuth();
  const [apiOk, setApiOk] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (!token) return;

    fetchAdminStatus(token)
      .then(() => setApiOk(true))
      .catch((err) => {
        setApiOk(false);
        setApiError(err.message);
      });
  }, [token]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Manage FlagHouse products and orders from here.
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          API connection
        </h2>
        {apiOk === null && (
          <p className="text-sm text-gray-500">Checking admin API…</p>
        )}
        {apiOk === true && (
          <p className="text-sm text-green-700 font-medium">
            Admin API connected successfully.
          </p>
        )}
        {apiOk === false && (
          <p className="text-sm text-red-600">
            {apiError || 'Could not reach admin API'}
          </p>
        )}
      </div>

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
