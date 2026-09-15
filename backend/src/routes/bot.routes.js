/**
 * Bot handlerlarini ro'yxatdan o'tkazish.
 */
const controller = require('../controllers/botController');
const { buttonsOf } = require('../utils/i18n');

function registerBotHandlers(bot) {
  if (!bot) return;

  // Buyruqlar
  bot.start(controller.handleStart);
  bot.command('menu', controller.handleStart);
  bot.command('language', controller.handleLanguageMenu);
  bot.command('orders', controller.handleMyOrders);
  bot.command('contact', controller.handleContactInfo);
  bot.command('id', controller.handleChatId);

  // Til tanlash (inline tugma)
  bot.action(/^lang:(uz|ru)$/, controller.handleLanguage);

  // Telefon raqam
  bot.on('contact', controller.handleContact);

  // Pastki klaviatura tugmalari (ikkala tilda)
  bot.hears(buttonsOf('btnOrder'), controller.handleOrderButton);
  bot.hears(buttonsOf('btnMyOrders'), controller.handleMyOrders);
  bot.hears(buttonsOf('btnContact'), controller.handleContactInfo);
  bot.hears(buttonsOf('btnLanguage'), controller.handleLanguageMenu);

  // Qolgan barcha matnlar
  bot.on('text', controller.handleUnknown);

  // Xatolarni ushlash
  bot.catch((err, ctx) => {
    console.error(`❌ Bot xatosi (${ctx?.updateType}):`, err.message);
  });
}

module.exports = registerBotHandlers;
