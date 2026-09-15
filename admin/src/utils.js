export const formatPrice = (value) =>
  Math.round(Number(value) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

export const STATUS_LABELS = {
  new: 'Yangi',
  confirmed: 'Tasdiqlandi',
  delivering: "Yo'lda",
  done: 'Yetkazildi',
  canceled: 'Bekor qilindi',
};

export const ORDER_NUMBER = (id) => '#' + String(id).padStart(5, '0');

export const DEFAULT_CAKE_OPTIONS = [
  { label: '1 kg', multiplier: 1 },
  { label: '1.5 kg', multiplier: 1.5 },
  { label: '2 kg', multiplier: 2 },
  { label: '3 kg', multiplier: 3 },
];
