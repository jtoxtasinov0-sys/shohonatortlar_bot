import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import { ORDER_NUMBER, STATUS_LABELS, formatDate, formatDateTime, formatPrice } from '../utils';

const FILTERS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'new', label: 'Yangi' },
  { key: 'confirmed', label: 'Tasdiqlangan' },
  { key: 'delivering', label: "Yo'lda" },
  { key: 'done', label: 'Yetkazilgan' },
  { key: 'canceled', label: 'Bekor qilingan' },
];

export default function Orders({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      const res = await api.orders(`?${params.toString()}`);
      setOrders(res.orders);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, search, onToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [autoRefresh, load]);

  const changeStatus = async (order, value) => {
    try {
      await api.setOrderStatus(order.id, value);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: value } : o)));
      onToast(`${ORDER_NUMBER(order.id)} → ${STATUS_LABELS[value]}`);
    } catch (err) {
      onToast(err.message);
    }
  };

  const removeOrder = async (order) => {
    if (!window.confirm(`${ORDER_NUMBER(order.id)} buyurtmasi o'chirilsinmi?`)) return;
    try {
      await api.deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      onToast("Buyurtma o'chirildi");
    } catch (err) {
      onToast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Buyurtmalar</h1>
          <p>Jami: {orders.length} ta</p>
        </div>
        <label className="live-dot" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            style={{ accentColor: '#17a05a' }}
          />
          <i /> Avtomatik yangilash (10s)
        </label>
      </div>

      <div className="toolbar">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            className={`btn ${status === filter.key ? 'dark' : 'ghost'}`}
            onClick={() => setStatus(filter.key)}
          >
            {filter.label}
          </button>
        ))}
        <input
          className="input"
          style={{ marginLeft: 'auto', minWidth: 230 }}
          value={search}
          placeholder="Ism yoki telefon bo'yicha qidirish"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : !orders.length ? (
          <div className="empty-state">
            <div className="ic">📭</div>
            <h3>Buyurtma topilmadi</h3>
            <p>Tanlangan filtr bo'yicha natija yo'q</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Mijoz</th>
                  <th>Mahsulotlar</th>
                  <th>Yetkazish</th>
                  <th>Summa</th>
                  <th>Holat</th>
                  <th>Sana</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="cell-main">{ORDER_NUMBER(order.id)}</td>

                    <td>
                      <div className="cell-main">
                        {order.customerName || order.user?.firstName || '—'}
                      </div>
                      <div className="cell-sub">{order.phone || '—'}</div>
                      {order.user?.username && (
                        <div className="cell-sub">@{order.user.username}</div>
                      )}
                    </td>

                    <td className="items-list">
                      {(order.items || []).map((item, index) => (
                        <div key={index}>
                          {item.nameUz}
                          {item.option ? ` (${item.option})` : ''} × {item.qty}
                          {item.inscription && <div className="ins">✍️ {item.inscription}</div>}
                        </div>
                      ))}
                    </td>

                    <td>
                      <div className="cell-main">
                        {order.deliveryType === 'pickup' ? '🏠 Olib ketish' : '🚗 Yetkazish'}
                      </div>
                      {order.address && <div className="cell-sub">{order.address}</div>}
                      {(order.deliveryDate || order.deliveryTime) && (
                        <div className="cell-sub">
                          {formatDate(order.deliveryDate)} {order.deliveryTime}
                        </div>
                      )}
                    </td>

                    <td className="price">
                      {formatPrice(order.total)}
                      {order.deliveryFee > 0 && (
                        <span className="cell-sub">+{formatPrice(order.deliveryFee)} yetkazish</span>
                      )}
                    </td>

                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => changeStatus(order, e.target.value)}
                      >
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="cell-sub">{formatDateTime(order.createdAt)}</td>

                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Batafsil" onClick={() => setDetail(order)}>
                          👁
                        </button>
                        <button
                          className="icon-btn danger"
                          title="O'chirish"
                          onClick={() => removeOrder(order)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <Modal title={`Buyurtma ${ORDER_NUMBER(detail.id)}`} onClose={() => setDetail(null)}>
          <div className="grid-2">
            <Info label="Mijoz" value={detail.customerName || detail.user?.firstName} />
            <Info label="Telefon" value={detail.phone} />
            <Info label="Telegram" value={detail.user?.username ? `@${detail.user.username}` : detail.user?.telegramId} />
            <Info label="Til" value={detail.user?.language === 'ru' ? 'Русский' : "O'zbekcha"} />
            <Info
              label="Qabul qilish"
              value={detail.deliveryType === 'pickup' ? 'Olib ketish' : 'Yetkazib berish'}
            />
            <Info label="To'lov" value={detail.paymentType === 'card' ? 'Karta' : 'Naqd'} />
            <Info label="Manzil" value={detail.address} />
            <Info label="Mo'ljal" value={detail.landmark} />
            <Info label="Sana" value={`${formatDate(detail.deliveryDate)} ${detail.deliveryTime || ''}`} />
            <Info label="Yaratilgan" value={formatDateTime(detail.createdAt)} />
          </div>

          {(detail.latitude || detail.longitude) && (
            <div className="field">
              <label>Joylashuv</label>
              <a
                className="btn ghost"
                href={`https://maps.google.com/?q=${detail.latitude},${detail.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                📍 Xaritada ochish
              </a>
            </div>
          )}

          {detail.comment && <Info label="Izoh" value={detail.comment} />}

          <div className="field" style={{ marginTop: 8 }}>
            <label>Mahsulotlar</label>
            <div className="card" style={{ padding: 14 }}>
              {(detail.items || []).map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    borderBottom: index < detail.items.length - 1 ? '1px solid #f0eef0' : 'none',
                  }}
                >
                  <div>
                    <b>{item.nameUz}</b>
                    {item.option ? ` · ${item.option}` : ''} × {item.qty}
                    {item.inscription && <div className="ins">✍️ {item.inscription}</div>}
                  </div>
                  <b>{formatPrice(item.unitPrice * item.qty)}</b>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px dashed #ddd',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                <span>Jami</span>
                <span>{formatPrice(detail.total)} so'm</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Info({ label, value }) {
  if (!value) return null;
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}
