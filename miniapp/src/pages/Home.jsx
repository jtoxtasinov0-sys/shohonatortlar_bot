import { useApp } from '../store';
import { haptic } from '../telegram';
import { formatPrice } from '../utils';
import Stories from '../components/Stories';
import ProductCard from '../components/ProductCard';

export default function Home({ onOpenProduct, onOpenCategory }) {
  const { t, lang, displayName, catalog, shop, setPage } = useApp();

  const popular = catalog.products.filter((p) => p.isPopular && !p.isUpsell).slice(0, 8);
  const categories = catalog.categories.slice(0, 4);

  return (
    <div className="screen">
      <header className="header">
        <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="header-text">
          <h1>
            {t.home.greeting}, {displayName}! 👋
          </h1>
          <p>{t.home.subtitle}</p>
        </div>
      </header>

      <Stories />

      <div className="hero">
        <h2>{t.home.heroTitle}</h2>
        <p>{t.home.heroText}</p>
        <button
          className="hero-btn"
          onClick={() => {
            haptic('medium');
            setPage('catalog');
          }}
        >
          {t.home.heroBtn} →
        </button>
      </div>

      {shop?.freeDeliveryFrom ? (
        <div className="info-strip">
          🚗 <span>{t.home.freeDelivery(formatPrice(shop.freeDeliveryFrom))}</span>
        </div>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h3 className="section-title">{t.home.categories}</h3>
          <button className="section-link" onClick={() => setPage('catalog')}>
            {t.home.seeAll} →
          </button>
        </div>
        <div className="cat-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              className="cat-tile"
              onClick={() => {
                haptic('light');
                onOpenCategory(category.id);
              }}
            >
              <span className="emoji">{category.emoji}</span>
              <b>{lang === 'ru' ? category.nameRu : category.nameUz}</b>
            </button>
          ))}
        </div>
      </section>

      {popular.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h3 className="section-title">{t.home.popular}</h3>
            <button className="section-link" onClick={() => setPage('catalog')}>
              {t.home.seeAll} →
            </button>
          </div>
          <div className="h-scroll">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={onOpenProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
