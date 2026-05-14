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
      'SELECT 1 FROM Product WHERE sku = ? LIMIT 1',
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

const listSubcategoriesForManagement = async (categoryId = null) => {
  const hasCategoryFilter = Number.isInteger(categoryId) && categoryId > 0;
  const [rows] = await pool.query(
    `SELECT
       sc.id_subcategory,
       sc.name,
       sc.id_category_fk,
       c.name AS category_name,
       sc.is_active,
       sc.created_at
     FROM Subcategory sc
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     ${hasCategoryFilter ? 'WHERE sc.id_category_fk = ?' : ''}
     ORDER BY c.name ASC, sc.name ASC`,
    hasCategoryFilter ? [categoryId] : []
  );

  return rows;
};

const listLinesForManagement = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (Number.isInteger(filters.companyId) && filters.companyId > 0) {
    conditions.push('l.id_company_fk = ?');
    values.push(filters.companyId);
  }

  if (Number.isInteger(filters.categoryId) && filters.categoryId > 0) {
    conditions.push('c.id_category = ?');
    values.push(filters.categoryId);
  }

  if (Number.isInteger(filters.subcategoryId) && filters.subcategoryId > 0) {
    conditions.push('sc.id_subcategory = ?');
    values.push(filters.subcategoryId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
       l.id_line,
       l.name,
       MIN(p.brand) AS brand,
       l.id_subcategory_fk,
       l.id_company_fk,
       l.is_active,
       l.created_at,
       l.updated_at,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name,
       co.name AS company_name,
       COUNT(DISTINCT p.id_product) AS products_count
     FROM Line l
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Company co ON co.id_company = l.id_company_fk
     LEFT JOIN Product p ON p.id_line_fk = l.id_line
     ${whereClause}
     GROUP BY
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       l.id_company_fk,
       l.is_active,
       l.created_at,
       l.updated_at,
       sc.name,
       c.id_category,
       c.name,
       co.name
     ORDER BY c.name ASC, sc.name ASC, l.name ASC`,
    values
  );

  return rows;
};

const appendExactFilter = (conditions, values, enabled, clause, value) => {
  if (!enabled) {
    return;
  }

  conditions.push(clause);
  values.push(value);
};

const appendLikeFilter = (conditions, values, value, clause) => {
  if (!value) {
    return;
  }

  conditions.push(clause);
  values.push(`%${value}%`);
};

const listProductsForManagement = async (filters = {}) => {
  const conditions = [];
  const values = [];

  appendExactFilter(conditions, values, Number.isInteger(filters.companyId) && filters.companyId > 0, 'l.id_company_fk = ?', filters.companyId);
  appendLikeFilter(conditions, values, filters.name, 'l.name LIKE ?');
  appendLikeFilter(conditions, values, filters.company, 'co.name LIKE ?');
  appendExactFilter(conditions, values, Number.isInteger(filters.categoryId) && filters.categoryId > 0, 'c.id_category = ?', filters.categoryId);
  appendLikeFilter(conditions, values, filters.category, 'c.name LIKE ?');
  appendExactFilter(conditions, values, Number.isInteger(filters.subcategoryId) && filters.subcategoryId > 0, 'sc.id_subcategory = ?', filters.subcategoryId);
  appendLikeFilter(conditions, values, filters.subcategory, 'sc.name LIKE ?');
  appendExactFilter(conditions, values, Number.isInteger(filters.lineId) && filters.lineId > 0, 'l.id_line = ?', filters.lineId);
  appendLikeFilter(conditions, values, filters.line, 'l.name LIKE ?');

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
  const limit = Number.isInteger(filters.limit) && filters.limit > 0 ? filters.limit : 20;
  const offset = (page - 1) * limit;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM Product p
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Company co ON co.id_company = l.id_company_fk
     ${whereClause}`,
    values
  );

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.id_line_fk,
       p.sku,
       p.brand,
       p.description,
       p.price,
       p.is_active,
       p.created_at,
       l.id_line,
       l.name AS line_name,
       l.is_active AS line_is_active,
       sc.id_subcategory,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name,
       co.id_company,
       co.name AS company_name,
       co.id_role_fk AS company_role_id,
       pi.image_url AS main_image_url
     FROM Product p
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Company co ON co.id_company = l.id_company_fk
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     ${whereClause}
     ORDER BY p.created_at DESC, p.id_product DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    products: rows,
    pagination: {
      page,
      limit,
      total: countRows[0]?.total ?? 0,
      total_pages: Math.max(1, Math.ceil((countRows[0]?.total ?? 0) / limit))
    }
  };
};

const listPublicCatalog = async (limit = 12) => {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 12;

  const [rows] = await pool.query(
    `SELECT
       l.id_line,
       l.name,
       MIN(p.brand) AS brand,
       MIN(p.id_product) AS id_product,
       MIN(p.sku) AS sku,
       MIN(p.price) AS price,
       MIN(pi.image_url) AS image_url
     FROM Line l
     INNER JOIN Product p ON p.id_line_fk = l.id_line
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE l.is_active = TRUE
       AND p.is_active = TRUE
       AND s.quantity > 0
     GROUP BY l.id_line, l.name
     ORDER BY l.created_at DESC
     LIMIT ?`,
    [safeLimit]
  );

  return rows;
};

const getPublicProductDetail = async (productId) => {
  const [lineRows] = await pool.query(
    `SELECT
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       sc.name AS subcategory_name,
       c.name AS category_name,
       l.created_at,
       l.updated_at
     FROM Line l
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     WHERE l.id_line = ?
       AND l.is_active = TRUE
     LIMIT 1`,
    [productId]
  );

  if (lineRows.length === 0) {
    return null;
  }

  const [productRows] = await pool.query(
    `SELECT
       p.id_product,
       p.sku,
       p.brand,
       p.description,
       p.price,
       p.attributes,
       p.is_active,
       s.quantity,
       s.min_stock,
       pi.image_url
     FROM Product p
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE p.id_line_fk = ?
       AND p.is_active = TRUE
     ORDER BY p.id_product ASC`,
    [productId]
  );

  return {
    ...lineRows[0],
    brand: productRows[0]?.brand ?? null,
    products: productRows
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

const updateCategory = async (categoryId, name) => {
  await pool.query('CALL sp_update_category(?, ?)', [categoryId, name]);

  const [rows] = await pool.query(
    'SELECT id_category, name, is_active, created_at FROM Category WHERE id_category = ? LIMIT 1',
    [categoryId]
  );

  return rows[0] ?? null;
};

const toggleCategory = async (categoryId, isActive) => {
  await pool.query('CALL sp_toggle_category(?, ?)', [categoryId, isActive]);

  const [rows] = await pool.query(
    'SELECT id_category, name, is_active, created_at FROM Category WHERE id_category = ? LIMIT 1',
    [categoryId]
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

const updateSubcategory = async (subcategoryId, name, categoryId) => {
  await pool.query('CALL sp_update_subcategory(?, ?, ?)', [subcategoryId, name, categoryId]);

  const [rows] = await pool.query(
    `SELECT
       sc.id_subcategory,
       sc.name,
       sc.id_category_fk,
       c.name AS category_name,
       sc.is_active,
       sc.created_at
     FROM Subcategory sc
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     WHERE sc.id_subcategory = ?
     LIMIT 1`,
    [subcategoryId]
  );

  return rows[0] ?? null;
};

const toggleSubcategory = async (subcategoryId, isActive) => {
  await pool.query('CALL sp_toggle_subcategory(?, ?)', [subcategoryId, isActive]);

  const [rows] = await pool.query(
    `SELECT
       sc.id_subcategory,
       sc.name,
       sc.id_category_fk,
       c.name AS category_name,
       sc.is_active,
       sc.created_at
     FROM Subcategory sc
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     WHERE sc.id_subcategory = ?
     LIMIT 1`,
    [subcategoryId]
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
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       l.id_company_fk,
       p.id_product,
       p.brand,
       p.sku,
       p.description,
       p.price,
       p.attributes,
       s.quantity,
       s.min_stock,
       pi.image_url
     FROM Line l
     INNER JOIN Product p ON p.id_line_fk = l.id_line
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE l.id_company_fk = ? AND l.name = ?
     ORDER BY l.id_line DESC, p.id_product DESC
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
       p.id_product,
       p.id_line_fk,
       p.sku,
       p.description,
       p.price,
       p.attributes,
       s.quantity,
       s.min_stock,
       pi.image_url
     FROM Product p
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE p.sku = ?
     LIMIT 1`,
    [resolvedSku]
  );

  return rows[0] ?? null;
};

const updateProduct = async (productId, name, brand) => {
  await pool.query('CALL sp_update_product(?, ?, ?)', [productId, name, brand]);

  const [rows] = await pool.query(
    `SELECT
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       l.id_company_fk,
       MIN(p.brand) AS brand,
       l.is_active,
       l.created_at,
       l.updated_at
     FROM Line l
     LEFT JOIN Product p ON p.id_line_fk = l.id_line
     WHERE l.id_line = ?
     GROUP BY l.id_line, l.name, l.id_subcategory_fk, l.id_company_fk, l.is_active, l.created_at, l.updated_at
     LIMIT 1`,
    [productId]
  );

  return rows[0] ?? null;
};

const toggleLine = async (productId, isActive) => {
  await pool.query('CALL sp_toggle_product(?, ?)', [productId, isActive]);

  const [rows] = await pool.query(
    `SELECT
       l.id_line,
       l.name,
       MIN(p.brand) AS brand,
       l.id_subcategory_fk,
       l.id_company_fk,
       l.is_active,
       l.created_at,
       l.updated_at,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name,
       co.name AS company_name
     FROM Line l
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Company co ON co.id_company = l.id_company_fk
     LEFT JOIN Product p ON p.id_line_fk = l.id_line
     WHERE l.id_line = ?
     GROUP BY l.id_line, l.name, l.id_subcategory_fk, l.id_company_fk, l.is_active, l.created_at, l.updated_at, sc.name, c.id_category, c.name, co.name
     LIMIT 1`,
    [productId]
  );

  return rows[0] ?? null;
};

const updateVariant = async (variantId, price, attributes) => {
  await pool.query('CALL sp_update_variant(?, ?, ?)', [variantId, price, attributes]);

  const [rows] = await pool.query(
    'SELECT id_product, id_line_fk, sku, description, price, attributes, is_active, created_at, updated_at FROM Product WHERE id_product = ? LIMIT 1',
    [variantId]
  );

  return rows[0] ?? null;
};

const syncStock = async (variantId, quantity, notes) => {
  await pool.query('CALL sp_update_stock(?, ?, ?, ?)', [variantId, quantity, 'ADJUSTMENT', notes]);

  const [rows] = await pool.query(
    'SELECT id_stock, id_product_fk, quantity, min_stock, created_at, updated_at FROM Stock WHERE id_product_fk = ? LIMIT 1',
    [variantId]
  );

  return rows[0] ?? null;
};

module.exports = {
  listCategories,
  listSubcategoriesByCategory,
  listSubcategoriesForManagement,
  listLinesForManagement,
  listProductsForManagement,
  listPublicCatalog,
  getPublicProductDetail,
  createCategory,
  updateCategory,
  toggleCategory,
  createSubcategory,
  updateSubcategory,
  toggleSubcategory,
  createProductFull,
  addVariant,
  updateProduct,
  toggleLine,
  updateVariant,
  syncStock
};