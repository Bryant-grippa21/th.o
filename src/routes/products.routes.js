const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadProductImage, uploadProductImages } = require('../middlewares/upload.middleware');
const {
  getCategories,
  getSubcategoriesByCategory,
  getManagedSubcategories,
  getManagedLines,
  getLineReferences,
  getManagedProducts,
  getManagedProductDetail,
  getManagedProductStockHistory,
  getPublicCatalog,
  getPublicProduct,
  getPublicProductBySku,
  createCategoryManual,
  updateCategoryManual,
  toggleCategoryStatusManual,
  createSubcategoryManual,
  updateSubcategoryManual,
  toggleSubcategoryStatusManual,
  createProductManual,
  addVariantManual,
  updateProductManual,
  toggleProductStatusManual,
  adjustProductStockManual,
  deleteProductImageManual,
  updateVariantManual,
  syncVariantStock
} = require('../controllers/products.controller');

const router = express.Router();

router.get('/catalog', getPublicCatalog);
router.get('/catalog/sku/:sku', getPublicProductBySku);
router.get('/catalog/:productId', getPublicProduct);
router.get('/categories', getCategories);
router.get('/categories/:categoryId/subcategories', getSubcategoriesByCategory);
router.get('/management/subcategories', verifyToken, getManagedSubcategories);
router.get('/management/lines', verifyToken, getManagedLines);
router.get('/management/line-references', verifyToken, getLineReferences);
router.get('/management/products', verifyToken, getManagedProducts);
router.get('/management/products/:productId', verifyToken, getManagedProductDetail);
router.get('/management/products/:productId/stock-history', verifyToken, getManagedProductStockHistory);

router.post('/categories', verifyToken, createCategoryManual);
router.put('/categories/:categoryId', verifyToken, updateCategoryManual);
router.put('/categories/:categoryId/status', verifyToken, toggleCategoryStatusManual);
router.post('/subcategories', verifyToken, createSubcategoryManual);
router.put('/subcategories/:subcategoryId', verifyToken, updateSubcategoryManual);
router.put('/subcategories/:subcategoryId/status', verifyToken, toggleSubcategoryStatusManual);

router.post('/', verifyToken, uploadProductImages, createProductManual);
router.post('/:productId/variants', verifyToken, uploadProductImage.single('image'), addVariantManual);

router.put('/:productId', verifyToken, uploadProductImages, updateProductManual);
router.put('/:productId/status', verifyToken, toggleProductStatusManual);
router.put('/:productId/stock', verifyToken, adjustProductStockManual);
router.delete('/:productId/images/:imageId', verifyToken, deleteProductImageManual);
router.put('/variants/:variantId', verifyToken, updateVariantManual);
router.put('/variants/:variantId/stock', verifyToken, syncVariantStock);

module.exports = router;