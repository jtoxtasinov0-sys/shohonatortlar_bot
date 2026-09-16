/**
 * Shohona Tortlar — asosiy ishga tushirish fayli.
 * Express API + Telegram bot bitta jarayonda ishlaydi.
 */
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const crypto = require('crypto');

const config = require('./config/default');
const { prisma, connectDatabase, disconnectDatabase } = require('./database/connection');
const { bot } = require('./core/bot');
const registerBotHandlers = require('./routes/bot.routes');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Javoblarni gzip qiladi — katalog JSON'i ~4 barobar kichrayadi,
// sekin mobil internetda Mini App sezilarli tez ochiladi.
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Oddiy log
app.use((req, res, next) => {
  if (req.path !== '/api/health') {
    console.log(`→ ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.get('/', (req, res) => {
  res.send(`<h2>🍰 ${config.shop.name} API</h2><p>Server ishlayapti.</p>`);
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    bot: config.isBotConfigured,
    webApp: config.isWebAppConfigured ? config.webAppUrl : null,
    time: new Date().toISOString(),
  });
});

// Telegram webhook uchun joy band qilinadi: haqiqiy ishlov beruvchi
// bot ishga tushganda qo'shiladi. Router oldindan o'rnatilmasa,
// u 404 handler'dan keyin qolib ketadi va xabarlar yetib kelmaydi.
const telegramWebhook = express.Router();
app.use(telegramWebhook);

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Bunday manzil topilmadi' });
});

// Xatoliklar
app.use((err, req, res, next) => {
  console.error('❌ Server xatosi:', err);
  const message =
    err.code === 'P2025'
      ? 'Ma\'lumot topilmadi'
      : err.code === 'P2002'
      ? 'Bunday yozuv allaqachon mavjud'
      : err.message || 'Ichki xatolik';
  res.status(err.status || 500).json({ ok: false, error: message });
});

// ---------------------------------------------------------------
// Servisni "uyg'oq" tutish
// ---------------------------------------------------------------
/**
 * Render bepul tarifi 15 daqiqa jimlikdan keyin servisni uxlatadi va
 * keyingi so'rov ~50 soniya kutadi — aynan shu sabab bot kech ochiladi.
 * Har 10 daqiqada o'zimizga so'rov yuborsak, servis ham, Neon bazasi ham
 * uyg'oq qoladi va /start bir zumda javob beradi.
 */
let keepAliveTimer = null;

function startKeepAlive() {
  const { enabled, url, minutes } = config.keepAlive;
  if (!enabled) return;

  if (!url) {
    if (config.env === 'production') {
      console.log(
        "\n⚠️  Keep-alive ishlamayapti: servisning o'z manzili topilmadi.\n" +
          "   Render → Environment ga qo'shing:\n" +
          '   SELF_URL = https://<servis-nomi>.onrender.com\n' +
          '   Aks holda servis 15 daqiqadan keyin uxlab qoladi va bot kech ochiladi.\n'
      );
    }
    return;
  }

  if (typeof fetch !== 'function') {
    console.log('⚠️  Keep-alive uchun Node.js 18+ kerak.');
    return;
  }

  const intervalMs = Math.max(1, minutes) * 60 * 1000;

  const ping = async () => {
    try {
      await fetch(`${url}/api/health`, { headers: { 'x-keep-alive': '1' } });
      // Neon bazasi ham uxlamasligi uchun yengil so'rov
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      console.error('⚠️  Keep-alive:', err.message);
    }
  };

  keepAliveTimer = setInterval(ping, intervalMs);
  console.log(`💓 Keep-alive:          har ${minutes} daqiqada ${url}/api/health`);
}

/**
 * Birinchi foydalanuvchi sovuq so'rovni kutmasligi uchun
 * Prisma ulanishini va katalog keshini oldindan isitib qo'yamiz.
 */
async function warmUp() {
  try {
    const { getCatalog } = require('./controllers/cartController');
    // Soxta req/res orqali keshni to'ldiramiz
    await new Promise((resolve) => {
      getCatalog(
        {},
        { set: () => {}, json: resolve },
        resolve
      );
    });
    console.log('🔥 Katalog keshi tayyor');
  } catch (err) {
    console.error('⚠️  Katalogni oldindan yuklab bo\'lmadi:', err.message);
  }
}

// ---------------------------------------------------------------
// Bot
// ---------------------------------------------------------------
/** Telegram botni ishga tushirish — serverni bloklamaydi */
async function startBot() {
  if (!config.isBotConfigured) {
    console.log('\n⚠️  BOT_TOKEN topilmadi — bot ishga tushmadi.');
    console.log('   backend/.env faylida BOT_TOKEN ni to\'ldiring.\n');
    return;
  }

  try {
    registerBotHandlers(bot);

    // Bot ma'lumotini oldindan olamiz: birinchi xabar kelganda Telegraf
    // uni qayta so'rab, javobni kechiktirmasligi uchun.
    const me = await bot.telegram.getMe();
    bot.botInfo = me;

    if (config.botMode === 'webhook') {
      // Telegram xabarni o'zi yuboradi — uxlab qolgan servisni
      // aynan shu so'rov uyg'otadi.
      const secretToken = crypto
        .createHash('sha256')
        .update(config.botToken)
        .digest('hex')
        .slice(0, 32);

      const middleware = await bot.createWebhook({
        domain: config.publicUrl,
        path: '/telegram/webhook',
        secret_token: secretToken,
        drop_pending_updates: false,
      });

      telegramWebhook.use(middleware);
      console.log(`📨 Bot rejimi:          webhook (${config.publicUrl}/telegram/webhook)`);
    } else {
      // MUHIM (1): dropPendingUpdates: false — servis uxlagan paytda yozilgan
      // /start xabarlari yo'qolmaydi, uyg'ongach javob beriladi.
      // MUHIM (2): launch() polling rejimida hech qachon tugamaydi
      // (ichida cheksiz sikl bor) — shuning uchun uni KUTMAYMIZ.
      bot
        .launch({ dropPendingUpdates: false })
        .catch((err) => console.error('❌ Bot ishga tushmadi:', err.message));
      console.log('📨 Bot rejimi:          polling');
    }

    // Buyruqlar ro'yxati botning ishlashiga ta'sir qilmaydi — kutib o'tirmaymiz.
    bot.telegram
      .setMyCommands([
        { command: 'start', description: 'Boshlash / Начать' },
        { command: 'menu', description: 'Menyu / Меню' },
        { command: 'orders', description: 'Buyurtmalarim / Мои заказы' },
        { command: 'contact', description: 'Aloqa / Контакты' },
        { command: 'language', description: 'Til / Язык' },
      ])
      .catch((err) => console.error('⚠️  Buyruqlar ro\'yxati:', err.message));

    console.log(`🤖 Bot ishlayapti:      @${me.username}`);
    console.log(
      config.isWebAppConfigured
        ? `🌐 Mini App:            ${config.webAppUrl}\n`
        : "\n⚠️  WEBAPP_URL sozlanmagan — botdagi «Menyu» tugmasi Mini App'ni ocha olmaydi.\n"
    );
  } catch (err) {
    console.error(`\n❌ Botni ulashda xatolik: ${err.message}`);
    console.error('   BOT_TOKEN to\'g\'riligini tekshiring. API esa ishlashda davom etadi.\n');
  }
}

// ---------------------------------------------------------------
// Ishga tushirish
// ---------------------------------------------------------------
async function start() {
  console.log('\n══════════════════════════════════════');
  console.log(`  🍰  ${config.shop.name}`);
  console.log('══════════════════════════════════════\n');

  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`🚀 API ishlayapti:      http://localhost:${config.port}`);
    console.log(`   Admin panel API:     http://localhost:${config.port}/api/admin`);
    console.log(`   Mini App API:        http://localhost:${config.port}/api/client`);
  });

  // Bular serverni kutib turmaydi — parallel ishga tushadi
  startKeepAlive();
  warmUp();
  startBot();
}

async function shutdown(signal) {
  console.log(`\n${signal} — to'xtatilmoqda...`);
  if (keepAliveTimer) clearInterval(keepAliveTimer);
  try {
    if (bot && config.botMode === 'polling') bot.stop(signal);
  } catch (_) {}
  await disconnectDatabase();
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

start().catch((err) => {
  console.error('\n❌ Ishga tushirishda xatolik:', err.message, '\n');
  process.exit(1);
});
