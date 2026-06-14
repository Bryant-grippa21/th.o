const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadPurchaseEvidence } = require('../middlewares/upload.middleware');
const {
  createCustomerCheckout,
  getCustomerCheckouts,
  getAdminCheckouts,
  createCustomerPurchaseEvidence,
  getCompanyPurchaseGroups,
  getCompanyMethods,
  createCompanyMethod,
  updateCompanyMethod,
  deleteCompanyMethod,
  approveCompanyPurchaseGroup,
  rejectCompanyPurchaseGroup,
  expireCompanyPurchaseGroup,
  updateCompanyPurchaseGroupDelivery
} = require('../controllers/purchase.controller');

const router = express.Router();

router.post('/checkout', verifyToken, createCustomerCheckout);
router.get('/my-checkouts', verifyToken, getCustomerCheckouts);
router.get('/admin/checkouts', verifyToken, getAdminCheckouts);
router.post(
  '/groups/:groupId/evidence',
  verifyToken,
  uploadPurchaseEvidence.single('evidence'),
  createCustomerPurchaseEvidence
);

router.get('/company/groups', verifyToken, getCompanyPurchaseGroups);
router.get('/company/payment-methods', verifyToken, getCompanyMethods);
router.post('/company/payment-methods', verifyToken, createCompanyMethod);
router.put('/company/payment-methods/:paymentMethodId', verifyToken, updateCompanyMethod);
router.delete('/company/payment-methods/:paymentMethodId', verifyToken, deleteCompanyMethod);
router.post('/company/groups/:groupId/approve', verifyToken, approveCompanyPurchaseGroup);
router.post('/company/groups/:groupId/reject', verifyToken, rejectCompanyPurchaseGroup);
router.post('/company/groups/:groupId/expire', verifyToken, expireCompanyPurchaseGroup);
router.put('/company/groups/:groupId/delivery', verifyToken, updateCompanyPurchaseGroupDelivery);

module.exports = router;