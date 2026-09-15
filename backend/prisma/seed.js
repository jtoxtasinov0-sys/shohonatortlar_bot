/**
 * Boshlang'ich ma'lumotlar: kategoriyalar, mahsulotlar va storylar.
 * Ishga tushirish:  npm run db:seed
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'tortlar', nameUz: 'Tortlar', nameRu: 'Торты', emoji: '🎂', sortOrder: 1 },
  { slug: 'kapkeyk', nameUz: 'Kapkeyk va kekslar', nameRu: 'Капкейки и кексы', emoji: '🧁', sortOrder: 2 },
  { slug: 'pechene', nameUz: 'Pechenye', nameRu: 'Печенье', emoji: '🍪', sortOrder: 3 },
  { slug: 'desert', nameUz: 'Desertlar', nameRu: 'Десерты', emoji: '🍮', sortOrder: 4 },
  { slug: 'ichimlik', nameUz: 'Ichimliklar', nameRu: 'Напитки', emoji: '☕', sortOrder: 5 },
];

const CAKE_OPTIONS = [
  { label: '1 kg', multiplier: 1 },
  { label: '1.5 kg', multiplier: 1.5 },
  { label: '2 kg', multiplier: 2 },
  { label: '3 kg', multiplier: 3 },
];

const PRODUCTS = [
  // ---------------- TORTLAR ----------------
  {
    category: 'tortlar',
    nameUz: 'Medovik "Shohona"',
    nameRu: 'Медовик «Шохона»',
    descriptionUz: "Yupqa asalli qatlamlar va uyda tayyorlangan smetanali krem. Bizning eng ko'p sotiladigan tortimiz.",
    descriptionRu: 'Тонкие медовые коржи и домашний сметанный крем. Наш самый продаваемый торт.',
    ingredientsUz: ['Tabiiy asal', 'Smetanali krem', 'Sariyog‘', 'Tuxum', 'Bug‘doy uni'],
    ingredientsRu: ['Натуральный мёд', 'Сметанный крем', 'Сливочное масло', 'Яйца', 'Пшеничная мука'],
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    price: 185000,
    oldPrice: 210000,
    unit: 'kg',
    weightOptions: CAKE_OPTIONS,
    allowText: true,
    isPopular: true,
    sortOrder: 1,
  },
  {
    category: 'tortlar',
    nameUz: 'Napoleon',
    nameRu: 'Наполеон',
    descriptionUz: "Yupqa qatlamli xamir va nozik zavarnoy krem. Klassik ta'm, hech qachon eskirmaydi.",
    descriptionRu: 'Слоёное тесто и нежный заварной крем. Классический вкус, который не стареет.',
    ingredientsUz: ['Qatlamli xamir', 'Zavarnoy krem', 'Sut', 'Vanil', 'Sariyog‘'],
    ingredientsRu: ['Слоёное тесто', 'Заварной крем', 'Молоко', 'Ваниль', 'Сливочное масло'],
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    price: 175000,
    oldPrice: 195000,
    unit: 'kg',
    weightOptions: CAKE_OPTIONS,
    allowText: true,
    isPopular: true,
    sortOrder: 2,
  },
  {
    category: 'tortlar',
    nameUz: 'Shokoladli tort',
    nameRu: 'Шоколадный торт',
    descriptionUz: "Belgiya shokoladidan tayyorlangan ganash va yumshoq biskvit. Shokolad sevuvchilar uchun.",
    descriptionRu: 'Ганаш из бельгийского шоколада и мягкий бисквит. Для любителей шоколада.',
    ingredientsUz: ['Belgiya shokoladi', 'Kakao biskvit', 'Qaymoqli ganash', 'Vanil'],
    ingredientsRu: ['Бельгийский шоколад', 'Какао-бисквит', 'Сливочный ганаш', 'Ваниль'],
    imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    price: 210000,
    oldPrice: 240000,
    unit: 'kg',
    weightOptions: CAKE_OPTIONS,
    allowText: true,
    isPopular: true,
    sortOrder: 3,
  },
  {
    category: 'tortlar',
    nameUz: 'Red Velvet',
    nameRu: 'Красный бархат',
    descriptionUz: "Baxmal kabi yumshoq qizil biskvit va krem-chiz. Tug'ilgan kunlar uchun ideal.",
    descriptionRu: 'Бархатистый красный бисквит и крем-чиз. Идеально для дня рождения.',
    ingredientsUz: ['Qizil biskvit', 'Krem-chiz', 'Qaymoq', 'Vanil', 'Kakao'],
    ingredientsRu: ['Красный бисквит', 'Крем-чиз', 'Сливки', 'Ваниль', 'Какао'],
    imageUrl: 'https://images.unsplash.com/photo-1586985289906-406988974504?auto=format&fit=crop&w=800&q=80',
    price: 225000,
    unit: 'kg',
    weightOptions: CAKE_OPTIONS,
    allowText: true,
    isPopular: true,
    sortOrder: 4,
  },
  {
    category: 'tortlar',
    nameUz: 'Nyu-York chizkeyk',
    nameRu: 'Чизкейк Нью-Йорк',
    descriptionUz: "Klassik amerikacha chizkeyk — krem-chiz va pechenye asosi.",
    descriptionRu: 'Классический американский чизкейк — крем-чиз на песочной основе.',
    ingredientsUz: ['Krem-chiz', 'Pechenye asosi', 'Qaymoq', 'Tuxum', 'Limon'],
    ingredientsRu: ['Крем-чиз', 'Песочная основа', 'Сливки', 'Яйца', 'Лимон'],
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    price: 195000,
    oldPrice: 220000,
    unit: 'kg',
    weightOptions: CAKE_OPTIONS,
    allowText: false,
    sortOrder: 5,
  },
  {
    category: 'tortlar',
    nameUz: 'Bolalar torti',
    nameRu: 'Детский торт',
    descriptionUz: "Yorqin bezaklar, mastika figuralar va bolalar yoqtiradigan shirin ta'm. Buyurtmaga individual bezatiladi.",
    descriptionRu: 'Яркий декор, фигурки из мастики и вкус, который любят дети. Оформляем индивидуально.',
    ingredientsUz: ['Vanilli biskvit', 'Mevali qatlam', 'Mastika bezak', 'Qaymoqli krem'],
    ingredientsRu: ['Ванильный бисквит', 'Фруктовая прослойка', 'Декор из мастики', 'Сливочный крем'],
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=800&q=80',
    price: 250000,
    unit: 'kg',
    weightOptions: CAKE_OPTIONS,
    allowText: true,
    sortOrder: 6,
  },

  // ---------------- KAPKEYK ----------------
  {
    category: 'kapkeyk',
    nameUz: 'Vanilli kapkeyk (6 dona)',
    nameRu: 'Ванильные капкейки (6 шт)',
    descriptionUz: "Yumshoq vanilli keks va yuqorisida qaymoqli krem gul. Chiroyli quticha bilan.",
    descriptionRu: 'Нежный ванильный кекс со сливочной кремовой шапочкой. В красивой коробочке.',
    ingredientsUz: ['Vanilli keks', 'Qaymoqli krem', 'Shakar pudrasi', 'Bezak'],
    ingredientsRu: ['Ванильный кекс', 'Сливочный крем', 'Сахарная пудра', 'Декор'],
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    price: 75000,
    oldPrice: 90000,
    unit: "to'plam",
    isPopular: true,
    sortOrder: 1,
  },
  {
    category: 'kapkeyk',
    nameUz: 'Shokoladli maffin (4 dona)',
    nameRu: 'Шоколадные маффины (4 шт)',
    descriptionUz: "Ichi oqadigan shokoladli maffin. Issiq holda ayniqsa mazali.",
    descriptionRu: 'Маффин с жидкой шоколадной начинкой. Особенно вкусно в тёплом виде.',
    ingredientsUz: ['Kakao xamir', 'Shokolad boshqarma', 'Sut', 'Sariyog‘'],
    ingredientsRu: ['Какао-тесто', 'Шоколадная начинка', 'Молоко', 'Масло'],
    imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
    price: 55000,
    unit: "to'plam",
    sortOrder: 2,
  },

  // ---------------- PECHENYE ----------------
  {
    category: 'pechene',
    nameUz: 'Makarons assorti (8 dona)',
    nameRu: 'Макаронс ассорти (8 шт)',
    descriptionUz: "Fransuz makaronslari — 8 xil ta'm, sovg'abop quticha bilan.",
    descriptionRu: 'Французские макаронс — 8 разных вкусов в подарочной коробке.',
    ingredientsUz: ['Bodom uni', 'Beze', 'Mevali gansh', 'Tabiiy bo‘yoq'],
    ingredientsRu: ['Миндальная мука', 'Безе', 'Фруктовый ганаш', 'Натуральный краситель'],
    imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80',
    price: 95000,
    oldPrice: 110000,
    unit: "to'plam",
    isPopular: true,
    sortOrder: 1,
  },
  {
    category: 'pechene',
    nameUz: 'Kurabiye (500 g)',
    nameRu: 'Курабье (500 г)',
    descriptionUz: "Og'izda eriydigan klassik qumli pechenye, murabbo bilan.",
    descriptionRu: 'Тающее во рту классическое песочное печенье с джемом.',
    ingredientsUz: ['Sariyog‘', 'Bug‘doy uni', 'Murabbo', 'Shakar pudrasi'],
    ingredientsRu: ['Сливочное масло', 'Мука', 'Джем', 'Сахарная пудра'],
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    price: 48000,
    unit: "to'plam",
    sortOrder: 2,
  },

  // ---------------- DESERT ----------------
  {
    category: 'desert',
    nameUz: 'Eklerlar (6 dona)',
    nameRu: 'Эклеры (6 шт)',
    descriptionUz: "Zavarnoy xamir va nozik krem, ustida shokolad qatlami.",
    descriptionRu: 'Заварное тесто и нежный крем под шоколадной глазурью.',
    ingredientsUz: ['Zavarnoy xamir', 'Vanilli krem', 'Shokolad glazur'],
    ingredientsRu: ['Заварное тесто', 'Ванильный крем', 'Шоколадная глазурь'],
    imageUrl: 'https://images.unsplash.com/photo-1616690710400-a16d146927c5?auto=format&fit=crop&w=800&q=80',
    price: 65000,
    unit: "to'plam",
    sortOrder: 1,
  },
  {
    category: 'desert',
    nameUz: 'Tiramisu (porsiya)',
    nameRu: 'Тирамису (порция)',
    descriptionUz: "Italyancha klassika: mascarpone, savoyardi va espresso.",
    descriptionRu: 'Итальянская классика: маскарпоне, савоярди и эспрессо.',
    ingredientsUz: ['Mascarpone', 'Savoyardi', 'Espresso', 'Kakao'],
    ingredientsRu: ['Маскарпоне', 'Савоярди', 'Эспрессо', 'Какао'],
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    price: 38000,
    oldPrice: 45000,
    unit: 'dona',
    isPopular: true,
    sortOrder: 2,
  },

  // ---------------- ICHIMLIK ----------------
  {
    category: 'ichimlik',
    nameUz: 'Kapuchino',
    nameRu: 'Капучино',
    descriptionUz: "Yangi qovurilgan don va nozik sut ko'pigi. 250 ml.",
    descriptionRu: 'Свежеобжаренные зёрна и нежная молочная пена. 250 мл.',
    ingredientsUz: ['Espresso', 'Sut', 'Sut ko‘pigi'],
    ingredientsRu: ['Эспрессо', 'Молоко', 'Молочная пена'],
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    price: 22000,
    unit: 'dona',
    sortOrder: 1,
  },
  {
    category: 'ichimlik',
    nameUz: 'Latte',
    nameRu: 'Латте',
    descriptionUz: "Ko'proq sut, yumshoqroq ta'm. 350 ml.",
    descriptionRu: 'Больше молока, мягче вкус. 350 мл.',
    ingredientsUz: ['Espresso', 'Sut', 'Siro (ixtiyoriy)'],
    ingredientsRu: ['Эспрессо', 'Молоко', 'Сироп (по желанию)'],
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    price: 26000,
    unit: 'dona',
    sortOrder: 2,
  },

  // ---------------- QO'SHIMCHA TAKLIF (upsell) ----------------
  {
    category: 'desert',
    nameUz: "Tug'ilgan kun shamlari to'plami",
    nameRu: 'Набор праздничных свечей',
    descriptionUz: "Tort uchun 12 ta rangli sham va bitta bengal o'ti.",
    descriptionRu: '12 разноцветных свечей и один бенгальский огонь для торта.',
    ingredientsUz: ['12 ta sham', 'Bengal o‘ti', 'Qutichada'],
    ingredientsRu: ['12 свечей', 'Бенгальский огонь', 'В коробочке'],
    imageUrl: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?auto=format&fit=crop&w=800&q=80',
    price: 9000,
    unit: "to'plam",
    isUpsell: true,
    sortOrder: 90,
  },
];

const STORIES = [
  {
    titleUz: 'Yangiliklar',
    titleRu: 'Новинки',
    textUz: "Bu hafta menyuda Red Velvet va Nyu-York chizkeyk! Yangi ta'mlarni birinchi bo'lib tatib ko'ring 🍰",
    textRu: 'На этой неделе в меню Красный бархат и Чизкейк Нью-Йорк! Попробуйте новинки первыми 🍰',
    imageUrl: 'https://images.unsplash.com/photo-1586985289906-406988974504?auto=format&fit=crop&w=800&q=80',
    sortOrder: 1,
  },
  {
    titleUz: 'Chegirma',
    titleRu: 'Скидки',
    textUz: "Medovik va Napoleon tortlariga 10% chegirma. Aksiya shu hafta oxirigacha 🎉",
    textRu: 'Скидка 10% на Медовик и Наполеон. Акция действует до конца недели 🎉',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    sortOrder: 2,
  },
  {
    titleUz: 'Yetkazish',
    titleRu: 'Доставка',
    textUz: "300 000 so'mdan yuqori buyurtmalarga yetkazib berish BEPUL 🚗",
    textRu: 'Бесплатная доставка при заказе от 300 000 сум 🚗',
    imageUrl: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=800&q=80',
    sortOrder: 3,
  },
  {
    titleUz: 'Biz haqimizda',
    titleRu: 'О нас',
    textUz: "7 yildan beri Toshkentda shirinlik pishiramiz. Faqat tabiiy mahsulotlar, konservantsiz 💛",
    textRu: 'Уже 7 лет печём сладости в Ташкенте. Только натуральные продукты, без консервантов 💛',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    sortOrder: 4,
  },
];

async function main() {
  console.log('🌱 Seed boshlandi...\n');

  // 1. Kategoriyalar
  const categoryMap = {};
  for (const item of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
    categoryMap[item.slug] = category.id;
    console.log(`  ✓ Kategoriya: ${category.emoji} ${category.nameUz}`);
  }

  // 2. Mahsulotlar
  console.log('');
  for (const item of PRODUCTS) {
    const { category, ...data } = item;
    const payload = { ...data, categoryId: categoryMap[category] };

    const existing = await prisma.product.findFirst({ where: { nameUz: data.nameUz } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: payload });
      console.log(`  ↻ Yangilandi: ${data.nameUz}`);
    } else {
      await prisma.product.create({ data: payload });
      console.log(`  ✓ Qo'shildi:  ${data.nameUz}`);
    }
  }

  // 3. Storylar
  console.log('');
  for (const item of STORIES) {
    const existing = await prisma.story.findFirst({ where: { titleUz: item.titleUz } });
    if (existing) {
      await prisma.story.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.story.create({ data: item });
    }
    console.log(`  ✓ Story: ${item.titleUz}`);
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    stories: await prisma.story.count(),
  };

  console.log(`\n✅ Tayyor! Kategoriya: ${counts.categories} | Mahsulot: ${counts.products} | Story: ${counts.stories}\n`);
}

main()
  .catch((err) => {
    console.error('❌ Seed xatosi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
