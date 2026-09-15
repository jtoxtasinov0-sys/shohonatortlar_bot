import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { haptic, setBackButton } from '../telegram';
import { formatPrice, pickDesc, pickList, pickName } from '../utils';
import SafeImage from './SafeImage';

/**
 * Pastdan qalqib chiquvchi mahsulot oynasi.
 */
export default function ProductSheet({ product, onClose }) {
  const { lang, t, addToCart, unitPriceOf } = useApp();

  const options = Array.isArray(product.weightOptions) ? product.weightOptions : [];
  const [option, setOption] = useState(options[0]?.label || null);
  const [qty, setQty] = useState(1);
  const [inscription, setInscription] = useState('');

  useEffect(() => setBackButton(true, onClose), [onClose]);

  const unitPrice = unitPriceOf(product, option);
  const total = unitPrice * qty;
  const ingredients = pickList(product, lang);

  const submit = () => {
    addToCart(product, { option, inscription: inscription.trim() || null, qty });
    onClose();
  };

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />

        <div className="sheet-scroll">
          <div className="sheet-hero">
            <SafeImage src={product.imageUrl} alt={pickName(product, lang)} emoji="🍰" />
          </div>

          <h2>{pickName(product, lang)}</h2>
          <p className="desc">{pickDesc(product, lang)}</p>

          {ingredients.length > 0 && (
            <>
              <div className="label">{t.product.ingredients}</div>
              <ul className="ing-list">
                {ingredients.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {options.length > 0 && (
            <>
              <div className="label">{t.product.size}</div>
              <div className="options">
                {options.map((item) => (
                  <button
                    key={item.label}
                    className={`option ${option === item.label ? 'active' : ''}`}
                    onClick={() => {
                      haptic('light');
                      setOption(item.label);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {product.allowText && (
            <>
              <div className="label">{t.product.inscription}</div>
              <div className="field" style={{ marginBottom: 0 }}>
                <input
                  value={inscription}
                  maxLength={60}
                  placeholder={t.product.inscriptionPh}
                  onChange={(e) => setInscription(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="label">{t.product.qty}</div>
          <div className="stepper">
            <button disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(30, q + 1))}>+</button>
          </div>
        </div>

        <div className="sheet-cta">
          <button className="btn" onClick={submit}>
            {t.product.add} · {formatPrice(total)} {t.currency}
          </button>
        </div>
      </div>
    </>
  );
}
