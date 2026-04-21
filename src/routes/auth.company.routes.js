const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadCompanyImage } = require('../middlewares/upload.middleware');

const {
  registerLocalCompany,
  loginLocalCompany,
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanyProfileImage
} = require('../controllers/auth.company.controller');

router.post('/register', registerLocalCompany);
router.post('/login', loginLocalCompany);
router.get('/me', verifyToken, getCompanyProfile);
router.get('/profile', verifyToken, getCompanyProfile);
router.put('/profile', verifyToken, updateCompanyProfile);
router.put('/profile/image', verifyToken, uploadCompanyImage.single('image'), updateCompanyProfileImage);

module.exports = router;