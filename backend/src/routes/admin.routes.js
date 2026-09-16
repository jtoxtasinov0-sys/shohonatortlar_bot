/**
 * Admin Panel uchun API yo'llari.
 * Bazaviy manzil: /api/admin
 */
const express = require('express');
const controller = require('../controllers/adminController');
const { adminAuth } = require('../middlewares/auth.middleware');
const { invalidateCatalog } = require('../controllers/cartController');

const router = express.Router();

// Ochiq
router.post('/login', controller.login);

// Quyidagilarning hammasi token talab qiladi
router.use(adminAuth);

// Katalogga tegadigan har qanday o'zgarish (POST/PUT/DELETE) keshni tozalaydi,
// shunda Mini App yangi ma'lumotni darhol ko'radi.
router.use((req, res, next) => {
  if (req.method !== 'GET') {
    res.on('finish', () => {
      if (res.statusCode < 400) invalidateCatalog();
    });
  }
  next();
});

router.get('/stats', controller.getStats);

// Buyurtmalar
router.get('/orders', controller.getOrders);
router.patch('/orders/:id/status', controller.updateOrderStatus);
router.delete('/orders/:id', controller.deleteOrder);

// Mahsulotlar
router.get('/products', controller.getProducts);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

// Kategoriyalar
router.get('/categories', controller.getCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

// Storylar
router.get('/stories', controller.getStories);
router.post('/stories', controller.createStory);
router.put('/stories/:id', controller.updateStory);
router.delete('/stories/:id', controller.deleteStory);

// Mijozlar
router.get('/users', controller.getUsers);

module.exports = router;
