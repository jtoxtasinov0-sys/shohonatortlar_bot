/**
 * User modeli — mijozlar bilan ishlash logikasi.
 */
const { prisma } = require('../database/connection');

const UserModel = {
  findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  },

  /** Bor bo'lsa yangilaydi, bo'lmasa yaratadi */
  async upsertFromTelegram(tgUser = {}) {
    const telegramId = String(tgUser.id);
    const data = {
      firstName: tgUser.first_name || null,
      lastName: tgUser.last_name || null,
      username: tgUser.username || null,
    };

    return prisma.user.upsert({
      where: { telegramId },
      update: data,
      create: {
        telegramId,
        ...data,
        language: tgUser.language_code === 'ru' ? 'ru' : 'uz',
      },
    });
  },

  update(id, data) {
    return prisma.user.update({ where: { id: Number(id) }, data });
  },

  setLanguage(telegramId, language) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { language: language === 'ru' ? 'ru' : 'uz' },
    });
  },

  setPhone(telegramId, phone) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { phone },
    });
  },

  count() {
    return prisma.user.count();
  },

  list({ take = 100, skip = 0 } = {}) {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { _count: { select: { orders: true } } },
    });
  },
};

module.exports = UserModel;
