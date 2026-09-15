import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import Thumb from '../components/Thumb';

const EMPTY = { titleUz: '', titleRu: '', textUz: '', textRu: '', imageUrl: '', sortOrder: 0, isActive: true };

export default function Stories({ onToast }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.stories();
      setStories(res.stories);
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
    if (!form.titleUz.trim() || !form.titleRu.trim()) return setError('Sarlavha (UZ va RU) shart');
    try {
      if (editing === 'new') {
        await api.createStory(form);
        onToast("Story qo'shildi");
      } else {
        await api.updateStory(editing.id, form);
        onToast('Story yangilandi');
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (story) => {
    if (!window.confirm(`"${story.titleUz}" o'chirilsinmi?`)) return;
    try {
      await api.deleteStory(story.id);
      load();
      onToast("Story o'chirildi");
    } catch (err) {
      onToast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Storylar</h1>
          <p>Mini App bosh sahifasidagi doiralar</p>
        </div>
        <button
          className="btn"
          onClick={() => {
            setError('');
            setForm(EMPTY);
            setEditing('new');
          }}
        >
          + Yangi story
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : !stories.length ? (
          <div className="empty-state">
            <div className="ic">✨</div>
            <h3>Story yo'q</h3>
            <p>Aksiya yoki yangilik haqida story qo'shing</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rasm</th>
                  <th>Sarlavha</th>
                  <th>Matn (UZ)</th>
                  <th>Tartib</th>
                  <th>Holat</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {stories.map((story) => (
                  <tr key={story.id}>
                    <td>
                      <Thumb src={story.imageUrl} emoji="✨" />
                    </td>
                    <td>
                      <div className="cell-main">{story.titleUz}</div>
                      <div className="cell-sub">{story.titleRu}</div>
                    </td>
                    <td className="items-list">{story.textUz}</td>
                    <td>{story.sortOrder}</td>
                    <td>
                      <span className={`pill ${story.isActive ? 'on' : 'off'}`}>
                        {story.isActive ? 'Faol' : "O'chiq"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => {
                            setError('');
                            setForm({
                              titleUz: story.titleUz,
                              titleRu: story.titleRu,
                              textUz: story.textUz || '',
                              textRu: story.textRu || '',
                              imageUrl: story.imageUrl || '',
                              sortOrder: story.sortOrder,
                              isActive: story.isActive,
                            });
                            setEditing(story);
                          }}
                        >
                          ✏️
                        </button>
                        <button className="icon-btn danger" onClick={() => remove(story)}>
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
          title={editing === 'new' ? 'Yangi story' : 'Storyni tahrirlash'}
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
              <label>Sarlavha (UZ) *</label>
              <input value={form.titleUz} onChange={(e) => set('titleUz', e.target.value)} />
            </div>
            <div className="field">
              <label>Sarlavha (RU) *</label>
              <input value={form.titleRu} onChange={(e) => set('titleRu', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Rasm havolasi (URL)</label>
            <input
              value={form.imageUrl}
              placeholder="https://..."
              onChange={(e) => set('imageUrl', e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Matn (UZ)</label>
              <textarea value={form.textUz} onChange={(e) => set('textUz', e.target.value)} />
            </div>
            <div className="field">
              <label>Matn (RU)</label>
              <textarea value={form.textRu} onChange={(e) => set('textRu', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Tartib raqami</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', Number(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                />
                Faol
              </label>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
