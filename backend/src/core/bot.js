/**
 * Telegram bot instansiyasi (Telegraf).
 * Handlerlar src/routes/bot.routes.js faylida ro'yxatdan o'tadi.
 */
const { Telegraf } = require('telegraf');
const config = require('../config/default');

// Token bo'lmasa ham server ishga tushishi kerak — shuning uchun "bo'sh" bot yaratamiz
const bot = config.isBotConfigured ? new Telegraf(config.botToken) : null;

/** Foydalanuvchiga xabar yuborish (bot sozlanmagan bo'lsa jim o'tadi) */
async function sendMessage(chatId, text, extra = {}) {
  if (!bot || !chatId) return false;
  try {
    await bot.telegram.sendMessage(String(chatId), text, { parse_mode: 'HTML', ...extra });
    return true;
  } catch (err) {
    console.error('⚠️  Telegram xabar yuborilmadi:', err.message);
    return false;
  }
}

module.exports = { bot, sendMessage };
