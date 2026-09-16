/**
 * Rasmlarni berish: GET /api/images/<id>.jpg
 *
 * Ochiq yo'l — Mini App va admin panel rasmni shu manzildan oladi.
 * Rasm mazmuni hech qachon o'zgarmaydi (id — mazmun xeshi), shuning
 * uchun brauzerga "abadiy saqla" deb aytamiz va bir marta yuklangach
 * qayta so'ralmaydi.
 */
const express = require('express');
const ImageModel = require('../models/Image');

const router = express.Router();

// Eng ko'p so'raladigan rasmlar xotirada ham turadi — bazaga
// har safar borilmaydi (Neon "uyqu"dan uyg'onishi sekin bo'lishi mumkin).
const MEMORY_LIMIT = 40;
const memory = new Map();

function remember(id, payload) {
  memory.set(id, payload);
  if (memory.size > MEMORY_LIMIT) {
    // Eng eski yozuvni chiqarib tashlaymiz
    memory.delete(memory.keys().next().value);
  }
}

router.get('/:file', async (req, res, next) => {
  try {
    const id = String(req.params.file).replace(/\.[a-z0-9]+$/i, '');
    if (!/^[a-f0-9]{8,64}$/i.test(id)) {
      return res.status(404).json({ ok: false, error: 'Rasm topilmadi' });
    }

    let image = memory.get(id);
    if (!image) {
      const row = await ImageModel.findById(id);
      if (!row) return res.status(404).json({ ok: false, error: 'Rasm topilmadi' });
      image = { mimeType: row.mimeType, data: Buffer.from(row.data) };
      remember(id, image);
    }

    const etag = `"${id}"`;
    res.set({
      'Content-Type': image.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: etag,
      'Access-Control-Allow-Origin': '*',
    });

    if (req.headers['if-none-match'] === etag) return res.status(304).end();
    res.send(image.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
