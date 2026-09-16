import { useEffect, useState } from 'react';

/**
 * Yuklanish paytida ko'rsatiladigan "skelet" ekran.
 * Bo'sh spinnerdan ko'ra tezroq ochilgandek tuyuladi, chunki
 * foydalanuvchi sahifa tuzilishini darrov ko'radi.
 *
 * Agar 4 soniyadan ko'p kutilsa — server uyqudan uyg'onayotgani
 * haqida ogohlantiramiz (Render bepul tarifi ~50 soniya uyg'onadi).
 */
export default function Skeleton({ t }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="screen sk-screen">
      <div className="sk-header">
        <div className="sk sk-avatar" />
        <div className="sk-lines">
          <div className="sk sk-line w60" />
          <div className="sk sk-line w40" />
        </div>
      </div>

      <div className="sk-stories">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sk sk-circle" />
        ))}
      </div>

      <div className="sk sk-hero" />

      <div className="sk-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sk-card">
            <div className="sk sk-thumb" />
            <div className="sk sk-line w80" />
            <div className="sk sk-line w50" />
          </div>
        ))}
      </div>

      {slow && <p className="sk-note">⏳ {t.wakingUp}</p>}
    </div>
  );
}
