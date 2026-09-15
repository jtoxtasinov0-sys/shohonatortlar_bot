import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';

const EMPTY = { nameUz: '', nameRu: '', emoji: '🍰', sortOrder: 0, isActive: true };

export default function Categories({ onToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.categories();
      setCategories(res.categories);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.nameUz.trim() || !form.nameRu.trim()) return setError('Nomi (UZ va RU) kiritilishi shart');
    try {
      if (editing === 'new') {
        await api.createCategory(form);
        onToast("Kategoriya qo'shildi");
      } else {
        await api.updateCategory(editing.id, { ...form, slug: editing.slug });
        onToast('Kategoriya yangilandi');
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (category) => {
    if (!window.confirm(`"${category.nameUz}" o'chirilsinmi? Ichidagi mahsulotlar ham o'chadi!`)) return;
    try {
      await api.deleteCategory(category.id);
      load();
      onToast("Kategoriya o'chirildi");
    } catch (err) {
      onToast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kategoriyalar</h1>
          <p>Jami: {categories.length} ta</p>
        </div>
        <button
          className="btn"
          onClick={() => {
            setError('');
            setForm(EMPTY);
            setEditing('new');
          }}
        >
          + Yangi kategoriya
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Emoji</th>
                  <th>Nomi (UZ)</th>
                  <th>Nomi (RU)</th>
                  <th>Mahsulotlar</th>
                  <th>Tartib</th>
                  <th>Holat</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td style={{ fontSize: 22 }}>{category.emoji}</td>
                    <td className="cell-main">{category.nameUz}</td>
                    <td>{category.nameRu}</td>
                    <td>{category._count?.products ?? 0} ta</td>
                    <td>{category.sortOrder}</td>
                    <td>
                      <span className={`pill ${category.isActive ? 'on' : 'off'}`}>
                        {category.isActive ? 'Faol' : "O'chiq"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => {
                            setError('');
                            setForm({
                              nameUz: category.nameUz,
                              nameRu: category.nameRu,
                              emoji: category.emoji,
                              sortOrder: category.sortOrder,
                              isActive: category.isActive,
                            });
                            setEditing(category);
                          }}
                        >
                          ✏️
                        </button>
                        <button className="icon-btn danger" onClick={() => remove(category)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Bekor qilish
              </button>
              <button className="btn" onClick={save}>
                Saqlash
              </button>
            </>
          }
        >
          {error && <div className="alert">{error}</div>}

          <div className="grid-2">
            <div className="field">
              <label>Nomi (UZ) *</label>
              <input value={form.nameUz} onChange={(e) => set('nameUz', e.target.value)} />
            </div>
            <div className="field">
              <label>Nomi (RU) *</label>
              <input value={form.nameRu} onChange={(e) => set('nameRu', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Emoji</label>
              <input value={form.emoji} maxLength={4} onChange={(e) => set('emoji', e.target.value)} />
            </div>
            <div className="field">
              <label>Tartib raqami</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', Number(e.target.value))}
              />
            </div>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            Faol (mijozlarga ko'rinadi)
          </label>
        </Modal>
      )}
    </>
  );
}
