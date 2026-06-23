const pool = require('../config/db');

const createExchangeRate = async (rateBsPerUsd) => {
  const normalizedRate = Number(rateBsPerUsd);

  if (!Number.isFinite(normalizedRate) || normalizedRate <= 0) {
    throw new Error('La tasa debe ser mayor a 0');
  }

  const [resultSets] = await pool.query('CALL sp_create_exchange_rate(?)', [normalizedRate]);
  return resultSets?.[0]?.[0] || null;
};

const getLatestExchangeRate = async () => {
  const [resultSets] = await pool.query('CALL sp_get_latest_exchange_rate()');
  return resultSets?.[0]?.[0] || null;
};

const listExchangeRates = async () => {
  const [resultSets] = await pool.query('CALL sp_list_exchange_rates()');
  return resultSets?.[0] || [];
};

module.exports = {
  createExchangeRate,
  getLatestExchangeRate,
  listExchangeRates
};