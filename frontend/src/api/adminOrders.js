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

export async function fetchAdminOrders(token) {
  const res = await fetch(`${API_URL}/api/admin/orders`, {
    headers: authHeaders(token),
  });
  return parseJsonResponse(res);
}

export async function fetchAdminOrderById(token, id) {
  const res = await fetch(`${API_URL}/api/admin/orders/${id}`, {
    headers: authHeaders(token),
  });
  return parseJsonResponse(res);
}

export async function updateAdminOrder(token, id, updates) {
  const res = await fetch(`${API_URL}/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(updates),
  });
  return parseJsonResponse(res);
}
