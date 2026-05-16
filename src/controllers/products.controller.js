const fs = require('node:fs');
const path = require('node:path');

const {
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
} = require('../services/products.service');

const requireCompanyToken = (req, res) => {
  if (req.user?.entity !== 'company') {
    res.status(403).json({ error: 'Token no válido para productos' });
    return false;
  }

  return true;
};

const requireAdminCompany = (req, res) => {
  if (!requireCompanyToken(req, res)) {
    return false;
  }

  if (req.user.id_role !== 1) {
    res.status(403).json({ error: 'Solo el admin puede realizar esta acción' });
    return false;
  }

  return true;
};

const parseOptionalPositiveInteger = (rawValue, fieldName) => {
  if (!rawValue) {
    return { value: null };
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return { error: `${fieldName} inválido` };
  }

  return { value: parsedValue };
};

const deleteUploadedProductFiles = (files = {}) => {
  const uploadedFiles = [
    ...(Array.isArray(files.main_image) ? files.main_image : []),
    ...(Array.isArray(files.secondary_images) ? files.secondary_images : [])
  ];

  uploadedFiles.forEach((file) => {
    if (!file?.path) {
      return;
    }

    const absolutePath = path.resolve(file.path);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  });
};

const normalizeProductAttributes = (attributes) => {
  const rawAttributes = typeof attributes === 'string'
    ? attributes.trim()
    : JSON.stringify(attributes ?? {});

  const parsedAttributes = JSON.parse(rawAttributes || '{}');

  if (!parsedAttributes || typeof parsedAttributes !== 'object' || Array.isArray(parsedAttributes)) {
    throw new Error('attributes debe ser un objeto JSON válido');
  }

  if (!Object.keys(parsedAttributes).length) {
    throw new Error('Debes enviar al menos un atributo');
  }

  return JSON.stringify(parsedAttributes);
};

const isProductCreationValidationError = (message) => [
  'attributes debe ser un objeto JSON válido',
  'Debes enviar al menos un atributo',
  'Empresa no existe',
  'Subcategoría no existe',
  'Ya existe una línea o producto con ese nombre para esta empresa',
  'No se pudo crear el producto porque ya existe un registro duplicado'
].includes(message);

const getCategories = async (_req, res) => {
  try {
    const categories = await listCategories();

    return res.status(200).json({ categories });
  } catch (error) {
    console.error('❌ ERROR GET CATEGORIES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getSubcategoriesByCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: 'categoryId inválido' });
    }

    const subcategories = await listSubcategoriesByCategory(categoryId);

    return res.status(200).json({ subcategories });
  } catch (error) {
    console.error('❌ ERROR GET SUBCATEGORIES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getManagedSubcategories = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const categoryId = req.query.category_id ? Number(req.query.category_id) : null;

    if (req.query.category_id && (!Number.isInteger(categoryId) || categoryId <= 0)) {
      return res.status(400).json({ error: 'category_id inválido' });
    }

    const subcategories = await listSubcategoriesForManagement(categoryId);

    return res.status(200).json({ subcategories });
  } catch (error) {
    console.error('❌ ERROR GET MANAGED SUBCATEGORIES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getManagedLines = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const requestedCompanyId = req.query.company_id ? Number(req.query.company_id) : null;
    const categoryId = req.query.category_id ? Number(req.query.category_id) : null;
    const subcategoryId = req.query.subcategory_id ? Number(req.query.subcategory_id) : null;

    if (req.query.company_id && (!Number.isInteger(requestedCompanyId) || requestedCompanyId <= 0)) {
      return res.status(400).json({ error: 'company_id inválido' });
    }

    if (req.query.category_id && (!Number.isInteger(categoryId) || categoryId <= 0)) {
      return res.status(400).json({ error: 'category_id inválido' });
    }

    if (req.query.subcategory_id && (!Number.isInteger(subcategoryId) || subcategoryId <= 0)) {
      return res.status(400).json({ error: 'subcategory_id inválido' });
    }

    const companyId = req.user.id_role === 1
      ? requestedCompanyId
      : req.user.id;

    const lines = await listLinesForManagement({
      companyId,
      categoryId,
      subcategoryId
    });

    return res.status(200).json({ lines });
  } catch (error) {
    console.error('❌ ERROR GET MANAGED LINES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getManagedProducts = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const categoryResult = parseOptionalPositiveInteger(req.query.category_id, 'category_id');
    const subcategoryResult = parseOptionalPositiveInteger(req.query.subcategory_id, 'subcategory_id');
    const lineResult = parseOptionalPositiveInteger(req.query.line_id, 'line_id');

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ error: 'page inválido' });
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ error: 'limit inválido' });
    }

    const invalidResult = [categoryResult, subcategoryResult, lineResult].find((result) => result.error);

    if (invalidResult) {
      return res.status(400).json({ error: invalidResult.error });
    }

    const filters = {
      page,
      limit,
      name: String(req.query.name ?? '').trim(),
      company: String(req.query.company ?? '').trim(),
      categoryId: categoryResult.value,
      subcategoryId: subcategoryResult.value,
      lineId: lineResult.value,
      category: String(req.query.category ?? '').trim(),
      subcategory: String(req.query.subcategory ?? '').trim(),
      line: String(req.query.line ?? '').trim(),
      companyId: req.user.id_role === 1 ? null : req.user.id
    };

    const result = await listProductsForManagement(filters);

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ ERROR GET MANAGED PRODUCTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getPublicCatalog = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 12;
    const products = await listPublicCatalog(limit);

    return res.status(200).json({ products });
  } catch (error) {
    console.error('❌ ERROR GET PUBLIC CATALOG:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getPublicProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    const product = await getPublicProductDetail(productId);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('❌ ERROR GET PUBLIC PRODUCT:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createCategoryManual = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name es requerido' });
    }

    const category = await createCategory(name.trim());

    return res.status(201).json({
      message: 'Categoría creada correctamente',
      category
    });
  } catch (error) {
    console.error('❌ ERROR CREATE CATEGORY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateCategoryManual = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const categoryId = Number(req.params.categoryId);
    const name = String(req.body.name ?? '').trim();

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: 'categoryId inválido' });
    }

    if (!name) {
      return res.status(400).json({ error: 'name es requerido' });
    }

    const category = await updateCategory(categoryId, name);

    return res.status(200).json({
      message: 'Categoría actualizada correctamente',
      category
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE CATEGORY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const toggleCategoryStatusManual = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const categoryId = Number(req.params.categoryId);
    const { is_active } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: 'categoryId inválido' });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active inválido' });
    }

    const category = await toggleCategory(categoryId, is_active);

    return res.status(200).json({
      message: is_active ? 'Categoría activada correctamente' : 'Categoría desactivada correctamente',
      category
    });
  } catch (error) {
    console.error('❌ ERROR TOGGLE CATEGORY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createSubcategoryManual = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const { name, category_id } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'name y category_id son requeridos' });
    }

    const subcategory = await createSubcategory(name.trim(), Number(category_id));

    return res.status(201).json({
      message: 'Subcategoría creada correctamente',
      subcategory
    });
  } catch (error) {
    console.error('❌ ERROR CREATE SUBCATEGORY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateSubcategoryManual = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const subcategoryId = Number(req.params.subcategoryId);
    const name = String(req.body.name ?? '').trim();
    const categoryId = req.body.category_id == null ? null : Number(req.body.category_id);

    if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
      return res.status(400).json({ error: 'subcategoryId inválido' });
    }

    if (!name) {
      return res.status(400).json({ error: 'name es requerido' });
    }

    if (req.body.category_id != null && (!Number.isInteger(categoryId) || categoryId <= 0)) {
      return res.status(400).json({ error: 'category_id inválido' });
    }

    const subcategory = await updateSubcategory(subcategoryId, name, categoryId);

    return res.status(200).json({
      message: 'Subcategoría actualizada correctamente',
      subcategory
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE SUBCATEGORY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const toggleSubcategoryStatusManual = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const subcategoryId = Number(req.params.subcategoryId);
    const { is_active } = req.body;

    if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
      return res.status(400).json({ error: 'subcategoryId inválido' });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active inválido' });
    }

    const subcategory = await toggleSubcategory(subcategoryId, is_active);

    return res.status(200).json({
      message: is_active ? 'Subcategoría activada correctamente' : 'Subcategoría desactivada correctamente',
      subcategory
    });
  } catch (error) {
    console.error('❌ ERROR TOGGLE SUBCATEGORY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createProductManual = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const {
      name,
      id_subcategory,
      id_company,
      brand,
      description,
      price,
      attributes,
      quantity,
      min_stock
    } = req.body;

    if (!name || !id_subcategory || price == null || quantity == null) {
      return res.status(400).json({
        error: 'name, id_subcategory, price y quantity son requeridos'
      });
    }

    const ownerCompanyId = req.user.id_role === 1 && id_company ? Number(id_company) : req.user.id;
    const parsedAttributes = normalizeProductAttributes(attributes);
    const mainImage = req.files?.main_image?.[0]?.filename ?? null;
    const secondaryImages = Array.isArray(req.files?.secondary_images)
      ? req.files.secondary_images.map((file) => file.filename)
      : [];

    const product = await createProductFull({
      name: name.trim(),
      id_subcategory: Number(id_subcategory),
      id_company: ownerCompanyId,
      brand: brand ?? null,
      description: description ?? null,
      price: Number(price),
      attributes: parsedAttributes,
      quantity: Number(quantity),
      min_stock: min_stock == null || min_stock === '' ? 0 : Number(min_stock),
      image_url: mainImage,
      secondary_images: secondaryImages
    });

    return res.status(201).json({
      message: 'Producto creado correctamente',
      product
    });
  } catch (error) {
    console.error('❌ ERROR CREATE PRODUCT:', error);

    if (req.files) {
      deleteUploadedProductFiles(req.files);
    }

    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;

    return res.status(statusCode).json({ error: error.message });
  }
};

const addVariantManual = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const productId = Number(req.params.productId);
    const {
      description,
      price,
      attributes,
      quantity,
      min_stock
    } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (price == null || quantity == null) {
      return res.status(400).json({ error: 'price y quantity son requeridos' });
    }

    const parsedAttributes = typeof attributes === 'string' ? attributes : JSON.stringify(attributes ?? {});
    const variant = await addVariant({
      id_product: productId,
      description: description ?? null,
      price: Number(price),
      attributes: parsedAttributes,
      quantity: Number(quantity),
      min_stock: min_stock == null || min_stock === '' ? 0 : Number(min_stock),
      image_url: req.file?.filename ?? null
    });

    return res.status(201).json({
      message: 'Variante creada correctamente',
      variant
    });
  } catch (error) {
    console.error('❌ ERROR ADD VARIANT:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateProductManual = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const productId = Number(req.params.productId);
    const { name, brand } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    const product = await updateProduct(productId, name ?? null, brand ?? null);

    return res.status(200).json({
      message: 'Producto actualizado correctamente',
      product
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE PRODUCT:', error);
    return res.status(500).json({ error: error.message });
  }
};

const toggleLineStatusManual = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const productId = Number(req.params.productId);
    const { is_active } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active inválido' });
    }

    const line = await toggleLine(productId, is_active);

    return res.status(200).json({
      message: is_active ? 'Línea activada correctamente' : 'Línea desactivada correctamente',
      line
    });
  } catch (error) {
    console.error('❌ ERROR TOGGLE LINE:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateVariantManual = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const variantId = Number(req.params.variantId);
    const { price, attributes } = req.body;

    if (!Number.isInteger(variantId) || variantId <= 0) {
      return res.status(400).json({ error: 'variantId inválido' });
    }

    let parsedAttributes = null;

    if (attributes != null) {
      parsedAttributes = typeof attributes === 'string'
        ? attributes
        : JSON.stringify(attributes);
    }

    const variant = await updateVariant(
      variantId,
      price == null || price === '' ? null : Number(price),
      parsedAttributes
    );

    return res.status(200).json({
      message: 'Variante actualizada correctamente',
      variant
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE VARIANT:', error);
    return res.status(500).json({ error: error.message });
  }
};

const syncVariantStock = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const variantId = Number(req.params.variantId);
    const { quantity, notes } = req.body;

    if (!Number.isInteger(variantId) || variantId <= 0) {
      return res.status(400).json({ error: 'variantId inválido' });
    }

    if (quantity == null || Number.isNaN(Number(quantity))) {
      return res.status(400).json({ error: 'quantity es requerido' });
    }

    const stock = await syncStock(variantId, Number(quantity), notes ?? 'Sincronización manual de stock');

    return res.status(200).json({
      message: 'Stock sincronizado correctamente',
      stock
    });
  } catch (error) {
    console.error('❌ ERROR SYNC STOCK:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  getSubcategoriesByCategory,
  getManagedSubcategories,
  getManagedLines,
  getManagedProducts,
  getPublicCatalog,
  getPublicProduct,
  createCategoryManual,
  updateCategoryManual,
  toggleCategoryStatusManual,
  createSubcategoryManual,
  updateSubcategoryManual,
  toggleSubcategoryStatusManual,
  createProductManual,
  addVariantManual,
  updateProductManual,
  toggleLineStatusManual,
  updateVariantManual,
  syncVariantStock
};