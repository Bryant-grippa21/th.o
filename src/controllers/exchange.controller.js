const {
  createExchangeRate,
  getLatestExchangeRate,
  listExchangeRates
} = require('../services/exchange.service');

const requireAdminCompany = (req, res) => {
  if (req.user?.entity !== 'company') {
    res.status(403).json({ error: 'Token no válido para admin' });
    return false;
  }

  if (req.user.id_role !== 1) {
    res.status(403).json({ error: 'Solo el admin puede realizar esta acción' });
    return false;
  }

  return true;
};

const getPublicLatestExchangeRate = async (_req, res) => {
  try {
    const exchangeRate = await getLatestExchangeRate();

    return res.status(200).json({ exchange_rate: exchangeRate });
  } catch (error) {
    console.error('❌ ERROR GET LATEST EXCHANGE RATE:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createAdminExchangeRate = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const exchangeRate = await createExchangeRate(req.body.rate_bs_per_usd);

    return res.status(201).json({
      message: 'Tasa registrada correctamente',
      exchange_rate: exchangeRate
    });
  } catch (error) {
    const statusCode = error.message === 'La tasa debe ser mayor a 0' ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const listAdminExchangeRates = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const exchange_rates = await listExchangeRates();
    return res.status(200).json({ exchange_rates });
  } catch (error) {
    console.error('❌ ERROR LIST EXCHANGE RATES:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPublicLatestExchangeRate,
  createAdminExchangeRate,
  listAdminExchangeRates
};