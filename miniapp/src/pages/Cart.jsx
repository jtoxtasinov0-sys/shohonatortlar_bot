import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { closeApp, haptic, setBackButton } from '../telegram';
import { TIME_SLOTS, formatPrice, pickName, todayISO } from '../utils';
import SafeImage from '../components/SafeImage';

export default function Cart() {
  const {
    t,
    lang,
    catalog,
    shop,
    user,
    displayName,
    cart,
    subtotal,
    changeQty,
    removeLine,
    clearCart,
    addToCart,
    setPage,
    showToast,
  } = useApp();

  const [step, setStep] = useState('cart'); // cart | checkout
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    deliveryType: 'delivery',
    address: '',
    landmark: '',
    latitude: null,
    longitude: null,
    deliveryDate: todayISO(),
    deliveryTime: TIME_SLOTS[2],
    comment: '',
    paymentType: 'cash',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user?.firstName || displayName || '',
      phone: prev.phone || user?.phone || '',
    }));
  }, [user, displayName]);

  useEffect(() => {
    if (step === 'checkout') return setBackButton(true, () => setStep('cart'));
    return setBackButton(false);
  }, [step]);

  const upsell = useMemo(() => catalog.products.find((p) => p.isUpsell && p.isActive), [catalog.products]);
  const upsellInCart = upsell ? cart.some((l) => l.productId === upsell.id) : false;

  const deliveryFee =
    form.deliveryType === 'delivery' && shop && subtotal < shop.freeDeliveryFrom ? shop.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleUpsell = () => {
    if (!upsell) return;
    haptic('light');
    if (upsellInCart) {
      const line = cart.find((l) => l.productId === upsell.id);
      if (line) removeLine(line.key);
    } else {
      addToCart(upsell, {});
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    haptic('light');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('latitude', pos.coords.latitude);
        set('longitude', pos.coords.longitude);
        showToast(t.checkout.geoOk);
      },
      () => showToast(t.errorTitle)
    );
  };

  const submit = async () => {
    if (!form.customerName.trim() || !form.phone.trim()) {
      haptic('error');
      return showToast(t.checkout.required);
    }
    if (form.deliveryType === 'delivery' && !form.address.trim()) {
      haptic('error');
      return showToast(t.checkout.addressRequired);
    }

    setSending(true);
    try {
      const res = await api.createOrder({
        ...form,
        language: lang,
        items: cart.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          option: line.option,
          inscription: line.inscription,
        })),
      });
      haptic('success');
      clearCart();
      setSuccess(res.order);
    } catch (err) {
      haptic('error');
      showToast(err.message);
    } finally {
      setSending(false);
    }
  };

  // ── Muvaffaqiyat ekrani ─────────────────────────────────
  if (success) {
    return (
      <div className="success-screen">
        <div className="success-icon">✅</div>
        <h2>{t.success.title}</h2>
        <p>{t.success.text}</p>
        <div className="order-number">
          <span>{t.success.number}</span>
          <b>{success.number}</b>
        </div>
        <button
          className="btn"
          onClick={() => {
            closeApp();
            setSuccess(null);
            setStep('cart');
            setPage('home');
          }}
        >
          {t.success.close}
        </button>
      </div>
    );
  }

  // ── Bo'sh savatcha ──────────────────────────────────────
  if (!cart.length) {
    return (
      <div className="screen">
        <h1 className="page-title">{t.cart.title}</h1>
        <div className="empty">
          <div className="e-icon">🛒</div>
          <h3>{t.cart.empty}</h3>
          <p>{t.cart.emptyText}</p>
          <button className="btn" onClick={() => setPage('catalog')}>
            {t.cart.goCatalog}
          </button>
        </div>
      </div>
    );
  }

  // ── Buyurtma ma'lumotlari ───────────────────────────────
  if (step === 'checkout') {
    return (
      <div className="screen has-cta">
        <h1 className="page-title">{t.checkout.title}</h1>

        <div className="field">
          <label>{t.checkout.name}</label>
          <input
            value={form.customerName}
            placeholder={t.checkout.namePh}
            onChange={(e) => set('customerName', e.target.value)}
          />
        </div>

        <div className="field">
          <label>{t.checkout.phone}</label>
          <input
            value={form.phone}
            type="tel"
            placeholder={t.checkout.phonePh}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        <div className="field">
          <label>{t.checkout.type}</label>
          <div className="segment">
            <button
              className={form.deliveryType === 'delivery' ? 'active' : ''}
              onClick={() => set('deliveryType', 'delivery')}
            >
              🚗 {t.checkout.delivery}
            </button>
            <button
              className={form.deliveryType === 'pickup' ? 'active' : ''}
              onClick={() => set('deliveryType', 'pickup')}
            >
              🏠 {t.checkout.pickup}
            </button>
          </div>
        </div>

        {form.deliveryType === 'delivery' ? (
          <>
            <div className="field">
              <label>{t.checkout.address}</label>
              <input
                value={form.address}
                placeholder={t.checkout.addressPh}
                onChange={(e) => set('address', e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t.checkout.landmark}</label>
              <input
                value={form.landmark}
                placeholder={t.checkout.landmarkPh}
                onChange={(e) => set('landmark', e.target.value)}
              />
            </div>
            <button
              className="btn ghost"
              style={{ marginBottom: 14, padding: 13 }}
              onClick={detectLocation}
            >
              {form.latitude ? t.checkout.geoOk : t.checkout.geo}
            </button>
          </>
        ) : (
          <div className="info-strip" style={{ marginBottom: 14 }}>
            📍 <span>{shop?.address}</span>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label>{t.checkout.date}</label>
            <input
              type="date"
              value={form.deliveryDate}
              min={todayISO()}
              onChange={(e) => set('deliveryDate', e.target.value)}
            />
          </div>
          <div className="field">
            <label>{t.checkout.time}</label>
            <select value={form.deliveryTime} onChange={(e) => set('deliveryTime', e.target.value)}>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>{t.checkout.payment}</label>
          <div className="segment">
            <button
              className={form.paymentType === 'cash' ? 'active' : ''}
              onClick={() => set('paymentType', 'cash')}
            >
              💵 {t.checkout.cash}
            </button>
            <button
              className={form.paymentType === 'card' ? 'active' : ''}
              onClick={() => set('paymentType', 'card')}
            >
              💳 {t.checkout.card}
            </button>
          </div>
        </div>

        <div className="field">
          <label>{t.checkout.comment}</label>
          <textarea
            value={form.comment}
            placeholder={t.checkout.commentPh}
            onChange={(e) => set('comment', e.target.value)}
          />
        </div>

        <div className="totals">
          <div className="row">
            <span>{t.cart.subtotal}</span>
            <span>
              {formatPrice(subtotal)} {t.currency}
            </span>
          </div>
          <div className="row">
            <span>{t.cart.deliveryFee}</span>
            {deliveryFee ? (
              <span>
                {formatPrice(deliveryFee)} {t.currency}
              </span>
            ) : (
              <span className="free">{t.cart.free}</span>
            )}
          </div>
          <div className="row grand">
            <span>{t.cart.total}</span>
            <span>
              {formatPrice(total)} {t.currency}
            </span>
          </div>
        </div>

        <div className="sticky-cta">
          <button className="btn" disabled={sending} onClick={submit}>
            {sending ? t.loading : `${t.cart.checkout} · ${formatPrice(total)} ${t.currency}`}
          </button>
        </div>
      </div>
    );
  }

  // ── Savatcha ────────────────────────────────────────────
  return (
    <div className="screen has-cta">
      <h1 className="page-title">{t.cart.title}</h1>

      {cart.map((line) => (
        <div className="cart-line" key={line.key}>
          <div className="cart-thumb">
            <SafeImage src={line.product.imageUrl} alt="" emoji="🍰" />
          </div>

          <div className="cart-info">
            <b>{pickName(line.product, lang)}</b>
            <div className="meta">
              {line.option ? `${line.option} · ` : ''}
              {formatPrice(line.unitPrice)} {t.currency}
            </div>
            {line.inscription && <div className="note">✍️ {line.inscription}</div>}
          </div>

          <div className="cart-right">
            <b>
              {formatPrice(line.sum)} {t.currency}
            </b>
            <div className="stepper sm">
              <button onClick={() => changeQty(line.key, -1)}>−</button>
              <span>{line.qty}</span>
              <button onClick={() => changeQty(line.key, 1)}>+</button>
            </div>
          </div>
        </div>
      ))}

      {upsell && (
        <>
          <div className="label">{t.cart.upsellTitle}</div>
          <div className="upsell">
            <SafeImage src={upsell.imageUrl} alt="" emoji="🕯️" />
            <div className="u-text">
              <b>{pickName(upsell, lang)}</b>
              <span>
                +{formatPrice(upsell.price)} {t.currency}
              </span>
            </div>
            <button
              className={`switch ${upsellInCart ? 'on' : ''}`}
              onClick={toggleUpsell}
              aria-label="upsell"
            />
          </div>
        </>
      )}

      <div className="totals">
        <div className="row">
          <span>
            {t.cart.subtotal} ({cart.length} {t.cart.items})
          </span>
          <span>
            {formatPrice(subtotal)} {t.currency}
          </span>
        </div>
        <div className="row">
          <span>{t.cart.deliveryFee}</span>
          {deliveryFee ? (
            <span>
              {formatPrice(deliveryFee)} {t.currency}
            </span>
          ) : (
            <span className="free">{t.cart.free}</span>
          )}
        </div>
        <div className="row grand">
          <span>{t.cart.total}</span>
          <span>
            {formatPrice(total)} {t.currency}
          </span>
        </div>
      </div>

      <button className="btn danger-text" onClick={clearCart}>
        {t.cart.clear}
      </button>

      <div className="sticky-cta">
        <button
          className="btn"
          onClick={() => {
            haptic('medium');
            setStep('checkout');
            window.scrollTo({ top: 0 });
          }}
        >
          {t.cart.checkout} · {formatPrice(total)} {t.currency}
        </button>
      </div>
    </div>
  );
}
