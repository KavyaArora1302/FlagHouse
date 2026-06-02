import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [heroOverlay, setHeroOverlay] = useState(true);
  const { cartCount } = useCart();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isOverlay = isHome && heroOverlay;

  const navLinks = [
    { label: "Shop", to: "/shop" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) {
      setHeroOverlay(false);
      return;
    }

    const onScroll = () => {
      const heroScrollEnd = window.innerHeight * 3;
      setHeroOverlay(window.scrollY < heroScrollEnd);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const pillBase =
    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200";

  const pillActive = isOverlay
    ? "bg-white text-gray-900 shadow-sm"
    : "bg-gray-900 text-white";

  const pillInactive = isOverlay
    ? "bg-white/90 text-gray-800 hover:bg-white shadow-sm"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  const iconBtn = isOverlay
    ? "flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 shadow-sm hover:bg-white/90 transition-all duration-200"
    : "flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOverlay
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
      }`}
    >
      <div className="w-full px-6 md:px-10">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <span
              className={`text-2xl md:text-[1.65rem] font-bold tracking-tight transition-colors duration-300 ${
                isOverlay ? "text-white" : "text-gray-900"
              }`}
            >
              Flag<span className={isOverlay ? "text-white/80" : "text-gray-400 font-normal"}>house</span>
            </span>
          </Link>

          {/* Desktop — pill nav + actions */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `${pillBase} ${isActive ? pillActive : pillInactive}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="w-px h-5 bg-white/30 mx-1" style={{ opacity: isOverlay ? 1 : 0 }} />
            <div className={`w-px h-5 bg-gray-200 mx-1 ${isOverlay ? "hidden" : "block"}`} />

            {/* Account */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={iconBtn}
                  aria-label="Account menu"
                >
                  <span className="text-xs font-bold uppercase">
                    {user?.name?.[0] || "U"}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={iconBtn} aria-label="Sign in">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className={`${iconBtn} relative`} aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold leading-none">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile — cart + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className={`${iconBtn} relative`} aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={iconBtn}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`md:hidden mx-4 mb-4 rounded-2xl overflow-hidden shadow-xl ${
            isOverlay ? "bg-white/95 backdrop-blur-md" : "bg-white border border-gray-100"
          }`}
        >
          <nav className="flex flex-col p-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base py-3 px-4 rounded-xl font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block text-base py-3 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block text-base py-3 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left text-base py-3 px-4 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block text-base py-3 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block text-base py-3 px-4 rounded-xl font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
