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

const clean = (value) => (value || '').trim().replace(/\/+$/, '');

// Servisning o'z ommaviy manzili. Render buni avtomatik beradi,
// boshqa joyda SELF_URL orqali qo'lda yoziladi.
const publicUrl = clean(process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL);

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 5000),

  publicUrl,

  databaseUrl: (process.env.DATABASE_URL || '').trim(),
  botToken: (process.env.BOT_TOKEN || '').trim(),
  webAppUrl: clean(process.env.WEBAPP_URL),

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

  // Render bepul tarifi 15 daqiqa harakatsizlikdan keyin servisni uxlatadi.
  // Uyg'onish ~50 soniya — bot ham, Mini App ham shuncha vaqt javob bermaydi.
  // Shuning uchun server o'zini-o'zi muntazam "turtib" turadi.
  keepAlive: {
    url: publicUrl,
    // Necha daqiqada bir. Render 15 daqiqada uxlatadi — 10 daqiqa xavfsiz.
    minutes: toInt(process.env.KEEP_ALIVE_MINUTES, 10),
    enabled: String(process.env.KEEP_ALIVE || 'true') === 'true',
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

/**
 * Bot qaysi rejimda ishlaydi?
 *
 *  polling  — bot Telegramdan xabarlarni o'zi so'rab turadi.
 *             Jarayon doimiy yoqiq turishi shart. Mahalliy ishlash uchun yagona variant.
 *
 *  webhook  — Telegram xabarni serverga o'zi yuboradi.
 *             Uxlab qolgan Render servisini AYNAN SHU so'rov uyg'otadi,
 *             shuning uchun ommaviy manzil ma'lum bo'lsa — shu rejim afzal.
 *
 * BOT_MODE=polling yozib majburan eski rejimga qaytarish mumkin.
 */
const requestedMode = (process.env.BOT_MODE || '').trim().toLowerCase();
config.botMode =
  requestedMode === 'webhook' || requestedMode === 'polling'
    ? requestedMode
    : /^https:\/\/.+/i.test(publicUrl)
    ? 'webhook'
    : 'polling';

module.exports = config;
