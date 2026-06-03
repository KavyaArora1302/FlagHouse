import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ScrollVideoSection from '../components/ScrollVideoSection';
import { homeCategoryCards } from '../data/products';
import { fetchProducts } from '../api/products';
import ProductLoadState, { ProductErrorState } from '../components/ProductLoadState';
import ProductImage from '../components/ProductImage';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Premium Quality',
    description: 'Thick, vibrant fabric that holds colour wash after wash.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Fast Delivery',
    description: 'Shipped within 24 hrs. Delivered across India in 3–5 days.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
      </svg>
    ),
    title: 'Easy Returns',
    description: '7-day hassle-free returns if you are not 100% satisfied.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
      </svg>
    ),
    title: 'Secure Payments',
    description: 'UPI, cards, net banking — all payments 100% safe & encrypted.',
  },
];

// ─── Section Components ───────────────────────────────────────────────────────

const HeroSection = () => <ScrollVideoSection />;

const CategoryCard = ({ cat }) => {
  const [hovered, setHovered] = useState(false);
  const [gifError, setGifError] = useState(false);

  const fallbackEmoji = { 1: '⚽', 2: '🎮', 3: '🎵', 4: '✈️' };

  return (
    <Link
      to="/shop"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-3xl p-7 flex flex-col justify-between overflow-hidden cursor-pointer"
      style={{
        backgroundColor: cat.bg,
        minHeight: '340px',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top row — title + arrow */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">{cat.title}</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-xs">{cat.description}</p>
        </div>
        <div
          className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0 mt-0.5"
          style={{
            transition: 'transform 0.2s ease',
            transform: hovered ? 'translate(3px, -3px)' : 'translate(0,0)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </div>
      </div>

      {/* GIF / animation area */}
      <div className="flex items-center justify-center mt-4" style={{ height: '200px' }}>
        {gifError ? (
          <span className="text-7xl">{fallbackEmoji[cat.id]}</span>
        ) : (
          <img
            src={cat.gif}
            alt={cat.title}
            className="object-contain w-full h-full"
            style={{
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.35s ease',
              mixBlendMode: 'multiply',
            }}
            onError={() => setGifError(true)}
          />
        )}
      </div>
    </Link>
  );
};

const CategoriesSection = () => (
  <section className="w-full px-8 py-20 bg-white">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-3">Shop by Category</h2>
      <p className="text-base text-gray-500">Find flags that match your world</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {homeCategoryCards.map((cat) => (
        <CategoryCard key={cat.id} cat={cat} />
      ))}
    </div>
  </section>
);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      <Link to={`/product/${product.id}`} className="block relative">
        <ProductImage
          product={product}
          alt={product.name}
          className="h-56"
          fallbackClassName="text-5xl"
        />
        {product.tag && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full z-10 ${
            product.tag === 'Sale' ? 'bg-gray-100 text-gray-900' :
            product.tag === 'New' ? 'bg-black text-white' :
            'bg-gray-100 text-gray-900'
          }`}>
            {product.tag}
          </span>
        )}
      </Link>
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{product.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          className={`w-full text-sm font-medium py-2.5 rounded-lg transition-colors duration-150 ${
            added ? 'bg-white text-black border border-black' : 'bg-black text-white hover:bg-neutral-800'
          }`}
        >
          {added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const FeaturedProductsSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeatured = () => {
    setLoading(true);
    setError(null);
    fetchProducts({ featured: true })
      .then(setFeaturedProducts)
      .catch((err) => setError(err.message || 'Failed to load featured products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeatured();
  }, []);

  return (
    <section className="w-full px-8 py-20 bg-gray-50">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Flags</h2>
          <p className="text-base text-gray-500">Our most loved picks right now</p>
        </div>
        <Link
          to="/shop"
          className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
        >
          View all →
        </Link>
      </div>
      {loading && <ProductLoadState message="Loading featured flags..." />}
      {error && !loading && (
        <ProductErrorState message={error} onRetry={loadFeatured} />
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

const FeaturesSection = () => (
  <section className="w-full px-8 py-20 bg-white">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Why FlagHouse?</h2>
      <p className="text-base text-gray-500">We put quality and your experience first — always</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <div key={index} className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-700">
            {feature.icon}
          </div>
          <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  </section>
);

const CTASection = () => (
  <section className="w-full px-8 py-20 bg-black flex flex-col items-center text-center gap-6">
    <h2 className="text-4xl font-bold text-white max-w-xl leading-tight">
      Find Your Flag Today
    </h2>
    <p className="text-base text-gray-400 max-w-md leading-relaxed">
      500+ designs. Every passion. Every room. Pick yours and transform your space instantly.
    </p>
    <Link
      to="/shop"
      className="bg-white text-gray-900 font-semibold text-base px-10 py-3.5 rounded-lg hover:bg-gray-100 transition-colors duration-150 mt-2"
    >
      Shop the Collection
    </Link>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const HomePage = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
