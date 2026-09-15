import { useState } from 'react';
import { api, auth } from '../api';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="logo">🍰</div>
        <h1>Shohona Tortlar</h1>
        <p>Admin panelga kirish</p>

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
      </form>
    </div>
  );
}
