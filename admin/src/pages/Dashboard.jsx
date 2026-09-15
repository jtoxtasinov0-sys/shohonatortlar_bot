import { useEffect, useState } from 'react';
import { api } from '../api';
import { ORDER_NUMBER, STATUS_LABELS, formatDateTime, formatPrice } from '../utils';

export default function Dashboard({ onGoOrders }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, o] = await Promise.all([api.stats(), api.orders('?take=6')]);
      setStats(s.stats);
      setOrders(o.orders);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="spinner" />;

  const cards = [
    { icon: '🔔', label: 'Yangi buyurtmalar', value: stats?.newOrders, sub: 'Ko’rib chiqilmagan' },
    { icon: '📦', label: 'Bugungi buyurtmalar', value: stats?.todayOrders, sub: 'Bugun' },
    {
      icon: '💰',
      label: 'Bugungi tushum',
      value: `${formatPrice(stats?.todayRevenue)}`,
      sub: "so'm",
    },
    {
      icon: '📈',
      label: 'Umumiy tushum',
      value: `${formatPrice(stats?.totalRevenue)}`,
      sub: `${stats?.totalOrders} ta buyurtma`,
    },
    { icon: '🍰', label: 'Mahsulotlar', value: stats?.totalProducts, sub: 'Katalogda' },
    { icon: '👥', label: 'Mijozlar', value: stats?.totalUsers, sub: 'Botga obuna' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Boshqaruv paneli</h1>
          <p>Do'kon holati bir qarashda</p>
        </div>
        <span className="live-dot">
          <i /> Har 15 soniyada yangilanadi
        </span>
      </div>

      <div className="stat-grid">
        {cards.map((card) => (
          <div className="stat" key={card.label}>
            <div className="top">
              <span>{card.icon}</span>
              {card.label}
            </div>
            <b>{card.value ?? 0}</b>
            <div className="sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="page-head">
        <h1 style={{ fontSize: 18 }}>So'nggi buyurtmalar</h1>
        <button className="btn ghost" onClick={onGoOrders}>
          Hammasi →
        </button>
      </div>

      <div className="card">
        {!orders.length ? (
          <div className="empty-state">
            <div className="ic">📭</div>
            <h3>Hozircha buyurtma yo'q</h3>
            <p>Mini App orqali birinchi buyurtma tushganda shu yerda ko'rinadi</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Mijoz</th>
                  <th>Mahsulotlar</th>
                  <th>Summa</th>
                  <th>Holat</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="cell-main">{ORDER_NUMBER(order.id)}</td>
                    <td>
                      <div className="cell-main">{order.customerName || order.user?.firstName || '—'}</div>
                      <div className="cell-sub">{order.phone || '—'}</div>
                    </td>
                    <td className="items-list">
                      {(order.items || []).map((item, index) => (
                        <div key={index}>
                          {item.nameUz}
                          {item.option ? ` (${item.option})` : ''} × {item.qty}
                        </div>
                      ))}
                    </td>
                    <td className="price">{formatPrice(order.total)}</td>
                    <td>
                      <span className={`pill ${order.status}`}>{STATUS_LABELS[order.status]}</span>
                    </td>
                    <td className="cell-sub">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
