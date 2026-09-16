/**
 * Bot logikasi: /start, til tanlash, telefon so'rash, asosiy menyu,
 * buyurtmalar tarixi va aloqa.
 */
const { Markup } = require('telegraf');
const config = require('../config/default');
const UserModel = require('../models/User');
const OrderModel = require('../models/Order');
const { t } = require('../utils/i18n');
const { formatPrice, formatOrderNumber, itemsToText, formatDate, escapeHtml } = require('../utils/helpers');

/** Asosiy menyu klaviaturasi */
function mainMenuKeyboard(lang) {
  const texts = t(lang);
  const firstRow = config.isWebAppConfigured
    ? [Markup.button.webApp(texts.btnOrder, config.webAppUrl)]
    : [texts.btnOrder];

  return Markup.keyboard([firstRow, [texts.btnMyOrders, texts.btnContact], [texts.btnLanguage]]).resize();
}

/** Til tanlash tugmalari */
function languageKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🇺🇿 O'zbekcha", 'lang:uz'),
      Markup.button.callback('🇷🇺 Русский', 'lang:ru'),
    ],
  ]);
}

/** Telefon so'rash klaviaturasi */
function phoneKeyboard(lang) {
  return Markup.keyboard([[Markup.button.contactRequest(t(lang).phoneButton)]])
    .resize()
    .oneTime();
}

/**
 * Telegramga darhol "yozmoqda..." belgisini yuboradi.
 * Bazadan javob kutilayotgan paytda foydalanuvchi bot tirikligini ko'radi.
 * Kutmaymiz — javob berishni sekinlashtirmasligi kerak.
 */
function typing(ctx) {
  try {
    ctx.sendChatAction('typing').catch(() => {});
  } catch (_) {}
}

/** Joriy foydalanuvchini bazadan olish / yaratish */
async function ensureUser(ctx) {
  return UserModel.upsertFromTelegram(ctx.from);
}

// ---------------------------------------------------------------
// /start
// ---------------------------------------------------------------
async function handleStart(ctx) {
  typing(ctx);
  const user = await ensureUser(ctx);

  if (!user.phone) {
    await ctx.reply(t(user.language).chooseLanguage, languageKeyboard());
    return;
  }

  const texts = t(user.language);
  await ctx.replyWithHTML(
    texts.welcome(escapeHtml(user.firstName || ctx.from.first_name || '')),
    mainMenuKeyboard(user.language)
  );
}

// ---------------------------------------------------------------
// Til tanlash tugmasi bosilganda
// ---------------------------------------------------------------
async function handleLanguage(ctx) {
  const lang = ctx.match[1];
  await ensureUser(ctx);
  const user = await UserModel.setLanguage(ctx.from.id, lang);
  const texts = t(lang);

  await ctx.answerCbQuery(texts.langSaved);
  try {
    await ctx.editMessageText(texts.langSaved);
  } catch (_) {
    /* xabar o'zgarmagan bo'lsa e'tibor bermaymiz */
  }

  if (!user.phone) {
    await ctx.replyWithHTML(texts.askPhone, phoneKeyboard(lang));
  } else {
    await ctx.replyWithHTML(texts.welcome(escapeHtml(user.firstName || '')), mainMenuKeyboard(lang));
  }
}

/** /language yoki "🌐 Til / Язык" */
async function handleLanguageMenu(ctx) {
  typing(ctx);
  const user = await ensureUser(ctx);
  await ctx.reply(t(user.language).chooseLanguage, languageKeyboard());
}

// ---------------------------------------------------------------
// Kontakt (telefon raqam) qabul qilish
// ---------------------------------------------------------------
async function handleContact(ctx) {
  typing(ctx);
  const user = await ensureUser(ctx);
  const contact = ctx.message.contact;

  // Faqat o'z raqamini qabul qilamiz
  if (String(contact.user_id) !== String(ctx.from.id)) {
    await ctx.reply(t(user.language).askPhone);
    return;
  }

  const phone = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;
  const updated = await UserModel.setPhone(ctx.from.id, phone);
  const texts = t(updated.language);

  await ctx.replyWithHTML(texts.phoneSaved(escapeHtml(phone)));
  await ctx.replyWithHTML(texts.welcome(escapeHtml(updated.firstName || '')), mainMenuKeyboard(updated.language));
}

// ---------------------------------------------------------------
// "🍰 Menyu va buyurtma" (WEBAPP_URL sozlanmagan holat uchun)
// ---------------------------------------------------------------
async function handleOrderButton(ctx) {
  typing(ctx);
  const user = await ensureUser(ctx);
  const texts = t(user.language);

  if (!config.isWebAppConfigured) {
    await ctx.replyWithHTML(texts.webAppMissing);
    return;
  }
  await ctx.replyWithHTML(texts.menuTitle, mainMenuKeyboard(user.language));
}

// ---------------------------------------------------------------
// "📜 Buyurtmalarim"
// ---------------------------------------------------------------
async function handleMyOrders(ctx) {
  typing(ctx);
  const user = await ensureUser(ctx);
  const texts = t(user.language);
  const orders = await OrderModel.listByUser(user.id, 5);

  if (!orders.length) {
    await ctx.reply(texts.noOrders);
    return;
  }

  const blocks = orders.map((order) => {
    const when = [formatDate(order.deliveryDate), order.deliveryTime].filter(Boolean).join(' ');
    return (
      `\n━━━━━━━━━━━━━━\n` +
      `🧾 <b>${formatOrderNumber(order.id)}</b> · ${texts.statuses[order.status] || order.status}\n` +
      `📅 ${formatDate(order.createdAt)}${when ? ` → ${when}` : ''}\n` +
      `${itemsToText(order.items, user.language)}\n` +
      `💰 <b>${formatPrice(order.total)}</b>`
    );
  });

  await ctx.replyWithHTML(texts.myOrdersTitle + blocks.join('\n'));
}

// ---------------------------------------------------------------
// "📞 Aloqa"
// ---------------------------------------------------------------
async function handleContactInfo(ctx) {
  const user = await ensureUser(ctx);
  await ctx.replyWithHTML(t(user.language).contact(config.shop));
}

// ---------------------------------------------------------------
// Tushunarsiz matn
// ---------------------------------------------------------------
async function handleUnknown(ctx) {
  const user = await ensureUser(ctx);
  await ctx.reply(t(user.language).unknown, mainMenuKeyboard(user.language));
}

/** /id — chat ID ni bilish uchun (ADMIN_CHAT_ID sozlashda asqotadi) */
async function handleChatId(ctx) {
  await ctx.replyWithHTML(`Chat ID: <code>${ctx.chat.id}</code>`);
}

module.exports = {
  handleStart,
  handleLanguage,
  handleLanguageMenu,
  handleContact,
  handleOrderButton,
  handleMyOrders,
  handleContactInfo,
  handleUnknown,
  handleChatId,
  mainMenuKeyboard,
};
