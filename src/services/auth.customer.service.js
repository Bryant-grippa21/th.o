const pool = require('../config/db');

// 🟢 REGISTRO LOCAL
const registerLocalUser = async (userData) => {
  const { name, email, password_hash, DOB, cell_phone, mail_address } = userData;
  const [rows] = await pool.query(
    'CALL sp_register_customer_local(?, ?, ?, ?, ?, ?)',
    [name, email, password_hash, DOB, cell_phone, mail_address]
  );
  console.log('📦 SP result:', JSON.stringify(rows)); // ← agrega esto
  return rows[0]?.[0] ?? null;                        // ← evita el crash
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

// 🔵 REGISTRO GOOGLE
const registerGoogleUser = async (data) => {
  const { name, email, provider_id, DOB, cell_phone, mail_address } = data;
  const [rows] = await pool.query(
    'CALL sp_register_customer_google(?, ?, ?, ?, ?, ?)',
    [name, email, provider_id, DOB, cell_phone, mail_address]
  );
  return rows[0][0];
};

// 🔄 ACTUALIZAR PERFIL
const updateUser = async (data) => {
  const { id, name, email, password_hash, DOB, cell_phone, mail_address, img_profile } = data;

  await pool.query(
    'CALL sp_update_customer(?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, password_hash, DOB, cell_phone, mail_address, img_profile]
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
  registerGoogleUser,
  updateUser,
  increaseLoginAttempts,
  resetLoginAttempts,
  toggleUserActive,
  updateCustomerImage
};