/**
 * Backend bilan aloqa.
 * Vite proxy tufayli "/api" avtomatik http://localhost:5000 ga yo'naltiriladi.
 */
const BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Backend boshqa domenda bo'lsa (Render), DNS + TLS ulanishini
 * oldindan ochib qo'yamiz. Birinchi so'rov ~200-500 ms tez bo'ladi.
 */
function preconnect() {
  try {
    if (!/^https?:\/\//i.test(BASE)) return;
    const origin = new URL(BASE).origin;
    if (origin === window.location.origin) return;

    for (const rel of ['preconnect', 'dns-prefetch']) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = origin;
      if (rel === 'preconnect') link.crossOrigin = '';
      document.head.appendChild(link);
    }
  } catch (_) {}
}

if (typeof document !== 'undefined') preconnect();

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
