const fs = require('node:fs');
const path = require('node:path');
const { randomInt } = require('node:crypto');
const pool = require('../config/db');

const SKU_DIGITS = 7;
const SKU_MIN = 10 ** (SKU_DIGITS - 1);
const SKU_MAX_EXCLUSIVE = 10 ** SKU_DIGITS;
const FORBIDDEN_SKU = '9'.repeat(SKU_DIGITS);
const SKU_GENERATION_ATTEMPTS = 25;
const productUploadsDir = path.resolve(__dirname, '../../public/uploads/products');

const resolveProductImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  const normalizedImageName = path.basename(String(imageUrl).trim());

  if (!normalizedImageName) {
    return null;
  }

  const absoluteImagePath = path.join(productUploadsDir, normalizedImageName);

  if (!fs.existsSync(absoluteImagePath)) {
    return null;
  }

  return `/uploads/products/${normalizedImageName}`;
};

const resolveProductImageFilePath = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  const normalizedImageName = path.basename(String(imageUrl).trim());

  if (!normalizedImageName) {
    return null;
  }

  return path.join(productUploadsDir, normalizedImageName);
};

const deleteProductImageFiles = (imageUrls = []) => {
  imageUrls.forEach((imageUrl) => {
    const imagePath = resolveProductImageFilePath(imageUrl);

    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });
};

const mapProductImageFields = (row) => {
  if (!row) {
    return row;
  }

  return {
    ...row,
    image_url: resolveProductImageUrl(row.image_url),
    main_image_url: resolveProductImageUrl(row.main_image_url)
  };
};

const normalizeProductName = (product, fallbackName = null) => {
  if (!product) {
    return product;
  }

  const resolvedName = String(product.name || '').trim();
  const resolvedFallbackName = String(fallbackName || '').trim();

  return {
    ...product,
    name: resolvedName || resolvedFallbackName || null
  };
};

const listImagesByProductIds = async (productIds, connection = pool) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return new Map();
  }

  const placeholders = productIds.map(() => '?').join(', ');
  const [rows] = await connection.query(
    `SELECT id_image, id_product_fk, image_url, is_main, sort_order
     FROM Product_Image
     WHERE id_product_fk IN (${placeholders})
     ORDER BY is_main DESC, sort_order ASC, id_product_fk ASC`,
    productIds
  );

  return rows.reduce((imagesByProductId, row) => {
    const productId = row.id_product_fk;
    const currentImages = imagesByProductId.get(productId) ?? [];
    const resolvedImageUrl = resolveProductImageUrl(row.image_url);

    if (resolvedImageUrl) {
      currentImages.push({
        id_image: row.id_image,
        image_url: resolvedImageUrl,
        is_main: Boolean(row.is_main),
        sort_order: row.sort_order
      });
      imagesByProductId.set(productId, currentImages);
    }

    return imagesByProductId;
  }, new Map());
};

const listReviewSummariesByProductIds = async (productIds, connection = pool) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return new Map();
  }

  const placeholders = productIds.map(() => '?').join(', ');
  const [rows] = await connection.query(
    `SELECT
       id_product_fk,
       COUNT(*) AS total_reviews,
       ROUND(AVG(rating), 1) AS average_rating
     FROM Product_Review
     WHERE id_product_fk IN (${placeholders})
     GROUP BY id_product_fk`,
    productIds
  );

  return rows.reduce((summariesByProductId, row) => {
    summariesByProductId.set(row.id_product_fk, {
      total_reviews: Number(row.total_reviews || 0),
      average_rating: Number(row.average_rating || 0)
    });
    return summariesByProductId;
  }, new Map());
};

const attachProductReviewSummaries = async (products, connection = pool) => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const productIds = products
    .map((product) => Number(product.id_product))
    .filter((productId) => Number.isInteger(productId) && productId > 0);
  const summariesByProductId = await listReviewSummariesByProductIds(productIds, connection);

  return products.map((product) => {
    const summary = summariesByProductId.get(product.id_product) || {
      total_reviews: 0,
      average_rating: 0
    };

    return {
      ...product,
      reviews: summary
    };
  });
};

const attachProductGalleries = async (products, connection = pool) => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const productIds = products
    .map((product) => product.id_product)
    .filter((productId) => Number.isInteger(productId) && productId > 0);

  const imagesByProductId = await listImagesByProductIds(productIds, connection);

  return products.map((product) => {
    const gallery = imagesByProductId.get(product.id_product) ?? [];

    return {
      ...product,
      images: gallery,
      secondary_images: gallery
        .filter((image) => !image.is_main)
        .map((image) => image.image_url)
    };
  });
};

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
       l.is_active,
       l.created_at,
       l.updated_at,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name,
       COUNT(DISTINCT p.id_product) AS products_count
     FROM Line l
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     LEFT JOIN Product p ON p.id_line_fk = l.id_line
     ${whereClause}
     GROUP BY
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       l.is_active,
       l.created_at,
       l.updated_at,
       sc.name,
       c.id_category,
       c.name
     ORDER BY c.name ASC, sc.name ASC, l.name ASC`,
    values
  );

  return rows;
};

const listLineReferences = async () => {
  const [rows] = await pool.query(
    `SELECT
       MIN(l.id_line) AS id_line,
       l.name,
       l.id_subcategory_fk,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name,
       COUNT(*) AS references_count
     FROM Line l
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     GROUP BY l.name, l.id_subcategory_fk, sc.name, c.id_category, c.name
     ORDER BY c.name ASC, sc.name ASC, l.name ASC`
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

const buildOwnedProductCondition = (companyId, values, productAlias = 'p') => {
  if (Number.isInteger(companyId) && companyId > 0) {
    values.push(companyId);
    return ` AND ${productAlias}.id_company_fk = ?`;
  }

  return '';
};

const ensureCompanyExists = async (companyId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id_company FROM Company WHERE id_company = ? LIMIT 1',
    [companyId]
  );

  if (!rows.length) {
    throw new Error('Empresa no existe');
  }
};

const ensureSubcategoryExists = async (subcategoryId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id_subcategory FROM Subcategory WHERE id_subcategory = ? LIMIT 1',
    [subcategoryId]
  );

  if (!rows.length) {
    throw new Error('Subcategoría no existe');
  }
};

const findLineByNameAndSubcategory = async (name, subcategoryId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id_line FROM Line WHERE name = ? AND id_subcategory_fk = ? LIMIT 1',
    [name, subcategoryId]
  );

  return rows[0] ?? null;
};

const findLineReferenceById = async (lineId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name
     FROM Line l
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     WHERE l.id_line = ?
     LIMIT 1`,
    [lineId]
  );

  return rows[0] ?? null;
};

const insertProductImages = async (connection, productId, imageUrl, secondaryImages = []) => {
  const productImages = [];

  if (imageUrl) {
    productImages.push([productId, imageUrl, true, 0]);
  }

  secondaryImages.forEach((secondaryImage, index) => {
    productImages.push([productId, secondaryImage, false, index + 1]);
  });

  if (productImages.length) {
    await connection.query(
      'INSERT INTO Product_Image (id_product_fk, image_url, is_main, sort_order) VALUES ?',
      [productImages]
    );
  }
};

const insertProductOnLine = async (connection, productData) => {
  const resolvedSku = await ensureUniqueSku();
  const {
    lineId,
    companyId,
    name,
    brand,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url,
    secondary_images = []
  } = productData;

  const [productResult] = await connection.query(
    `INSERT INTO Product (
       id_line_fk, id_company_fk, sku, name, brand, description, price, attributes
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [lineId, companyId, resolvedSku, name, brand, description, price, attributes]
  );

  const productId = productResult.insertId;

  await connection.query(
    'INSERT INTO Stock (id_product_fk, quantity, min_stock) VALUES (?, ?, ?)',
    [productId, quantity, min_stock]
  );

  await insertProductImages(connection, productId, image_url, secondary_images);

  return productId;
};

const listProductsForManagement = async (filters = {}) => {
  const conditions = [];
  const values = [];

  appendExactFilter(conditions, values, Number.isInteger(filters.companyId) && filters.companyId > 0, 'p.id_company_fk = ?', filters.companyId);
  appendLikeFilter(conditions, values, filters.name, 'p.name LIKE ?');
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
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     ${whereClause}`,
    values
  );

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.id_line_fk,
       p.sku,
       p.name,
       p.brand,
       p.description,
       p.price,
       p.attributes,
       p.is_active,
       p.created_at,
       p.updated_at,
       l.id_line,
       l.name AS line_name,
       l.is_active AS line_is_active,
       sc.id_subcategory,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name,
       p.id_company_fk AS id_company,
       co.name AS company_name,
       co.id_role_fk AS company_role_id,
       s.quantity,
       s.min_stock,
       pi.image_url AS main_image_url
     FROM Product p
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     ${whereClause}
     ORDER BY p.created_at DESC, p.id_product DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  const mappedProducts = await attachProductGalleries(
    rows
      .map(mapProductImageFields)
      .map((product) => normalizeProductName(product, product.line_name))
  );

  return {
    products: mappedProducts,
    pagination: {
      page,
      limit,
      total: countRows[0]?.total ?? 0,
      total_pages: Math.max(1, Math.ceil((countRows[0]?.total ?? 0) / limit))
    }
  };
};

const listProductImageRowsByProductId = async (productId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT id_image, id_product_fk, image_url, is_main, sort_order
     FROM Product_Image
     WHERE id_product_fk = ?
     ORDER BY is_main DESC, sort_order ASC, id_image ASC`,
    [productId]
  );

  return rows;
};

const listPublicCatalog = async (filters = {}) => {
  const safePage = Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
  const safeLimit = Number.isInteger(filters.limit) && filters.limit > 0 ? filters.limit : 20;
  const safeOffset = (safePage - 1) * safeLimit;
  const normalizedQuery = String(filters.query || '').trim();
  const normalizedCategoryId = Number.isInteger(filters.categoryId) && filters.categoryId > 0
    ? filters.categoryId
    : null;
  const normalizedSort = String(filters.sort || 'reviews_desc').trim().toLowerCase();
  const conditions = [
    'l.is_active = TRUE',
    'p.is_active = TRUE',
    's.quantity > 0',
    "ro.name = 'DETALLISTA'"
  ];
  const values = [];

  if (normalizedCategoryId) {
    conditions.push('c.id_category = ?');
    values.push(normalizedCategoryId);
  }

  if (normalizedQuery) {
    const queryLike = `%${normalizedQuery}%`;
    conditions.push(`(
      p.name LIKE ?
      OR p.brand LIKE ?
      OR p.sku LIKE ?
      OR l.name LIKE ?
      OR c.name LIKE ?
      OR sc.name LIKE ?
    )`);
    values.push(queryLike, queryLike, queryLike, queryLike, queryLike, queryLike);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const sortClause = normalizedSort === 'recent'
    ? 'ORDER BY p.created_at DESC, p.id_product DESC'
    : 'ORDER BY COALESCE(rs.average_rating, 0) DESC, COALESCE(rs.total_reviews, 0) DESC, p.created_at DESC, p.id_product DESC';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM Product p
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     ${whereClause}`,
    values
  );

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.sku,
       p.name,
       p.brand,
       p.price,
       p.description,
       l.id_line,
       l.name AS line_name,
       c.id_category,
       c.name AS category_name,
       sc.id_subcategory,
       sc.name AS subcategory_name,
       s.quantity,
       pi.image_url AS image_url,
       COALESCE(rs.total_reviews, 0) AS total_reviews,
       COALESCE(rs.average_rating, 0) AS average_rating
     FROM Product p
    INNER JOIN Company co ON co.id_company = p.id_company_fk
    INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     LEFT JOIN (
       SELECT
         id_product_fk,
         COUNT(*) AS total_reviews,
         ROUND(AVG(rating), 1) AS average_rating
       FROM Product_Review
       GROUP BY id_product_fk
     ) rs ON rs.id_product_fk = p.id_product
     ${whereClause}
     ${sortClause}
     LIMIT ? OFFSET ?`,
    [...values, safeLimit, safeOffset]
  );

  const products = rows
    .map(mapProductImageFields)
    .map((product) => normalizeProductName(product, product.line_name))
    .map((product) => ({
      ...product,
      quantity: Number(product.quantity || 0),
      reviews: {
        total_reviews: Number(product.total_reviews || 0),
        average_rating: Number(product.average_rating || 0)
      }
    }));

  return {
    products,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: countRows[0]?.total ?? 0,
      total_pages: Math.max(1, Math.ceil((countRows[0]?.total ?? 0) / safeLimit))
    },
    filters: {
      query: normalizedQuery,
      category_id: normalizedCategoryId,
      sort: normalizedSort
    }
  };
};

const listRecommendedProducts = async ({ limit = 10, excludeSku = null } = {}) => {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const conditions = [
    'l.is_active = TRUE',
    'p.is_active = TRUE',
    's.quantity > 0',
    "ro.name = 'DETALLISTA'"
  ];
  const values = [];

  if (excludeSku) {
    conditions.push('p.sku <> ?');
    values.push(String(excludeSku).trim());
  }

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.sku,
       p.name,
       p.brand,
       p.description,
       p.price,
       s.quantity,
       l.id_line,
       l.name AS line_name,
       pi.image_url AS image_url
     FROM Product p
    INNER JOIN Company co ON co.id_company = p.id_company_fk
    INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE ${conditions.join(' AND ')}
     ORDER BY RAND()
     LIMIT ?`,
    [...values, safeLimit]
  );

  return attachProductReviewSummaries(rows
    .map(mapProductImageFields)
    .map((product) => normalizeProductName(product, product.line_name)));
};

const ensurePublicProductExists = async (productId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT
       p.id_product,
       p.name,
       p.sku,
       p.is_active,
       l.is_active AS line_is_active,
       ro.name AS company_role
     FROM Product p
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     WHERE p.id_product = ?
     LIMIT 1`,
    [productId]
  );

  if (!rows.length) {
    throw new Error('Producto no encontrado');
  }

  if (rows[0].company_role !== 'DETALLISTA') {
    throw new Error('Producto no disponible en catálogo público');
  }

  return rows[0];
};

const listWholesaleCatalog = async (filters = {}) => {
  const safePage = Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
  const safeLimit = Number.isInteger(filters.limit) && filters.limit > 0 ? filters.limit : 20;
  const safeOffset = (safePage - 1) * safeLimit;
  const normalizedQuery = String(filters.query || '').trim();
  const normalizedCategoryId = Number.isInteger(filters.categoryId) && filters.categoryId > 0
    ? filters.categoryId
    : null;
  const normalizedSort = String(filters.sort || 'recent').trim().toLowerCase();
  const conditions = [
    'l.is_active = TRUE',
    'p.is_active = TRUE',
    's.quantity > 0',
    "ro.name = 'MAYORISTA'"
  ];
  const values = [];

  if (normalizedCategoryId) {
    conditions.push('c.id_category = ?');
    values.push(normalizedCategoryId);
  }

  if (normalizedQuery) {
    const queryLike = `%${normalizedQuery}%`;
    conditions.push(`(
      p.name LIKE ?
      OR p.brand LIKE ?
      OR p.sku LIKE ?
      OR l.name LIKE ?
      OR c.name LIKE ?
      OR sc.name LIKE ?
      OR co.name LIKE ?
    )`);
    values.push(queryLike, queryLike, queryLike, queryLike, queryLike, queryLike, queryLike);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const sortClause = normalizedSort === 'reviews_desc'
    ? 'ORDER BY COALESCE(rs.average_rating, 0) DESC, COALESCE(rs.total_reviews, 0) DESC, p.created_at DESC, p.id_product DESC'
    : 'ORDER BY p.created_at DESC, p.id_product DESC';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM Product p
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     ${whereClause}`,
    values
  );

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.sku,
       p.name,
       p.brand,
       p.price,
       p.description,
       p.id_company_fk,
       co.name AS company_name,
       l.id_line,
       l.name AS line_name,
       c.id_category,
       c.name AS category_name,
       sc.id_subcategory,
       sc.name AS subcategory_name,
       s.quantity,
       pi.image_url AS image_url,
       COALESCE(rs.total_reviews, 0) AS total_reviews,
       COALESCE(rs.average_rating, 0) AS average_rating
     FROM Product p
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     LEFT JOIN (
       SELECT
         id_product_fk,
         COUNT(*) AS total_reviews,
         ROUND(AVG(rating), 1) AS average_rating
       FROM Product_Review
       GROUP BY id_product_fk
     ) rs ON rs.id_product_fk = p.id_product
     ${whereClause}
     ${sortClause}
     LIMIT ? OFFSET ?`,
    [...values, safeLimit, safeOffset]
  );

  const products = rows
    .map(mapProductImageFields)
    .map((product) => normalizeProductName(product, product.line_name))
    .map((product) => ({
      ...product,
      quantity: Number(product.quantity || 0),
      reviews: {
        total_reviews: Number(product.total_reviews || 0),
        average_rating: Number(product.average_rating || 0)
      }
    }));

  return {
    products,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: countRows[0]?.total ?? 0,
      total_pages: Math.max(1, Math.ceil((countRows[0]?.total ?? 0) / safeLimit))
    },
    filters: {
      query: normalizedQuery,
      category_id: normalizedCategoryId,
      sort: normalizedSort
    }
  };
};

const listProductReviews = async (productId) => {
  await ensurePublicProductExists(productId);

  const [rows] = await pool.query(
    `SELECT
       id_product_review,
       id_product_fk,
       author_entity,
       author_name,
       rating,
       comment,
       created_at,
       updated_at
     FROM Product_Review
     WHERE id_product_fk = ?
     ORDER BY created_at DESC, id_product_review DESC`,
    [productId]
  );

  const totalReviews = rows.length;
  const averageRating = totalReviews
    ? Number((rows.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews).toFixed(1))
    : 0;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  rows.forEach((review) => {
    const rating = Number(review.rating || 0);

    if (distribution[rating] != null) {
      distribution[rating] += 1;
    }
  });

  return {
    summary: {
      total_reviews: totalReviews,
      average_rating: averageRating,
      distribution
    },
    reviews: rows.map((review) => ({
      ...review,
      rating: Number(review.rating || 0)
    }))
  };
};

const createProductReview = async ({ productId, reviewer, rating, comment = null }) => {
  const normalizedProductId = Number(productId);
  const normalizedRating = Number(rating);
  const normalizedComment = String(comment || '').trim() || null;

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) {
    throw new Error('productId inválido');
  }

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    throw new Error('rating inválido');
  }

  if (!reviewer || !['customer', 'company'].includes(reviewer.entity)) {
    throw new Error('Usuario no válido para reseña');
  }

  await ensurePublicProductExists(normalizedProductId);

  const idCustomer = reviewer.entity === 'customer' ? Number(reviewer.id) : null;
  const idCompany = reviewer.entity === 'company' ? Number(reviewer.id) : null;
  const reviewerName = String(reviewer.name || reviewer.email || 'Usuario').trim();
  const reviewerField = reviewer.entity === 'customer' ? 'id_customer_fk' : 'id_company_fk';
  const reviewerId = reviewer.entity === 'customer' ? idCustomer : idCompany;

  const [existingRows] = await pool.query(
    `SELECT id_product_review
     FROM Product_Review
     WHERE id_product_fk = ?
       AND ${reviewerField} = ?
     ORDER BY id_product_review DESC
     LIMIT 1`,
    [normalizedProductId, reviewerId]
  );

  let action = 'created';

  if (existingRows.length) {
    await pool.query(
      `UPDATE Product_Review
       SET author_name = ?,
           rating = ?,
           comment = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_product_review = ?`,
      [reviewerName, normalizedRating, normalizedComment, existingRows[0].id_product_review]
    );

    action = 'updated';
  } else {
    await pool.query(
      `INSERT INTO Product_Review (
         id_product_fk,
         id_customer_fk,
         id_company_fk,
         author_entity,
         author_name,
         rating,
         comment
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedProductId,
        idCustomer,
        idCompany,
        reviewer.entity,
        reviewerName,
        normalizedRating,
        normalizedComment
      ]
    );
  }

  return {
    action,
    ...(await listProductReviews(normalizedProductId))
  };
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
       p.name,
       p.brand,
       p.description,
       p.price,
       p.attributes,
       p.is_active,
       p.id_company_fk,
       s.quantity,
       s.min_stock,
       pi.image_url,
       co.name AS company_name,
       co.email AS company_email,
       co.rif AS company_rif
     FROM Product p
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE p.id_line_fk = ?
       AND p.is_active = TRUE
       AND ro.name = 'DETALLISTA'
     ORDER BY p.id_product ASC`,
    [productId]
  );

  const mappedProducts = await attachProductGalleries(
    productRows
      .map(mapProductImageFields)
      .map((product) => normalizeProductName(product, lineRows[0]?.name))
  );

  return {
    ...lineRows[0],
    brand: mappedProducts[0]?.brand ?? null,
    products: mappedProducts
  };
};

const getPublicProductDetailBySku = async (sku) => {
  const normalizedSku = String(sku || '').trim();

  if (!normalizedSku) {
    return null;
  }

  const [rows] = await pool.query(
    `SELECT p.id_line_fk
     FROM Product p
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     WHERE p.sku = ?
       AND p.is_active = TRUE
       AND l.is_active = TRUE
       AND ro.name = 'DETALLISTA'
     LIMIT 1`,
    [normalizedSku]
  );

  if (!rows.length) {
    return null;
  }

  const detail = await getPublicProductDetail(rows[0].id_line_fk);

  if (!detail) {
    return null;
  }

  const selectedProducts = detail.products.filter((product) => product.sku === normalizedSku);
  const remainingProducts = detail.products.filter((product) => product.sku !== normalizedSku);

  return {
    ...detail,
    products: selectedProducts.concat(remainingProducts)
  };
};

const getWholesaleProductDetail = async (productId) => {
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
       p.name,
       p.brand,
       p.description,
       p.price,
       p.attributes,
       p.is_active,
       p.id_company_fk,
       s.quantity,
       s.min_stock,
       pi.image_url,
       co.name AS company_name,
       co.email AS company_email,
       co.rif AS company_rif
     FROM Product p
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE p.id_line_fk = ?
       AND p.is_active = TRUE
       AND ro.name = 'MAYORISTA'
     ORDER BY p.id_product ASC`,
    [productId]
  );

  const mappedProducts = await attachProductGalleries(
    productRows
      .map(mapProductImageFields)
      .map((product) => normalizeProductName(product, lineRows[0]?.name))
  );

  return {
    ...lineRows[0],
    brand: mappedProducts[0]?.brand ?? null,
    products: mappedProducts
  };
};

const getWholesaleProductDetailBySku = async (sku) => {
  const normalizedSku = String(sku || '').trim();

  if (!normalizedSku) {
    return null;
  }

  const [rows] = await pool.query(
    `SELECT p.id_line_fk
     FROM Product p
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Role ro ON ro.id_role = co.id_role_fk
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     WHERE p.sku = ?
       AND p.is_active = TRUE
       AND l.is_active = TRUE
       AND ro.name = 'MAYORISTA'
     LIMIT 1`,
    [normalizedSku]
  );

  if (!rows.length) {
    return null;
  }

  const detail = await getWholesaleProductDetail(rows[0].id_line_fk);

  if (!detail) {
    return null;
  }

  const selectedProducts = detail.products.filter((product) => product.sku === normalizedSku);
  const remainingProducts = detail.products.filter((product) => product.sku !== normalizedSku);

  return {
    ...detail,
    products: selectedProducts.concat(remainingProducts)
  };
};

const listStockHistoryByProductId = async (productId, filters = {}, connection = pool) => {
  const safeLimit = Number.isInteger(filters.limit) && filters.limit > 0 ? filters.limit : 10;
  const safePage = Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
  const offset = (safePage - 1) * safeLimit;
  const conditions = ['s.id_product_fk = ?'];
  const values = [productId];

  if (filters.movementType) {
    conditions.push('sh.movement_type = ?');
    values.push(filters.movementType);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const [countRows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM Stock_History sh
     INNER JOIN Stock s ON s.id_stock = sh.id_stock_fk
     ${whereClause}`,
    values
  );
  const [rows] = await connection.query(
    `SELECT
       sh.id_stock_history,
       sh.quantity_change,
       sh.previous_quantity,
       sh.new_quantity,
       sh.movement_type,
       sh.notes,
       sh.created_at
     FROM Stock_History sh
     INNER JOIN Stock s ON s.id_stock = sh.id_stock_fk
     ${whereClause}
     ORDER BY sh.created_at DESC, sh.id_stock_history DESC
     LIMIT ? OFFSET ?`,
    [...values, safeLimit, offset]
  );

  return {
    entries: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: countRows[0]?.total ?? 0,
      total_pages: Math.max(1, Math.ceil((countRows[0]?.total ?? 0) / safeLimit))
    }
  };
};

const getManagedProductById = async (productId, companyId = null, connection = pool) => {
  const values = [productId];
  const ownershipCondition = buildOwnedProductCondition(companyId, values);
  const [rows] = await connection.query(
    `SELECT
       p.id_product,
       p.id_line_fk,
       p.id_company_fk AS id_company,
       p.sku,
       p.name,
       p.brand,
       p.description,
       p.price,
       p.attributes,
       p.is_active,
       p.created_at,
       p.updated_at,
       l.id_line,
       l.name AS line_name,
       l.is_active AS line_is_active,
       sc.id_subcategory,
       sc.name AS subcategory_name,
       c.id_category,
       c.name AS category_name,
       co.name AS company_name,
       s.quantity,
       s.min_stock,
       pi.image_url AS main_image_url
     FROM Product p
     INNER JOIN Line l ON l.id_line = p.id_line_fk
     INNER JOIN Subcategory sc ON sc.id_subcategory = l.id_subcategory_fk
     INNER JOIN Category c ON c.id_category = sc.id_category_fk
     INNER JOIN Company co ON co.id_company = p.id_company_fk
     INNER JOIN Stock s ON s.id_product_fk = p.id_product
     LEFT JOIN Product_Image pi ON pi.id_product_fk = p.id_product AND pi.is_main = TRUE
     WHERE p.id_product = ?${ownershipCondition}
     LIMIT 1`,
    values
  );

  if (!rows.length) {
    return null;
  }

  const [product] = await attachProductGalleries(
    rows
      .map(mapProductImageFields)
      .map((row) => normalizeProductName(row, row.line_name)),
    connection
  );

  return {
    ...product,
    stock_history: (await listStockHistoryByProductId(productId, { page: 1, limit: 5 }, connection)).entries
  };
};

const listManagedProductStockHistory = async (productId, companyId = null, filters = {}, connection = pool) => {
  const product = await getManagedProductById(productId, companyId, connection);

  if (!product) {
    throw new Error('Producto no existe o no pertenece a la empresa');
  }

  return listStockHistoryByProductId(productId, filters, connection);
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
    line_name,
    id_subcategory,
    id_company,
    brand,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url,
    secondary_images = []
  } = productData;

  await ensureCompanyExists(id_company);
  await ensureSubcategoryExists(id_subcategory);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const resolvedLineName = String(line_name || name || '').trim();

    let lineId = (await findLineByNameAndSubcategory(resolvedLineName, id_subcategory, connection))?.id_line ?? null;

    if (!lineId) {
      const [lineResult] = await connection.query(
        'INSERT INTO Line (name, id_subcategory_fk) VALUES (?, ?)',
        [resolvedLineName, id_subcategory]
      );

      lineId = lineResult.insertId;
    }

    await insertProductOnLine(connection, {
      lineId,
      companyId: id_company,
      name,
      brand,
      description,
      price,
      attributes,
      quantity,
      min_stock,
      image_url,
      secondary_images
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('No se pudo crear el producto porque ya existe un registro duplicado');
    }

    throw error;
  } finally {
    connection.release();
  }

  const [rows] = await pool.query(
    `SELECT
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       p.id_product,
       p.id_company_fk,
       p.brand,
       p.sku,
      p.name,
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
     WHERE p.id_company_fk = ?
       AND p.name = ?
       AND l.id_subcategory_fk = ?
     ORDER BY p.id_product DESC
     LIMIT 1`,
    [id_company, name, id_subcategory]
  );

  const product = rows[0] ?? null;

  if (!product) {
    return null;
  }

  return {
    ...mapProductImageFields(product),
    secondary_images
  };
};

const createProductFromReference = async (productData) => {
  const {
    reference_line_id,
    id_company,
    name,
    brand,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url,
    secondary_images = []
  } = productData;

  await ensureCompanyExists(id_company);

  const referenceLine = await findLineReferenceById(reference_line_id);

  if (!referenceLine) {
    throw new Error('La línea de referencia no existe');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await insertProductOnLine(connection, {
      lineId: referenceLine.id_line,
      companyId: id_company,
      name,
      brand,
      description,
      price,
      attributes,
      quantity,
      min_stock,
      image_url,
      secondary_images
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const [rows] = await pool.query(
    `SELECT
       l.id_line,
       l.name,
       l.id_subcategory_fk,
       p.id_product,
       p.id_company_fk,
       p.brand,
       p.sku,
      p.name,
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
     WHERE l.id_line = ?
       AND p.id_company_fk = ?
       AND p.name = ?
     ORDER BY p.id_product DESC
     LIMIT 1`,
    [referenceLine.id_line, id_company, name]
  );

  return {
    ...mapProductImageFields(rows[0] ?? null),
    secondary_images
  };
};

const addVariant = async (variantData) => {
  const {
    id_product,
    id_company,
    name,
    description,
    price,
    attributes,
    quantity,
    min_stock,
    image_url
  } = variantData;

  const resolvedSku = await ensureUniqueSku();

  await pool.query(
    'CALL sp_add_variant(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id_product, id_company, resolvedSku, name, description, price, attributes, quantity, min_stock, image_url]
  );

  const [rows] = await pool.query(
    `SELECT
       p.id_product,
       p.id_line_fk,
      p.id_company_fk,
       p.sku,
      p.name,
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

  return mapProductImageFields(rows[0] ?? null);
};

const updateManagedProduct = async (productId, companyId, updates = {}, files = {}) => {
  const connection = await pool.getConnection();
  const imageUrlsToDelete = [];

  try {
    await connection.beginTransaction();

    const existingProduct = await getManagedProductById(productId, companyId, connection);

    if (!existingProduct) {
      throw new Error('Producto no existe o no pertenece a la empresa');
    }

    const resolvedName = updates.name == null
      ? existingProduct.name
      : String(updates.name).trim();

    if (!resolvedName) {
      throw new Error('name es requerido');
    }

    const resolvedBrand = updates.brand == null ? existingProduct.brand : String(updates.brand).trim() || null;
    const resolvedDescription = updates.description == null ? existingProduct.description : String(updates.description).trim() || null;
    const resolvedPrice = updates.price == null ? existingProduct.price : updates.price;
    const resolvedAttributes = updates.attributes == null ? existingProduct.attributes : updates.attributes;
    const resolvedMinStock = updates.min_stock == null ? existingProduct.min_stock : updates.min_stock;

    await connection.query(
      `UPDATE Product
       SET name = ?,
           brand = ?,
           description = ?,
           price = ?,
           attributes = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_product = ?`,
      [resolvedName, resolvedBrand, resolvedDescription, resolvedPrice, resolvedAttributes, productId]
    );

    await connection.query(
      `UPDATE Stock
       SET min_stock = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_product_fk = ?`,
      [resolvedMinStock, productId]
    );

    let nextSortOrder = existingProduct.images.reduce(
      (highestSortOrder, image) => Math.max(highestSortOrder, Number(image.sort_order) || 0),
      0
    );

    if (files.mainImage) {
      const existingImages = await listProductImageRowsByProductId(productId, connection);
      const currentMainImage = existingImages.find((image) => Boolean(image.is_main));

      if (currentMainImage) {
        await connection.query(
          'DELETE FROM Product_Image WHERE id_image = ? LIMIT 1',
          [currentMainImage.id_image]
        );
        imageUrlsToDelete.push(currentMainImage.image_url);
      }

      await connection.query(
        'INSERT INTO Product_Image (id_product_fk, image_url, is_main, sort_order) VALUES (?, ?, TRUE, 0)',
        [productId, files.mainImage]
      );
    }

    if (Array.isArray(files.secondaryImages) && files.secondaryImages.length) {
      const secondaryRows = files.secondaryImages.map((imageUrl, index) => [productId, imageUrl, false, nextSortOrder + index + 1]);

      await connection.query(
        'INSERT INTO Product_Image (id_product_fk, image_url, is_main, sort_order) VALUES ?',
        [secondaryRows]
      );
    }

    await connection.commit();
    deleteProductImageFiles(imageUrlsToDelete);

    return getManagedProductById(productId, companyId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const toggleManagedProductStatus = async (productId, companyId, isActive) => {
  const existingProduct = await getManagedProductById(productId, companyId);

  if (!existingProduct) {
    throw new Error('Producto no existe o no pertenece a la empresa');
  }

  await pool.query('CALL sp_toggle_variant(?, ?)', [productId, isActive]);

  return getManagedProductById(productId, companyId);
};

const deleteManagedProductImage = async (productId, imageId, companyId = null) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const product = await getManagedProductById(productId, companyId, connection);

    if (!product) {
      throw new Error('Producto no existe o no pertenece a la empresa');
    }

    const imageRows = await listProductImageRowsByProductId(productId, connection);
    const imageRow = imageRows.find((image) => image.id_image === imageId);

    if (!imageRow) {
      throw new Error('Imagen no existe para este producto');
    }

    await connection.query('DELETE FROM Product_Image WHERE id_image = ? LIMIT 1', [imageId]);

    if (imageRow.is_main) {
      const remainingImages = imageRows.filter((image) => image.id_image !== imageId);
      const nextMainImage = remainingImages.sort((left, right) => {
        const leftSort = Number(left.sort_order) || 0;
        const rightSort = Number(right.sort_order) || 0;
        return leftSort - rightSort || left.id_image - right.id_image;
      })[0] ?? null;

      if (nextMainImage) {
        await connection.query(
          `UPDATE Product_Image
           SET is_main = CASE WHEN id_image = ? THEN TRUE ELSE FALSE END,
               sort_order = CASE WHEN id_image = ? THEN 0 ELSE sort_order END
           WHERE id_product_fk = ?`,
          [nextMainImage.id_image, nextMainImage.id_image, productId]
        );
      }
    }

    await connection.commit();
    deleteProductImageFiles([imageRow.image_url]);

    return getManagedProductById(productId, companyId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const adjustManagedProductStock = async (productId, companyId, operation, quantity, notes) => {
  const existingProduct = await getManagedProductById(productId, companyId);

  if (!existingProduct) {
    throw new Error('Producto no existe o no pertenece a la empresa');
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('quantity inválido');
  }

  const normalizedOperation = String(operation || 'set').trim().toLowerCase();
  const resolvedNotes = String(notes || '').trim();

  if (normalizedOperation === 'increase') {
    await pool.query('CALL sp_add_stock(?, ?, ?, ?)', [productId, quantity, 'ADJUSTMENT', resolvedNotes || 'Aumento manual de stock']);
  } else if (normalizedOperation === 'decrease') {
    await pool.query('CALL sp_remove_stock(?, ?, ?, ?)', [productId, quantity, 'ADJUSTMENT', resolvedNotes || 'Disminución manual de stock']);
  } else if (normalizedOperation === 'set') {
    await pool.query('CALL sp_update_stock(?, ?, ?, ?)', [productId, quantity, 'ADJUSTMENT', resolvedNotes || 'Ajuste manual de stock']);
  } else {
    throw new Error('operation inválida');
  }

  return getManagedProductById(productId, companyId);
};

module.exports = {
  listCategories,
  listSubcategoriesByCategory,
  listSubcategoriesForManagement,
  listLinesForManagement,
  listLineReferences,
  listProductsForManagement,
  getManagedProductById,
  listManagedProductStockHistory,
  listPublicCatalog,
  listWholesaleCatalog,
  listRecommendedProducts,
  listProductReviews,
  createProductReview,
  getPublicProductDetail,
  getPublicProductDetailBySku,
  getWholesaleProductDetail,
  getWholesaleProductDetailBySku,
  createCategory,
  updateCategory,
  toggleCategory,
  createSubcategory,
  updateSubcategory,
  toggleSubcategory,
  createProductFull,
  createProductFromReference,
  addVariant,
  updateManagedProduct,
  toggleManagedProductStatus,
  adjustManagedProductStock,
  deleteManagedProductImage
};