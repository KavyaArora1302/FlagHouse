import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCT_SIZES } from '../data/products';
import { fetchProductById } from '../api/products';
import ProductLoadState, { ProductErrorState } from '../components/ProductLoadState';
import ProductImage from '../components/ProductImage';

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 ${star <= Math.floor(rating) ? 'text-yellow-400' : star - 0.5 <= rating ? 'text-yellow-300' : 'text-gray-200'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

// ─── Related Product Card ─────────────────────────────────────────────────────

const RelatedCard = ({ product }) => (
  <Link to={`/product/${product.id}`} className="group">
    <ProductImage
      product={product}
      alt={product.name}
      className="rounded-xl h-40 mb-3 group-hover:shadow-md transition-shadow"
      fallbackClassName="text-4xl"
    />
    <p className="text-xs text-gray-400 uppercase tracking-wide">{product.category}</p>
    <h4 className="text-sm font-semibold text-gray-900 mt-0.5 mb-1">{product.name}</h4>
    <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
  </Link>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(PRODUCT_SIZES[1]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const loadProduct = () => {
    setLoading(true);
    setError(null);
    fetchProductById(id)
      .then((data) => {
        setProduct(data.product);
        setRelatedProducts(data.related || []);
      })
      .catch((err) => setError(err.message || 'Failed to load product'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedSize, quantity);
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  if (loading) {
    return (
      <div className="w-full px-8 py-10">
        <ProductLoadState message="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full px-8 py-10">
        <ProductErrorState
          message={error || 'Product not found'}
          onRetry={loadProduct}
        />
        <div className="text-center mt-4">
          <Link to="/shop" className="text-sm font-medium text-gray-900 underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="w-full px-8 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gray-700 transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row gap-12 mb-16">

        {/* ── Left: Images ── */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden">
            <ProductImage
              product={product}
              alt={product.name}
              className="h-96"
              fallbackClassName="text-8xl"
            />
            {product.tag && (
              <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full z-10 ${
                product.tag === 'Sale'       ? 'bg-gray-100 text-gray-900' :
                product.tag === 'New'        ? 'bg-black text-white' :
                                               'bg-gray-100 text-gray-900'
              }`}>
                {product.tag}
              </span>
            )}
          </div>
        </div>

        {/* ── Right: Info ── */}
        <div className="lg:w-1/2 flex flex-col gap-5">

          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-1 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                <span className="bg-gray-100 text-gray-900 text-sm font-semibold px-2.5 py-1 rounded-full">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

          <hr className="border-gray-100" />

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`text-sm px-4 py-2 rounded-lg border transition-colors duration-150 ${
                    selectedSize === size
                      ? 'bg-black text-white border-black font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Quantity</p>
            <div className="flex items-center gap-0 border border-gray-200 rounded-lg w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors text-lg"
              >
                −
              </button>
              <span className="w-12 text-center text-base font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 rounded-xl text-base font-semibold transition-all duration-150 ${
                addedToCart
                  ? 'bg-white text-black border border-black'
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-3.5 rounded-xl text-base font-semibold border-2 border-black text-black hover:bg-black hover:text-white transition-colors duration-150"
            >
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: '🏅', label: 'Premium Quality' },
              { icon: '🚚', label: 'Fast Delivery' },
              { icon: '↩️', label: 'Easy Returns' },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl py-3 px-2 text-center">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-xs font-medium text-gray-600">{badge.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="border border-gray-100 rounded-2xl p-8 mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-700">Material</span>
              <span>Premium Polyester</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-700">Print Type</span>
              <span>Sublimation Print</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-700">Finish</span>
              <span>Fade-resistant, Vibrant</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-700">Hanging</span>
              <span>Rod pocket + grommets</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-700">Care</span>
              <span>Hand wash, cold water</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-700">Origin</span>
              <span>Made in India</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <div className="flex items-end justify-between mb-7">
            <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
            <Link to="/shop" className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailPage;
