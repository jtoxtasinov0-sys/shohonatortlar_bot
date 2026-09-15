import { useMemo, useState } from 'react';
import { useApp } from '../store';
import { haptic } from '../telegram';
import { pickName } from '../utils';
import ProductCard from '../components/ProductCard';

export default function Catalog({ onOpenProduct, activeCategory, setActiveCategory }) {
  const { t, lang, catalog } = useApp();
  const [query, setQuery] = useState('');

  const products = useMemo(() => {
    const search = query.trim().toLowerCase();
    return catalog.products
      .filter((p) => !p.isUpsell)
      .filter((p) => (activeCategory ? p.categoryId === activeCategory : true))
      .filter((p) => (search ? pickName(p, lang).toLowerCase().includes(search) : true));
  }, [catalog.products, activeCategory, query, lang]);

  return (
    <div className="screen">
      <h1 className="page-title">{t.catalog.title}</h1>

      <div className="search">
        <span className="icon">🔍</span>
        <input
          value={query}
          placeholder={t.catalog.search}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chips">
        <button
          className={`chip ${!activeCategory ? 'active' : ''}`}
          onClick={() => {
            haptic('light');
            setActiveCategory(null);
          }}
        >
          {t.catalog.all}
        </button>
        {catalog.categories.map((category) => (
          <button
            key={category.id}
            className={`chip ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              setActiveCategory(category.id);
            }}
          >
            {category.emoji} {lang === 'ru' ? category.nameRu : category.nameUz}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="empty">
          <div className="e-icon">🧁</div>
          <p>{t.catalog.empty}</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={onOpenProduct} />
          ))}
        </div>
      )}
    </div>
  );
}
