/**
 * Product modeli — mahsulotlar bilan ishlash logikasi.
 */
const { prisma } = require('../database/connection');

const ProductModel = {
  /** Mijozlar uchun: faqat aktiv mahsulotlar */
  listActive() {
    return prisma.product.findMany({
      where: { isActive: true, category: { isActive: true } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { category: { select: { slug: true, nameUz: true, nameRu: true, emoji: true } } },
    });
  },

  /** Admin uchun: hammasi */
  listAll() {
    return prisma.product.findMany({
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      include: { category: { select: { id: true, slug: true, nameUz: true, nameRu: true, emoji: true } } },
    });
  },

  findById(id) {
    return prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });
  },

  findManyByIds(ids) {
    return prisma.product.findMany({ where: { id: { in: ids.map(Number) } } });
  },

  create(data) {
    return prisma.product.create({ data });
  },

  update(id, data) {
    return prisma.product.update({ where: { id: Number(id) }, data });
  },

  remove(id) {
    return prisma.product.delete({ where: { id: Number(id) } });
  },

  count() {
    return prisma.product.count();
  },
};

module.exports = ProductModel;
