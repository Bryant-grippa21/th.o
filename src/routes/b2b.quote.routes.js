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
  dispatchWholesalerQuote,
  confirmRetailerQuoteDelivery,
  submitRetailerPaymentEvidence,
  reviewWholesalerPaymentEvidence
} = require('../controllers/b2b.quote.controller');

const router = express.Router();

router.post('/drafts', verifyToken, createRetailerDraft);
router.get('/drafts/my', verifyToken, getRetailerDrafts);
router.get('/drafts/:draftId', verifyToken, getRetailerDraft);
router.post('/drafts/:draftId/items', verifyToken, addRetailerDraftItem);
router.put('/drafts/:draftId/submit', verifyToken, submitRetailerDraft);

router.get('/quotes/incoming', verifyToken, getIncomingWholesalerQuotes);
router.get('/quotes/outgoing', verifyToken, getOutgoingRetailerQuotes);
router.get('/quotes/:quoteId', verifyToken, getCompanyQuoteDetail);
router.put('/quotes/:quoteId/respond', verifyToken, respondWholesalerQuote);
router.put('/quotes/:quoteId/accept', verifyToken, acceptRetailerQuote);
router.put('/quotes/:quoteId/reject', verifyToken, rejectRetailerQuote);
router.put('/quotes/:quoteId/delivery/dispatch', verifyToken, dispatchWholesalerQuote);
router.put('/quotes/:quoteId/delivery/confirm', verifyToken, confirmRetailerQuoteDelivery);
router.post('/quotes/:quoteId/payment-evidences', verifyToken, submitRetailerPaymentEvidence);
router.put('/quotes/:quoteId/payment-evidences/:evidenceId/review', verifyToken, reviewWholesalerPaymentEvidence);

module.exports = router;
