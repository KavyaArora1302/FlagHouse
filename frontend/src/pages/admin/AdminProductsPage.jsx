import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PRODUCT_CATEGORIES } from '../../data/products';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from '../../api/adminProducts';
import ProductImage from '../../components/ProductImage';

const emptyForm = {
  name: '',
  category: 'Sports',
  price: '',
  originalPrice: '',
  tag: '',
  rating: '0',
  reviews: '0',
  description: '',
  featured: false,
  image: '',
};

const productToForm = (product) => ({
  name: product.name,
  category: product.category,
  price: String(product.price),
  originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
  tag: product.tag || '',
  rating: String(product.rating ?? 0),
  reviews: String(product.reviews ?? 0),
  description: product.description,
  featured: Boolean(product.featured),
  image: product.image || '',
});

const formToPayload = (form) => ({
  name: form.name,
  category: form.category,
  price: Number(form.price),
  originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
  tag: form.tag || null,
  rating: Number(form.rating),
  reviews: Number(form.reviews),
  description: form.description,
  featured: form.featured,
  image: form.image || null,
});

const AdminProductsPage = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = useCallback(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    fetchAdminProducts(token)
      .then(setProducts)
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm(productToForm(product));
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const payload = formToPayload(form);

      if (editingId) {
        await updateAdminProduct(token, editingId, payload);
      } else {
        await createAdminProduct(token, payload);
      }

      closeForm();
      loadProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      await deleteAdminProduct(token, product.id);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const setField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Products</h1>
          <p className="text-gray-500">Manage your FlagHouse catalog</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openAdd}
            className="bg-gray-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            + Add product
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={loadProducts}
            className="ml-3 underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? `Edit product #${editingId}` : 'New product'}
          </h2>

          {formError && (
            <p className="mb-4 text-sm text-red-600">{formError}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Name</span>
              <input
                required
                value={form.name}
                onChange={setField('name')}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Category</span>
              <select
                value={form.category}
                onChange={setField('category')}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Tag (optional)</span>
              <input
                value={form.tag}
                onChange={setField('tag')}
                placeholder="Bestseller, Sale, New"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Price (₹)</span>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={setField('price')}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Original price (₹)</span>
              <input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={setField('originalPrice')}
                placeholder="Leave empty if none"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Rating (0–5)</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={setField('rating')}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Reviews count</span>
              <input
                type="number"
                min="0"
                value={form.reviews}
                onChange={setField('reviews')}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Image URL (optional)</span>
              <input
                value={form.image}
                onChange={setField('image')}
                placeholder="/products/1.jpg or https://..."
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
              {(form.image || editingId) && (
                <ProductImage
                  product={{ id: editingId, image: form.image || undefined }}
                  alt="Preview"
                  className="mt-3 w-24 h-24 rounded-xl border border-gray-100"
                  fallbackClassName="text-2xl"
                />
              )}
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={setField('description')}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-y"
              />
            </label>

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={setField('featured')}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Featured on homepage</span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="border border-gray-200 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && (
        <p className="text-sm text-gray-500">Loading products…</p>
      )}

      {!loading && !showForm && products.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400">
          No products yet. Add your first product.
        </div>
      )}

      {!loading && products.length > 0 && !showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <ProductImage
                        product={product}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg"
                        fallbackClassName="text-lg"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500">{product.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3">₹{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {product.featured ? (
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="text-gray-700 hover:text-gray-900 font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && products.length > 0 && showForm && (
        <p className="text-xs text-gray-400 mt-4">
          {products.length} product{products.length !== 1 ? 's' : ''} in catalog
        </p>
      )}
    </div>
  );
};

export default AdminProductsPage;
