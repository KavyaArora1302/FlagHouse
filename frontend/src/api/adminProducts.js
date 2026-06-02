import { API_URL } from './config.js';

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export async function fetchAdminProducts(token) {
  const res = await fetch(`${API_URL}/api/admin/products`, {
    headers: authHeaders(token),
  });
  return parseJsonResponse(res);
}

export async function createAdminProduct(token, product) {
  const res = await fetch(`${API_URL}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(product),
  });
  return parseJsonResponse(res);
}

export async function updateAdminProduct(token, id, product) {
  const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(product),
  });
  return parseJsonResponse(res);
}

export async function deleteAdminProduct(token, id) {
  const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseJsonResponse(res);
}
