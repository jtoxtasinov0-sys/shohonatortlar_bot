/**
 * Kichik yordamchi funksiyalar.
 */

/** 250000 -> "250 000" */
function formatPrice(value) {
  const num = Math.round(Number(value) || 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 12 -> "#00012" */
function formatOrderNumber(id) {
  return '#' + String(id).padStart(5, '0');
}

/** HTML maxsus belgilarini xavfsizlash */
function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Buyurtma mahsulotlari ro'yxatini matnga aylantirish (Telegram HTML uchun) */
function itemsToText(items, lang = 'uz') {
  if (!Array.isArray(items) || !items.length) return '';
  return items
    .map((item, index) => {
      const name = escapeHtml(lang === 'ru' ? item.nameRu || item.nameUz : item.nameUz || item.nameRu);
      const option = item.option ? ` (${escapeHtml(item.option)})` : '';
      const sum = formatPrice((item.unitPrice || 0) * (item.qty || 1));
      const text = item.inscription ? `\n     ✍️ «${escapeHtml(item.inscription)}»` : '';
      return `${index + 1}. ${name}${option} × ${item.qty} — ${sum}${text}`;
    })
    .join('\n');
}

/** "2026-09-20" -> "20.09.2026" */
function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

module.exports = { formatPrice, formatOrderNumber, itemsToText, escapeHtml, formatDate };
