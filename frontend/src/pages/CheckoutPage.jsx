import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payments';
import { fetchCheckoutPrefill } from '../api/profile';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import ProductImage from '../components/ProductImage';

const SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE    = 99;
const COD_EXTRA_CHARGE   = 30;

const paymentMethods = [
  { id: 'upi',        label: 'UPI',          icon: '📱' },
  { id: 'card',       label: 'Credit / Debit Card', icon: '💳' },
  { id: 'netbanking', label: 'Net Banking',  icon: '🏦' },
  { id: 'cod',        label: 'Cash on Delivery', icon: '💵' },
];

// ─── Input Component ──────────────────────────────────────────────────────────

const Input = ({ label, id, type = 'text', placeholder, value, onChange, required, half }) => (
  <div className={half ? 'flex-1 min-w-0' : 'w-full'}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
    />
  </div>
);

// ─── Step Indicator ───────────────────────────────────────────────────────────

const steps = ['Delivery', 'Payment', 'Review'];

const StepIndicator = ({ current }) => (
  <div className="flex items-center gap-0 mb-10">
    {steps.map((step, i) => (
      <div key={step} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            i < current  ? 'bg-black text-white' :
            i === current ? 'bg-black text-white' :
                            'bg-gray-100 text-gray-400'
          }`}>
            {i < current ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : i + 1}
          </div>
          <span className={`text-xs font-medium ${i === current ? 'text-gray-900' : 'text-gray-400'}`}>
            {step}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-colors ${i < current ? 'bg-black' : 'bg-gray-200'}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const [step, setStep]           = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderPlaced, setOrderPlaced]     = useState(false);
  const [placedOrder, setPlacedOrder]     = useState(null);
  const [placingOrder, setPlacingOrder]   = useState(false);
  const [placeError, setPlaceError]       = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [prefillNote, setPrefillNote] = useState('');
  const prefillDone = useRef(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
  });

  const shipping = cartSubtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const codCharge = paymentMethod === 'cod' ? COD_EXTRA_CHARGE : 0;
  const subtotal  = cartSubtotal;
  const total     = subtotal + shipping + codCharge;

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Redirect to cart when there is nothing to checkout
  useEffect(() => {
    if (orderPlaced) return;
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems.length, orderPlaced, navigate]);

  const applyShippingAddress = (shipping, addressId = '') => {
    if (!shipping) return;
    setForm({
      firstName: shipping.firstName || '',
      lastName: shipping.lastName || '',
      email: shipping.email || user?.email || '',
      phone: shipping.phone || '',
      address: shipping.address || '',
      city: shipping.city || '',
      state: shipping.state || '',
      pincode: shipping.pincode || '',
    });
    setSelectedAddressId(addressId);
  };

  useEffect(() => {
    if (!token || prefillDone.current) return;
    prefillDone.current = true;

    fetchCheckoutPrefill(token)
      .then((data) => {
        setSavedAddresses(data.savedAddresses || []);
        applyShippingAddress(data.shippingAddress, data.addressId || '');

        if (data.source === 'saved') {
          setPrefillNote('Filled from your default saved address');
        } else if (data.source === 'lastOrder') {
          setPrefillNote('Filled from your last order — edit if needed');
        } else {
          setPrefillNote('');
        }
      })
      .catch(() => {
        if (user?.email) {
          setForm((prev) => ({
            ...prev,
            email: prev.email || user.email,
            firstName: prev.firstName || user.name?.split(' ')[0] || '',
          }));
        }
      });
  }, [token]);

  const buildOrderPayload = () => ({
    items: cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      category: item.category,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    })),
    shippingAddress: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    },
    paymentMethod,
    subtotal,
    shipping,
    codCharge,
    total,
  });

  const handlePlaceOrder = async () => {
    if (!token) return;

    setPlacingOrder(true);
    setPlaceError('');

    try {
      const payload = buildOrderPayload();

      if (paymentMethod === 'cod') {
        const data = await createOrder(token, payload);
        setPlacedOrder(data.order);
        clearCart();
        setOrderPlaced(true);
        return;
      }

      const { order, razorpay } = await createRazorpayOrder(token, payload);

      const verified = await openRazorpayCheckout({
        keyId: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        orderId: razorpay.orderId,
        orderNumber: order.orderNumber,
        customer: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
        },
        onDismiss: () => setPlacingOrder(false),
        onSuccess: (response) =>
          verifyRazorpayPayment(token, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
      });

      setPlacedOrder(verified.order);
      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        setPlaceError(err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Order Placed Screen ──
  if (orderPlaced && placedOrder) {
    return (
      <div className="w-full px-8 py-20 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-base text-gray-500 max-w-sm mx-auto">
            Thank you for shopping with FlagHouse. Your order has been confirmed and will be delivered in 3–5 business days.
          </p>
          {(placedOrder.shippingAddress?.email || form.email) && (
            <p className="text-sm text-gray-400 max-w-sm mx-auto mt-3">
              A confirmation email was sent to{' '}
              <span className="font-medium text-gray-600">
                {placedOrder.shippingAddress?.email || form.email}
              </span>
              .
            </p>
          )}
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5 text-sm text-gray-600 flex flex-col gap-2">
          <p><span className="font-semibold text-gray-900">Order ID:</span> {placedOrder.orderNumber}</p>
          <p><span className="font-semibold text-gray-900">Items:</span> {placedOrder.itemCount}</p>
          <p><span className="font-semibold text-gray-900">Amount Paid:</span> ₹{placedOrder.total.toLocaleString()}</p>
          <p><span className="font-semibold text-gray-900">Delivery to:</span> {[placedOrder.shippingAddress?.city, placedOrder.shippingAddress?.state].filter(Boolean).join(', ') || 'Your address'}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/orders"
            className="bg-black text-white font-semibold text-base px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="border border-gray-200 text-gray-700 font-semibold text-base px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Checkout</h1>
        <p className="text-base text-gray-500">Complete your order below</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── Left: Steps ── */}
        <div className="flex-1 min-w-0">
          <StepIndicator current={step} />

          {/* ── Step 0: Delivery ── */}
          {step === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Details</h2>

              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saved address
                  </label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) {
                        setSelectedAddressId('');
                        setPrefillNote('');
                        return;
                      }
                      const addr = savedAddresses.find((a) => a.id === id);
                      if (addr) {
                        applyShippingAddress(
                          {
                            ...addr,
                            email: user?.email || form.email,
                          },
                          id
                        );
                        setPrefillNote('Using saved address');
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400"
                  >
                    <option value="">Enter a new address</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} — {addr.city}, {addr.state}
                        {addr.isDefault ? ' (default)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    <Link to="/profile" className="text-gray-600 underline hover:no-underline">
                      Manage addresses in profile
                    </Link>
                  </p>
                </div>
              )}

              {prefillNote && (
                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-5">
                  {prefillNote}
                </p>
              )}

              <div className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <Input label="First Name" id="firstName" placeholder="Kavya" value={form.firstName} onChange={set('firstName')} required half />
                  <Input label="Last Name"  id="lastName"  placeholder="Arora"  value={form.lastName}  onChange={set('lastName')}  required half />
                </div>
                <Input label="Email Address" id="email" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
                <Input label="Phone Number"  id="phone" type="tel"   placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} required />
                <Input label="Street Address" id="address" placeholder="House no., Street, Area" value={form.address} onChange={set('address')} required />
                <div className="flex gap-4">
                  <Input label="City"    id="city"    placeholder="Mumbai"    value={form.city}    onChange={set('city')}    required half />
                  <Input label="State"   id="state"   placeholder="Maharashtra" value={form.state}   onChange={set('state')}   required half />
                </div>
                <div className="flex gap-4">
                  <Input label="Pincode" id="pincode" placeholder="400001" value={form.pincode} onChange={set('pincode')} required half />
                  <div className="flex-1 min-w-0" />
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-black text-white font-semibold text-base py-3.5 rounded-xl hover:bg-neutral-800 transition-colors mt-2"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Payment ── */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

              {/* Method Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                      paymentMethod === method.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className={`text-sm font-medium ${paymentMethod === method.id ? 'text-gray-900' : 'text-gray-500'}`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Online payment — Razorpay checkout on Place Order */}
              {paymentMethod !== 'cod' && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                  You will complete payment securely via <strong className="text-gray-900">Razorpay</strong> after
                  you review your order. In test mode, use Razorpay&apos;s test UPI, card, or netbanking options.
                </div>
              )}

              {/* COD */}
              {paymentMethod === 'cod' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
                  ₹{total.toLocaleString()} will be collected at the time of delivery. Extra ₹{COD_EXTRA_CHARGE} COD charge applies.
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              {/* Delivery Summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                  <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-gray-700 underline">Edit</button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {form.firstName} {form.lastName}<br />
                  {form.address}<br />
                  {form.city}, {form.state} – {form.pincode}<br />
                  {form.phone}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Payment Method</h2>
                  <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-700 underline">Edit</button>
                </div>
                <p className="text-sm text-gray-700">
                  {paymentMethods.find((m) => m.id === paymentMethod)?.icon}{' '}
                  {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                </p>
              </div>

              {/* Items */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Order Items</h2>
                <div className="flex flex-col gap-3">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
                      <ProductImage
                        product={item}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg shrink-0"
                        fallbackClassName="text-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.size} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {placeError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                  {placeError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={placingOrder}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-3.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="flex-1 bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Placing order...
                    </>
                  ) : (
                    paymentMethod === 'cod'
                      ? `Place Order ₹${total.toLocaleString()}`
                      : `Pay ₹${total.toLocaleString()}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-5">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate mr-2">{item.name} ×{item.quantity}</span>
                  <span className="font-medium text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="font-medium text-green-600">Free</span>
                ) : (
                  <span className="font-medium text-gray-900">₹{shipping}</span>
                )}
              </div>
              {codCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>COD charge</span>
                  <span className="font-medium text-gray-900">₹{codCharge}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Secure & encrypted checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
