import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import { getDict } from './i18n';
import { getTelegramUser, haptic } from './telegram';
import { lineKey, roundPrice, storage } from './utils';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS_LANG = 'sht_lang';
const LS_ONB = 'sht_onboarded';
const LS_CART = 'sht_cart';
const LS_CATALOG = 'sht_catalog_v1';

const EMPTY_CATALOG = { categories: [], products: [], stories: [], shop: null };

/** Keshdagi katalog yaroqlimi (tuzilishi to'g'rimi) */
function readCachedCatalog() {
  const cached = storage.get(LS_CATALOG, null);
  if (!cached || !Array.isArray(cached.products) || !cached.products.length) return null;
  return { ...EMPTY_CATALOG, ...cached };
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => storage.get(LS_LANG, null));
  const [suggestedLang, setSuggestedLang] = useState('uz'); // botda tanlangan til
  const [onboarded, setOnboarded] = useState(() => storage.get(LS_ONB, false));

  // Oxirgi marta ko'rilgan katalog — ilova bir zumda ochilishi uchun.
  // Yangi ma'lumot orqa fonda yuklanadi va o'z-o'zidan almashadi.
  // localStorage faqat bir marta o'qiladi (lazy initializer).
  const cachedRef = useRef(null);
  if (cachedRef.current === null) cachedRef.current = { value: readCachedCatalog() };
  const cachedCatalog = cachedRef.current.value;

  const [catalog, setCatalog] = useState(() => cachedCatalog || EMPTY_CATALOG);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(!cachedCatalog);
  const [error, setError] = useState(null);

  const [page, setPage] = useState('home');
  const [cart, setCart] = useState(() => storage.get(LS_CART, []));
  const [toast, setToast] = useState(null);

  const t = useMemo(() => getDict(lang || 'uz'), [lang]);

  // ── Ma'lumotlarni yuklash ────────────────────────────────
  // silent=true bo'lsa ekran o'zgarmaydi: eski ma'lumot ko'rinib turadi,
  // yangisi kelgach jimgina almashadi (stale-while-revalidate).
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    // Ikkala so'rov bir vaqtda ketadi — ketma-ket kutish yo'q.
    const catalogPromise = api.getCatalog();
    const mePromise = api.getMe().catch(() => null);

    try {
      const data = await catalogPromise;
      const next = {
        categories: data.categories || [],
        products: data.products || [],
        stories: data.stories || [],
        shop: data.shop || null,
      };
      setCatalog(next);
      storage.set(LS_CATALOG, next);
    } catch (err) {
      // Keshda ma'lumot bo'lsa — xato ekranini ko'rsatmaymiz,
      // foydalanuvchi eski katalog bilan ishlayveradi.
      if (!silent) setError(err.message);
    } finally {
      setLoading(false);
    }

    // Profil katalogdan mustaqil — kechikib kelsa ham ilovani ushlab turmaydi
    const meRes = await mePromise;
    if (meRes?.user) {
      setUser(meRes.user);
      // Botda tanlangan til — til ekranida oldindan belgilanadi
      if (meRes.user.language) setSuggestedLang(meRes.user.language);
    }
  }, []);

  useEffect(() => {
    load({ silent: Boolean(cachedCatalog) });
  }, [load, cachedCatalog]);

  const reload = useCallback(() => load(), [load]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
    } catch (_) {
      setOrders([]);
    }
  }, []);

  // ── Til ──────────────────────────────────────────────────
  const setLang = useCallback((value) => {
    const next = value === 'ru' ? 'ru' : 'uz';
    setLangState(next);
    storage.set(LS_LANG, next);
    api.updateMe({ language: next }).catch(() => {});
  }, []);

  const finishOnboarding = useCallback(() => {
    setOnboarded(true);
    storage.set(LS_ONB, true);
  }, []);

  // ── Savatcha ─────────────────────────────────────────────
  useEffect(() => {
    storage.set(LS_CART, cart);
  }, [cart]);

  const showToast = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const addToCart = useCallback(
    (product, { option = null, inscription = null, qty = 1 } = {}) => {
      const key = lineKey(product.id, option, inscription);
      setCart((prev) => {
        const index = prev.findIndex((l) => l.key === key);
        if (index >= 0) {
          const next = [...prev];
          next[index] = { ...next[index], qty: next[index].qty + qty };
          return next;
        }
        return [...prev, { key, productId: product.id, option, inscription, qty }];
      });
      haptic('success');
      showToast(getDict(lang || 'uz').toast.added);
    },
    [lang, showToast]
  );

  const changeQty = useCallback((key, delta) => {
    haptic('light');
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const removeLine = useCallback((key) => {
    haptic('light');
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Hisob-kitob ──────────────────────────────────────────
  const productMap = useMemo(
    () => new Map(catalog.products.map((p) => [p.id, p])),
    [catalog.products]
  );

  const unitPriceOf = useCallback((product, option) => {
    const options = Array.isArray(product?.weightOptions) ? product.weightOptions : [];
    if (!options.length) return product?.price || 0;
    const found = options.find((o) => o.label === option) || options[0];
    return roundPrice((product?.price || 0) * (Number(found.multiplier) || 1));
  }, []);

  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = productMap.get(line.productId);
          if (!product) return null;
          const unitPrice = unitPriceOf(product, line.option);
          return { ...line, product, unitPrice, sum: unitPrice * line.qty };
        })
        .filter(Boolean),
    [cart, productMap, unitPriceOf]
  );

  const subtotal = useMemo(() => cartLines.reduce((sum, l) => sum + l.sum, 0), [cartLines]);
  const cartCount = useMemo(() => cartLines.reduce((sum, l) => sum + l.qty, 0), [cartLines]);

  const telegramUser = getTelegramUser();
  const displayName =
    user?.firstName || telegramUser?.first_name || (lang === 'ru' ? 'Гость' : 'Mehmon');

  const value = {
    lang,
    setLang,
    suggestedLang,
    t,
    onboarded,
    finishOnboarding,

    catalog,
    shop: catalog.shop,
    user,
    setUser,
    displayName,
    orders,
    loadOrders,

    loading,
    error,
    reload,

    page,
    setPage,

    cart: cartLines,
    rawCart: cart,
    cartCount,
    subtotal,
    addToCart,
    changeQty,
    removeLine,
    clearCart,
    unitPriceOf,

    toast,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
