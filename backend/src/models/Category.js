/**
 * Category modeli — kategoriyalar bilan ishlash logikasi.
 */
const { prisma } = require('../database/connection');

const CategoryModel = {
  listActive() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  },

  listAll() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  },

  findById(id) {
    return prisma.category.findUnique({ where: { id: Number(id) } });
  },

  create(data) {
    return prisma.category.create({ data });
  },

  update(id, data) {
    return prisma.category.update({ where: { id: Number(id) }, data });
  },

  remove(id) {
    return prisma.category.delete({ where: { id: Number(id) } });
  },
};

module.exports = CategoryModel;
