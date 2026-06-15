const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadImportSpreadsheet, uploadProductImages } = require('../middlewares/upload.middleware');
const {
  uploadProductImportBatch,
  getProductImportBatchDetail,
  listProductImportBatches,
  updateProductImportBatchRow,
  uploadProductImportBatchRowImages,
  approveProductImportBatch,
  publishProductImportBatch,
  deleteProductImportBatch,
  downloadProductImportTemplate
} = require('../controllers/product.import.controller');

const router = express.Router();

const handleImportRowImagesUpload = (req, res, next) => {
  uploadProductImages(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: error.message || 'Error al subir imágenes' });
    }

    return next();
  });
};

router.get('/template', verifyToken, downloadProductImportTemplate);
router.get('/batches', verifyToken, listProductImportBatches);
router.post('/batches', verifyToken, uploadImportSpreadsheet.single('file'), uploadProductImportBatch);
router.get('/batches/:batchId', verifyToken, getProductImportBatchDetail);
router.delete('/batches/:batchId', verifyToken, deleteProductImportBatch);
router.patch('/batches/:batchId/rows/:rowNumber', verifyToken, updateProductImportBatchRow);
router.post('/batches/:batchId/rows/:rowNumber/images', verifyToken, handleImportRowImagesUpload, uploadProductImportBatchRowImages);
router.post('/batches/:batchId/approve', verifyToken, approveProductImportBatch);
router.post('/batches/:batchId/publish', verifyToken, publishProductImportBatch);

module.exports = router;
