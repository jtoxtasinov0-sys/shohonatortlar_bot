/**
 * Boshlang'ich ma'lumotlar: kategoriyalar, mahsulotlar va storylar.
 *
 * Mahsulot rasmlari — do'konning o'z tortlari (prisma/seed-images/).
 * Ular bazadagi "images" jadvaliga yoziladi va /api/images/<id>.jpg
 * manzili orqali beriladi (Render diski vaqtinchalik bo'lgani uchun).
 *
 * Ishga tushirish:  npm run db:seed
 * DIQQAT: eski kategoriya, mahsulot va storylar o'chiriladi.
 *         Buyurtmalar va mijozlarga tegilmaydi.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const IMAGES_DIR = path.join(__dirname, 'seed-images');

// ---------------------------------------------------------------
// Kategoriyalar
// ---------------------------------------------------------------
const CATEGORIES = [
  { slug: 'bolalar', nameUz: 'Bolalar tortlari', nameRu: 'Детские торты', emoji: '🧸', sortOrder: 1 },
  { slug: 'tugilgan-kun', nameUz: "Tug'ilgan kun tortlari", nameRu: 'Торты на день рождения', emoji: '🎂', sortOrder: 2 },
  { slug: 'toy', nameUz: "To'y va katta tortlar", nameRu: 'Свадебные и большие торты', emoji: '💍', sortOrder: 3 },
  { slug: 'mevali', nameUz: 'Mevali va shokoladli', nameRu: 'Фруктовые и шоколадные', emoji: '🍓', sortOrder: 4 },
];

// Tortlar kilogramm bo'yicha sotiladi: narx × koeffitsient
const CAKE_OPTIONS = [
  { label: '1 kg', multiplier: 1 },
  { label: '1.5 kg', multiplier: 1.5 },
  { label: '2 kg', multiplier: 2 },
  { label: '3 kg', multiplier: 3 },
];

// ---------------------------------------------------------------
// Mahsulotlar — hammasi do'konning haqiqiy tortlari
// ---------------------------------------------------------------
const PRODUCTS = [
  // ---------------- BOLALAR TORTLARI ----------------
  {
    image: 'futbol-torti.jpg',
    category: 'bolalar',
    nameUz: 'Futbol torti',
    nameRu: 'Футбольный торт',
    descriptionUz:
      "Moviy krem, yangi qulupnay va malina bilan bezatilgan bolalar torti. Ustiga tabrik so'zlari va bolangizning ismini yozib beramiz.",
    descriptionRu:
      'Детский торт с голубым кремом, свежей клубникой и малиной. Напишем поздравление и имя ребёнка прямо на торте.',
    ingredientsUz: ['Vanilli biskvit', 'Qaymoqli krem', 'Yangi qulupnay', 'Malina', 'Pista'],
    ingredientsRu: ['Ванильный бисквит', 'Сливочный крем', 'Свежая клубника', 'Малина', 'Фисташки'],
    price: 210000,
    oldPrice: 235000,
    allowText: true,
    isPopular: true,
    sortOrder: 1,
  },
  {
    image: 'sofiya-malika-torti.jpg',
    category: 'bolalar',
    nameUz: 'Sofiya malika torti',
    nameRu: 'Торт «София Прекрасная»',
    descriptionUz:
      "Kichkina malikalar uchun pushti tort. Shokoladli konfetlar, kapkeyklar va Sofiya qahramonlari bilan bezatilgan.",
    descriptionRu:
      'Розовый торт для маленьких принцесс: шоколадные конфеты, капкейки и фигурки Софии.',
    ingredientsUz: ['Vanilli biskvit', 'Pishloqli krem', 'Shokoladli konfetlar', 'Pechenye', 'Bayram bezaklari'],
    ingredientsRu: ['Ванильный бисквит', 'Крем-чиз', 'Шоколадные конфеты', 'Печенье', 'Праздничный декор'],
    price: 240000,
    allowText: true,
    isPopular: true,
    sortOrder: 2,
  },
  {
    image: 'paw-patrol-torti.jpg',
    category: 'bolalar',
    nameUz: 'Paw Patrol torti',
    nameRu: 'Торт «Щенячий патруль»',
    descriptionUz:
      "Futbol maydonchasi ko'rinishidagi tort va bolalarning sevimli qahramonlari. Tug'ilgan kun uchun tayyor syurpriz.",
    descriptionRu:
      'Торт в виде футбольного поля с любимыми героями малышей. Готовый сюрприз на день рождения.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Rangli bezelar', 'Draje', 'Bayram bezaklari'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Цветное безе', 'Драже', 'Праздничный декор'],
    price: 230000,
    allowText: true,
    isPopular: true,
    sortOrder: 3,
  },
  {
    image: 'kok-traktor-torti.jpg',
    category: 'bolalar',
    nameUz: "Ko'k traktor torti",
    nameRu: 'Торт «Синий трактор»',
    descriptionUz:
      "«Ko'k traktor» multfilmi ishqibozlari uchun yumshoq biskvitli tort. Yorqin bezaklar va rangli drajelar bilan.",
    descriptionRu:
      'Мягкий бисквитный торт для поклонников мультфильма «Синий трактор». Яркий декор и цветное драже.',
    ingredientsUz: ['Vanilli biskvit', 'Qaymoqli krem', 'Rangli draje', 'Pechenye', 'Bayram bezaklari'],
    ingredientsRu: ['Ванильный бисквит', 'Сливочный крем', 'Цветное драже', 'Печенье', 'Праздничный декор'],
    price: 195000,
    allowText: true,
    sortOrder: 4,
  },
  {
    image: 'kok-traktor-katta-tort.jpg',
    category: 'bolalar',
    nameUz: "Ko'k traktor — katta tort",
    nameRu: 'Большой торт «Синий трактор»',
    descriptionUz:
      "To'rtburchak katta tort — 10-15 kishilik davra uchun. Yangi mevalar bilan bezatiladi, bolaning ismi va yoshini yozib beramiz.",
    descriptionRu:
      'Большой прямоугольный торт на компанию 10–15 человек. Украшаем свежими фруктами, пишем имя и возраст ребёнка.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Kivi', 'Apelsin', 'Bayram bezaklari'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Киви', 'Апельсин', 'Праздничный декор'],
    price: 220000,
    allowText: true,
    sortOrder: 5,
  },
  {
    image: 'spider-man-torti.jpg',
    category: 'bolalar',
    nameUz: 'Spider-Man torti',
    nameRu: 'Торт «Человек-паук»',
    descriptionUz:
      "O'g'il bolalarning eng sevimli tortlaridan biri: moviy krem, o'rgimchak to'ri naqshi va Spider-Man bezaklari.",
    descriptionRu:
      'Один из самых любимых мальчиками тортов: голубой крем, узор паутины и декор с Человеком-пауком.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Rangli draje', 'Shokolad naqsh', 'Bayram bezaklari'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Цветное драже', 'Шоколадный узор', 'Праздничный декор'],
    price: 235000,
    allowText: true,
    sortOrder: 6,
  },

  // ---------------- TUG'ILGAN KUN TORTLARI ----------------
  {
    image: 'pushti-happy-birthday.jpg',
    category: 'tugilgan-kun',
    nameUz: "Pushti «Happy Birthday» tort",
    nameRu: 'Розовый торт «Happy Birthday»',
    descriptionUz:
      "Nozik pushti krem, oltin rang marvaridlar va jonli ko'rinishdagi gullar. Qizlar va ayollar uchun eng ko'p tanlanadigan tort.",
    descriptionRu:
      'Нежный розовый крем, золотые бусины и живые на вид цветы. Самый популярный выбор для девушек и женщин.',
    ingredientsUz: ['Vanilli biskvit', 'Qaymoqli krem', 'Oltin draje', 'Bezak gullar', 'Kapalaklar'],
    ingredientsRu: ['Ванильный бисквит', 'Сливочный крем', 'Золотое драже', 'Декор-цветы', 'Бабочки'],
    price: 225000,
    allowText: true,
    isPopular: true,
    sortOrder: 1,
  },
  {
    image: 'qizil-glazurli-tort.jpg',
    category: 'tugilgan-kun',
    nameUz: 'Qizil glazurli tort',
    nameRu: 'Торт с красной глазурью',
    descriptionUz:
      "Yaltiroq qizil glazur, qizil atirgullar va kumush marvaridlar. Sevgi kunlari va yubileylar uchun ajoyib tanlov.",
    descriptionRu:
      'Глянцевая красная глазурь, красные розы и серебряные бусины. Отличный выбор для юбилея или романтического повода.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Qizil glazur', 'Bezak atirgullar', 'Kumush marvarid'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Красная глазурь', 'Декор-розы', 'Серебряные бусины'],
    price: 215000,
    allowText: true,
    isPopular: true,
    sortOrder: 2,
  },
  {
    image: 'sariq-glazurli-gulli-tort.jpg',
    category: 'tugilgan-kun',
    nameUz: 'Sariq glazurli gulli tort',
    nameRu: 'Жёлтый торт с розами',
    descriptionUz:
      "Yorqin sariq glazur, pushti atirgullar va oq marvaridlar. Tort ustiga tabrik yozuvini shokolad bilan yozib beramiz.",
    descriptionRu:
      'Яркая жёлтая глазурь, розовые розы и белые бусины. Поздравительную надпись пишем шоколадом прямо на торте.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Sariq glazur', 'Bezak atirgullar', 'Shokolad yozuv'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Жёлтая глазурь', 'Декор-розы', 'Шоколадная надпись'],
    price: 205000,
    allowText: true,
    sortOrder: 3,
  },
  {
    image: 'sariq-atirgulli-tort.jpg',
    category: 'tugilgan-kun',
    nameUz: 'Atirgulli sariq tort',
    nameRu: 'Жёлтый торт с красными розами',
    descriptionUz:
      "Sariq glazur ustida shokoladli naqshlar, qizil atirgullar va oltin drajelar. Bayram dasturxonining eng chiroyli mehmoni.",
    descriptionRu:
      'Шоколадные узоры по жёлтой глазури, красные розы и золотое драже. Самый заметный торт на праздничном столе.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Sariq glazur', 'Shokolad naqsh', 'Bezak atirgullar'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Жёлтая глазурь', 'Шоколадный узор', 'Декор-розы'],
    price: 215000,
    allowText: true,
    sortOrder: 4,
  },
  {
    image: 'smaylik-tort.jpg',
    category: 'tugilgan-kun',
    nameUz: 'Smaylik tort',
    nameRu: 'Торт «Смайлик»',
    descriptionUz:
      "Kulgichli sariq tort — sovg'a qilganda kayfiyatni ko'taradi. Yaltiroq glazur va shokolad bilan chizilgan tabassum.",
    descriptionRu:
      'Жёлтый торт-смайлик, который поднимает настроение. Глянцевая глазурь и улыбка, нарисованная шоколадом.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Sariq glazur', 'Shokolad naqsh'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Жёлтая глазурь', 'Шоколадный узор'],
    price: 185000,
    oldPrice: 210000,
    allowText: false,
    sortOrder: 5,
  },
  {
    image: 'yashil-gulli-oq-tort.jpg',
    category: 'tugilgan-kun',
    nameUz: 'Yashil gulli oq tort',
    nameRu: 'Белый торт с зелёными цветами',
    descriptionUz:
      "Oq krem, kumush marvaridlar va yashil kapalaklar bilan qo'lda bezatilgan tort. Nafis va bayramona ko'rinish.",
    descriptionRu:
      'Белый крем, серебряные бусины и зелёные бабочки — украшено вручную. Изысканно и празднично.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Kumush marvarid', 'Bezak gullar', 'Kapalaklar'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Серебряные бусины', 'Декор-цветы', 'Бабочки'],
    price: 230000,
    allowText: true,
    sortOrder: 6,
  },

  // ---------------- TO'Y VA KATTA TORTLAR ----------------
  {
    image: 'ikki-qavatli-toy-torti.jpg',
    category: 'toy',
    nameUz: "Ikki qavatli to'y torti",
    nameRu: 'Двухъярусный свадебный торт',
    descriptionUz:
      "Ikki qavatli katta tort: oq atirgullar, Ferrero konfetlari va kumush marvaridlar. To'y, nikoh va yubileylar uchun.",
    descriptionRu:
      'Большой двухъярусный торт: белые розы, конфеты Ferrero и серебряные бусины. Для свадеб, никоха и юбилеев.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Ferrero konfetlari', 'Pechenye', 'Bezak atirgullar'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Конфеты Ferrero', 'Печенье', 'Декор-розы'],
    price: 260000,
    allowText: true,
    isPopular: true,
    sortOrder: 1,
  },
  {
    image: 'ikki-qavatli-kokosli-tort.jpg',
    category: 'toy',
    nameUz: 'Ikki qavatli kokosli tort',
    nameRu: 'Двухъярусный кокосовый торт',
    descriptionUz:
      "Kokos qipig'i bilan qoplangan ikki qavatli tort. Pushti atirgullar, kapalaklar va qizil lenta bilan bezatiladi.",
    descriptionRu:
      'Двухъярусный торт в кокосовой стружке. Украшен розовыми розами, бабочками и красной лентой.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Kokos qipig‘i', 'Bezak atirgullar', 'Kapalaklar'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Кокосовая стружка', 'Декор-розы', 'Бабочки'],
    price: 250000,
    allowText: true,
    sortOrder: 2,
  },
  {
    image: 'kokosli-shohona-tort.jpg',
    category: 'toy',
    nameUz: "Kokosli «Shohona» tort",
    nameRu: 'Кокосовый торт «Shohona»',
    descriptionUz:
      "Kokos qipig'i va oq krem bilan qoplangan klassik tort. Qizil lenta va istalgan yozuv bilan bezatib beramiz.",
    descriptionRu:
      'Классический торт в белом креме и кокосовой стружке. Украсим красной лентой и любой надписью.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Kokos qipig‘i', 'Murabbo', 'Lenta bezak'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Кокосовая стружка', 'Джем', 'Декор-лента'],
    price: 195000,
    oldPrice: 220000,
    allowText: true,
    sortOrder: 3,
  },

  // ---------------- MEVALI VA SHOKOLADLI ----------------
  {
    image: 'karamel-mevali-tort.jpg',
    category: 'mevali',
    nameUz: 'Karamel glazurli mevali tort',
    nameRu: 'Карамельный торт с фруктами',
    descriptionUz:
      "Karamel glazur ostidagi yumshoq biskvit. Yuqorisi yangi apelsin, kivi, shokolad va pechenye bilan bezatilgan.",
    descriptionRu:
      'Мягкий бисквит под карамельной глазурью. Сверху — свежий апельсин, киви, шоколад и печенье.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Karamel glazur', 'Apelsin', 'Kivi', 'Shokolad'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Карамельная глазурь', 'Апельсин', 'Киви', 'Шоколад'],
    price: 200000,
    allowText: true,
    isPopular: true,
    sortOrder: 1,
  },
  {
    image: 'shokoladli-mevali-tort.jpg',
    category: 'mevali',
    nameUz: 'Shokoladli mevali tort',
    nameRu: 'Шоколадный торт с фруктами',
    descriptionUz:
      "Quyuq shokolad glazuri, yangi mevalar va shokoladli naychalar. Shokolad sevuvchilar uchun tayyorlanadi.",
    descriptionRu:
      'Густая шоколадная глазурь, свежие фрукты и шоколадные трубочки. Для тех, кто любит шоколад.',
    ingredientsUz: ['Kakao biskvit', 'Qaymoqli krem', 'Shokolad glazur', 'Apelsin', 'Olma', 'Kivi'],
    ingredientsRu: ['Какао-бисквит', 'Сливочный крем', 'Шоколадная глазурь', 'Апельсин', 'Яблоко', 'Киви'],
    price: 190000,
    oldPrice: 215000,
    allowText: true,
    sortOrder: 2,
  },
  {
    image: 'tiramisu-tort.jpg',
    category: 'mevali',
    nameUz: 'Tiramisu uslubidagi tort',
    nameRu: 'Торт в стиле тирамису',
    descriptionUz:
      "Kakao sepilgan nozik krem qatlamlari, ustida apelsin va shokolad. Achchiq kofe bilan ayni muddao.",
    descriptionRu:
      'Нежные кремовые слои, присыпанные какао, сверху апельсин и шоколад. Идеально с крепким кофе.',
    ingredientsUz: ['Biskvit', 'Qaymoqli krem', 'Kakao', 'Apelsin', 'Shokolad'],
    ingredientsRu: ['Бисквит', 'Сливочный крем', 'Какао', 'Апельсин', 'Шоколад'],
    price: 180000,
    oldPrice: 205000,
    allowText: true,
    sortOrder: 3,
  },
];

// ---------------------------------------------------------------
// Storylar (Mini App bosh sahifasidagi doiralar)
// ---------------------------------------------------------------
const STORIES = [
  {
    image: 'toy-tortlari-story.jpg',
    titleUz: "To'y tortlari",
    titleRu: 'Свадебные торты',
    textUz: "To'y, nikoh va yubileylar uchun ikki qavatli katta tortlar. Bezakni o'zingiz tanlaysiz 💍",
    textRu: 'Большие двухъярусные торты для свадьбы, никоха и юбилея. Декор выбираете вы 💍',
    sortOrder: 1,
  },
  {
    image: 'paw-patrol-torti.jpg',
    titleUz: 'Bolalar bayrami',
    titleRu: 'Детский праздник',
    textUz: "Sevimli multfilm qahramonlari bilan bezatilgan tortlar. Bolangizning ismini tort ustiga yozib beramiz 🧸",
    textRu: 'Торты с любимыми героями мультфильмов. Имя вашего ребёнка напишем прямо на торте 🧸',
    sortOrder: 2,
  },
  {
    image: 'karamel-mevali-tort.jpg',
    titleUz: 'Yetkazib berish',
    titleRu: 'Доставка',
    textUz: "300 000 so'mdan yuqori buyurtmalarga yetkazib berish BEPUL 🚗",
    textRu: 'Бесплатная доставка при заказе от 300 000 сум 🚗',
    sortOrder: 3,
  },
  {
    image: 'pushti-happy-birthday.jpg',
    titleUz: 'Biz haqimizda',
    titleRu: 'О нас',
    textUz: "Har bir tort buyurtmadan keyin yangidan pishiriladi: tabiiy qaymoq, yangi mevalar, konservantsiz 💛",
    textRu: 'Каждый торт печём после заказа: натуральные сливки, свежие фрукты, без консервантов 💛',
    sortOrder: 4,
  },
];

// ---------------------------------------------------------------
// Rasmlarni bazaga yuklash
// ---------------------------------------------------------------
/** Faylni "images" jadvaliga yozadi va manzilini qaytaradi */
async function uploadImage(fileName) {
  const filePath = path.join(IMAGES_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Rasm topilmadi: ${fileName}`);
    return '';
  }

  const buffer = fs.readFileSync(filePath);
  const id = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);

  const existing = await prisma.image.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    await prisma.image.create({
      data: { id, mimeType: 'image/jpeg', width: 1200, height: 1200, size: buffer.length, data: buffer },
    });
  }

  return `/api/images/${id}.jpg`;
}

async function main() {
  console.log('\n🌱 Seed boshlandi...\n');

  // 0. Rasmlar
  const imageUrls = {};
  const fileNames = [...new Set([...PRODUCTS, ...STORIES].map((item) => item.image))];
  for (const fileName of fileNames) {
    imageUrls[fileName] = await uploadImage(fileName);
  }
  console.log(`  ✓ ${fileNames.length} ta rasm bazaga yuklandi\n`);

  // 1. Eski katalogni tozalash (buyurtmalar va mijozlarga tegilmaydi)
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.story.deleteMany();
  console.log('  ✓ Eski katalog tozalandi\n');

  // 2. Kategoriyalar
  const categoryMap = {};
  for (const item of CATEGORIES) {
    const category = await prisma.category.create({ data: item });
    categoryMap[item.slug] = category.id;
    console.log(`  ✓ Kategoriya: ${category.emoji} ${category.nameUz}`);
  }

  // 3. Mahsulotlar
  console.log('');
  for (const item of PRODUCTS) {
    const { category, image, ...data } = item;
    await prisma.product.create({
      data: {
        ...data,
        imageUrl: imageUrls[image] || '',
        unit: 'kg',
        weightOptions: CAKE_OPTIONS,
        categoryId: categoryMap[category],
      },
    });
    console.log(`  ✓ ${data.nameUz} — ${data.price.toLocaleString('ru-RU')} so'm/kg`);
  }

  // 4. Storylar
  console.log('');
  for (const item of STORIES) {
    const { image, ...data } = item;
    await prisma.story.create({ data: { ...data, imageUrl: imageUrls[image] || '' } });
    console.log(`  ✓ Story: ${data.titleUz}`);
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    stories: await prisma.story.count(),
    images: await prisma.image.count(),
  };

  console.log(
    `\n✅ Tayyor! Kategoriya: ${counts.categories} | Mahsulot: ${counts.products} | ` +
      `Story: ${counts.stories} | Rasm: ${counts.images}\n`
  );
}

main()
  .catch((err) => {
    console.error('❌ Seed xatosi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
