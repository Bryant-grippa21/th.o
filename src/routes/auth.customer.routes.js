const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadCustomerImage } = require('../middlewares/upload.middleware');

const {
  registerLocal,
  loginLocal,
  loginGoogle,
  getProfile,
  updateProfile,
  updateCustomerProfileImage
} = require('../controllers/auth.customer.controller');

router.post('/register', registerLocal);
router.post('/login', loginLocal);
router.post('/google', loginGoogle);

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/profile/image', verifyToken, uploadCustomerImage.single('image'), updateCustomerProfileImage);

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;