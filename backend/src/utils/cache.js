/**
 * Oddiy xotira keshi (TTL bilan).
 *
 * Nega kerak: Mini App har ochilganda /api/client/catalog ni so'raydi.
 * Har safar Neon bazasiga 3 ta so'rov yuborish — ayniqsa baza "uyqu"dan
 * uyg'onayotgan paytda — bir necha soniya vaqt oladi. Katalog esa kunda
 * bir-ikki marta o'zgaradi, shuning uchun uni xotirada saqlash mumkin.
 */

const store = new Map();

/** Keshdan olish (muddati o'tgan bo'lsa — null) */
function get(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

/** Keshga yozish. ttlMs — necha millisekund yashashi */
function set(key, value, ttlMs = 60_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/**
 * Keshdan o'qiydi, bo'lmasa loader() ni chaqirib natijani saqlaydi.
 * Bir vaqtda kelgan bir nechta so'rov bitta so'rovni kutadi (dogpile himoyasi).
 */
const inFlight = new Map();

async function remember(key, ttlMs, loader) {
  const cached = get(key);
  if (cached !== null) return cached;

  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    try {
      const value = await loader();
      set(key, value, ttlMs);
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

/** Bitta kalitni yoki (kalitsiz) butun keshni tozalash */
function invalidate(key) {
  if (key === undefined) store.clear();
  else store.delete(key);
}

module.exports = { get, set, remember, invalidate };
