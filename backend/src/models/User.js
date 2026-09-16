/**
 * User modeli — mijozlar bilan ishlash logikasi.
 *
 * Tezlik uchun foydalanuvchi yozuvi qisqa vaqt xotirada saqlanadi:
 * bot har bir xabarda va Mini App har bir so'rovda bazaga yozib
 * o'tirmaydi. Har qanday o'zgarish keshni darrov tozalaydi.
 */
const { prisma } = require('../database/connection');

const CACHE_TTL = 5 * 60 * 1000;
const userCache = new Map(); // telegramId -> { user, expiresAt }

function cacheGet(telegramId) {
  const hit = userCache.get(String(telegramId));
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    userCache.delete(String(telegramId));
    return null;
  }
  return hit.user;
}

function cachePut(user) {
  if (!user?.telegramId) return user;
  userCache.set(String(user.telegramId), { user, expiresAt: Date.now() + CACHE_TTL });
  return user;
}

function cacheDrop(telegramId) {
  userCache.delete(String(telegramId));
}

const UserModel = {
  findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  },

  /**
   * Bor bo'lsa yangilaydi, bo'lmasa yaratadi.
   * Kesh ichida bo'lsa — bazaga umuman murojaat qilmaydi.
   */
  async upsertFromTelegram(tgUser = {}) {
    const telegramId = String(tgUser.id);

    const cached = cacheGet(telegramId);
    if (cached) return cached;

    const data = {
      firstName: tgUser.first_name || null,
      lastName: tgUser.last_name || null,
      username: tgUser.username || null,
    };

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: data,
      create: {
        telegramId,
        ...data,
        language: tgUser.language_code === 'ru' ? 'ru' : 'uz',
      },
    });

    return cachePut(user);
  },

  async update(id, data) {
    const user = await prisma.user.update({ where: { id: Number(id) }, data });
    return cachePut(user);
  },

  async setLanguage(telegramId, language) {
    cacheDrop(telegramId);
    const user = await prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { language: language === 'ru' ? 'ru' : 'uz' },
    });
    return cachePut(user);
  },

  async setPhone(telegramId, phone) {
    cacheDrop(telegramId);
    const user = await prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { phone },
    });
    return cachePut(user);
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

  /** Admin panel mijozni bloklaganda / o'zgartirganda chaqiriladi */
  dropCache: cacheDrop,
};

module.exports = UserModel;
