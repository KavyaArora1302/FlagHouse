import { API_URL } from './config.js';

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function fetchAdminStatus(token) {
  const res = await fetch(`${API_URL}/api/admin/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseJsonResponse(res);
}
