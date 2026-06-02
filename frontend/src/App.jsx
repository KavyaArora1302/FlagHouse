import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import OrdersPage from './pages/OrdersPage';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

// Redirects to login if not logged in
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return isLoggedIn ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
            </Route>

            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
              <Route path="/"            element={<HomePage />} />
              <Route path="/shop"        element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart"        element={<CartPage />} />
              <Route path="/checkout"    element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders"      element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/about"       element={<AboutPage />} />
              <Route path="/contact"     element={<ContactPage />} />
              <Route path="/login"       element={<LoginPage />} />
              <Route path="/register"    element={<RegisterPage />} />
              <Route path="*"            element={<NotFoundPage />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
