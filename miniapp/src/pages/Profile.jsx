import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { haptic } from '../telegram';
import { formatDate, formatPrice } from '../utils';

export default function Profile() {
  const { t, lang, setLang, user, displayName, shop, orders, loadOrders, catalog, addToCart, setPage, showToast } =
    useApp();
  const [tab, setTab] = useState('main'); // main | orders

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const reorder = (order) => {
    haptic('success');
    const map = new Map(catalog.products.map((p) => [p.id, p]));
    let added = 0;
    (order.items || []).forEach((item) => {
      const product = map.get(item.productId);
      if (product) {
        addToCart(product, { option: item.option, inscription: item.inscription, qty: item.qty });
        added += 1;
      }
    });
    if (added) {
      showToast(t.toast.reordered);
      setPage('cart');
    }
  };

  if (tab === 'orders') {
    return (
      <div className="screen">
        <h1 className="page-title">
          <button style={{ marginRight: 8 }} onClick={() => setTab('main')}>
            ←
          </button>
          {t.profile.myOrders}
        </h1>

        {!orders.length ? (
          <div className="empty">
            <div className="e-icon">📜</div>
            <p>{t.profile.ordersEmpty}</p>
            <button className="btn" onClick={() => setPage('catalog')}>
              {t.cart.goCatalog}
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <b>#{String(order.id).padStart(5, '0')}</b>
                  <div className="date">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`status ${order.status}`}>{t.statuses[order.status]}</span>
              </div>

              <div className="order-items">
                {(order.items || []).map((item, index) => (
                  <div key={index}>
                    • {lang === 'ru' ? item.nameRu : item.nameUz}
                    {item.option ? ` (${item.option})` : ''} × {item.qty}
                  </div>
                ))}
              </div>

              <div className="order-foot">
                <b>
                  {formatPrice(order.total)} {t.currency}
                </b>
                <button className="reorder-btn" onClick={() => reorder(order)}>
                  🔁 {t.profile.reorder}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 className="page-title">{t.profile.title}</h1>

      <div className="profile-card">
        <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <b>{displayName}</b>
          <span>{user?.phone || (user?.username ? `@${user.username}` : '—')}</span>
        </div>
      </div>

      <section className="section">
        <button className="list-row" onClick={() => setTab('orders')}>
          <span className="ic">📜</span>
          <span className="txt">
            <b>{t.profile.myOrders}</b>
            <span>{orders.length}</span>
          </span>
          <span className="arrow">›</span>
        </button>

        <div className="list-row">
          <span className="ic">🌐</span>
          <span className="txt">
            <b>{t.profile.language}</b>
          </span>
          <div className="segment" style={{ width: 150 }}>
            <button
              className={lang === 'uz' ? 'active' : ''}
              onClick={() => {
                haptic('light');
                setLang('uz');
              }}
            >
              🇺🇿 UZ
            </button>
            <button
              className={lang === 'ru' ? 'active' : ''}
              onClick={() => {
                haptic('light');
                setLang('ru');
              }}
            >
              🇷🇺 RU
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3 className="section-title">{t.profile.contactUs}</h3>
        </div>

        <a className="list-row" href={`tel:${(shop?.phone || '').replace(/\s/g, '')}`}>
          <span className="ic">📞</span>
          <span className="txt">
            <b>{t.profile.call}</b>
            <span>{shop?.phone}</span>
          </span>
          <span className="arrow">›</span>
        </a>

        <a className="list-row" href={shop?.instagram} target="_blank" rel="noreferrer">
          <span className="ic">📸</span>
          <span className="txt">
            <b>{t.profile.instagram}</b>
            <span>@shohonatortlar</span>
          </span>
          <span className="arrow">›</span>
        </a>

        <div className="list-row">
          <span className="ic">🕒</span>
          <span className="txt">
            <b>{t.profile.workTime}</b>
            <span>{shop?.workTime}</span>
          </span>
        </div>

        <div className="list-row">
          <span className="ic">📍</span>
          <span className="txt">
            <b>{t.profile.address}</b>
            <span>{shop?.address}</span>
          </span>
        </div>
      </section>

      <p style={{ textAlign: 'center', color: '#b7b2bb', fontSize: 12, marginTop: 28 }}>
        🍰 Shohona Tortlar · v1.0
      </p>
    </div>
  );
}
