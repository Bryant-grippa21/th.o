const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');

const MAX_SECONDARY_PRODUCT_IMAGES = 7;

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const customerDir = path.join(__dirname, '../../public/uploads/profiles/customers');
const companyDir = path.join(__dirname, '../../public/uploads/profiles/companies');
const productDir = path.join(__dirname, '../../public/uploads/products');
const purchaseEvidenceDir = path.join(__dirname, '../../public/uploads/purchases/evidences');
const companyLegalDocumentsDir = path.join(__dirname, '../../public/uploads/company/legal-documents');

ensureDir(customerDir);
ensureDir(companyDir);
ensureDir(productDir);
ensureDir(purchaseEvidenceDir);
ensureDir(companyLegalDocumentsDir);

const companyLegalMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

const createFileFilter = (allowedMimeTypes, errorMessage) => (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error(errorMessage));
    return;
  }

  cb(null, true);
};

const createStorage = (folder, prefix) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const userId = req.user?.id || Date.now();
      const uniqueSuffix = randomUUID();
      const filename = `${prefix}_${userId}_${Date.now()}_${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  });

const uploadCustomerImage = multer({
  storage: createStorage(customerDir, 'customer'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadCompanyImage = multer({
  storage: createStorage(companyDir, 'company'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadProductImage = multer({
  storage: createStorage(productDir, 'product'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadPurchaseEvidence = multer({
  storage: createStorage(purchaseEvidenceDir, 'purchase_evidence'),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const uploadCompanyLegalDocuments = multer({
  storage: createStorage(companyLegalDocumentsDir, 'company_legal_document'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: createFileFilter(companyLegalMimeTypes, 'Solo se permiten imagenes y archivos PDF')
});

const uploadProductImages = uploadProductImage.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'secondary_images', maxCount: MAX_SECONDARY_PRODUCT_IMAGES }
]);

const importSpreadsheetMimeTypes = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
  'application/octet-stream'
]);

const uploadImportSpreadsheet = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: createFileFilter(importSpreadsheetMimeTypes, 'Solo se permiten archivos Excel o CSV')
});

module.exports = {
  uploadCustomerImage,
  uploadCompanyImage,
  uploadProductImage,
  uploadProductImages,
  uploadImportSpreadsheet,
  uploadPurchaseEvidence,
  uploadCompanyLegalDocuments
};