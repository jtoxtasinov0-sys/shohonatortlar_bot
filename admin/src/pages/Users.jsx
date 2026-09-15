import { useEffect, useState } from 'react';
import { api } from '../api';
import { formatDateTime } from '../utils';

export default function Users({ onToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .users()
      .then((res) => setUsers(res.users))
      .catch((err) => onToast(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mijozlar</h1>
          <p>Jami: {users.length} ta</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : !users.length ? (
          <div className="empty-state">
            <div className="ic">👥</div>
            <h3>Mijozlar yo'q</h3>
            <p>Botga /start yozgan foydalanuvchilar shu yerda ko'rinadi</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ism</th>
                  <th>Username</th>
                  <th>Telefon</th>
                  <th>Til</th>
                  <th>Buyurtmalar</th>
                  <th>Ro'yxatdan o'tgan</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="cell-main">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td>{user.username ? `@${user.username}` : '—'}</td>
                    <td>{user.phone || '—'}</td>
                    <td>{user.language === 'ru' ? '🇷🇺 RU' : '🇺🇿 UZ'}</td>
                    <td>{user._count?.orders ?? 0} ta</td>
                    <td className="cell-sub">{formatDateTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
