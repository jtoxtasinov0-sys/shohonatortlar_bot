/**
 * Mini App (mijozlar) uchun API yo'llari.
 * Bazaviy manzil: /api/client
 */
const express = require('express');
const controller = require('../controllers/cartController');
const { telegramAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Ochiq: katalogni ko'rish uchun avtorizatsiya shart emas
router.get('/catalog', controller.getCatalog);

// Himoyalangan: Telegram initData tekshiriladi
router.get('/me', telegramAuth, controller.getMe);
router.patch('/me', telegramAuth, controller.updateMe);
router.get('/orders', telegramAuth, controller.getMyOrders);
router.post('/orders', telegramAuth, controller.createOrder);

module.exports = router;
