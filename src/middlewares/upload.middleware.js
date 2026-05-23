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

ensureDir(customerDir);
ensureDir(companyDir);
ensureDir(productDir);
ensureDir(purchaseEvidenceDir);

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
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadPurchaseEvidence = multer({
  storage: createStorage(purchaseEvidenceDir, 'purchase_evidence'),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const uploadProductImages = uploadProductImage.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'secondary_images', maxCount: MAX_SECONDARY_PRODUCT_IMAGES }
]);

module.exports = {
  uploadCustomerImage,
  uploadCompanyImage,
  uploadProductImage,
  uploadProductImages,
  uploadPurchaseEvidence
};