const pool = require('../config/db');

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