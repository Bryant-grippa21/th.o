const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

const COMPANY_ROLE = {
  WHOLESALER: 2,
  RETAILER: 3
};

const CART_STATUS = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED'
};

const PAYMENT_MODE = {
  ONE_TIME: 'ONE_TIME',
  INSTALLMENTS: 'INSTALLMENTS'
};

const storageRootDir = path.resolve(__dirname, '../storage/b2b');
const retailerCartDir = path.join(storageRootDir, 'retailer-cart');

const ensureStorageDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const normalizeText = (value, maxLength = 255) => {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
};

const normalizePositiveInt = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} invalido`);
  }

  return parsed;
};

const normalizeMoney = (value, fieldName) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${fieldName} invalido`);
  }

  return Math.round(amount * 100) / 100;
};

const normalizePaymentMode = (value) => {
  const normalized = String(value || '').trim().toUpperCase();

  if (!normalized) {
    return PAYMENT_MODE.ONE_TIME;
  }

  if (!new Set([PAYMENT_MODE.ONE_TIME, PAYMENT_MODE.INSTALLMENTS]).has(normalized)) {
    throw new Error('payment_mode invalido');
  }

  return normalized;
};

const getRetailerCartFilePath = (retailerId) => {
  const normalizedRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  return path.join(retailerCartDir, `${normalizedRetailerId}.json`);
};

const createDefaultRetailerCart = (retailerId) => ({
  id_retailer: retailerId,
  status: CART_STATUS.ACTIVE,
  locked_at: null,
  submitted_at: null,
  groups: [],
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

const resolveProfileImageUrl = (imageName) => {
  const normalizedImageName = String(imageName || '').trim();

  if (!normalizedImageName) {
    return null;
  }

  return `/uploads/profiles/companies/${normalizedImageName}`;
};

const resolveProductImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  const normalizedPath = String(imageUrl).trim().replaceAll('\\', '/');

  if (!normalizedPath) {
    return null;
  }

  const productPrefix = '/uploads/products/';
  const legacyPrefix = 'uploads/products/';

  let relativePath = normalizedPath;

  if (relativePath.startsWith(productPrefix)) {
    relativePath = relativePath.slice(productPrefix.length);
  } else if (relativePath.startsWith(legacyPrefix)) {
    relativePath = relativePath.slice(legacyPrefix.length);
  } else if (relativePath.startsWith('/')) {
    relativePath = relativePath.slice(1);
  }

  const safeRelativePath = path.posix.normalize(relativePath).replace(/^\.(\/|$)/, '');

  if (!safeRelativePath || safeRelativePath.startsWith('..')) {
    return null;
  }

  return `/uploads/products/${safeRelativePath.replaceAll('\\', '/')}`;
};

const getProductSnapshot = async (productId) => {
  const normalizedProductId = normalizePositiveInt(productId, 'id_product');
  const [rows] = await pool.query(
    `SELECT p.id_product,
            p.id_company_fk,
            p.sku,
            p.name,
            p.price,
            p.is_active,
            c.name AS company_name,
            c.email AS company_email,
            c.mail_address AS company_address,
            c.cell_phone AS company_phone,
            c.img_profile AS company_image_name,
            c.id_role_fk AS company_role_fk,
            c.can_sell,
            c.verification_status,
            image.image_url AS main_image_url
     FROM Product p
     INNER JOIN Company c ON c.id_company = p.id_company_fk
     LEFT JOIN Product_Image image
       ON image.id_product_fk = p.id_product
      AND image.is_main = TRUE
     WHERE p.id_product = ?
     LIMIT 1`,
    [normalizedProductId]
  );

  const row = rows[0];

  if (!row) {
    throw new Error('Producto no existe');
  }

  if (!row.is_active) {
    throw new Error('Producto no disponible');
  }

  if (Number(row.company_role_fk) !== COMPANY_ROLE.WHOLESALER || !row.can_sell) {
    throw new Error('El producto no pertenece a una empresa habilitada para cotizar');
  }

  return {
    id_product: Number(row.id_product),
    id_company_fk: Number(row.id_company_fk),
    sku: normalizeText(row.sku, 64),
    name: normalizeText(row.name, 255),
    price_usd: normalizeMoney(row.price, 'price_usd'),
    company_name: normalizeText(row.company_name, 255),
    company_email: normalizeText(row.company_email, 255),
    company_address: normalizeText(row.company_address, 255),
    company_phone: normalizeText(row.company_phone, 30),
    company_image_url: resolveProfileImageUrl(row.company_image_name),
    main_image_url: resolveProductImageUrl(row.main_image_url)
  };
};

const normalizeCartItem = (item) => {
  const quantity = normalizePositiveInt(item?.quantity, 'quantity');

  return {
    id_product: normalizePositiveInt(item?.id_product, 'id_product'),
    quantity,
    product_name: normalizeText(item?.product_name, 255),
    sku: normalizeText(item?.sku, 64),
    unit_price_usd: normalizeMoney(item?.unit_price_usd, 'unit_price_usd'),
    company_id: normalizePositiveInt(item?.company_id, 'company_id'),
    company_name: normalizeText(item?.company_name, 255),
    company_email: normalizeText(item?.company_email, 255),
    company_address: normalizeText(item?.company_address, 255),
    company_phone: normalizeText(item?.company_phone, 30),
    company_image_url: normalizeText(item?.company_image_url, 255),
    main_image_url: normalizeText(item?.main_image_url, 255),
    created_at: item?.created_at || new Date().toISOString(),
    updated_at: item?.updated_at || new Date().toISOString()
  };
};

const normalizeCartGroup = (group) => {
  const companyId = normalizePositiveInt(group?.company_id, 'company_id');
  const items = Array.isArray(group?.items)
    ? group.items
        .map((item) => normalizeCartItem({
          ...item,
          company_id: companyId,
          company_name: group?.company_name,
          company_email: group?.company_email,
          company_address: group?.company_address,
          company_phone: group?.company_phone,
          company_image_url: group?.company_image_url
        }))
        .filter((item, index, values) => values.findIndex((candidate) => candidate.id_product === item.id_product) === index)
    : [];

  return {
    company_id: companyId,
    company_name: normalizeText(group?.company_name, 255),
    company_email: normalizeText(group?.company_email, 255),
    company_address: normalizeText(group?.company_address, 255),
    company_phone: normalizeText(group?.company_phone, 30),
    company_image_url: normalizeText(group?.company_image_url, 255),
    payment_mode: normalizePaymentMode(group?.payment_mode),
    note: normalizeText(group?.note, 1000),
    items,
    created_at: group?.created_at || new Date().toISOString(),
    updated_at: group?.updated_at || new Date().toISOString()
  };
};

const normalizeRetailerCart = (retailerId, payload) => {
  const normalizedGroups = Array.isArray(payload?.groups)
    ? payload.groups
        .map((group) => normalizeCartGroup(group))
        .reduce((accumulator, group) => {
          const existingGroup = accumulator.find((candidate) => candidate.company_id === group.company_id);

          if (!existingGroup) {
            accumulator.push(group);
            return accumulator;
          }

          existingGroup.items = group.items;
          existingGroup.payment_mode = group.payment_mode;
          existingGroup.note = group.note;
          existingGroup.updated_at = group.updated_at;
          existingGroup.company_name = group.company_name || existingGroup.company_name;
          existingGroup.company_email = group.company_email || existingGroup.company_email;
          existingGroup.company_address = group.company_address || existingGroup.company_address;
          existingGroup.company_phone = group.company_phone || existingGroup.company_phone;
          existingGroup.company_image_url = group.company_image_url || existingGroup.company_image_url;
          return accumulator;
        }, [])
    : [];

  return {
    id_retailer: normalizePositiveInt(retailerId, 'retailerId'),
    status: CART_STATUS.ACTIVE,
    locked_at: null,
    submitted_at: payload?.submitted_at || null,
    groups: normalizedGroups.filter((group) => group.items.length > 0),
    updated_at: payload?.updated_at || new Date().toISOString()
  };
};

const decorateCart = (cart) => {
  const groups = Array.isArray(cart.groups) ? cart.groups : [];

  const decoratedGroups = groups.map((group) => {
    const items = Array.isArray(group.items) ? group.items : [];
    const itemsCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const subtotalUsd = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price_usd || 0)), 0);

    return {
      ...group,
      items_count: itemsCount,
      subtotal_usd: Number(subtotalUsd.toFixed(2))
    };
  });

  const groupsCount = decoratedGroups.length;
  const totalItems = decoratedGroups.reduce((sum, group) => sum + Number(group.items_count || 0), 0);
  const subtotalUsd = decoratedGroups.reduce((sum, group) => sum + Number(group.subtotal_usd || 0), 0);

  return {
    ...cart,
    groups: decoratedGroups,
    groups_count: groupsCount,
    total_items: totalItems,
    subtotal_usd: Number(subtotalUsd.toFixed(2))
  };
};

const readRetailerCart = async (retailerId) => {
  await ensureStorageDir(retailerCartDir);
  const filePath = getRetailerCartFilePath(retailerId);
  const cart = normalizeRetailerCart(retailerId, await readJsonFile(filePath, createDefaultRetailerCart(retailerId)));
  return decorateCart(cart);
};

const writeRetailerCart = async (retailerId, payload) => {
  await ensureStorageDir(retailerCartDir);
  const filePath = getRetailerCartFilePath(retailerId);
  const nextValue = normalizeRetailerCart(retailerId, payload);
  nextValue.updated_at = new Date().toISOString();
  await writeJsonFile(filePath, nextValue);
  return decorateCart(nextValue);
};

const assertRetailerCartEditable = (cart) => {
  if (String(cart.status) === CART_STATUS.LOCKED) {
    throw new Error('El carrito B2B esta bloqueado');
  }
};

const getRetailerCart = async (retailerId) => readRetailerCart(retailerId);

const setRetailerCartItem = async (retailerId, productId, quantity) => {
  const normalizedRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const normalizedProductId = normalizePositiveInt(productId, 'id_product');
  const normalizedQuantity = Number(quantity);

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 0) {
    throw new Error('quantity invalida');
  }

  const currentCart = await readRetailerCart(normalizedRetailerId);
  assertRetailerCartEditable(currentCart);

  const product = await getProductSnapshot(normalizedProductId);
  const nextGroups = Array.isArray(currentCart.groups) ? currentCart.groups.map((group) => ({
    ...group,
    items: Array.isArray(group.items) ? group.items.map((item) => ({ ...item })) : []
  })) : [];

  const currentGroupIndex = nextGroups.findIndex((group) => group.company_id === product.id_company_fk);

  if (normalizedQuantity === 0) {
    if (currentGroupIndex !== -1) {
      nextGroups[currentGroupIndex].items = nextGroups[currentGroupIndex].items.filter((item) => item.id_product !== normalizedProductId);

      if (!nextGroups[currentGroupIndex].items.length) {
        nextGroups.splice(currentGroupIndex, 1);
      }
    }

    return writeRetailerCart(normalizedRetailerId, {
      ...currentCart,
      groups: nextGroups
    });
  }

  const nextItem = {
    id_product: product.id_product,
    quantity: normalizedQuantity,
    product_name: product.name,
    sku: product.sku,
    unit_price_usd: product.price_usd,
    company_id: product.id_company_fk,
    company_name: product.company_name,
    company_email: product.company_email,
    company_address: product.company_address,
    company_phone: product.company_phone,
    company_image_url: product.company_image_url,
    main_image_url: product.main_image_url,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (currentGroupIndex === -1) {
    nextGroups.push({
      company_id: product.id_company_fk,
      company_name: product.company_name,
      company_email: product.company_email,
      company_address: product.company_address,
      company_phone: product.company_phone,
      company_image_url: product.company_image_url,
      payment_mode: PAYMENT_MODE.ONE_TIME,
      note: null,
      items: [nextItem],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } else {
    const currentGroup = nextGroups[currentGroupIndex];
    const currentItemIndex = currentGroup.items.findIndex((item) => item.id_product === normalizedProductId);

    if (currentItemIndex === -1) {
      currentGroup.items.push(nextItem);
    } else {
      currentGroup.items[currentItemIndex] = {
        ...currentGroup.items[currentItemIndex],
        quantity: normalizedQuantity,
        product_name: product.name,
        sku: product.sku,
        unit_price_usd: product.price_usd,
        company_name: product.company_name,
        company_email: product.company_email,
        company_address: product.company_address,
        company_phone: product.company_phone,
        company_image_url: product.company_image_url,
        main_image_url: product.main_image_url,
        updated_at: new Date().toISOString()
      };
    }

    currentGroup.company_name = currentGroup.company_name || product.company_name;
    currentGroup.company_email = currentGroup.company_email || product.company_email;
    currentGroup.company_address = currentGroup.company_address || product.company_address;
    currentGroup.company_phone = currentGroup.company_phone || product.company_phone;
    currentGroup.company_image_url = currentGroup.company_image_url || product.company_image_url;
    currentGroup.updated_at = new Date().toISOString();
  }

  return writeRetailerCart(normalizedRetailerId, {
    ...currentCart,
    groups: nextGroups
  });
};

const removeRetailerCartItem = async (retailerId, productId) => {
  const normalizedRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const normalizedProductId = normalizePositiveInt(productId, 'id_product');
  const currentCart = await readRetailerCart(normalizedRetailerId);
  assertRetailerCartEditable(currentCart);

  const nextGroups = Array.isArray(currentCart.groups) ? currentCart.groups.map((group) => ({
    ...group,
    items: Array.isArray(group.items) ? group.items.filter((item) => item.id_product !== normalizedProductId) : []
  })).filter((group) => group.items.length > 0) : [];

  return writeRetailerCart(normalizedRetailerId, {
    ...currentCart,
    groups: nextGroups
  });
};

const updateRetailerCartGroup = async ({ retailerId, companyId, paymentMode, note }) => {
  const normalizedRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const normalizedCompanyId = normalizePositiveInt(companyId, 'companyId');
  const currentCart = await readRetailerCart(normalizedRetailerId);
  assertRetailerCartEditable(currentCart);

  const nextGroups = Array.isArray(currentCart.groups) ? currentCart.groups.map((group) => ({ ...group })) : [];
  const currentGroup = nextGroups.find((group) => group.company_id === normalizedCompanyId);

  if (!currentGroup) {
    throw new Error('Grupo no encontrado');
  }

  currentGroup.payment_mode = normalizePaymentMode(paymentMode ?? currentGroup.payment_mode);
  currentGroup.note = normalizeText(note, 1000);
  currentGroup.updated_at = new Date().toISOString();

  return writeRetailerCart(normalizedRetailerId, {
    ...currentCart,
    groups: nextGroups
  });
};

const clearRetailerCart = async (retailerId) => {
  const normalizedRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const currentCart = await readRetailerCart(normalizedRetailerId);
  assertRetailerCartEditable(currentCart);
  const nextValue = createDefaultRetailerCart(normalizedRetailerId);
  await writeJsonFile(getRetailerCartFilePath(normalizedRetailerId), nextValue);
  return decorateCart(nextValue);
};

const lockRetailerCart = async (retailerId) => {
  const normalizedRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const currentCart = await readRetailerCart(normalizedRetailerId);

  if (String(currentCart.status) === CART_STATUS.LOCKED) {
    return currentCart;
  }

  const nextValue = {
    ...currentCart,
    status: CART_STATUS.LOCKED,
    locked_at: new Date().toISOString(),
    submitted_at: currentCart.submitted_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    groups: []
  };

  await writeJsonFile(getRetailerCartFilePath(normalizedRetailerId), nextValue);
  return decorateCart(nextValue);
};

module.exports = {
  CART_STATUS,
  PAYMENT_MODE,
  getRetailerCart,
  setRetailerCartItem,
  removeRetailerCartItem,
  updateRetailerCartGroup,
  clearRetailerCart,
  lockRetailerCart
};