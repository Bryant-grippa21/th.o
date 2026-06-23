export const formatUSD = (value = 0) => {
  const numeric = Number(value) || 0;
  return `USD ${numeric.toLocaleString('es-VE', {
    minimumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (value = 0) => {
  const numeric = Number(value) || 0;
  return numeric.toLocaleString('es-VE', {
    minimumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export const formatPercent = (value = 0) => {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString('es-VE', {
    minimumFractionDigits: Number.isInteger(numeric) ? 0 : 1,
    maximumFractionDigits: 2,
  })}%`;
};

export const buildLocationLabel = ({ state, city, urbanization } = {}) => {
  return [state, city, urbanization].filter(Boolean).join(' / ');
};

export const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
