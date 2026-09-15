/**
 * Order modeli — buyurtmalar bilan ishlash logikasi.
 */
const { prisma } = require('../database/connection');

const OrderModel = {
  create(data) {
    return prisma.order.create({ data, include: { user: true } });
  },

  findById(id) {
    return prisma.order.findUnique({ where: { id: Number(id) }, include: { user: true } });
  },

  /** Bitta mijozning buyurtmalari */
  listByUser(userId, take = 30) {
    return prisma.order.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
      take,
    });
  },

  /** Admin panel uchun: filtr + qidiruv */
  listAll({ status, search, take = 200 } = {}) {
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: { user: true },
    });
  },

  updateStatus(id, status) {
    return prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: { user: true },
    });
  },

  remove(id) {
    return prisma.order.delete({ where: { id: Number(id) } });
  },

  /** Admin dashboard statistikasi */
  async stats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, newCount, todayCount, revenueAll, revenueToday] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'new' } }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'canceled' } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'canceled' }, createdAt: { gte: startOfToday } },
      }),
    ]);

    return {
      totalOrders: total,
      newOrders: newCount,
      todayOrders: todayCount,
      totalRevenue: revenueAll._sum.total || 0,
      todayRevenue: revenueToday._sum.total || 0,
    };
  },
};

module.exports = OrderModel;
