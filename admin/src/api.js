/** Admin API bilan aloqa */
const BASE = import.meta.env.VITE_API_URL || '/api/admin';
const LS_TOKEN = 'sht_admin_token';

/** Backend manzili — xato xabarlarida ko'rsatiladi */
export const apiBase = BASE;

/**
 * `VITE_API_URL` berilmagan bo'lsa, so'rovlar backend'ga emas, saytning
 * o'ziga ketadi va hech kim kira olmaydi. Buni darhol aytib qo'yamiz.
 */
export const apiMisconfigured = !import.meta.env.VITE_API_URL;

/**
 * Backend'ning asosiy manzili. Yuklangan rasmlar bazada saqlanadi va
 * "/api/images/<id>.jpg" ko'rinishida keladi — to'liq havola shu yerdan yasaladi.
 */
const ORIGIN = (() => {
  try {
    return new URL(BASE, window.location.origin).origin;
  } catch (_) {
    return '';
  }
})();

/** Rasm havolasini to'liq manzilga aylantiradi */
export function mediaUrl(url) {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return ORIGIN + (url.startsWith('/') ? url : `/${url}`);
}

export const auth = {
  get: () => localStorage.getItem(LS_TOKEN) || '',
  set: (token) => localStorage.setItem(LS_TOKEN, token),
  clear: () => localStorage.removeItem(LS_TOKEN),
};

/**
 * Render'ning bepul tarifi 15 daqiqa harakatsizlikdan keyin servisni uxlatadi
 * va uyg'onish ~50 soniya oladi. Shu vaqtda birinchi so'rov «yiqilmasligi»
 * uchun kutamiz va bir necha marta qayta urinamiz.
 */
const TIMEOUT_MS = 75000;
const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);
const SLOW_AFTER_MS = 3500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Sekin javoblarni kuzatuvchilar — «server uyg'onmoqda» xabari uchun */
const slowListeners = new Set();

/** Sekin so'rov boshlanganda/tugaganda xabar beradi. Obunani bekor qiluvchi funksiya qaytaradi. */
export function onSlowRequest(fn) {
  slowListeners.add(fn);
  return () => slowListeners.delete(fn);
}

function emitSlow(slow) {
  slowListeners.forEach((fn) => fn(slow));
}

async function fetchWithRetry(url, options, attempts = 3) {
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const isLast = attempt === attempts - 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      // Uyg'onayotgan yoki band server tez 5xx qaytaradi — qayta urinib ko'ramiz
      if (isLast || !RETRY_STATUS.has(res.status)) return res;
      lastError = new Error(`Server javob bermadi (${res.status})`);
    } catch (err) {
      // Kutish vaqti tugagan bo'lsa qayta urinish ma'nosiz: foydalanuvchi allaqachon kutdi
      if (err.name === 'AbortError') {
        throw new Error('Server juda uzoq javob bermadi. Biroz kutib, qayta urinib ko\'ring.');
      }
      lastError = new Error('Serverga ulanib bo\'lmadi. Internetni va server holatini tekshiring.');
      if (isLast) throw lastError;
    } finally {
      clearTimeout(timer);
    }

    await sleep(2000 * (attempt + 1));
  }

  throw lastError;
}

async function request(path, { method = 'GET', body } = {}) {
  const slowTimer = setTimeout(() => emitSlow(true), SLOW_AFTER_MS);

  let res;
  try {
    res = await fetchWithRetry(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': auth.get() },
      body: body ? JSON.stringify(body) : undefined,
    });
  } finally {
    clearTimeout(slowTimer);
    emitSlow(false);
  }

  const raw = await res.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (_) {
    data = null;
  }

  // JSON o'rniga HTML kelgan bo'lsa — so'rov backend'ga yetib bormagan
  if (data === null && raw.trim().startsWith('<')) {
    throw new Error(
      `Backend manzili noto'g'ri: so'rov "${BASE}" ga ketdi va sayt sahifasi qaytdi. ` +
        'Vercel → Settings → Environment Variables → VITE_API_URL ni to\'g\'rilab, qayta deploy qiling.'
    );
  }

  if (res.status === 401) {
    auth.clear();
    window.location.reload();
    throw new Error('Sessiya tugadi');
  }
  if (!res.ok || !data?.ok) throw new Error(data?.error || `Xatolik (${res.status})`);
  return data;
}

export const api = {
  login: (password) => request('/login', { method: 'POST', body: { password } }),
  stats: () => request('/stats'),

  orders: (params = '') => request(`/orders${params}`),
  setOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  /** Rasmni bazaga yuklaydi, javobida { url } qaytadi */
  upload: (body) => request('/upload', { method: 'POST', body }),

  products: () => request('/products'),
  createProduct: (body) => request('/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  categories: () => request('/categories'),
  createCategory: (body) => request('/categories', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  stories: () => request('/stories'),
  createStory: (body) => request('/stories', { method: 'POST', body }),
  updateStory: (id, body) => request(`/stories/${id}`, { method: 'PUT', body }),
  deleteStory: (id) => request(`/stories/${id}`, { method: 'DELETE' }),

  users: () => request('/users'),
};
