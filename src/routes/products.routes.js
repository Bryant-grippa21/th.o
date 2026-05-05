const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadProductImage } = require('../middlewares/upload.middleware');
const {
  getCategories,
  getSubcategoriesByCategory,
  getPublicCatalog,
  getPublicProduct,
  createCategoryManual,
  createSubcategoryManual,
  createProductManual,
  addVariantManual,
  updateProductManual,
  updateVariantManual,
  syncVariantStock
} = require('../controllers/products.controller');

const router = express.Router();

router.get('/catalog', getPublicCatalog);
router.get('/catalog/:productId', getPublicProduct);
router.get('/categories', getCategories);
router.get('/categories/:categoryId/subcategories', getSubcategoriesByCategory);

router.post('/categories', verifyToken, createCategoryManual);
router.post('/subcategories', verifyToken, createSubcategoryManual);

router.post('/', verifyToken, uploadProductImage.single('image'), createProductManual);
router.post('/:productId/variants', verifyToken, uploadProductImage.single('image'), addVariantManual);

router.put('/:productId', verifyToken, updateProductManual);
router.put('/variants/:variantId', verifyToken, updateVariantManual);
router.put('/variants/:variantId/stock', verifyToken, syncVariantStock);

module.exports = router;