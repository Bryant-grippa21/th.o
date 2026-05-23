const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadPurchaseEvidence } = require('../middlewares/upload.middleware');
const {
  createCustomerCheckout,
  getCustomerCheckouts,
  createCustomerPurchaseEvidence,
  getCompanyPurchaseGroups,
  getCompanyMethods,
  createCompanyMethod,
  approveCompanyPurchaseGroup,
  rejectCompanyPurchaseGroup,
  expireCompanyPurchaseGroup
} = require('../controllers/purchase.controller');

const router = express.Router();

router.post('/checkout', verifyToken, createCustomerCheckout);
router.get('/my-checkouts', verifyToken, getCustomerCheckouts);
router.post(
  '/groups/:groupId/evidence',
  verifyToken,
  uploadPurchaseEvidence.single('evidence'),
  createCustomerPurchaseEvidence
);

router.get('/company/groups', verifyToken, getCompanyPurchaseGroups);
router.get('/company/payment-methods', verifyToken, getCompanyMethods);
router.post('/company/payment-methods', verifyToken, createCompanyMethod);
router.post('/company/groups/:groupId/approve', verifyToken, approveCompanyPurchaseGroup);
router.post('/company/groups/:groupId/reject', verifyToken, rejectCompanyPurchaseGroup);
router.post('/company/groups/:groupId/expire', verifyToken, expireCompanyPurchaseGroup);

module.exports = router;