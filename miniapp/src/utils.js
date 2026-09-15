/** Yordamchi funksiyalar */

export const formatPrice = (value) =>
  Math.round(Number(value) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const roundPrice = (value) => Math.round(value / 1000) * 1000;

/** Mahsulot nomi tanlangan tilda */
export const pickName = (item, lang) =>
  (lang === 'ru' ? item?.nameRu : item?.nameUz) || item?.nameUz || item?.nameRu || '';

export const pickDesc = (item, lang) =>
  (lang === 'ru' ? item?.descriptionRu : item?.descriptionUz) || '';

export const pickList = (item, lang) => {
  const list = lang === 'ru' ? item?.ingredientsRu : item?.ingredientsUz;
  return Array.isArray(list) && list.length ? list : item?.ingredientsUz || [];
};

export const pickTitle = (item, lang) => (lang === 'ru' ? item?.titleRu : item?.titleUz) || '';
export const pickText = (item, lang) => (lang === 'ru' ? item?.textRu : item?.textUz) || '';

/** Savatchadagi element uchun unikal kalit (vazn + yozuv bilan) */
export const lineKey = (productId, option, inscription) =>
  `${productId}__${option || ''}__${inscription || ''}`;

/** "2026-09-15" formatidagi bugungi sana */
export const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

export const TIME_SLOTS = [
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 21:00',
];

/** localStorage bilan xavfsiz ishlash */
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  },
};
