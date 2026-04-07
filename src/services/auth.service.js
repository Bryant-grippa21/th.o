const pool = require('../config/db');

const registerLocalUser = async (userData) => {
  const {
    name,
    email,
    password_hash,
    DOB,
    cell_phone,
    mail_address
  } = userData;

  const query = `
    CALL sp_register_user_n_local(?, ?, ?, ?, ?, ?)
  `;

  await pool.execute(query, [
    name,
    email,
    password_hash,
    DOB,
    cell_phone || null,
    mail_address || null
  ]);
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM user_n WHERE email = ?',
    [email]
  );

  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM user_n WHERE id_user_n = ?',
    [id]
  );

  return rows[0];
};

const registerGoogleUser = async (data) => {
  const query = `
    CALL sp_register_user_n_google(?, ?, ?, ?, ?, ?)
  `;

  await pool.execute(query, [
    data.name,
    data.email,
    data.provider_id,
    data.DOB,
    data.cell_phone || null,
    data.mail_address || null
  ]);
};

const updateUser = async (data) => {
  const query = `
    CALL sp_update_user_n(?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.execute(query, [
    data.id,
    data.name,
    data.email,
    data.password_hash,
    data.DOB,
    data.cell_phone || null,
    data.mail_address || null,
    data.img_profile || null
  ]);
};

// 🔥 NUEVAS FUNCIONES

const increaseLoginAttempts = async (userId) => {
  await pool.execute(`CALL sp_update_login_failed(?)`, [userId]);
};

const resetLoginAttempts = async (userId) => {
  await pool.execute(`CALL sp_reset_login_failed(?)`, [userId]);
};

const toggleUserActive = async (userId, isActive) => {
  await pool.execute(`CALL sp_toggle_user_active(?, ?)`, [userId, isActive]);
};

module.exports = {
  registerLocalUser,
  findUserByEmail,
  findUserById,
  registerGoogleUser,
  updateUser,
  increaseLoginAttempts,
  resetLoginAttempts,
  toggleUserActive
};