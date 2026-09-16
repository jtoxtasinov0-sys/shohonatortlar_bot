/**
 * Image modeli — rasmlar bazada saqlanadi.
 *
 * Nima uchun bazada? Render'ning bepul tarifida fayl tizimi vaqtinchalik:
 * har bir deploy'dan keyin yuklangan rasmlar yo'qoladi. Neon bazasi esa
 * doimiy — shuning uchun rasm baytlari shu yerda yotadi.
 *
 * id — fayl mazmunidan olingan sha256 xesh (24 belgi). Bir xil rasm
 * ikki marta yuklansa, yangi yozuv yaratilmaydi va manzili ham o'zgarmaydi.
 */
const crypto = require('crypto');
const { prisma } = require('../database/connection');

/** Rasm baytlaridan barqaror id yasaydi */
function hashId(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);
}

const ImageModel = {
  hashId,

  /** Mahsulotga/storyga yoziladigan manzil */
  urlFor(id) {
    return `/api/images/${id}.jpg`;
  },

  findById(id) {
    return prisma.image.findUnique({ where: { id: String(id) } });
  },

  /** Rasmni saqlaydi (bir xili bo'lsa — mavjudini qaytaradi) */
  async save(buffer, { mimeType = 'image/jpeg', width = 0, height = 0 } = {}) {
    const id = hashId(buffer);
    const existing = await prisma.image.findUnique({ where: { id }, select: { id: true } });
    if (existing) return { id, created: false };

    await prisma.image.create({
      data: { id, mimeType, width, height, size: buffer.length, data: buffer },
    });
    return { id, created: true };
  },

  count() {
    return prisma.image.count();
  },

  /**
   * Ishlatilmayotgan rasmlarni o'chiradi.
   *
   * Admin panelda rasm tanlangan, lekin mahsulot saqlanmagan bo'lsa yoki
   * rasm boshqasiga almashtirilgan bo'lsa — eskisi bazada qolib ketadi.
   * Shunday "yetim" rasmlar bir kundan keyin tozalanadi.
   */
  async cleanupOrphans(olderThanHours = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    return prisma.$executeRaw`
      DELETE FROM images i
      WHERE i."createdAt" < ${cutoff}
        AND NOT EXISTS (SELECT 1 FROM products p WHERE p."imageUrl" LIKE '%' || i.id || '%')
        AND NOT EXISTS (SELECT 1 FROM stories s WHERE s."imageUrl" LIKE '%' || i.id || '%')
    `;
  },
};

module.exports = ImageModel;
