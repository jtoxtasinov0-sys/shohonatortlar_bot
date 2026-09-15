import { useApp } from '../store';
import { haptic } from '../telegram';

const ITEMS = [
  { key: 'home', icon: '🏠' },
  { key: 'catalog', icon: '🔍' },
  { key: 'cart', icon: '🛒' },
  { key: 'profile', icon: '👤' },
];

export default function BottomNav() {
  const { page, setPage, t, cartCount } = useApp();

  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <button
          key={item.key}
          className={`nav-item ${page === item.key ? 'active' : ''}`}
          onClick={() => {
            haptic('light');
            setPage(item.key);
          }}
        >
          <span className="ic">{item.icon}</span>
          <span>{t.nav[item.key]}</span>
          {item.key === 'cart' && cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </button>
      ))}
    </nav>
  );
}
