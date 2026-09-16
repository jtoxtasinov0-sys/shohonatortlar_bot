import { useEffect, useRef, useState } from 'react';
import { api, mediaUrl } from '../api';

/**
 * Mahsulot / story rasmini tanlash maydoni.
 *
 * Rasm telefon galereyasidan, kameradan yoki kompyuterdan olinadi —
 * internetga oldindan yuklash shart emas. Tanlangan rasm brauzerning
 * o'zida tayyorlanadi:
 *   • EXIF bo'yicha to'g'ri buriladi
 *   • kvadrat (1:1) kadrga kesiladi — katalogdagi barcha rasmlar bir xil
 *   • yorug'lik, kontrast va ranglar biroz kuchaytiriladi
 *   • 1200×1200 o'lchamli, siqilgan JPEG'ga aylantiriladi
 * Shundan keyingina serverga yuboriladi.
 */

const SIZE = 1200;
const ENHANCE = 'brightness(1.04) contrast(1.06) saturate(1.12)';

/** Faylni rasmga aylantiradi (telefon suratlari EXIF bo'yicha buriladi) */
async function decodeFile(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (_) {
      try {
        return await createImageBitmap(file);
      } catch (_) {}
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Rasmni o'qib bo'lmadi"));
    };
    img.src = url;
  });
}

/** Rasmni kvadrat kadrga joylab chizadi. offset — kadrning joyi (0...1) */
function drawSquare(canvas, img, size, offset) {
  const ctx = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;

  const side = Math.min(img.width, img.height);
  const sx = img.width > img.height ? (img.width - side) * offset : 0;
  const sy = img.height > img.width ? (img.height - side) * offset : 0;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  try {
    ctx.filter = ENHANCE; // eski brauzerlarda e'tiborsiz qoladi
  } catch (_) {}
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  ctx.filter = 'none';
}

export default function ImageField({ value, onChange, label = 'Rasm', hint }) {
  const [source, setSource] = useState(null); // tanlangan fayl (kadrni sozlash uchun)
  const [offset, setOffset] = useState(0.5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linkMode, setLinkMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef(null);
  const previewRef = useRef(null);
  const workRef = useRef(null);
  const uploadTimer = useRef(null);

  // Kadr o'zgarganda ko'rinishni qayta chizamiz
  useEffect(() => {
    if (source && previewRef.current) drawSquare(previewRef.current, source, 400, offset);
  }, [source, offset]);

  useEffect(() => () => clearTimeout(uploadTimer.current), []);

  /** Tayyorlangan rasmni serverga yuboradi */
  const upload = async (img, position) => {
    setBusy(true);
    setError('');
    try {
      const canvas = workRef.current || document.createElement('canvas');
      workRef.current = canvas;
      drawSquare(canvas, img, SIZE, position);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
      const res = await api.upload({ dataUrl, width: SIZE, height: SIZE });
      onChange(res.url);
    } catch (err) {
      setError(err.message || "Rasmni yuklab bo'lmadi");
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!/^image\//i.test(file.type)) return setError('Faqat rasm fayli tanlanadi');
    if (file.size > 25 * 1024 * 1024) return setError("Fayl juda katta (25 MB gacha bo'lsin)");

    setError('');
    setBusy(true);
    try {
      const img = await decodeFile(file);
      setSource(img);
      setOffset(0.5);
      await upload(img, 0.5);
    } catch (err) {
      setError(err.message || "Rasmni o'qib bo'lmadi");
      setBusy(false);
    }
  };

  /** Kadr siljitilganda — biroz kutib, qayta yuklaymiz */
  const handleOffset = (next) => {
    setOffset(next);
    clearTimeout(uploadTimer.current);
    uploadTimer.current = setTimeout(() => source && upload(source, next), 500);
  };

  const clear = () => {
    clearTimeout(uploadTimer.current);
    setSource(null);
    setOffset(0.5);
    setError('');
    onChange('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer?.files?.[0]);
  };

  const isPortraitOrWide = source && source.width !== source.height;

  return (
    <div className="field">
      <label>{label}</label>

      <div
        className={`image-field ${dragOver ? 'drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="image-preview">
          {source ? (
            <canvas ref={previewRef} />
          ) : value ? (
            <img src={mediaUrl(value)} alt="" />
          ) : (
            <div className="image-empty">🍰</div>
          )}
          {busy && <div className="image-busy"><div className="spinner sm" /></div>}
        </div>

        <div className="image-actions">
          <button
            type="button"
            className="btn sm"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            📷 Galereyadan tanlash
          </button>

          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setLinkMode((v) => !v)}
            disabled={busy}
          >
            🔗 Havola
          </button>

          {(value || source) && (
            <button type="button" className="btn ghost sm danger" onClick={clear} disabled={busy}>
              🗑 O'chirish
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {isPortraitOrWide && (
        <div className="image-offset">
          <span>Kadr:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(offset * 100)}
            onChange={(e) => handleOffset(Number(e.target.value) / 100)}
            disabled={busy}
          />
          <span className="hint">{source.width > source.height ? "chap ↔ o'ng" : 'tepa ↕ past'}</span>
        </div>
      )}

      {linkMode && (
        <input
          className="image-link"
          value={/^https?:/i.test(value || '') ? value : ''}
          placeholder="https://... (internetdagi rasm havolasi)"
          onChange={(e) => {
            setSource(null);
            onChange(e.target.value.trim());
          }}
        />
      )}

      {error && <div className="hint error">{error}</div>}
      {!error && (
        <div className="hint">
          {hint || "Telefon galereyasidan yoki kameradan tanlang — rasm avtomatik kvadrat kadrga kesiladi va sifati yaxshilanadi."}
        </div>
      )}
    </div>
  );
}
