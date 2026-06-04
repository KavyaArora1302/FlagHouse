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
  'Content-Type': 'application/json',
});

export async function updateProfile(token, { name }) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
  return parseJsonResponse(res);
}

export async function fetchCheckoutPrefill(token) {
  const res = await fetch(`${API_URL}/api/auth/checkout-prefill`, {
    headers: authHeaders(token),
  });
  return parseJsonResponse(res);
}

export async function addSavedAddress(token, address) {
  const res = await fetch(`${API_URL}/api/auth/addresses`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(address),
  });
  return parseJsonResponse(res);
}

export async function updateSavedAddress(token, id, address) {
  const res = await fetch(`${API_URL}/api/auth/addresses/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(address),
  });
  return parseJsonResponse(res);
}

export async function deleteSavedAddress(token, id) {
  const res = await fetch(`${API_URL}/api/auth/addresses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseJsonResponse(res);
}

export async function setDefaultSavedAddress(token, id) {
  const res = await fetch(`${API_URL}/api/auth/addresses/${id}/default`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return parseJsonResponse(res);
}
