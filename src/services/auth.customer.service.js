const pool = require('../config/db');
const CASHBACK_GROUP_REF_OFFSET = 1000000000;
const CASHBACK_CHECKOUT_REF_OFFSET = 2000000000;

const buildOrderCode = (checkoutId, createdAt) => {
  const dateValue = new Date(createdAt);
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return `THO-${String(checkoutId).padStart(6, '0')}-${year}${month}${day}`;
};

// 🟢 REGISTRO LOCAL
const registerLocalUser = async (userData) => {
  const { name, email, password_hash, cell_phone, mail_address } = userData;

  await pool.query(
    'INSERT INTO Customer (name, email, password_hash, cell_phone, mail_address, auth_provider, is_new, is_verified) VALUES (?, ?, ?, ?, ?, ?, TRUE, FALSE)',
    [name, email, password_hash, cell_phone, mail_address, 'local']
  );

  const [rows] = await pool.query(
    'SELECT id_customer FROM Customer WHERE email = ?',
    [email]
  );

  if (rows[0]) {
    await pool.query(
      'INSERT INTO Cashback (id_customer_fk, value) VALUES (?, 0)',
      [rows[0].id_customer]
    );
  }

  return true;
};

// 🔍 BUSCAR POR EMAIL
const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM Customer WHERE email = ?',
    [email]
  );
  return rows[0];
};

// 🔍 BUSCAR POR ID
const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM Customer WHERE id_customer = ?',
    [id]
  );
  return rows[0];
};

const getCustomerCashbackOverview = async (customerId) => {
  const normalizedCustomerId = Number(customerId);

  const [cashbackRows] = await pool.query(
    `SELECT id_cashback, value, created_at, updated_at
     FROM Cashback
     WHERE id_customer_fk = ?
     LIMIT 1`,
    [normalizedCustomerId]
  );

  const cashback = cashbackRows[0]
    ? {
        id_cashback: cashbackRows[0].id_cashback,
        value: Number(cashbackRows[0].value || 0),
        created_at: cashbackRows[0].created_at,
        updated_at: cashbackRows[0].updated_at
      }
    : {
        id_cashback: null,
        value: 0,
        created_at: null,
        updated_at: null
      };

  if (!cashback.id_cashback) {
    return {
      cashback,
      history: []
    };
  }

  const [historyRows] = await pool.query(
    `SELECT id_cashback_history,
            id_transaction_fk,
            value,
            transaction_type,
            created_at
     FROM Cashback_History
     WHERE id_cashback_fk = ?
     ORDER BY created_at DESC, id_cashback_history DESC`,
    [cashback.id_cashback]
  );

  const itemIds = [...new Set(historyRows
    .filter((row) => Number(row.id_transaction_fk) > 0 && Number(row.id_transaction_fk) < CASHBACK_GROUP_REF_OFFSET)
    .map((row) => Number(row.id_transaction_fk)))];
  const groupIds = [...new Set(historyRows
    .filter((row) => Number(row.id_transaction_fk) >= CASHBACK_GROUP_REF_OFFSET && Number(row.id_transaction_fk) < CASHBACK_CHECKOUT_REF_OFFSET)
    .map((row) => Number(row.id_transaction_fk) - CASHBACK_GROUP_REF_OFFSET))];
  const checkoutIds = [...new Set(historyRows
    .filter((row) => Number(row.id_transaction_fk) >= CASHBACK_CHECKOUT_REF_OFFSET)
    .map((row) => Number(row.id_transaction_fk) - CASHBACK_CHECKOUT_REF_OFFSET))];

  const itemPlaceholders = itemIds.map(() => '?').join(', ');
  const groupPlaceholders = groupIds.map(() => '?').join(', ');
  const checkoutPlaceholders = checkoutIds.map(() => '?').join(', ');

  const [itemRows, groupRows, checkoutRows] = await Promise.all([
    itemIds.length
      ? pool.query(
          `SELECT pi.id_purchase_item,
                  pi.id_purchase_group_fk,
                  pi.id_product_fk,
                  pi.quantity,
                  pi.subtotal_usd,
                  p.name AS product_name,
                  p.sku
           FROM Purchase_Item pi
           LEFT JOIN Product p ON p.id_product = pi.id_product_fk
           WHERE pi.id_purchase_item IN (${itemPlaceholders})`,
          itemIds
        ).then(([rows]) => rows)
      : Promise.resolve([]),
    groupIds.length
      ? pool.query(
          `SELECT pg.id_purchase_group,
                  pg.id_checkout_fk,
                  pg.status,
                  pg.subtotal_usd,
                  co.name AS company_name
           FROM Purchase_Group pg
           INNER JOIN Company co ON co.id_company = pg.id_company_fk
           WHERE pg.id_purchase_group IN (${groupPlaceholders})`,
          groupIds
        ).then(([rows]) => rows)
      : Promise.resolve([]),
    checkoutIds.length
      ? pool.query(
          `SELECT id_checkout, created_at, total_usd, status
           FROM Purchase_Checkout
           WHERE id_checkout IN (${checkoutPlaceholders})`,
          checkoutIds
        ).then(([rows]) => rows)
      : Promise.resolve([])
  ]);

  const itemsById = new Map(itemRows.map((row) => [row.id_purchase_item, row]));
  const groupsById = new Map(groupRows.map((row) => [row.id_purchase_group, row]));
  const checkoutsById = new Map(checkoutRows.map((row) => [row.id_checkout, row]));

  return {
    cashback,
    history: historyRows.map((row) => ({
      id_cashback_history: row.id_cashback_history,
      id_purchase_item: Number(row.id_transaction_fk) < CASHBACK_GROUP_REF_OFFSET ? row.id_transaction_fk : null,
      value: Number(row.value || 0),
      transaction_type: row.transaction_type,
      created_at: row.created_at,
      purchase_item: itemsById.get(Number(row.id_transaction_fk))
        ? {
            id_purchase_item: itemsById.get(Number(row.id_transaction_fk)).id_purchase_item,
            id_purchase_group: itemsById.get(Number(row.id_transaction_fk)).id_purchase_group_fk,
            id_product: itemsById.get(Number(row.id_transaction_fk)).id_product_fk,
            quantity: Number(itemsById.get(Number(row.id_transaction_fk)).quantity || 0),
            subtotal_usd: Number(itemsById.get(Number(row.id_transaction_fk)).subtotal_usd || 0),
            product_name: itemsById.get(Number(row.id_transaction_fk)).product_name,
            sku: itemsById.get(Number(row.id_transaction_fk)).sku
          }
        : null,
      purchase_group: Number(row.id_transaction_fk) >= CASHBACK_GROUP_REF_OFFSET && Number(row.id_transaction_fk) < CASHBACK_CHECKOUT_REF_OFFSET
        ? (() => {
            const group = groupsById.get(Number(row.id_transaction_fk) - CASHBACK_GROUP_REF_OFFSET);

            return group
              ? {
                  id_purchase_group: group.id_purchase_group,
                  id_checkout: group.id_checkout_fk,
                  status: group.status,
                  subtotal_usd: Number(group.subtotal_usd || 0),
                  company_name: group.company_name
                }
              : null;
          })()
        : null,
      purchase_checkout: Number(row.id_transaction_fk) >= CASHBACK_CHECKOUT_REF_OFFSET
        ? (() => {
            const checkout = checkoutsById.get(Number(row.id_transaction_fk) - CASHBACK_CHECKOUT_REF_OFFSET);

            return checkout
              ? {
                  id_checkout: checkout.id_checkout,
                  order_code: buildOrderCode(checkout.id_checkout, checkout.created_at),
                  total_usd: Number(checkout.total_usd || 0),
                  status: checkout.status,
                  created_at: checkout.created_at
                }
              : null;
          })()
        : null
    }))
  };
};

const listCustomersForAdmin = async () => {
  const [rows] = await pool.query(
    `SELECT
       id_customer,
       name,
       email,
       auth_provider,
       is_verified,
       is_active,
       attempts,
       cell_phone,
       mail_address,
       created_at,
       updated_at
     FROM Customer
     ORDER BY created_at DESC, id_customer DESC`
  );

  return rows;
};

const updateCustomerBasicByAdmin = async (customerId, name, email) => {
  await pool.query(
    `UPDATE Customer
     SET
       name = ?,
       email = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id_customer = ?`,
    [name, email, customerId]
  );

  return findUserById(customerId);
};

const updateCustomerPasswordByAdmin = async (customerId, passwordHash) => {
  await pool.query(
    `UPDATE Customer
     SET
       password_hash = ?,
       auth_provider = CASE
         WHEN auth_provider = 'google' THEN 'both'
         ELSE auth_provider
       END,
       updated_at = CURRENT_TIMESTAMP
     WHERE id_customer = ?`,
    [passwordHash, customerId]
  );

  return findUserById(customerId);
};

// 🔵 REGISTRO GOOGLE
const registerGoogleUser = async (data) => {
  const { name, email, provider_id, cell_phone, mail_address } = data;

  await pool.query(
    'INSERT INTO Customer (name, email, auth_provider, provider_id, cell_phone, mail_address, is_new, is_verified) VALUES (?, ?, ?, ?, ?, ?, FALSE, TRUE)',
    [name, email, 'google', provider_id, cell_phone, mail_address]
  );

  const [rows] = await pool.query(
    'SELECT id_customer FROM Customer WHERE email = ?',
    [email]
  );

  if (rows[0]) {
    await pool.query(
      'INSERT INTO Cashback (id_customer_fk, value) VALUES (?, 0)',
      [rows[0].id_customer]
    );
  }

  return true;
};

// 🔄 ACTUALIZAR PERFIL
const updateUser = async (data) => {
  const {
    id,
    name,
    email,
    password_hash,
    cell_phone,
    mail_address,
    img_profile,
    enable_local_auth = false
  } = data;

  await pool.query(
    `UPDATE Customer
     SET
       name = COALESCE(?, name),
       email = COALESCE(?, email),
       password_hash = COALESCE(?, password_hash),
       auth_provider = CASE
         WHEN ? = TRUE AND auth_provider = 'google' THEN 'both'
         ELSE auth_provider
       END,
       cell_phone = COALESCE(?, cell_phone),
       mail_address = COALESCE(?, mail_address),
       img_profile = COALESCE(?, img_profile),
       updated_at = CURRENT_TIMESTAMP
     WHERE id_customer = ?`,
    [name, email, password_hash, enable_local_auth, cell_phone, mail_address, img_profile, id]
  );

  return true;
};

const enableLocalAuthForCustomer = async (customerId, password_hash) => {
  await pool.query(
    `UPDATE Customer
     SET
       password_hash = ?,
       auth_provider = CASE
         WHEN auth_provider = 'google' THEN 'both'
         ELSE auth_provider
       END,
       updated_at = CURRENT_TIMESTAMP
     WHERE id_customer = ?`,
    [password_hash, customerId]
  );

  return true;
};

const linkGoogleAuthForCustomer = async (customerId, provider_id) => {
  await pool.query(
    `UPDATE Customer
     SET
       provider_id = COALESCE(?, provider_id),
       auth_provider = CASE
         WHEN auth_provider = 'local' THEN 'both'
         ELSE auth_provider
       END,
       is_verified = TRUE,
       updated_at = CURRENT_TIMESTAMP
     WHERE id_customer = ?`,
    [provider_id, customerId]
  );

  return true;
};

// ❌ AUMENTAR INTENTOS FALLIDOS
const increaseLoginAttempts = async (userId) => {
  await pool.query(
    'CALL sp_update_login_failed(?)',
    [userId]
  );
};

// ✅ RESETEAR INTENTOS
const resetLoginAttempts = async (userId) => {
  await pool.query(
    'CALL sp_reset_login_failed(?)',
    [userId]
  );
};

// 🔒 TOGGLE ESTADO CUENTA
const toggleUserActive = async (userId, isActive) => {
  await pool.query(
    'CALL sp_toggle_customer_status(?, ?)',
    [userId, isActive]
  );
};

// 🖼️ ACTUALIZAR IMAGEN DE PERFIL
const updateCustomerImage = async (customerId, imgProfile) => {
  await pool.query(
    'UPDATE Customer SET img_profile = ? WHERE id_customer = ?',
    [imgProfile, customerId]
  );

  return true;
};

module.exports = {
  registerLocalUser,
  findUserByEmail,
  findUserById,
  getCustomerCashbackOverview,
  listCustomersForAdmin,
  updateCustomerBasicByAdmin,
  updateCustomerPasswordByAdmin,
  registerGoogleUser,
  updateUser,
  enableLocalAuthForCustomer,
  linkGoogleAuthForCustomer,
  increaseLoginAttempts,
  resetLoginAttempts,
  toggleUserActive,
  updateCustomerImage
};