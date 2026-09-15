/** Admin API bilan aloqa */
const BASE = import.meta.env.VITE_API_URL || '/api/admin';
const LS_TOKEN = 'sht_admin_token';

export const auth = {
  get: () => localStorage.getItem(LS_TOKEN) || '',
  set: (token) => localStorage.setItem(LS_TOKEN, token),
  clear: () => localStorage.removeItem(LS_TOKEN),
};

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': auth.get() },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
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
