const {
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
    const parsedAttributes = typeof attributes === 'string' ? attributes : JSON.stringify(attributes ?? {});
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
      image_url: req.file?.filename ?? null
    });

    return res.status(201).json({
      message: 'Producto creado correctamente',
      product
    });
  } catch (error) {
    console.error('❌ ERROR CREATE PRODUCT:', error);
    return res.status(500).json({ error: error.message });
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
  getPublicCatalog,
  getPublicProduct,
  createCategoryManual,
  createSubcategoryManual,
  createProductManual,
  addVariantManual,
  updateProductManual,
  updateVariantManual,
  syncVariantStock
};