const pool = require('../config/db');

const registerCompany = async (companyData) => {
  const {
    company_name,
    rif,
    email,
    password_hash,
    phone,
    address,
    id_role
  } = companyData;

  await pool.query(
    'CALL sp_register_company(?, ?, ?, ?, ?, ?, ?)',
    [company_name, rif, email, password_hash, phone, address, id_role]
  );

  return true;
};

const findCompanyByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM Company WHERE email = ?',
    [email]
  );

  return rows[0];
};

const findCompanyByRif = async (rif) => {
  const [rows] = await pool.query(
    'SELECT * FROM Company WHERE rif = ?',
    [rif]
  );

  return rows[0];
};

const findCompanyById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM Company WHERE id_company = ?',
    [id]
  );

  return rows[0];
};

const increaseLoginAttemptsCompany = async (companyId) => {
  await pool.query(
    'CALL sp_update_login_failed_company(?)',
    [companyId]
  );
};

const resetLoginAttemptsCompany = async (companyId) => {
  await pool.query(
    'CALL sp_reset_login_failed_company(?)',
    [companyId]
  );
};

const toggleCompanyActive = async (companyId, isActive) => {
  await pool.query(
    'CALL sp_toggle_company_status(?, ?)',
    [companyId, isActive]
  );
};

const updateCompany = async (companyData) => {
  const {
    id,
    company_name,
    rif,
    email,
    password_hash,
    phone,
    address,
    id_role
  } = companyData;

  await pool.query(
    'CALL sp_update_company(?, ?, ?, ?, ?, ?, ?, ?)',
    [id, company_name, rif, email, password_hash, phone, address, id_role]
  );

  return true;
};

const updateCompanyImage = async (companyId, imgProfile) => {
  await pool.query(
    'UPDATE Company SET img_profile = ? WHERE id_company = ?',
    [imgProfile, companyId]
  );

  return true;
};

module.exports = {
  registerCompany,
  findCompanyByEmail,
  findCompanyByRif,
  findCompanyById,
  increaseLoginAttemptsCompany,
  resetLoginAttemptsCompany,
  toggleCompanyActive,
  updateCompany,
  updateCompanyImage
};