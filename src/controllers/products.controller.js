const fs = require('node:fs');
const path = require('node:path');
const { findCompanyById } = require('../services/auth.company.service');
const { parseFlexibleAttributes } = require('../services/product.import.service');

const {
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
} = require('../services/products.service');

const requireCompanyToken = (req, res) => {
  if (req.user?.entity !== 'company') {
    res.status(403).json({ error: 'Token no válido para productos' });
    return false;
  }

  return true;
};

const requireCompanySellAccess = async (req, res, actionLabel = 'usar este módulo') => {
  if (!requireCompanyToken(req, res)) {
    return false;
  }

  if (Number(req.user.id_role) === 1) {
    return true;
  }

  const company = await findCompanyById(Number(req.user.id));

  if (!company) {
    res.status(404).json({ error: 'Empresa no encontrada' });
    return false;
  }

  if (company.verification_status !== 'APPROVED') {
    res.status(403).json({ error: `Tu empresa debe estar jurídicamente aprobada para ${actionLabel}` });
    return false;
  }

  if (!company.can_sell) {
    res.status(403).json({ error: `Tu empresa no tiene permiso comercial para ${actionLabel}` });
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

const requireCompanyBuyAccess = async (req, res, actionLabel = 'usar este módulo') => {
  if (!requireCompanyToken(req, res)) {
    return false;
  }

  if (Number(req.user.id_role) === 1) {
    return true;
  }

  const company = await findCompanyById(Number(req.user.id));

  if (!company) {
    res.status(404).json({ error: 'Empresa no encontrada' });
    return false;
  }

  if (company.verification_status !== 'APPROVED') {
    res.status(403).json({ error: `Tu empresa debe estar jurídicamente aprobada para ${actionLabel}` });
    return false;
  }

  if (!company.can_buy) {
    res.status(403).json({ error: `Tu empresa no tiene permiso comercial para ${actionLabel}` });
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
  const { value: parsedAttributes } = parseFlexibleAttributes(attributes);

  if (!parsedAttributes || typeof parsedAttributes !== 'object' || Array.isArray(parsedAttributes)) {
    throw new Error('attributes debe ser un objeto JSON válido');
  }

  if (!Object.keys(parsedAttributes).length) {
    throw new Error('Debes enviar al menos un atributo');
  }

  return JSON.stringify(parsedAttributes);
};

const normalizeOptionalAttributesInput = (attributes) => {
  if (attributes == null || attributes === '') {
    return null;
  }

  const { value: parsedAttributes } = parseFlexibleAttributes(attributes);

  if (!parsedAttributes || typeof parsedAttributes !== 'object' || Array.isArray(parsedAttributes)) {
    throw new Error('attributes debe ser un objeto JSON válido');
  }

  if (!Object.keys(parsedAttributes).length) {
    throw new Error('Debes enviar al menos un atributo');
  }

  return JSON.stringify(parsedAttributes);
};

const extractUploadedProductImages = (files = {}) => ({
  mainImage: files?.main_image?.[0]?.filename ?? null,
  secondaryImages: Array.isArray(files?.secondary_images)
    ? files.secondary_images.map((file) => file.filename)
    : []
});

const resolveManagedCompanyScope = (req, rawCompanyId) => {
  if (req.user.id_role !== 1) {
    return req.user.id;
  }

  return rawCompanyId ? Number(rawCompanyId) : null;
};

const isProductCreationValidationError = (message) => [
  'attributes debe ser un objeto JSON válido',
  'Debes enviar al menos un atributo',
  'Empresa no existe',
  'Subcategoría no existe',
  'Ya existe una línea o producto con ese nombre para esta empresa',
  'No se pudo crear el producto porque ya existe un registro duplicado',
  'Producto no existe o no pertenece a la empresa',
  'name es requerido',
  'quantity inválido',
  'operation inválida',
  'Stock insuficiente',
  'Imagen no existe para este producto'
].includes(message);

const buildProductUpdateInput = (req) => {
  const companyScope = resolveManagedCompanyScope(req, req.body.id_company);
  const { mainImage, secondaryImages } = extractUploadedProductImages(req.files);

  return {
    companyScope,
    files: {
      mainImage,
      secondaryImages
    },
    updates: {
      name: req.body.name ?? null,
      brand: req.body.brand ?? null,
      description: req.body.description ?? null,
      price: req.body.price == null || req.body.price === '' ? null : Number(req.body.price),
      attributes: req.body.attributes == null ? null : normalizeProductAttributes(req.body.attributes),
      min_stock: req.body.min_stock == null || req.body.min_stock === '' ? null : Number(req.body.min_stock)
    }
  };
};

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
    if (!await requireCompanySellAccess(req, res, 'gestionar subcategorías')) {
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
    if (!await requireCompanySellAccess(req, res, 'gestionar líneas')) {
      return;
    }

    const categoryId = req.query.category_id ? Number(req.query.category_id) : null;
    const subcategoryId = req.query.subcategory_id ? Number(req.query.subcategory_id) : null;

    if (req.query.category_id && (!Number.isInteger(categoryId) || categoryId <= 0)) {
      return res.status(400).json({ error: 'category_id inválido' });
    }

    if (req.query.subcategory_id && (!Number.isInteger(subcategoryId) || subcategoryId <= 0)) {
      return res.status(400).json({ error: 'subcategory_id inválido' });
    }

    const lines = await listLinesForManagement({
      categoryId,
      subcategoryId
    });

    return res.status(200).json({ lines });
  } catch (error) {
    console.error('❌ ERROR GET MANAGED LINES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getLineReferences = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'consultar líneas de referencia')) {
      return;
    }

    const lines = await listLineReferences();

    return res.status(200).json({ lines });
  } catch (error) {
    console.error('❌ ERROR GET LINE REFERENCES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getManagedProducts = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'gestionar productos')) {
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
      search: String(req.query.query ?? req.query.name ?? '').trim(),
      company: String(req.query.company ?? '').trim(),
      categoryId: categoryResult.value,
      subcategoryId: subcategoryResult.value,
      lineId: lineResult.value,
      category: String(req.query.category ?? '').trim(),
      subcategory: String(req.query.subcategory ?? '').trim(),
      line: String(req.query.line ?? '').trim(),
      sort: String(req.query.sort ?? '').trim().toLowerCase(),
      companyId: req.user.id_role === 1 ? null : req.user.id
    };

    const result = await listProductsForManagement(filters);

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ ERROR GET MANAGED PRODUCTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getManagedProductDetail = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'consultar productos gestionados')) {
      return;
    }

    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    const product = await getManagedProductById(productId, req.user.id_role === 1 ? null : req.user.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('❌ ERROR GET MANAGED PRODUCT DETAIL:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getManagedProductStockHistory = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'consultar historial de stock')) {
      return;
    }

    const productId = Number(req.params.productId);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const movementType = String(req.query.movement_type ?? '').trim().toUpperCase();

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ error: 'page inválido' });
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ error: 'limit inválido' });
    }

    const history = await listManagedProductStockHistory(
      productId,
      req.user.id_role === 1 ? null : req.user.id,
      {
        page,
        limit,
        movementType: movementType || null
      }
    );

    return res.status(200).json(history);
  } catch (error) {
    console.error('❌ ERROR GET PRODUCT STOCK HISTORY:', error);
    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const getPublicCatalog = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const categoryResult = parseOptionalPositiveInteger(req.query.category_id, 'category_id');

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ error: 'page inválido' });
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ error: 'limit inválido' });
    }

    if (categoryResult.error) {
      return res.status(400).json({ error: categoryResult.error });
    }

    const result = await listPublicCatalog({
      page,
      limit,
      query: String(req.query.q ?? '').trim(),
      categoryId: categoryResult.value,
      sort: String(req.query.sort ?? 'reviews_desc').trim().toLowerCase() || 'reviews_desc'
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ ERROR GET PUBLIC CATALOG:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getWholesaleCatalogForCompany = async (req, res) => {
  try {
    if (!await requireCompanyBuyAccess(req, res, 'consultar catálogo mayorista')) {
      return;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const categoryResult = parseOptionalPositiveInteger(req.query.category_id, 'category_id');

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ error: 'page inválido' });
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ error: 'limit inválido' });
    }

    if (categoryResult.error) {
      return res.status(400).json({ error: categoryResult.error });
    }

    const result = await listWholesaleCatalog({
      page,
      limit,
      query: String(req.query.q ?? '').trim(),
      categoryId: categoryResult.value,
      sort: String(req.query.sort ?? 'recent').trim().toLowerCase() || 'recent'
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ ERROR GET WHOLESALE CATALOG:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getRecommendedProducts = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const excludeSku = String(req.query.exclude_sku ?? '').trim() || null;
    const products = await listRecommendedProducts({ limit, excludeSku });

    return res.status(200).json({ products });
  } catch (error) {
    console.error('❌ ERROR GET RECOMMENDED PRODUCTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    const result = await listProductReviews(productId);

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ ERROR GET PRODUCT REVIEWS:', error);
    const statusCode = error.message === 'Producto no encontrado' ? 404 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const createPublicProductReview = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const rating = Number(req.body?.rating);
    const comment = req.body?.comment ?? null;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating inválido' });
    }

    const reviewer = {
      id: req.user?.id,
      email: req.user?.email,
      entity: req.user?.entity,
      name: req.user?.entity === 'company'
        ? (req.user?.company_name || req.user?.email)
        : (req.user?.name || req.user?.email)
    };

    const result = await createProductReview({
      productId,
      reviewer,
      rating,
      comment
    });

    return res.status(201).json({
      message: result.action === 'updated'
        ? 'Reseña actualizada correctamente'
        : 'Reseña registrada correctamente',
      ...result
    });
  } catch (error) {
    console.error('❌ ERROR CREATE PRODUCT REVIEW:', error);
    let statusCode = 500;

    if (['productId inválido', 'rating inválido', 'Usuario no válido para reseña'].includes(error.message)) {
      statusCode = 400;
    } else if (error.message === 'Producto no encontrado') {
      statusCode = 404;
    }

    return res.status(statusCode).json({ error: error.message });
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

const getPublicProductBySku = async (req, res) => {
  try {
    const sku = String(req.params.sku ?? '').trim();

    if (!sku) {
      return res.status(400).json({ error: 'sku inválido' });
    }

    const product = await getPublicProductDetailBySku(sku);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('❌ ERROR GET PUBLIC PRODUCT BY SKU:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getWholesaleProductBySku = async (req, res) => {
  try {
    if (!await requireCompanyBuyAccess(req, res, 'consultar detalle mayorista')) {
      return;
    }

    const sku = String(req.params.sku ?? '').trim();

    if (!sku) {
      return res.status(400).json({ error: 'sku inválido' });
    }

    const product = await getWholesaleProductDetailBySku(sku);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('❌ ERROR GET WHOLESALE PRODUCT BY SKU:', error);
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
    if (!await requireCompanySellAccess(req, res, 'crear productos')) {
      return;
    }

    const {
      name,
      line_name,
      id_subcategory,
      reference_line_id,
      id_company,
      brand,
      description,
      price,
      attributes,
      quantity,
      min_stock
    } = req.body;

    if (!name || price == null || quantity == null) {
      return res.status(400).json({
        error: 'name, price y quantity son requeridos'
      });
    }

    if (!reference_line_id && !id_subcategory) {
      return res.status(400).json({
        error: 'id_subcategory es requerido cuando no se usa una línea de referencia'
      });
    }

    const ownerCompanyId = resolveManagedCompanyScope(req, id_company);
    const parsedAttributes = normalizeProductAttributes(attributes);
    const { mainImage, secondaryImages } = extractUploadedProductImages(req.files);

    const product = reference_line_id
      ? await createProductFromReference({
        name: name.trim(),
        reference_line_id: Number(reference_line_id),
        id_company: ownerCompanyId,
        brand: brand ?? null,
        description: description ?? null,
        price: Number(price),
        attributes: parsedAttributes,
        quantity: Number(quantity),
        min_stock: min_stock == null || min_stock === '' ? 0 : Number(min_stock),
        image_url: mainImage,
        secondary_images: secondaryImages
      })
      : await createProductFull({
        name: name.trim(),
        line_name: line_name?.trim() || null,
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
    if (!await requireCompanySellAccess(req, res, 'crear variantes')) {
      return;
    }

    const productId = Number(req.params.productId);
    const {
      name,
      description,
      price,
      attributes,
      quantity,
      min_stock
    } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (!name || price == null || quantity == null) {
      return res.status(400).json({ error: 'name, price y quantity son requeridos' });
    }

    const parsedAttributes = typeof attributes === 'string' ? attributes : JSON.stringify(attributes ?? {});
    const ownerCompanyId = req.user.id_role === 1 && req.body.id_company ? Number(req.body.id_company) : req.user.id;
    const variant = await addVariant({
      id_product: productId,
      id_company: ownerCompanyId,
      name: String(name).trim(),
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
    if (!await requireCompanySellAccess(req, res, 'actualizar productos')) {
      return;
    }

    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    const productUpdateInput = buildProductUpdateInput(req);
    const product = await updateManagedProduct(
      productId,
      productUpdateInput.companyScope,
      productUpdateInput.updates,
      productUpdateInput.files
    );

    return res.status(200).json({
      message: 'Producto actualizado correctamente',
      product
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE PRODUCT:', error);

    if (req.files) {
      deleteUploadedProductFiles(req.files);
    }

    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;

    return res.status(statusCode).json({ error: error.message });
  }
};

const toggleProductStatusManual = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'cambiar el estado de productos')) {
      return;
    }

    const productId = Number(req.params.productId);
    const { is_active, id_company } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active inválido' });
    }

    const product = await toggleManagedProductStatus(
      productId,
      resolveManagedCompanyScope(req, id_company),
      is_active
    );

    return res.status(200).json({
      message: is_active ? 'Producto activado correctamente' : 'Producto desactivado correctamente',
      product
    });
  } catch (error) {
    console.error('❌ ERROR TOGGLE PRODUCT:', error);
    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const updateVariantManual = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'actualizar variantes')) {
      return;
    }

    const variantId = Number(req.params.variantId);
    const { price, attributes } = req.body;

    if (!Number.isInteger(variantId) || variantId <= 0) {
      return res.status(400).json({ error: 'variantId inválido' });
    }

    const variant = await updateManagedProduct(
      variantId,
      req.user.id_role === 1 ? null : req.user.id,
      {
        price: price == null || price === '' ? null : Number(price),
        attributes: normalizeOptionalAttributesInput(attributes)
      }
    );

    return res.status(200).json({
      message: 'Variante actualizada correctamente',
      variant
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE VARIANT:', error);
    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const syncVariantStock = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'sincronizar stock')) {
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

    const stock = await adjustManagedProductStock(
      variantId,
      req.user.id_role === 1 ? null : req.user.id,
      'set',
      Number(quantity),
      notes ?? 'Sincronización manual de stock'
    );

    return res.status(200).json({
      message: 'Stock sincronizado correctamente',
      stock
    });
  } catch (error) {
    console.error('❌ ERROR SYNC STOCK:', error);
    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const adjustProductStockManual = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'ajustar stock')) {
      return;
    }

    const productId = Number(req.params.productId);
    const { operation, quantity, notes, id_company } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (quantity == null || Number.isNaN(Number(quantity))) {
      return res.status(400).json({ error: 'quantity es requerido' });
    }

    const product = await adjustManagedProductStock(
      productId,
      resolveManagedCompanyScope(req, id_company),
      operation,
      Number(quantity),
      notes
    );

    return res.status(200).json({
      message: 'Stock actualizado correctamente',
      product
    });
  } catch (error) {
    console.error('❌ ERROR ADJUST STOCK:', error);
    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const deleteProductImageManual = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'eliminar imágenes de productos')) {
      return;
    }

    const productId = Number(req.params.productId);
    const imageId = Number(req.params.imageId);
    const companyId = resolveManagedCompanyScope(req, req.body.id_company);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    if (!Number.isInteger(imageId) || imageId <= 0) {
      return res.status(400).json({ error: 'imageId inválido' });
    }

    const product = await deleteManagedProductImage(productId, imageId, companyId);

    return res.status(200).json({
      message: 'Imagen eliminada correctamente',
      product
    });
  } catch (error) {
    console.error('❌ ERROR DELETE PRODUCT IMAGE:', error);
    const statusCode = isProductCreationValidationError(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  getSubcategoriesByCategory,
  getManagedSubcategories,
  getManagedLines,
  getLineReferences,
  getManagedProducts,
  getManagedProductDetail,
  getManagedProductStockHistory,
  getPublicCatalog,
  getWholesaleCatalogForCompany,
  getRecommendedProducts,
  getProductReviews,
  createPublicProductReview,
  getPublicProduct,
  getPublicProductBySku,
  getWholesaleProductBySku,
  createCategoryManual,
  updateCategoryManual,
  toggleCategoryStatusManual,
  createSubcategoryManual,
  updateSubcategoryManual,
  toggleSubcategoryStatusManual,
  createProductManual,
  addVariantManual,
  updateProductManual,
  toggleProductStatusManual,
  adjustProductStockManual,
  deleteProductImageManual,
  updateVariantManual,
  syncVariantStock
};