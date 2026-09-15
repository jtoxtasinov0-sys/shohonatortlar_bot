/**
 * Loyihaning barcha sozlamalari shu yerda.
 * Qiymatlar .env faylidan olinadi.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const toInt = (value, fallback) => {
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : fallback;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 5000),

  databaseUrl: (process.env.DATABASE_URL || '').trim(),
  botToken: (process.env.BOT_TOKEN || '').trim(),
  webAppUrl: (process.env.WEBAPP_URL || '').trim().replace(/\/+$/, ''),

  admin: {
    password: process.env.ADMIN_PASSWORD || 'admin123',
    token: process.env.ADMIN_TOKEN || 'shohona-admin-secret',
    chatId: (process.env.ADMIN_CHAT_ID || '').trim(),
  },

  shop: {
    name: process.env.SHOP_NAME || 'Shohona Tortlar',
    phone: process.env.SHOP_PHONE || '+998 90 123 45 67',
    address: process.env.SHOP_ADDRESS || "Toshkent sh., Chilonzor t., Bunyodkor ko'chasi 12",
    workTime: process.env.SHOP_WORK_TIME || '09:00 — 21:00',
    instagram: process.env.SHOP_INSTAGRAM || 'https://instagram.com/',
    deliveryFee: toInt(process.env.DELIVERY_FEE, 15000),
    freeDeliveryFrom: toInt(process.env.FREE_DELIVERY_FROM, 300000),
    minOrder: toInt(process.env.MIN_ORDER, 30000),
  },

  // Brauzerda (Telegramsiz) test qilish uchun
  dev: {
    allowDevAuth: String(process.env.ALLOW_DEV_AUTH || 'true') === 'true',
    telegramId: (process.env.DEV_TELEGRAM_ID || '999000001').trim(),
  },
};

config.isBotConfigured = /^\d{6,}:[A-Za-z0-9_-]{20,}$/.test(config.botToken);
config.isWebAppConfigured = /^https:\/\/.+/i.test(config.webAppUrl);
config.isDatabaseConfigured = /^postgres(ql)?:\/\/.+/i.test(config.databaseUrl);

module.exports = config;
