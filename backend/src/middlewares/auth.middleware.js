/**
 * Validatsiya:
 *  - telegramAuth : Mini App'dan kelgan initData'ni HMAC-SHA256 orqali tekshiradi
 *  - adminAuth    : Admin Panel so'rovlarini token orqali tekshiradi
 */
const crypto = require('crypto');
const config = require('../config/default');
const UserModel = require('../models/User');

/**
 * Telegram WebApp initData imzosini tekshirish.
 * Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifyInitData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    const sign = (entries) =>
      crypto
        .createHmac('sha256', secretKey)
        .update(
          entries
            .map(([key, value]) => `${key}=${value}`)
            .sort()
            .join('\n')
        )
        .digest('hex');

    const entries = [...params.entries()];
    // Telegram versiyalariga qarab "signature" maydoni hisobga olinishi
    // yoki olinmasligi mumkin — ikkala variantni ham tekshiramiz.
    const variants = [entries, entries.filter(([key]) => key !== 'signature')];

    if (!variants.some((variant) => sign(variant) === hash)) return null;

    const userRaw = params.get('user');
    return userRaw ? JSON.parse(userRaw) : null;
  } catch (err) {
    console.error('initData tekshirishda xato:', err.message);
    return null;
  }
}

/** Mini App so'rovlari uchun middleware */
async function telegramAuth(req, res, next) {
  try {
    const initData =
      req.headers['x-telegram-init-data'] || req.body?.initData || req.query?.initData || '';

    let tgUser = null;

    if (initData && config.isBotConfigured) {
      tgUser = verifyInitData(String(initData), config.botToken);
      // initData bor, lekin imzo mos kelmadi — soxta so'rov
      if (!tgUser) {
        return res
          .status(401)
          .json({ ok: false, error: "Telegram ma'lumotlari tasdiqlanmadi" });
      }
    }

    // Brauzerda test qilish rejimi (ALLOW_DEV_AUTH=true)
    if (!tgUser && config.dev.allowDevAuth) {
      tgUser = {
        id: Number(config.dev.telegramId),
        first_name: 'Test',
        last_name: 'Mijoz',
        username: 'test_user',
        language_code: 'uz',
      };
    }

    if (!tgUser) {
      return res.status(401).json({ ok: false, error: 'Telegram autentifikatsiyasi amalga oshmadi' });
    }

    const user = await UserModel.upsertFromTelegram(tgUser);

    if (user.isBlocked) {
      return res.status(403).json({ ok: false, error: 'Foydalanuvchi bloklangan' });
    }

    req.user = user;
    req.tgUser = tgUser;
    next();
  } catch (err) {
    next(err);
  }
}

/** Admin Panel so'rovlari uchun middleware */
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query?.token;
  if (!token || token !== config.admin.token) {
    return res.status(401).json({ ok: false, error: "Ruxsat yo'q. Qaytadan kiring." });
  }
  next();
}

module.exports = { telegramAuth, adminAuth, verifyInitData };
