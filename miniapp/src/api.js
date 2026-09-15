/**
 * Backend bilan aloqa.
 * Vite proxy tufayli "/api" avtomatik http://localhost:5000 ga yo'naltiriladi.
 */
const BASE = import.meta.env.VITE_API_URL || '/api';

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) h['x-telegram-init-data'] = initData;
  return h;
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Server xatosi (${res.status})`);
  }
  return data;
}

export const api = {
  getCatalog: () => request('/client/catalog'),
  getMe: () => request('/client/me'),
  updateMe: (payload) => request('/client/me', { method: 'PATCH', body: payload }),
  getMyOrders: () => request('/client/orders'),
  createOrder: (payload) => request('/client/orders', { method: 'POST', body: payload }),
};
