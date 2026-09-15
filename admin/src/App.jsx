import { useCallback, useEffect, useState } from 'react';
import { api, auth } from './api';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Stories from './pages/Stories';
import Users from './pages/Users';

const MENU = [
  { key: 'dashboard', icon: '📊', label: 'Boshqaruv' },
  { key: 'orders', icon: '📦', label: 'Buyurtmalar' },
  { key: 'products', icon: '🍰', label: 'Mahsulotlar' },
  { key: 'categories', icon: '🗂', label: 'Kategoriyalar' },
  { key: 'stories', icon: '✨', label: 'Storylar' },
  { key: 'users', icon: '👥', label: 'Mijozlar' },
];

export default function App() {
  const [authed, setAuthed] = useState(() => !!auth.get());
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [newCount, setNewCount] = useState(0);

  const showToast = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // Yangi buyurtmalar sonini kuzatib turamiz
  useEffect(() => {
    if (!authed) return undefined;
    const tick = () =>
      api
        .stats()
        .then((res) => setNewCount(res.stats.newOrders))
        .catch(() => {});
    tick();
    const timer = setInterval(tick, 12000);
    return () => clearInterval(timer);
  }, [authed, page]);

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">🍰</span>
          <div>
            <b>Shohona Tortlar</b>
            <span>Admin panel</span>
          </div>
        </div>

        <nav className="menu">
          {MENU.map((item) => (
            <button
              key={item.key}
              className={`menu-item ${page === item.key ? 'active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              <span className="ic">{item.icon}</span>
              <span>{item.label}</span>
              {item.key === 'orders' && newCount > 0 && <span className="count">{newCount}</span>}
            </button>
          ))}
        </nav>

        <button
          className="logout"
          onClick={() => {
            auth.clear();
            setAuthed(false);
          }}
        >
          ⎋ Chiqish
        </button>
      </aside>

      <main className="main">
        {page === 'dashboard' && <Dashboard onGoOrders={() => setPage('orders')} />}
        {page === 'orders' && <Orders onToast={showToast} />}
        {page === 'products' && <Products onToast={showToast} />}
        {page === 'categories' && <Categories onToast={showToast} />}
        {page === 'stories' && <Stories onToast={showToast} />}
        {page === 'users' && <Users onToast={showToast} />}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
