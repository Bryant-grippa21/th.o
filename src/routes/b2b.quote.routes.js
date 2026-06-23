const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const {
  createRetailerDraft,
  getRetailerDrafts,
  getRetailerDraft,
  addRetailerDraftItem,
  submitRetailerDraft,
  getIncomingWholesalerQuotes,
  getOutgoingRetailerQuotes,
  getCompanyQuoteDetail,
  respondWholesalerQuote,
  acceptRetailerQuote,
  rejectRetailerQuote,
  submitRetailerPaymentEvidence,
  reviewWholesalerPaymentEvidence,
  submitRetailerCart
} = require('../controllers/b2b.quote.controller');
const { uploadB2BEvidence } = require('../middlewares/upload.middleware');
const {
  getRetailerCartHandler,
  setRetailerCartItemHandler,
  removeRetailerCartItemHandler,
  updateRetailerCartGroupHandler,
  clearRetailerCartHandler
} = require('../controllers/b2b.retailer.cart.controller');

const router = express.Router();

router.post('/drafts', verifyToken, createRetailerDraft);
router.get('/drafts/my', verifyToken, getRetailerDrafts);
router.get('/drafts/:draftId', verifyToken, getRetailerDraft);
router.post('/drafts/:draftId/items', verifyToken, addRetailerDraftItem);
router.put('/drafts/:draftId/submit', verifyToken, submitRetailerDraft);

router.post('/retailer-cart/submit', verifyToken, submitRetailerCart);

router.get('/retailer-cart', verifyToken, getRetailerCartHandler);
router.put('/retailer-cart/items', verifyToken, setRetailerCartItemHandler);
router.delete('/retailer-cart/items/:productId', verifyToken, removeRetailerCartItemHandler);
router.patch('/retailer-cart/groups/:companyId', verifyToken, updateRetailerCartGroupHandler);
router.delete('/retailer-cart', verifyToken, clearRetailerCartHandler);

router.get('/quotes/incoming', verifyToken, getIncomingWholesalerQuotes);
router.get('/quotes/outgoing', verifyToken, getOutgoingRetailerQuotes);
router.get('/quotes/:quoteId', verifyToken, getCompanyQuoteDetail);
router.put('/quotes/:quoteId/respond', verifyToken, respondWholesalerQuote);
router.put('/quotes/:quoteId/accept', verifyToken, acceptRetailerQuote);
router.put('/quotes/:quoteId/reject', verifyToken, rejectRetailerQuote);
router.post('/quotes/:quoteId/payment-evidences', verifyToken, uploadB2BEvidence.single('evidence'), submitRetailerPaymentEvidence);
router.put('/quotes/:quoteId/payment-evidences/:evidenceId/review', verifyToken, reviewWholesalerPaymentEvidence);

module.exports = router;
