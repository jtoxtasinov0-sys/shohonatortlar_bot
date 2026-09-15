import { useState } from 'react';
import { getDict } from '../i18n';
import { haptic } from '../telegram';

/**
 * Birinchi ekran — til tanlash.
 */
export default function LanguageScreen({ onSelect, initial = 'uz' }) {
  const [selected, setSelected] = useState(initial === 'ru' ? 'ru' : 'uz');
  const t = getDict(selected);

  return (
    <div className="intro">
      <div className="intro-top" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="brand-mark">
          <div className="logo">🍰</div>
          <h1>Shohona Tortlar</h1>
          <p>Uyda pishirilgan tort va shirinliklar</p>
        </div>

        <div className="lang-list">
          <button
            className={`lang-btn ${selected === 'uz' ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              setSelected('uz');
            }}
          >
            <span className="flag">🇺🇿</span>
            O'zbekcha
            {selected === 'uz' && <span className="check">✓</span>}
          </button>

          <button
            className={`lang-btn ${selected === 'ru' ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              setSelected('ru');
            }}
          >
            <span className="flag">🇷🇺</span>
            Русский
            {selected === 'ru' && <span className="check">✓</span>}
          </button>
        </div>
      </div>

      <button
        className="btn"
        onClick={() => {
          haptic('success');
          onSelect(selected);
        }}
      >
        {t.lang.next}
      </button>
    </div>
  );
}
