import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SHOP_FILTER_CATEGORIES } from '../data/products';
import { fetchProducts } from '../api/products';
import ProductLoadState, { ProductErrorState } from '../components/ProductLoadState';

const priceRanges = [
  { label: 'All Prices', min: 0,   max: Infinity },
  { label: 'Under ₹350', min: 0,   max: 350 },
  { label: '₹350 – ₹450', min: 350, max: 450 },
  { label: 'Above ₹450', min: 450, max: Infinity },
];

const sortOptions = [
  { label: 'Latest',           value: 'latest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
];

// ─── Product Card ─────────────────────────────────────────────────────────────

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
    <Link to={`/product/${product.id}`}>
      <div className="relative bg-gray-100 h-52 flex items-center justify-center">
        <span className="text-5xl">🚩</span>
        {product.tag && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
            product.tag === 'Sale'       ? 'bg-gray-100 text-gray-900' :
            product.tag === 'New'        ? 'bg-black text-white' :
                                           'bg-gray-100 text-gray-900'
          }`}>
            {product.tag}
          </span>
        )}
      </div>
    </Link>
    <div className="p-4">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{product.category}</span>
      <h3 className="text-base font-semibold text-gray-900 mt-0.5 mb-2">{product.name}</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
        {product.originalPrice && (
          <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
        )}
        {product.originalPrice && (
          <span className="text-xs font-semibold text-green-600 ml-auto">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% off
          </span>
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ selectedCategory, setSelectedCategory, selectedPrice, setSelectedPrice, onClose }) => (
  <aside className="w-full flex flex-col gap-8">

    {/* Header (mobile only) */}
    {onClose && (
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}

    {/* Category Filter */}
    <div>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4">Category</h3>
      <ul className="flex flex-col gap-1">
        {SHOP_FILTER_CATEGORIES.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                selectedCategory === cat
                  ? 'bg-black text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>

    {/* Price Filter */}
    <div>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4">Price Range</h3>
      <ul className="flex flex-col gap-1">
        {priceRanges.map((range) => (
          <li key={range.label}>
            <button
              onClick={() => setSelectedPrice(range)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                selectedPrice.label === range.label
                  ? 'bg-black text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          </li>
        ))}
      </ul>
    </div>

  </aside>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice]       = useState(priceRanges[0]);
  const [sortBy, setSortBy]                     = useState('latest');
  const [search, setSearch]                     = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    list = list.filter(
      (p) => p.price >= selectedPrice.min && p.price <= selectedPrice.max
    );

    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'price_asc')  list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, selectedCategory, selectedPrice, sortBy, search]);

  if (loading) {
    return (
      <div className="w-full px-8 py-10">
        <ProductLoadState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-8 py-10">
        <ProductErrorState message={error} onRetry={loadProducts} />
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-10">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Shop All Flags</h1>
        <p className="text-base text-gray-500">Browse our full collection of premium wall flags</p>
      </div>

      <div className="flex gap-10">

        {/* Sidebar — Desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <Sidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4 mb-7">

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search flags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-gray-400 text-gray-700"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
              Filters
            </button>

            {/* Product Count */}
            <span className="text-sm text-gray-400 ml-auto">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="text-xl font-semibold text-gray-800">No flags found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSelectedPrice(priceRanges[0]); setSearch(''); }}
                className="mt-2 text-sm font-medium bg-black text-white px-5 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto shadow-xl">
            <Sidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={(val) => { setSelectedCategory(val); setMobileFiltersOpen(false); }}
              selectedPrice={selectedPrice}
              setSelectedPrice={(val) => { setSelectedPrice(val); setMobileFiltersOpen(false); }}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ShopPage;
