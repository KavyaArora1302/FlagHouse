import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE    = 99;

// ─── Cart Item Row ────────────────────────────────────────────────────────────

const CartItem = ({ item, onQuantityChange, onRemove }) => (
  <div className="flex gap-5 py-6 border-b border-gray-100 last:border-0">
    <Link to={`/product/${item.id}`} className="shrink-0">
      <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity">
        <span className="text-3xl">🚩</span>
      </div>
    </Link>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {item.category}
          </span>
          <Link to={`/product/${item.id}`}>
            <h3 className="text-base font-semibold text-gray-900 mt-0.5 hover:text-gray-600 transition-colors">
              {item.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-400 mt-1">Size: {item.size}</p>
        </div>

        <button
          onClick={() => onRemove(item.id, item.size)}
          className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-1"
          title="Remove item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => onQuantityChange(item.id, item.size, item.quantity - 1)}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-lg transition-colors text-base"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold text-gray-900">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, item.size, item.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-lg transition-colors text-base"
          >
            +
          </button>
        </div>

        <div className="text-right">
          <p className="text-base font-bold text-gray-900">
            ₹{(item.price * item.quantity).toLocaleString()}
          </p>
          {item.quantity > 1 && (
            <p className="text-xs text-gray-400">₹{item.price} each</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-base text-gray-500">Looks like you haven't added anything yet.</p>
    </div>
    <Link
      to="/shop"
      className="bg-black text-white font-semibold text-base px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors duration-150"
    >
      Go Shopping
    </Link>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const CartPage = () => {
  const { cartItems, cartCount, cartSubtotal, updateQuantity, removeFromCart } = useCart();

  const shipping = cartSubtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const total    = cartSubtotal + shipping;

  return (
    <div className="w-full px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Your Cart</h1>
        {cartItems.length > 0 && (
          <p className="text-base text-gray-500">
            {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
          </p>
        )}
      </div>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Cart Items */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-100 rounded-2xl px-6">
              {cartItems.map((item) => (
                <CartItem
                  key={`${item.id}-${item.size}`}
                  item={item}
                  onQuantityChange={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                  <span className="font-medium text-gray-900">₹{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-green-600">Free</span>
                  ) : (
                    <span className="font-medium text-gray-900">₹{shipping}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    Add ₹{(SHIPPING_THRESHOLD - cartSubtotal).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-black text-white text-base font-semibold text-center py-3.5 rounded-xl hover:bg-neutral-800 transition-colors duration-150"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
                {['UPI', 'Card', 'NetBanking', 'COD'].map((method) => (
                  <span key={method} className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-2 py-1 font-medium">
                    {method}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Secure & encrypted checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
