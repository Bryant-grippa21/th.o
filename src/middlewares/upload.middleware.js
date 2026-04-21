const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const customerDir = path.join(__dirname, '../../public/uploads/profiles/customers');
const companyDir = path.join(__dirname, '../../public/uploads/profiles/companies');

ensureDir(customerDir);
ensureDir(companyDir);

const createStorage = (folder, prefix) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const userId = req.user?.id || Date.now();
      const filename = `${prefix}_${userId}_${Date.now()}${ext}`;
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

module.exports = {
  uploadCustomerImage,
  uploadCompanyImage
};