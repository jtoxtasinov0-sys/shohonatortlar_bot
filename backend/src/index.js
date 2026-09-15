/**
 * Shohona Tortlar — asosiy ishga tushirish fayli.
 * Express API + Telegram bot bitta jarayonda ishlaydi.
 */
const express = require('express');
const cors = require('cors');

const config = require('./config/default');
const { connectDatabase, disconnectDatabase } = require('./database/connection');
const { bot } = require('./core/bot');
const registerBotHandlers = require('./routes/bot.routes');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

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

  if (!config.isBotConfigured) {
    console.log('\n⚠️  BOT_TOKEN topilmadi — bot ishga tushmadi.');
    console.log('   backend/.env faylida BOT_TOKEN ni to\'ldiring.\n');
    return;
  }

  // Bot ishga tushmasa ham API ishlashda davom etadi
  try {
    registerBotHandlers(bot);

    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Boshlash / Начать' },
      { command: 'menu', description: 'Menyu / Меню' },
      { command: 'orders', description: 'Buyurtmalarim / Мои заказы' },
      { command: 'contact', description: 'Aloqa / Контакты' },
      { command: 'language', description: 'Til / Язык' },
    ]);

    bot
      .launch({ dropPendingUpdates: true })
      .catch((err) => console.error('❌ Bot ishga tushmadi:', err.message));

    const me = await bot.telegram.getMe();
    console.log(`🤖 Bot ishlayapti:      @${me.username}`);
    console.log(
      config.isWebAppConfigured
        ? `🌐 Mini App:            ${config.webAppUrl}\n`
        : "\n⚠️  WEBAPP_URL sozlanmagan — botdagi «Menyu» tugmasi Mini App'ni ocha olmaydi.\n   ngrok havolasini backend/.env dagi WEBAPP_URL ga yozing.\n"
    );
  } catch (err) {
    console.error(`\n❌ Botni ulashda xatolik: ${err.message}`);
    console.error('   BOT_TOKEN to\'g\'riligini tekshiring. API esa ishlashda davom etadi.\n');
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} — to'xtatilmoqda...`);
  try {
    if (bot) bot.stop(signal);
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
