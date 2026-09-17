import { useEffect, useState } from 'react';
import { api, auth, apiBase, apiMisconfigured, onSlowRequest } from '../api';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(false);

  // Server uxlab qolgan bo'lsa, birinchi so'rov ~50 soniya davom etadi —
  // foydalanuvchi "ishlamayapti" deb o'ylamasligi uchun buni aytib turamiz.
  useEffect(() => onSlowRequest(setWaking), []);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(password);
      auth.set(res.token);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setWaking(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="logo">🍰</div>
        <h1>Shohona Tortlar</h1>
        <p>Admin panelga kirish</p>

        {apiMisconfigured && (
          <div className="alert">
            Server manzili sozlanmagan. Vercel → Settings → Environment Variables →
            <b> VITE_API_URL</b> qo'shib, qayta deploy qiling.
          </div>
        )}

        {error && <div className="alert">{error}</div>}

        <div className="field">
          <input
            type="password"
            value={password}
            autoFocus
            placeholder="Parol"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn block" type="submit" disabled={loading || !password}>
          {loading ? 'Tekshirilmoqda...' : 'Kirish'}
        </button>

        {waking && (
          <p className="login-note">
            Server uyqudan uyg'onmoqda — bu 1 daqiqagacha davom etishi mumkin. Sahifani yopmang.
          </p>
        )}

        {error && <p className="login-note">Server: {apiBase}</p>}
      </form>
    </div>
  );
}
