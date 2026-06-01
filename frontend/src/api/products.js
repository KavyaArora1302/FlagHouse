import { API_URL } from './config.js';

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function fetchProducts({ featured, category } = {}) {
  const params = new URLSearchParams();

  if (featured) params.set('featured', 'true');
  if (category) params.set('category', category);

  const query = params.toString();
  const url = `${API_URL}/api/products${query ? `?${query}` : ''}`;

  const res = await fetch(url);
  return parseJsonResponse(res);
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  return parseJsonResponse(res);
}
