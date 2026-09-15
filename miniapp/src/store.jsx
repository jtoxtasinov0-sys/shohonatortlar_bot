import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { getDict } from './i18n';
import { getTelegramUser, haptic } from './telegram';
import { lineKey, roundPrice, storage } from './utils';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS_LANG = 'sht_lang';
const LS_ONB = 'sht_onboarded';
const LS_CART = 'sht_cart';

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => storage.get(LS_LANG, null));
  const [suggestedLang, setSuggestedLang] = useState('uz'); // botda tanlangan til
  const [onboarded, setOnboarded] = useState(() => storage.get(LS_ONB, false));

  const [catalog, setCatalog] = useState({ categories: [], products: [], stories: [], shop: null });
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState('home');
  const [cart, setCart] = useState(() => storage.get(LS_CART, []));
  const [toast, setToast] = useState(null);

  const t = useMemo(() => getDict(lang || 'uz'), [lang]);

  // ── Ma'lumotlarni yuklash ────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCatalog();
      setCatalog({
        categories: data.categories || [],
        products: data.products || [],
        stories: data.stories || [],
        shop: data.shop || null,
      });

      try {
        const meRes = await api.getMe();
        setUser(meRes.user);
        // Botda tanlangan til — til ekranida oldindan belgilanadi
        if (meRes.user?.language) setSuggestedLang(meRes.user.language);
      } catch (_) {
        // Avtorizatsiya bo'lmasa ham katalogni ko'rsatamiz
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    reload: load,

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
