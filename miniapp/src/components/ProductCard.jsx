import { useApp } from '../store';
import { formatPrice, pickName } from '../utils';
import SafeImage from './SafeImage';

/**
 * Katalogdagi mahsulot kartochkasi.
 */
export default function ProductCard({ product, onOpen }) {
  const { lang, t, addToCart } = useApp();

  const options = Array.isArray(product.weightOptions) ? product.weightOptions : [];
  const hasOptions = options.length > 0;

  const quickAdd = (event) => {
    event.stopPropagation();
    addToCart(product, { option: hasOptions ? options[0].label : null });
  };

  return (
    <div className="card" onClick={() => onOpen(product)}>
      <div className="card-img">
        <SafeImage src={product.imageUrl} alt={pickName(product, lang)} emoji="🍰" />
        {product.isPopular && <span className="badge">{t.product.popular}</span>}
        {!product.isPopular && product.oldPrice && <span className="badge sale">%</span>}
        <button className="add-btn" onClick={quickAdd} aria-label="add">
          +
        </button>
      </div>

      <div className="card-body">
        <div className="card-name">{pickName(product, lang)}</div>
        <div className="card-prices">
          <span className="price-new">{formatPrice(product.price)}</span>
          {product.oldPrice ? <span className="price-old">{formatPrice(product.oldPrice)}</span> : null}
          <span className="price-unit">{hasOptions ? '/ kg' : ''}</span>
        </div>
      </div>
    </div>
  );
}
