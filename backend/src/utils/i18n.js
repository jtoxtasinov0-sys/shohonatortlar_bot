/**
 * Bot matnlari — o'zbek va rus tillarida.
 */
const messages = {
  uz: {
    chooseLanguage: "🇺🇿 Tilni tanlang\n🇷🇺 Выберите язык",
    langSaved: "✅ Til o'zgartirildi: O'zbekcha",

    welcome: (name) =>
      `Assalomu alaykum, <b>${name}</b>! 👋\n\n` +
      `<b>Shohona Tortlar</b> — uyda pishirilgan tort va shirinliklar 🍰\n` +
      `Buyurtma berish uchun pastdagi tugmani bosing.`,

    askPhone:
      "📱 Buyurtmani qabul qilishimiz uchun telefon raqamingiz kerak.\n\n" +
      "Pastdagi <b>«Raqamni yuborish»</b> tugmasini bosing.",
    phoneButton: "📱 Raqamni yuborish",
    phoneSaved: (phone) => `✅ Raqamingiz saqlandi: <b>${phone}</b>`,

    menuTitle: "Quyidagilardan birini tanlang 👇",
    btnOrder: "🍰 Menyu va buyurtma",
    btnMyOrders: "📜 Buyurtmalarim",
    btnContact: "📞 Aloqa",
    btnLanguage: "🌐 Til / Язык",

    noOrders: "Sizda hali buyurtmalar yo'q 🙂\nBirinchi buyurtmangizni bering — menyu tugmasi pastda.",
    myOrdersTitle: "📜 <b>Sizning buyurtmalaringiz</b>\n",

    orderAccepted: (order) =>
      `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n` +
      `🧾 Buyurtma raqami: <b>${order.number}</b>\n` +
      `${order.list}\n` +
      `💰 Jami: <b>${order.total} so'm</b>\n` +
      `${order.deliveryLine}\n\n` +
      `Menejerimiz tez orada siz bilan bog'lanadi 🍰\nRahmat, <b>Shohona Tortlar</b>ni tanlaganingiz uchun!`,

    statusChanged: (number, status) =>
      `🔔 Buyurtma <b>${number}</b> holati o'zgardi: <b>${status}</b>`,

    contact: (shop) =>
      `📞 <b>Aloqa</b>\n\n` +
      `Telefon: <b>${shop.phone}</b>\n` +
      `Manzil: ${shop.address}\n` +
      `Ish vaqti: ${shop.workTime}\n\n` +
      `Savollaringiz bo'lsa — shu yerga yozing, javob beramiz 💛`,

    webAppMissing:
      "⚙️ Mini App hali ulanmagan.\n\n" +
      "backend/.env faylidagi <code>WEBAPP_URL</code> ga ngrok havolasini yozing va serverni qayta ishga tushiring.",

    unknown: "Pastdagi tugmalardan foydalaning 👇",

    statuses: {
      new: 'Yangi',
      confirmed: 'Tasdiqlandi',
      delivering: 'Yo‘lda',
      done: 'Yetkazildi',
      canceled: 'Bekor qilindi',
    },
    delivery: 'Yetkazib berish',
    pickup: 'Olib ketish',
  },

  ru: {
    chooseLanguage: "🇺🇿 Tilni tanlang\n🇷🇺 Выберите язык",
    langSaved: '✅ Язык изменён: Русский',

    welcome: (name) =>
      `Здравствуйте, <b>${name}</b>! 👋\n\n` +
      `<b>Shohona Tortlar</b> — домашние торты и сладости 🍰\n` +
      `Нажмите кнопку ниже, чтобы сделать заказ.`,

    askPhone:
      '📱 Для оформления заказа нам нужен ваш номер телефона.\n\n' +
      'Нажмите кнопку <b>«Отправить номер»</b> ниже.',
    phoneButton: '📱 Отправить номер',
    phoneSaved: (phone) => `✅ Ваш номер сохранён: <b>${phone}</b>`,

    menuTitle: 'Выберите один из пунктов 👇',
    btnOrder: '🍰 Меню и заказ',
    btnMyOrders: '📜 Мои заказы',
    btnContact: '📞 Контакты',
    btnLanguage: '🌐 Til / Язык',

    noOrders: 'У вас пока нет заказов 🙂\nСделайте первый заказ — кнопка меню внизу.',
    myOrdersTitle: '📜 <b>Ваши заказы</b>\n',

    orderAccepted: (order) =>
      `✅ <b>Ваш заказ принят!</b>\n\n` +
      `🧾 Номер заказа: <b>${order.number}</b>\n` +
      `${order.list}\n` +
      `💰 Итого: <b>${order.total} сум</b>\n` +
      `${order.deliveryLine}\n\n` +
      `Наш менеджер свяжется с вами в ближайшее время 🍰\nСпасибо, что выбрали <b>Shohona Tortlar</b>!`,

    statusChanged: (number, status) =>
      `🔔 Статус заказа <b>${number}</b> изменён: <b>${status}</b>`,

    contact: (shop) =>
      `📞 <b>Контакты</b>\n\n` +
      `Телефон: <b>${shop.phone}</b>\n` +
      `Адрес: ${shop.address}\n` +
      `Время работы: ${shop.workTime}\n\n` +
      `Есть вопросы — напишите сюда, мы ответим 💛`,

    webAppMissing:
      '⚙️ Mini App ещё не подключён.\n\n' +
      'Укажите ngrok-ссылку в <code>WEBAPP_URL</code> файла backend/.env и перезапустите сервер.',

    unknown: 'Пользуйтесь кнопками ниже 👇',

    statuses: {
      new: 'Новый',
      confirmed: 'Подтверждён',
      delivering: 'В пути',
      done: 'Доставлен',
      canceled: 'Отменён',
    },
    delivery: 'Доставка',
    pickup: 'Самовывоз',
  },
};

/** Tilga mos matnlar to'plamini qaytaradi */
function t(lang) {
  return messages[lang === 'ru' ? 'ru' : 'uz'];
}

/** Barcha tillardagi tugma matnlarini yig'ish (matnli tugmalarni aniqlash uchun) */
function buttonsOf(key) {
  return [messages.uz[key], messages.ru[key]];
}

module.exports = { messages, t, buttonsOf };
