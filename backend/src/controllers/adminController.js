/**
 * Admin Panel uchun API logikasi (CRUD).
 */
const { Prisma } = require('@prisma/client');
const config = require('../config/default');
const ProductModel = require('../models/Product');
const CategoryModel = require('../models/Category');
const OrderModel = require('../models/Order');
const StoryModel = require('../models/Story');
const UserModel = require('../models/User');
const ImageModel = require('../models/Image');
const { sendMessage } = require('../core/bot');
const { t } = require('../utils/i18n');
const { formatOrderNumber } = require('../utils/helpers');

const ORDER_STATUSES = ['new', 'confirmed', 'delivering', 'done', 'canceled'];

const toInt = (value, fallback = 0) => {
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : fallback;
};

const toBool = (value) => value === true || value === 'true' || value === 1 || value === '1';

const toArray = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[\n,;]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

// ---------------------------------------------------------------
// Login
// ---------------------------------------------------------------
function login(req, res) {
  const { password } = req.body || {};
  if (!password || password !== config.admin.password) {
    return res.status(401).json({ ok: false, error: "Parol noto'g'ri" });
  }
  res.json({ ok: true, token: config.admin.token, shopName: config.shop.name });
}

// ---------------------------------------------------------------
// Statistika
// ---------------------------------------------------------------
async function getStats(req, res, next) {
  try {
    const [stats, products, users] = await Promise.all([
      OrderModel.stats(),
      ProductModel.count(),
      UserModel.count(),
    ]);
    res.json({ ok: true, stats: { ...stats, totalProducts: products, totalUsers: users } });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------
// Buyurtmalar
// ---------------------------------------------------------------
async function getOrders(req, res, next) {
  try {
    const orders = await OrderModel.listAll({
      status: req.query.status,
      search: req.query.search,
      take: toInt(req.query.take, 200),
    });
    res.json({ ok: true, orders: orders.map((o) => ({ ...o, number: formatOrderNumber(o.id) })) });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ ok: false, error: "Noto'g'ri holat" });
    }

    const order = await OrderModel.updateStatus(req.params.id, status);

    // Mijozga holat o'zgargani haqida xabar
    if (order.user?.telegramId && ['confirmed', 'delivering', 'done', 'canceled'].includes(status)) {
      const texts = t(order.user.language);
      await sendMessage(
        order.user.telegramId,
        texts.statusChanged(formatOrderNumber(order.id), texts.statuses[status])
      );
    }

    res.json({ ok: true, order: { ...order, number: formatOrderNumber(order.id) } });
  } catch (err) {
    next(err);
  }
}

async function deleteOrder(req, res, next) {
  try {
    await OrderModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------
// Mahsulotlar (CRUD)
// ---------------------------------------------------------------
function buildProductData(body = {}) {
  const data = {
    nameUz: String(body.nameUz || '').trim(),
    nameRu: String(body.nameRu || '').trim(),
    descriptionUz: String(body.descriptionUz || '').trim(),
    descriptionRu: String(body.descriptionRu || '').trim(),
    ingredientsUz: toArray(body.ingredientsUz),
    ingredientsRu: toArray(body.ingredientsRu),
    imageUrl: String(body.imageUrl || '').trim(),
    price: toInt(body.price, 0),
    oldPrice: body.oldPrice ? toInt(body.oldPrice, 0) : null,
    unit: String(body.unit || 'dona'),
    allowText: toBool(body.allowText),
    isPopular: toBool(body.isPopular),
    isUpsell: toBool(body.isUpsell),
    isActive: body.isActive === undefined ? true : toBool(body.isActive),
    sortOrder: toInt(body.sortOrder, 0),
    categoryId: toInt(body.categoryId, 0),
  };

  // Vazn variantlari (tortlar uchun). Prisma'da Json maydonni bo'shatish
  // uchun oddiy null emas, Prisma.DbNull ishlatiladi.
  if (Array.isArray(body.weightOptions) && body.weightOptions.length) {
    data.weightOptions = body.weightOptions
      .filter((o) => o && o.label)
      .map((o) => ({ label: String(o.label), multiplier: Number(o.multiplier) || 1 }));
  } else {
    data.weightOptions = Prisma.DbNull;
  }

  if (data.oldPrice && data.oldPrice <= data.price) data.oldPrice = null;
  return data;
}

async function getProducts(req, res, next) {
  try {
    const products = await ProductModel.listAll();
    res.json({ ok: true, products });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const data = buildProductData(req.body);
    if (!data.nameUz || !data.nameRu) {
      return res.status(400).json({ ok: false, error: 'Nomi (uz va ru) kiritilishi shart' });
    }
    if (!data.categoryId) {
      return res.status(400).json({ ok: false, error: 'Kategoriya tanlanmagan' });
    }
    if (data.price <= 0) {
      return res.status(400).json({ ok: false, error: "Narx noto'g'ri" });
    }
    const product = await ProductModel.create(data);
    res.json({ ok: true, product });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await ProductModel.update(req.params.id, buildProductData(req.body));
    res.json({ ok: true, product });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await ProductModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------
// Kategoriyalar (CRUD)
// ---------------------------------------------------------------
function buildCategoryData(body = {}) {
  return {
    slug:
      String(body.slug || body.nameUz || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `cat-${Date.now()}`,
    nameUz: String(body.nameUz || '').trim(),
    nameRu: String(body.nameRu || '').trim(),
    emoji: String(body.emoji || '🍰').trim(),
    sortOrder: toInt(body.sortOrder, 0),
    isActive: body.isActive === undefined ? true : toBool(body.isActive),
  };
}

async function getCategories(req, res, next) {
  try {
    res.json({ ok: true, categories: await CategoryModel.listAll() });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const data = buildCategoryData(req.body);
    if (!data.nameUz || !data.nameRu) {
      return res.status(400).json({ ok: false, error: 'Nomi (uz va ru) kiritilishi shart' });
    }
    res.json({ ok: true, category: await CategoryModel.create(data) });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    res.json({ ok: true, category: await CategoryModel.update(req.params.id, buildCategoryData(req.body)) });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await CategoryModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------
// Storylar (CRUD)
// ---------------------------------------------------------------
function buildStoryData(body = {}) {
  return {
    titleUz: String(body.titleUz || '').trim(),
    titleRu: String(body.titleRu || '').trim(),
    textUz: String(body.textUz || '').trim(),
    textRu: String(body.textRu || '').trim(),
    imageUrl: String(body.imageUrl || '').trim(),
    sortOrder: toInt(body.sortOrder, 0),
    isActive: body.isActive === undefined ? true : toBool(body.isActive),
  };
}

async function getStories(req, res, next) {
  try {
    res.json({ ok: true, stories: await StoryModel.listAll() });
  } catch (err) {
    next(err);
  }
}

async function createStory(req, res, next) {
  try {
    const data = buildStoryData(req.body);
    if (!data.titleUz || !data.titleRu) {
      return res.status(400).json({ ok: false, error: 'Sarlavha (uz va ru) kiritilishi shart' });
    }
    res.json({ ok: true, story: await StoryModel.create(data) });
  } catch (err) {
    next(err);
  }
}

async function updateStory(req, res, next) {
  try {
    res.json({ ok: true, story: await StoryModel.update(req.params.id, buildStoryData(req.body)) });
  } catch (err) {
    next(err);
  }
}

async function deleteStory(req, res, next) {
  try {
    await StoryModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------
// Rasm yuklash (telefon galereyasidan yoki kameradan)
// ---------------------------------------------------------------
/** "data:image/jpeg;base64,AAA..." satrini baytlarga aylantiradi */
function parseDataUrl(value) {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    String(value || '').trim()
  );
  if (!match) return null;

  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length) return null;

  return {
    mimeType: match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase(),
    buffer,
  };
}

/**
 * POST /api/admin/upload
 * Admin panel rasmni (galereyadan tanlangan faylni) shu yerga yuboradi,
 * javobida esa mahsulotga yoziladigan manzil qaytadi.
 */
async function uploadImage(req, res, next) {
  try {
    const parsed = parseDataUrl(req.body && req.body.dataUrl);
    if (!parsed) {
      return res.status(400).json({
        ok: false,
        error: 'Rasm formati mos emas — JPG, PNG yoki WebP yuboring',
      });
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (parsed.buffer.length > MAX_BYTES) {
      return res.status(413).json({ ok: false, error: "Rasm juda katta (5 MB gacha bo'lsin)" });
    }

    const { id } = await ImageModel.save(parsed.buffer, {
      mimeType: parsed.mimeType,
      width: toInt(req.body && req.body.width, 0),
      height: toInt(req.body && req.body.height, 0),
    });

    res.json({ ok: true, id, url: ImageModel.urlFor(id) });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------
// Mijozlar
// ---------------------------------------------------------------
async function getUsers(req, res, next) {
  try {
    res.json({ ok: true, users: await UserModel.list({ take: 200 }) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  getStats,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStories,
  createStory,
  updateStory,
  deleteStory,
  getUsers,
  uploadImage,
};
