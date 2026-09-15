import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import Thumb from '../components/Thumb';
import { DEFAULT_CAKE_OPTIONS, formatPrice } from '../utils';

const EMPTY = {
  nameUz: '',
  nameRu: '',
  categoryId: '',
  descriptionUz: '',
  descriptionRu: '',
  ingredientsUz: '',
  ingredientsRu: '',
  imageUrl: '',
  price: '',
  oldPrice: '',
  unit: 'dona',
  hasWeights: false,
  allowText: false,
  isPopular: false,
  isUpsell: false,
  isActive: true,
  sortOrder: 0,
};

export default function Products({ onToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api.products(), api.categories()]);
      setProducts(p.products);
      setCategories(c.categories);
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setError('');
    setForm({ ...EMPTY, categoryId: categories[0]?.id || '' });
    setEditing('new');
  };

  const openEdit = (product) => {
    setError('');
    setForm({
      nameUz: product.nameUz,
      nameRu: product.nameRu,
      categoryId: product.categoryId,
      descriptionUz: product.descriptionUz || '',
      descriptionRu: product.descriptionRu || '',
      ingredientsUz: (product.ingredientsUz || []).join('\n'),
      ingredientsRu: (product.ingredientsRu || []).join('\n'),
      imageUrl: product.imageUrl || '',
      price: product.price,
      oldPrice: product.oldPrice || '',
      unit: product.unit || 'dona',
      hasWeights: Array.isArray(product.weightOptions) && product.weightOptions.length > 0,
      allowText: !!product.allowText,
      isPopular: !!product.isPopular,
      isUpsell: !!product.isUpsell,
      isActive: !!product.isActive,
      sortOrder: product.sortOrder || 0,
    });
    setEditing(product);
  };

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.nameUz.trim() || !form.nameRu.trim()) return setError('Nomi (UZ va RU) kiritilishi shart');
    if (!form.categoryId) return setError('Kategoriyani tanlang');
    if (!Number(form.price)) return setError("Narxni to'g'ri kiriting");

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        categoryId: Number(form.categoryId),
        sortOrder: Number(form.sortOrder) || 0,
        weightOptions: form.hasWeights ? DEFAULT_CAKE_OPTIONS : null,
      };

      if (editing === 'new') {
        await api.createProduct(payload);
        onToast("Mahsulot qo'shildi");
      } else {
        await api.updateProduct(editing.id, payload);
        onToast('Mahsulot yangilandi');
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`"${product.nameUz}" o'chirilsinmi?`)) return;
    try {
      await api.deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      onToast("Mahsulot o'chirildi");
    } catch (err) {
      onToast(err.message);
    }
  };

  const toggleActive = async (product) => {
    try {
      await api.updateProduct(product.id, {
        ...product,
        ingredientsUz: product.ingredientsUz,
        ingredientsRu: product.ingredientsRu,
        isActive: !product.isActive,
      });
      load();
    } catch (err) {
      onToast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mahsulotlar</h1>
          <p>Jami: {products.length} ta</p>
        </div>
        <button className="btn" onClick={openNew}>
          + Yangi mahsulot
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : !products.length ? (
          <div className="empty-state">
            <div className="ic">🍰</div>
            <h3>Mahsulotlar yo'q</h3>
            <p>Birinchi mahsulotni qo'shing</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rasm</th>
                  <th>Nomi</th>
                  <th>Kategoriya</th>
                  <th>Narxi</th>
                  <th>Belgilar</th>
                  <th>Holat</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Thumb src={product.imageUrl} />
                    </td>
                    <td>
                      <div className="cell-main">{product.nameUz}</div>
                      <div className="cell-sub">{product.nameRu}</div>
                    </td>
                    <td>
                      {product.category?.emoji} {product.category?.nameUz}
                    </td>
                    <td className="price">
                      {formatPrice(product.price)}
                      {product.oldPrice ? <span className="old">{formatPrice(product.oldPrice)}</span> : null}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {product.isPopular && <span className="pill confirmed">Mashhur</span>}
                        {product.isUpsell && <span className="pill delivering">Taklif</span>}
                        {product.allowText && <span className="pill new">Yozuv</span>}
                        {Array.isArray(product.weightOptions) && product.weightOptions.length > 0 && (
                          <span className="pill off">kg</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className={`pill ${product.isActive ? 'on' : 'off'}`}
                        onClick={() => toggleActive(product)}
                      >
                        {product.isActive ? 'Faol' : "O'chiq"}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(product)}>
                          ✏️
                        </button>
                        <button className="icon-btn danger" onClick={() => remove(product)}>
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
          title={editing === 'new' ? 'Yangi mahsulot' : 'Mahsulotni tahrirlash'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Bekor qilish
              </button>
              <button className="btn" onClick={save} disabled={saving}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
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
              <label>Kategoriya *</label>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.nameUz}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Birlik</label>
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                <option value="dona">dona</option>
                <option value="kg">kg</option>
                <option value="to'plam">to'plam</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Narxi (so'm) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Eski narxi (chegirma uchun)</label>
              <input
                type="number"
                value={form.oldPrice}
                onChange={(e) => set('oldPrice', e.target.value)}
              />
              <div className="hint">Bo'sh qoldirsangiz chegirma ko'rsatilmaydi</div>
            </div>
          </div>

          <div className="field">
            <label>Rasm havolasi (URL)</label>
            <input
              value={form.imageUrl}
              placeholder="https://..."
              onChange={(e) => set('imageUrl', e.target.value)}
            />
            <div className="hint">Rasmni internetga yuklab, havolasini shu yerga qo'ying</div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Tavsif (UZ)</label>
              <textarea
                value={form.descriptionUz}
                onChange={(e) => set('descriptionUz', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Tavsif (RU)</label>
              <textarea
                value={form.descriptionRu}
                onChange={(e) => set('descriptionRu', e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Tarkibi (UZ)</label>
              <textarea
                value={form.ingredientsUz}
                placeholder={'Asal\nSmetanali krem\nSariyog‘'}
                onChange={(e) => set('ingredientsUz', e.target.value)}
              />
              <div className="hint">Har bir qatorga bittadan</div>
            </div>
            <div className="field">
              <label>Tarkibi (RU)</label>
              <textarea
                value={form.ingredientsRu}
                placeholder={'Мёд\nСметанный крем\nМасло'}
                onChange={(e) => set('ingredientsRu', e.target.value)}
              />
              <div className="hint">Har bir qatorga bittadan</div>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.hasWeights}
                  onChange={(e) => set('hasWeights', e.target.checked)}
                />
                Vazn variantlari (1 / 1.5 / 2 / 3 kg)
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.allowText}
                  onChange={(e) => set('allowText', e.target.checked)}
                />
                Tort ustiga yozuv yozish mumkin
              </label>
            </div>
            <div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => set('isPopular', e.target.checked)}
                />
                Mashhur (bosh sahifada)
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.isUpsell}
                  onChange={(e) => set('isUpsell', e.target.checked)}
                />
                Savatchada qo'shimcha taklif
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                />
                Faol (mijozlarga ko'rinadi)
              </label>
            </div>
          </div>

          <div className="field">
            <label>Tartib raqami</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
            />
            <div className="hint">Kichik raqam yuqorida turadi</div>
          </div>
        </Modal>
      )}
    </>
  );
}
