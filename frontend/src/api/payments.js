import { API_URL } from './config.js';

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function createRazorpayOrder(token, orderData) {
  const res = await fetch(`${API_URL}/api/payments/razorpay/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  return parseJsonResponse(res);
}

export async function verifyRazorpayPayment(token, paymentData) {
  const res = await fetch(`${API_URL}/api/payments/razorpay/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });
  return parseJsonResponse(res);
}
