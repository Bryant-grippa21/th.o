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
  updateCustomerProfileImage,
  getCustomerFavorites,
  addCustomerFavorite,
  removeCustomerFavorite,
  getCustomerCart,
  setCustomerCartItem,
  removeCustomerCartItem,
  clearCustomerCart,
  getAdminCustomers,
  updateAdminCustomerStatus,
  updateAdminCustomerBasic,
  resetAdminCustomerAttempts,
  updateAdminCustomerPassword
} = require('../controllers/auth.customer.controller');

router.post('/register', registerLocal);
router.post('/login', loginLocal);
router.post('/google', loginGoogle);
router.get('/admin/customers', verifyToken, getAdminCustomers);
router.put('/admin/customers/:customerId/status', verifyToken, updateAdminCustomerStatus);
router.put('/admin/customers/:customerId/basic', verifyToken, updateAdminCustomerBasic);
router.put('/admin/customers/:customerId/attempts/reset', verifyToken, resetAdminCustomerAttempts);
router.put('/admin/customers/:customerId/password', verifyToken, updateAdminCustomerPassword);

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/profile/image', verifyToken, uploadCustomerImage.single('image'), updateCustomerProfileImage);
router.get('/favorites', verifyToken, getCustomerFavorites);
router.post('/favorites', verifyToken, addCustomerFavorite);
router.delete('/favorites/:productId', verifyToken, removeCustomerFavorite);
router.get('/cart', verifyToken, getCustomerCart);
router.put('/cart/items', verifyToken, setCustomerCartItem);
router.delete('/cart/items/:productId', verifyToken, removeCustomerCartItem);
router.delete('/cart', verifyToken, clearCustomerCart);

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;