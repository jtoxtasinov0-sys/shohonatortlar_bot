import { useEffect, useState } from 'react';
import { useApp } from './store';

import LanguageScreen from './components/LanguageScreen';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import ProductSheet from './components/ProductSheet';
import Skeleton from './components/Skeleton';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Profile from './pages/Profile';

export default function App() {
  const { lang, setLang, suggestedLang, onboarded, loading, error, reload, page, setPage, toast, t } =
    useApp();

  const [product, setProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Sahifa almashganda tepaga qaytish
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  // Birinchi yuklanish: bo'sh spinner emas, sahifa skeletini ko'rsatamiz.
  // Keshdan ochilganda bu ekran umuman ko'rinmaydi.
  if (loading) return <Skeleton t={t} />;

  if (error) {
    return (
      <div className="loader">
        <div className="empty">
          <div className="e-icon">😔</div>
          <h3>{t.errorTitle}</h3>
          <p>{error}</p>
          <button className="btn" onClick={reload}>
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  if (!lang) return <LanguageScreen onSelect={setLang} initial={suggestedLang} />;
  if (!onboarded) return <Onboarding />;

  const openCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setPage('catalog');
  };

  return (
    <div className="app">
      {page === 'home' && <Home onOpenProduct={setProduct} onOpenCategory={openCategory} />}
      {page === 'catalog' && (
        <Catalog
          onOpenProduct={setProduct}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}
      {page === 'cart' && <Cart />}
      {page === 'profile' && <Profile />}

      {product && <ProductSheet product={product} onClose={() => setProduct(null)} />}

      <BottomNav />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
