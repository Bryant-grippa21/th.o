export const sumBy = (rows = [], selector = () => 0) => rows.reduce((total, row) => total + Number(selector(row) || 0), 0);
export const countDistinctBy = (rows = [], selector = () => '') => new Set(rows.map(selector).filter(Boolean)).size;
export const averageBy = (rows = [], selector = () => 0) => rows.length ? sumBy(rows, selector) / rows.length : 0;
export const safeDivide = (numerator, denominator, fallback = 0) => Number(denominator) ? Number(numerator || 0) / Number(denominator) : fallback;
export const percentOf = (part, total) => safeDivide(part, total) * 100;

export const getInvoiceBalance = (invoice = {}) => Number(invoice.total || 0) - Number(invoice.paid || 0) - Number(invoice.covered || 0);
export const getB2BCommission = (amount = 0) => Number(amount || 0) * 0.015;
export const getB2CUtility = (amount = 0) => Number(amount || 0) * 0.05;
export const getB2CCashback = (amount = 0) => Number(amount || 0) * 0.025;
export const getReinsertionIncome = (balance = 0) => Number(balance || 0) * 0.1;
