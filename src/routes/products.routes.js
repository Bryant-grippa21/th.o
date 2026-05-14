const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadProductImage } = require('../middlewares/upload.middleware');
const {
  getCategories,
  getSubcategoriesByCategory,
  getManagedSubcategories,
  getManagedLines,
  getManagedProducts,
  getPublicCatalog,
  getPublicProduct,
  createCategoryManual,
  updateCategoryManual,
  toggleCategoryStatusManual,
  createSubcategoryManual,
  updateSubcategoryManual,
  toggleSubcategoryStatusManual,
  createProductManual,
  addVariantManual,
  updateProductManual,
  toggleLineStatusManual,
  updateVariantManual,
  syncVariantStock
} = require('../controllers/products.controller');

const router = express.Router();

router.get('/catalog', getPublicCatalog);
router.get('/catalog/:productId', getPublicProduct);
router.get('/categories', getCategories);
router.get('/categories/:categoryId/subcategories', getSubcategoriesByCategory);
router.get('/management/subcategories', verifyToken, getManagedSubcategories);
router.get('/management/lines', verifyToken, getManagedLines);
router.get('/management/products', verifyToken, getManagedProducts);

router.post('/categories', verifyToken, createCategoryManual);
router.put('/categories/:categoryId', verifyToken, updateCategoryManual);
router.put('/categories/:categoryId/status', verifyToken, toggleCategoryStatusManual);
router.post('/subcategories', verifyToken, createSubcategoryManual);
router.put('/subcategories/:subcategoryId', verifyToken, updateSubcategoryManual);
router.put('/subcategories/:subcategoryId/status', verifyToken, toggleSubcategoryStatusManual);

router.post('/', verifyToken, uploadProductImage.single('image'), createProductManual);
router.post('/:productId/variants', verifyToken, uploadProductImage.single('image'), addVariantManual);

router.put('/:productId', verifyToken, updateProductManual);
router.put('/:productId/status', verifyToken, toggleLineStatusManual);
router.put('/variants/:variantId', verifyToken, updateVariantManual);
router.put('/variants/:variantId/stock', verifyToken, syncVariantStock);

module.exports = router;