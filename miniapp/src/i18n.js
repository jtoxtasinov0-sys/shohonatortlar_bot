/**
 * Mini App matnlari — o'zbekcha va ruscha.
 */
export const dict = {
  uz: {
    currency: "so'm",
    loading: 'Yuklanmoqda...',
    wakingUp: "Server uyg'onmoqda, biroz kuting...",
    errorTitle: 'Xatolik yuz berdi',
    retry: 'Qayta urinish',
    close: 'Yopish',
    save: 'Saqlash',
    cancel: 'Bekor qilish',

    lang: {
      title: 'Tilni tanlang',
      subtitle: 'Выберите язык',
      uz: "O'zbekcha",
      ru: 'Русский',
      next: 'Davom etish',
    },

    onboarding: [
      {
        emoji: '🍰',
        title: 'Shirinlik xohlayapsizmi?',
        text: "Uyda pishirilgan yangi tortlar va desertlarni 60 daqiqada eshigingizgacha yetkazamiz.",
      },
      {
        emoji: '🛍️',
        title: 'Bu qanday ishlaydi?',
        text: 'Tanlang, buyurtma bering va rohatlaning — hammasi 3 ta bosishda.',
      },
      {
        emoji: '💛',
        title: '10 000+ mijoz biz bilan',
        text: "7 yildan beri bayramlaringizni shirin qilamiz. Faqat tabiiy mahsulotlar.",
      },
    ],
    onbNext: 'Keyingisi',
    onbStart: 'Boshlash',
    onbSkip: "O'tkazib yuborish",

    nav: { home: 'Bosh sahifa', catalog: 'Katalog', cart: 'Savatcha', profile: 'Profil' },

    home: {
      greeting: 'Assalomu alaykum',
      subtitle: 'Bugun qanday shirinlik xohlaysiz?',
      heroTitle: 'Yangi buyurtma berish',
      heroText: "Menyudan tanlang — 60 daqiqada yetkazamiz",
      heroBtn: 'Menyuni ochish',
      categories: 'Kategoriyalar',
      popular: 'Mashhur mahsulotlar',
      seeAll: 'Hammasi',
      freeDelivery: (sum) => `${sum} so'mdan yuqori buyurtmaga yetkazish bepul`,
    },

    catalog: {
      title: 'Katalog',
      search: 'Qidirish...',
      all: 'Hammasi',
      empty: 'Bu bo‘limda mahsulot topilmadi',
    },

    product: {
      ingredients: 'Tarkibi',
      size: 'Hajmi',
      qty: 'Soni',
      inscription: 'Tort ustiga yozuv',
      inscriptionPh: "Masalan: Tug'ilgan kuning bilan!",
      add: 'Savatchaga qo‘shish',
      popular: 'Mashhur',
    },

    cart: {
      title: 'Savatcha',
      empty: 'Savatcha bo‘sh',
      emptyText: 'Menyudan shirinlik tanlang va shu yerga qo‘shing',
      goCatalog: 'Katalogga o‘tish',
      upsellTitle: 'Buyurtmangizga qo‘shamizmi?',
      subtotal: 'Mahsulotlar',
      deliveryFee: 'Yetkazib berish',
      free: 'Bepul',
      total: 'Jami',
      checkout: 'Buyurtmani tasdiqlash',
      clear: 'Savatchani tozalash',
      items: 'ta mahsulot',
    },

    checkout: {
      title: 'Buyurtma ma‘lumotlari',
      name: 'Ismingiz',
      namePh: 'Ism familiya',
      phone: 'Telefon raqam',
      phonePh: '+998 __ ___ __ __',
      type: 'Qabul qilish usuli',
      delivery: 'Yetkazib berish',
      pickup: 'Olib ketish',
      address: 'Manzil',
      addressPh: "Ko'cha, uy, kvartira",
      landmark: 'Mo‘ljal',
      landmarkPh: 'Masalan: 12-maktab yonida',
      geo: '📍 Joylashuvni aniqlash',
      geoOk: '📍 Joylashuv aniqlandi',
      date: 'Sana',
      time: 'Vaqt',
      comment: 'Izoh',
      commentPh: 'Qo‘shimcha istaklaringiz...',
      payment: 'To‘lov',
      cash: 'Naqd',
      card: 'Karta',
      required: 'Iltimos, ism va telefon raqamni kiriting',
      addressRequired: 'Iltimos, yetkazib berish manzilini kiriting',
      pickupAddress: 'Olib ketish manzili',
    },

    success: {
      title: 'Buyurtmangiz qabul qilindi!',
      text: 'Menejerimiz tez orada siz bilan bog‘lanadi. Botga tasdiq xabari yuborildi 🍰',
      number: 'Buyurtma raqami',
      close: 'Yopish',
    },

    profile: {
      title: 'Profil',
      myOrders: 'Mening buyurtmalarim',
      ordersEmpty: 'Hali buyurtma bermagansiz',
      language: 'Til',
      contactUs: 'Biz bilan bog‘lanish',
      call: 'Qo‘ng‘iroq qilish',
      instagram: 'Instagram',
      workTime: 'Ish vaqti',
      address: 'Manzil',
      reorder: 'Yana buyurtma qilish',
      total: 'Jami',
    },

    statuses: {
      new: 'Yangi',
      confirmed: 'Tasdiqlandi',
      delivering: 'Yo‘lda',
      done: 'Yetkazildi',
      canceled: 'Bekor qilindi',
    },

    toast: {
      added: 'Savatchaga qo‘shildi',
      removed: 'O‘chirildi',
      reordered: 'Mahsulotlar savatchaga qo‘shildi',
      minOrder: (sum) => `Minimal buyurtma: ${sum} so'm`,
    },
  },

  ru: {
    currency: 'сум',
    loading: 'Загрузка...',
    wakingUp: 'Сервер просыпается, подождите немного...',
    errorTitle: 'Произошла ошибка',
    retry: 'Повторить',
    close: 'Закрыть',
    save: 'Сохранить',
    cancel: 'Отмена',

    lang: {
      title: 'Выберите язык',
      subtitle: 'Tilni tanlang',
      uz: "O'zbekcha",
      ru: 'Русский',
      next: 'Продолжить',
    },

    onboarding: [
      {
        emoji: '🍰',
        title: 'Хочется сладкого?',
        text: 'Свежие домашние торты и десерты доставим к вашей двери за 60 минут.',
      },
      {
        emoji: '🛍️',
        title: 'Как это работает?',
        text: 'Выбирайте, заказывайте и наслаждайтесь — всего три касания.',
      },
      {
        emoji: '💛',
        title: 'С нами 10 000+ клиентов',
        text: 'Уже 7 лет делаем ваши праздники сладкими. Только натуральные продукты.',
      },
    ],
    onbNext: 'Далее',
    onbStart: 'Начать',
    onbSkip: 'Пропустить',

    nav: { home: 'Главная', catalog: 'Каталог', cart: 'Корзина', profile: 'Профиль' },

    home: {
      greeting: 'Здравствуйте',
      subtitle: 'Чего сладкого хотите сегодня?',
      heroTitle: 'Сделать новый заказ',
      heroText: 'Выберите из меню — доставим за 60 минут',
      heroBtn: 'Открыть меню',
      categories: 'Категории',
      popular: 'Популярное',
      seeAll: 'Все',
      freeDelivery: (sum) => `Бесплатная доставка при заказе от ${sum} сум`,
    },

    catalog: {
      title: 'Каталог',
      search: 'Поиск...',
      all: 'Все',
      empty: 'В этом разделе пока пусто',
    },

    product: {
      ingredients: 'Состав',
      size: 'Размер',
      qty: 'Количество',
      inscription: 'Надпись на торте',
      inscriptionPh: 'Например: С днём рождения!',
      add: 'Добавить в корзину',
      popular: 'Хит',
    },

    cart: {
      title: 'Корзина',
      empty: 'Корзина пуста',
      emptyText: 'Выберите сладости из меню и добавьте сюда',
      goCatalog: 'Перейти в каталог',
      upsellTitle: 'Добавить к заказу?',
      subtotal: 'Товары',
      deliveryFee: 'Доставка',
      free: 'Бесплатно',
      total: 'Итого',
      checkout: 'Подтвердить заказ',
      clear: 'Очистить корзину',
      items: 'товаров',
    },

    checkout: {
      title: 'Данные заказа',
      name: 'Ваше имя',
      namePh: 'Имя и фамилия',
      phone: 'Номер телефона',
      phonePh: '+998 __ ___ __ __',
      type: 'Способ получения',
      delivery: 'Доставка',
      pickup: 'Самовывоз',
      address: 'Адрес',
      addressPh: 'Улица, дом, квартира',
      landmark: 'Ориентир',
      landmarkPh: 'Например: рядом со школой №12',
      geo: '📍 Определить местоположение',
      geoOk: '📍 Местоположение определено',
      date: 'Дата',
      time: 'Время',
      comment: 'Комментарий',
      commentPh: 'Дополнительные пожелания...',
      payment: 'Оплата',
      cash: 'Наличные',
      card: 'Карта',
      required: 'Пожалуйста, укажите имя и номер телефона',
      addressRequired: 'Пожалуйста, укажите адрес доставки',
      pickupAddress: 'Адрес самовывоза',
    },

    success: {
      title: 'Ваш заказ принят!',
      text: 'Менеджер свяжется с вами в ближайшее время. Подтверждение отправлено в бот 🍰',
      number: 'Номер заказа',
      close: 'Закрыть',
    },

    profile: {
      title: 'Профиль',
      myOrders: 'Мои заказы',
      ordersEmpty: 'Вы ещё не делали заказов',
      language: 'Язык',
      contactUs: 'Связаться с нами',
      call: 'Позвонить',
      instagram: 'Instagram',
      workTime: 'Время работы',
      address: 'Адрес',
      reorder: 'Заказать снова',
      total: 'Итого',
    },

    statuses: {
      new: 'Новый',
      confirmed: 'Подтверждён',
      delivering: 'В пути',
      done: 'Доставлен',
      canceled: 'Отменён',
    },

    toast: {
      added: 'Добавлено в корзину',
      removed: 'Удалено',
      reordered: 'Товары добавлены в корзину',
      minOrder: (sum) => `Минимальный заказ: ${sum} сум`,
    },
  },
};

export const getDict = (lang) => dict[lang === 'ru' ? 'ru' : 'uz'];
