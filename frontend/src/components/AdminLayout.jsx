import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Orders', to: '/admin/orders' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <Link to="/admin" className="text-xl font-bold text-gray-900">
            Flag<span className="text-gray-400 font-normal">house</span>
          </Link>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
            Admin
          </p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <p className="text-xs text-gray-400 truncate mb-1">{user?.email}</p>
          <Link
            to="/"
            className="block text-sm text-gray-600 hover:text-gray-900 py-2"
          >
            ← Back to store
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-600 py-2"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-8 py-4">
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-semibold text-gray-900">{user?.name}</span>
          </p>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
