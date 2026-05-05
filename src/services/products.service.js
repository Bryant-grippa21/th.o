const { randomInt } = require('node:crypto');
const pool = require('../config/db');

const SKU_DIGITS = 7;
const SKU_MIN = 10 ** (SKU_DIGITS - 1);
const SKU_MAX_EXCLUSIVE = 10 ** SKU_DIGITS;
const FORBIDDEN_SKU = '9'.repeat(SKU_DIGITS);
const SKU_GENERATION_ATTEMPTS = 25;

const generateRandomSkuCandidate = () => {
  let candidate = String(randomInt(SKU_MIN, SKU_MAX_EXCLUSIVE));

  while (candidate === FORBIDDEN_SKU) {
    candidate = String(randomInt(SKU_MIN, SKU_MAX_EXCLUSIVE));
  }

  return candidate;
};

const ensureUniqueSku = async () => {
  for (let attempt = 0; attempt < SKU_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = generateRandomSkuCandidate();
    const [rows] = await pool.query(
      'SELECT 1 FROM Product_Variant WHERE sku = ? LIMIT 1',
      [candidate]
    );

    if (rows.length === 0) {
      return candidate;
    }
  }

  throw new Error('No se pudo generar un SKU único automáticamente');
};

const listCategories = async () => {
  const [rows] = await pool.query(
    'SELECT id_category, name, is_active, created_at FROM Category ORDER BY name ASC'
  );

  return rows;
};

const listSubcategoriesByCategory = async (categoryId) => {
  const [rows] = await pool.query(
    'SELECT id_subcategory, name, id_category_fk, is_active, created_at FROM Subcategory WHERE id_category_fk = ? ORDER BY name ASC',
    [categoryId]
  );

  return rows;
};

const listPublicCatalog = async (limit = 12) => {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 12;

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.name,
       p.brand,
       MIN(pv.id_variant) AS id_variant,
       MIN(pv.sku) AS sku,
       MIN(pv.price) AS price,
       MIN(pi.image_url) AS image_url
     FROM Product p
     INNER JOIN Product_Variant pv ON pv.id_product_fk = p.id_product
     INNER JOIN Stock s ON s.id_variant_fk = pv.id_variant
     LEFT JOIN Product_Image pi ON pi.id_variant_fk = pv.id_variant AND pi.is_main = TRUE
     WHERE p.is_active = TRUE
       AND pv.is_active = TRUE
       AND s.quantity > 0
     GROUP BY p.id_product, p.name, p.brand
     ORDER BY p.created_at DESC
     LIMIT ?`,
    [safeLimit]
  );

  return rows;
};

const getPublicProductDetail = async (productId) => {
  const [productRows] = await pool.query(
    `SELECT
       p.id_product,
       p.name,
       p.brand,
       p.id_subcategory_fk,
       sc.name AS subcategory_name,
       c.name AS category_name,
       p.created_at,
       p.updated_at
     FROM Product p
     INNER JOIN Subcategory sc ON sc.id_subcategory = p.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     WHERE p.id_product = ?
       AND p.is_active = TRUE
     LIMIT 1`,
    [productId]
  );

  if (productRows.length === 0) {
    return null;
  }

  const [variantRows] = await pool.query(
    `SELECT
       pv.id_variant,
       pv.sku,
       pv.description,
       pv.price,
       pv.attributes,
       pv.is_active,
       s.quantity,
       s.min_stock,
       pi.image_url
     FROM Product_Variant pv
     INNER JOIN Stock s ON s.id_variant_fk = pv.id_variant
     LEFT JOIN Product_Image pi ON pi.id_variant_fk = pv.id_variant AND pi.is_main = TRUE
     WHERE pv.id_product_fk = ?
       AND pv.is_active = TRUE
     ORDER BY pv.id_variant ASC`,
    [productId]
  );

  return {
    ...productRows[0],
    variants: variantRows
  };
};

const createCategory = async (name) => {
  await pool.query('CALL sp_admin_create_category(?)', [name]);

  const [rows] = await pool.query(
    'SELECT id_category, name, is_active, created_at FROM Category WHERE name = ? LIMIT 1',
    [name]
  );

  return rows[0] ?? null;
};

const createSubcategory = async (name, categoryId) => {
  await pool.query('CALL sp_admin_create_subcategory(?, ?)', [name, categoryId]);

  const [rows] = await pool.query(
    'SELECT id_subcategory, name, id_category_fk, is_active, created_at FROM Subcategory WHERE name = ? AND id_category_fk = ? LIMIT 1',
    [name, categoryId]
  );

  return rows[0] ?? null;
};

const createProductFull = async (productData) => {
  const {
    name,
    id_subcategory,
    id_company,
    brand,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url
  } = productData;

  const resolvedSku = await ensureUniqueSku();

  await pool.query(
    'CALL sp_create_product_full(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, id_subcategory, id_company, brand, resolvedSku, description, price, attributes, quantity, min_stock, image_url]
  );

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.name,
       p.id_subcategory_fk,
       p.id_company_fk,
       p.brand,
       pv.id_variant,
       pv.sku,
       pv.description,
       pv.price,
       pv.attributes,
       s.quantity,
       s.min_stock,
       pi.image_url
     FROM Product p
     INNER JOIN Product_Variant pv ON pv.id_product_fk = p.id_product
     INNER JOIN Stock s ON s.id_variant_fk = pv.id_variant
     LEFT JOIN Product_Image pi ON pi.id_variant_fk = pv.id_variant AND pi.is_main = TRUE
     WHERE p.id_company_fk = ? AND p.name = ?
     ORDER BY p.id_product DESC, pv.id_variant DESC
     LIMIT 1`,
    [id_company, name]
  );

  return rows[0] ?? null;
};

const addVariant = async (variantData) => {
  const {
    id_product,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url
  } = variantData;

  const resolvedSku = await ensureUniqueSku();

  await pool.query(
    'CALL sp_add_variant(?, ?, ?, ?, ?, ?, ?, ?)',
    [id_product, resolvedSku, description, price, attributes, quantity, min_stock, image_url]
  );

  const [rows] = await pool.query(
    `SELECT
       pv.id_variant,
       pv.id_product_fk,
       pv.sku,
       pv.description,
       pv.price,
       pv.attributes,
       s.quantity,
       s.min_stock,
       pi.image_url
     FROM Product_Variant pv
     INNER JOIN Stock s ON s.id_variant_fk = pv.id_variant
     LEFT JOIN Product_Image pi ON pi.id_variant_fk = pv.id_variant AND pi.is_main = TRUE
     WHERE pv.sku = ?
     LIMIT 1`,
    [resolvedSku]
  );

  return rows[0] ?? null;
};

const updateProduct = async (productId, name, brand) => {
  await pool.query('CALL sp_update_product(?, ?, ?)', [productId, name, brand]);

  const [rows] = await pool.query(
    'SELECT id_product, name, id_subcategory_fk, id_company_fk, brand, is_active, created_at, updated_at FROM Product WHERE id_product = ? LIMIT 1',
    [productId]
  );

  return rows[0] ?? null;
};

const updateVariant = async (variantId, price, attributes) => {
  await pool.query('CALL sp_update_variant(?, ?, ?)', [variantId, price, attributes]);

  const [rows] = await pool.query(
    'SELECT id_variant, id_product_fk, sku, description, price, attributes, is_active, created_at, updated_at FROM Product_Variant WHERE id_variant = ? LIMIT 1',
    [variantId]
  );

  return rows[0] ?? null;
};

const syncStock = async (variantId, quantity, notes) => {
  await pool.query('CALL sp_update_stock(?, ?, ?, ?)', [variantId, quantity, 'ADJUSTMENT', notes]);

  const [rows] = await pool.query(
    'SELECT id_stock, id_variant_fk, quantity, min_stock, created_at, updated_at FROM Stock WHERE id_variant_fk = ? LIMIT 1',
    [variantId]
  );

  return rows[0] ?? null;
};

module.exports = {
  listCategories,
  listSubcategoriesByCategory,
  listPublicCatalog,
  getPublicProductDetail,
  createCategory,
  createSubcategory,
  createProductFull,
  addVariant,
  updateProduct,
  updateVariant,
  syncStock
};