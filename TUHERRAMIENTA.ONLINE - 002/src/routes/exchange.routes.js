const express = require('express');

const { verifyToken } = require('../middlewares/auth.middleware');
const {
  getPublicLatestExchangeRate,
  createAdminExchangeRate,
  listAdminExchangeRates
} = require('../controllers/exchange.controller');

const router = express.Router();

router.get('/latest', getPublicLatestExchangeRate);
router.get('/', verifyToken, listAdminExchangeRates);
router.post('/', verifyToken, createAdminExchangeRate);

module.exports = router;