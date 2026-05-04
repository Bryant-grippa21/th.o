const pool = require('../config/db');

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
    sku,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url
  } = productData;

  await pool.query(
    'CALL sp_create_product_full(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, id_subcategory, id_company, brand, sku, description, price, attributes, quantity, min_stock, image_url]
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
    sku,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url
  } = variantData;

  await pool.query(
    'CALL sp_add_variant(?, ?, ?, ?, ?, ?, ?, ?)',
    [id_product, sku, description, price, attributes, quantity, min_stock, image_url]
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
    [sku]
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
  createCategory,
  createSubcategory,
  createProductFull,
  addVariant,
  updateProduct,
  updateVariant,
  syncStock
};