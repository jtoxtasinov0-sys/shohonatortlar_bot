/**
 * Mijoz (Mini App) uchun API logikasi:
 * katalog, profil, savatchani rasmiylashtirish, buyurtmalar tarixi.
 */
const config = require('../config/default');
const CategoryModel = require('../models/Category');
const ProductModel = require('../models/Product');
const OrderModel = require('../models/Order');
const UserModel = require('../models/User');
const StoryModel = require('../models/Story');
const cache = require('../utils/cache');
const { sendMessage } = require('../core/bot');
const { t } = require('../utils/i18n');
const { formatPrice, formatOrderNumber, itemsToText, escapeHtml, formatDate } = require('../utils/helpers');

/** Narxni 1000 so'mgacha yaxlitlash */
const roundPrice = (value) => Math.round(value / 1000) * 1000;

/** Katalog qancha vaqt keshda yashaydi (ms). Admin panel o'zgartirsa — darrov tozalanadi. */
const CATALOG_TTL = 5 * 60 * 1000;
const CATALOG_KEY = 'catalog';

/** Katalog o'zgarganda keshni tozalash (adminController chaqiradi) */
function invalidateCatalog() {
  cache.invalidate(CATALOG_KEY);
}

/** Katalog ma'lumotlarini bazadan yig'ish */
async function buildCatalog() {
  const [categories, products, stories] = await Promise.all([
    CategoryModel.listActive(),
    ProductModel.listActive(),
    StoryModel.listActive(),
  ]);

  return {
    ok: true,
    categories,
    products,
    stories,
    shop: {
      name: config.shop.name,
      phone: config.shop.phone,
      address: config.shop.address,
      workTime: config.shop.workTime,
      instagram: config.shop.instagram,
      deliveryFee: config.shop.deliveryFee,
      freeDeliveryFrom: config.shop.freeDeliveryFrom,
      minOrder: config.shop.minOrder,
    },
  };
}

/** GET /api/client/catalog — kategoriyalar + mahsulotlar + storylar (keshlanadi) */
async function getCatalog(req, res, next) {
  try {
    const payload = await cache.remember(CATALOG_KEY, CATALOG_TTL, buildCatalog);

    // Brauzer keshi: 60 soniya yangi, keyin 5 daqiqa davomida eskisini
    // ko'rsatib turib, orqa fonda yangilaydi — Mini App bir zumda ochiladi.
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

/** GET /api/client/me — joriy mijoz ma'lumotlari */
async function getMe(req, res, next) {
  try {
    res.json({ ok: true, user: req.user });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/client/me — til / ism / telefonni yangilash */
async function updateMe(req, res, next) {
  try {
    const { language, phone, firstName } = req.body || {};
    const data = {};
    if (language) data.language = language === 'ru' ? 'ru' : 'uz';
    if (phone) data.phone = String(phone).trim();
    if (firstName) data.firstName = String(firstName).trim();

    const user = Object.keys(data).length ? await UserModel.update(req.user.id, data) : req.user;
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
}

/** GET /api/client/orders — mijozning buyurtmalari */
async function getMyOrders(req, res, next) {
  try {
    const orders = await OrderModel.listByUser(req.user.id);
    res.json({ ok: true, orders });
  } catch (err) {
    next(err);
  }
}

/** POST /api/client/orders — yangi buyurtma */
async function createOrder(req, res, next) {
  try {
    const body = req.body || {};
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (!rawItems.length) {
      return res.status(400).json({ ok: false, error: "Savatcha bo'sh" });
    }

    // 1. Mahsulot narxlarini bazadan olamiz (frontenddan kelgan narxga ishonmaymiz)
    const ids = [...new Set(rawItems.map((i) => Number(i.productId)).filter(Boolean))];
    const products = await ProductModel.findManyByIds(ids);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = [];
    let subtotal = 0;

    for (const raw of rawItems) {
      const product = productMap.get(Number(raw.productId));
      if (!product || !product.isActive) continue;

      const qty = Math.max(1, Math.min(50, parseInt(raw.qty, 10) || 1));

      // Vazn varianti (tortlar uchun)
      let multiplier = 1;
      let optionLabel = null;
      const options = Array.isArray(product.weightOptions) ? product.weightOptions : [];
      if (options.length) {
        const found = options.find((o) => o.label === raw.option) || options[0];
        multiplier = Number(found.multiplier) || 1;
        optionLabel = found.label;
      }

      const unitPrice = roundPrice(product.price * multiplier);
      subtotal += unitPrice * qty;

      items.push({
        productId: product.id,
        nameUz: product.nameUz,
        nameRu: product.nameRu,
        imageUrl: product.imageUrl,
        option: optionLabel,
        unitPrice,
        qty,
        inscription: product.allowText && raw.inscription ? String(raw.inscription).slice(0, 120) : null,
      });
    }

    if (!items.length) {
      return res.status(400).json({ ok: false, error: 'Mahsulotlar topilmadi' });
    }

    if (subtotal < config.shop.minOrder) {
      return res.status(400).json({
        ok: false,
        error: `Minimal buyurtma summasi ${formatPrice(config.shop.minOrder)} so'm`,
      });
    }

    // 2. Yetkazib berish narxi
    const deliveryType = body.deliveryType === 'pickup' ? 'pickup' : 'delivery';
    let deliveryFee = 0;
    if (deliveryType === 'delivery' && subtotal < config.shop.freeDeliveryFrom) {
      deliveryFee = config.shop.deliveryFee;
    }

    const total = subtotal + deliveryFee;

    // 3. Mijoz ma'lumotlarini yangilaymiz
    const customerName = String(body.customerName || req.user.firstName || '').trim().slice(0, 80);
    const phone = String(body.phone || req.user.phone || '').trim().slice(0, 30);

    const userUpdate = {};
    if (phone && phone !== req.user.phone) userUpdate.phone = phone;
    if (customerName && customerName !== req.user.firstName) userUpdate.firstName = customerName;
    if (body.language) userUpdate.language = body.language === 'ru' ? 'ru' : 'uz';
    if (Object.keys(userUpdate).length) await UserModel.update(req.user.id, userUpdate);

    // 4. Buyurtmani saqlaymiz
    const order = await OrderModel.create({
      userId: req.user.id,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryType,
      address: deliveryType === 'delivery' ? String(body.address || '').trim().slice(0, 300) || null : null,
      landmark: String(body.landmark || '').trim().slice(0, 200) || null,
      latitude: body.latitude ? Number(body.latitude) : null,
      longitude: body.longitude ? Number(body.longitude) : null,
      customerName: customerName || null,
      phone: phone || null,
      deliveryDate: String(body.deliveryDate || '').slice(0, 20) || null,
      deliveryTime: String(body.deliveryTime || '').slice(0, 30) || null,
      comment: String(body.comment || '').trim().slice(0, 500) || null,
      paymentType: body.paymentType === 'card' ? 'card' : 'cash',
      status: 'new',
    });

    // 5. Mijozga botdan tasdiq xabari
    const lang = (body.language || req.user.language) === 'ru' ? 'ru' : 'uz';
    const texts = t(lang);
    const number = formatOrderNumber(order.id);
    const deliveryLine =
      deliveryType === 'delivery'
        ? `🚗 ${texts.delivery}: ${escapeHtml(order.address || '')}`
        : `🏠 ${texts.pickup}: ${escapeHtml(config.shop.address)}`;

    await sendMessage(
      req.user.telegramId,
      texts.orderAccepted({
        number,
        list: itemsToText(items, lang),
        total: formatPrice(total),
        deliveryLine,
      })
    );

    // 6. Admin guruhiga xabar (ixtiyoriy — ADMIN_CHAT_ID .env da bo'lsa)
    if (config.admin.chatId) {
      const when = [formatDate(order.deliveryDate), order.deliveryTime].filter(Boolean).join(' ');
      await sendMessage(
        config.admin.chatId,
        `🔔 <b>YANGI BUYURTMA ${number}</b>\n\n` +
          `👤 ${escapeHtml(customerName || '-')}\n` +
          `📱 ${escapeHtml(phone || '-')}\n\n` +
          `${itemsToText(items, 'uz')}\n\n` +
          `💰 Jami: <b>${formatPrice(total)} so'm</b>\n` +
          `${deliveryLine}\n` +
          (when ? `🕒 ${when}\n` : '') +
          (order.comment ? `💬 ${escapeHtml(order.comment)}` : '')
      );
    }

    res.json({ ok: true, order: { ...order, number } });
  } catch (err) {
    next(err);
  }
}

module.exports = { invalidateCatalog, getCatalog, getMe, updateMe, getMyOrders, createOrder };
