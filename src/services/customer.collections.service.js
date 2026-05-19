const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

const storageRootDir = path.resolve(__dirname, '../storage/customers');
const favoritesDir = path.join(storageRootDir, 'favorites');
const cartDir = path.join(storageRootDir, 'cart');
const productUploadsDir = path.resolve(__dirname, '../../public/uploads/products');

const ensureStorageDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const getCollectionFilePath = (collectionType, customerId) => {
  const normalizedCustomerId = Number(customerId);

  if (!Number.isInteger(normalizedCustomerId) || normalizedCustomerId <= 0) {
    throw new Error('customerId inválido');
  }

  const baseDir = collectionType === 'favorites' ? favoritesDir : cartDir;
  return path.join(baseDir, `${normalizedCustomerId}.json`);
};

const createDefaultFavorites = (customerId) => ({
  id_customer: customerId,
  items: [],
  updated_at: new Date().toISOString()
});

const createDefaultCart = (customerId) => ({
  id_customer: customerId,
  items: [],
  checkout_ready: false,
  updated_at: new Date().toISOString()
});

const readJsonFile = async (filePath, fallbackValue) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallbackValue;
    }

    throw error;
  }
};

const writeJsonFile = async (filePath, value) => {
  const tempFilePath = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tempFilePath, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(tempFilePath, filePath);
};

const normalizeFavorites = (customerId, payload) => {
  const items = Array.isArray(payload?.items)
    ? payload.items
        .map((item) => Number(item?.id_product || item))
        .filter((productId, index, values) => Number.isInteger(productId) && productId > 0 && values.indexOf(productId) === index)
        .map((productId) => ({ id_product: productId }))
    : [];

  return {
    id_customer: customerId,
    items,
    updated_at: payload?.updated_at || new Date().toISOString()
  };
};

const normalizeCart = (customerId, payload) => {
  const items = Array.isArray(payload?.items)
    ? payload.items
        .map((item) => ({
          id_product: Number(item?.id_product),
          quantity: Number(item?.quantity),
          updated_at: item?.updated_at || new Date().toISOString()
        }))
        .filter((item, index, values) => (
          Number.isInteger(item.id_product)
          && item.id_product > 0
          && Number.isInteger(item.quantity)
          && item.quantity > 0
          && values.findIndex((candidate) => candidate.id_product === item.id_product) === index
        ))
    : [];

  return {
    id_customer: customerId,
    items,
    updated_at: payload?.updated_at || new Date().toISOString()
  };
};

const resolveProductImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  const normalizedImageName = path.basename(String(imageUrl).trim());

  if (!normalizedImageName) {
    return null;
  }

  return `/uploads/products/${normalizedImageName}`;
};

const listProductsByIds = async (productIds) => {
  if (!Array.isArray(productIds) || !productIds.length) {
    return [];
  }

  const placeholders = productIds.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT p.id_product, p.sku, p.name, p.brand, p.price, p.description, p.is_active,
            l.name AS line_name,
            s.quantity,
            image.image_url AS main_image_url
     FROM Product p
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     LEFT JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image image
       ON image.id_product_fk = p.id_product
      AND image.is_main = TRUE
     WHERE p.id_product IN (${placeholders})`,
    productIds
  );

  return rows.map((row) => ({
    ...row,
    main_image_url: resolveProductImageUrl(row.main_image_url),
    is_active: Boolean(row.is_active),
    quantity: Number(row.quantity || 0)
  }));
};

const assertProductExists = async (productId) => {
  const normalizedProductId = Number(productId);

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) {
    throw new Error('id_product inválido');
  }

  const [rows] = await pool.query(
    'SELECT id_product FROM Product WHERE id_product = ? LIMIT 1',
    [normalizedProductId]
  );

  if (!rows.length) {
    throw new Error('Producto no existe');
  }

  return normalizedProductId;
};

const getFavorites = async (customerId) => {
  await ensureStorageDir(favoritesDir);
  const filePath = getCollectionFilePath('favorites', customerId);
  const data = normalizeFavorites(customerId, await readJsonFile(filePath, createDefaultFavorites(customerId)));
  const products = await listProductsByIds(data.items.map((item) => item.id_product));
  const productsById = new Map(products.map((product) => [product.id_product, product]));

  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      product: productsById.get(item.id_product) || null
    }))
  };
};

const addFavorite = async (customerId, productId) => {
  const normalizedProductId = await assertProductExists(productId);
  await ensureStorageDir(favoritesDir);
  const filePath = getCollectionFilePath('favorites', customerId);
  const current = normalizeFavorites(customerId, await readJsonFile(filePath, createDefaultFavorites(customerId)));

  if (!current.items.some((item) => item.id_product === normalizedProductId)) {
    current.items.push({ id_product: normalizedProductId });
  }

  current.updated_at = new Date().toISOString();
  await writeJsonFile(filePath, current);
  return getFavorites(customerId);
};

const removeFavorite = async (customerId, productId) => {
  await ensureStorageDir(favoritesDir);
  const filePath = getCollectionFilePath('favorites', customerId);
  const current = normalizeFavorites(customerId, await readJsonFile(filePath, createDefaultFavorites(customerId)));
  current.items = current.items.filter((item) => item.id_product !== Number(productId));
  current.updated_at = new Date().toISOString();
  await writeJsonFile(filePath, current);
  return getFavorites(customerId);
};

const getCart = async (customerId) => {
  await ensureStorageDir(cartDir);
  const filePath = getCollectionFilePath('cart', customerId);
  const data = normalizeCart(customerId, await readJsonFile(filePath, createDefaultCart(customerId)));
  const products = await listProductsByIds(data.items.map((item) => item.id_product));
  const productsById = new Map(products.map((product) => [product.id_product, product]));

  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      product: productsById.get(item.id_product) || null
    }))
  };
};

const setCartItem = async (customerId, productId, quantity) => {
  const normalizedProductId = await assertProductExists(productId);
  const normalizedQuantity = Number(quantity);

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 0) {
    throw new Error('quantity inválida');
  }

  await ensureStorageDir(cartDir);
  const filePath = getCollectionFilePath('cart', customerId);
  const current = normalizeCart(customerId, await readJsonFile(filePath, createDefaultCart(customerId)));
  const currentItem = current.items.find((item) => item.id_product === normalizedProductId);

  if (normalizedQuantity === 0) {
    current.items = current.items.filter((item) => item.id_product !== normalizedProductId);
  } else if (currentItem) {
    currentItem.quantity = normalizedQuantity;
    currentItem.updated_at = new Date().toISOString();
  } else {
    current.items.push({
      id_product: normalizedProductId,
      quantity: normalizedQuantity,
      updated_at: new Date().toISOString()
    });
  }

  current.updated_at = new Date().toISOString();
  await writeJsonFile(filePath, current);
  return getCart(customerId);
};

const removeCartItem = async (customerId, productId) => {
  await ensureStorageDir(cartDir);
  const filePath = getCollectionFilePath('cart', customerId);
  const current = normalizeCart(customerId, await readJsonFile(filePath, createDefaultCart(customerId)));
  current.items = current.items.filter((item) => item.id_product !== Number(productId));
  current.updated_at = new Date().toISOString();
  await writeJsonFile(filePath, current);
  return getCart(customerId);
};

const clearCart = async (customerId) => {
  await ensureStorageDir(cartDir);
  const filePath = getCollectionFilePath('cart', customerId);
  const nextValue = createDefaultCart(customerId);
  await writeJsonFile(filePath, nextValue);
  return getCart(customerId);
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  getCart,
  setCartItem,
  removeCartItem,
  clearCart
};