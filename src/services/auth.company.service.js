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

const findRoleByName = async (roleName) => {
  const [rows] = await pool.query(
    'SELECT id_role, name FROM Role WHERE name = ? LIMIT 1',
    [roleName]
  );

  return rows[0] ?? null;
};

const listCompanyRolesForAdmin = async () => {
  const [rows] = await pool.query(
    `SELECT id_role, name
     FROM Role
     WHERE name IN ('MAYORISTA', 'DETALLISTA')
     ORDER BY name ASC`
  );

  return rows;
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

const listCompaniesForAdmin = async () => {
  const [rows] = await pool.query(
    `SELECT
       c.id_company,
       c.name,
       c.rif,
       c.email,
       c.id_role_fk,
       r.name AS role_name,
       c.is_active,
       c.attempts,
       c.can_buy,
       c.can_sell,
       c.cell_phone,
       c.mail_address,
       c.created_at,
       c.updated_at
     FROM Company c
     LEFT JOIN Role r ON r.id_role = c.id_role_fk
     ORDER BY
       CASE WHEN c.id_role_fk = 1 THEN 0 ELSE 1 END,
       c.created_at DESC,
       c.id_company DESC`
  );

  return rows;
};

const updateCompanyPasswordByAdmin = async (companyId, passwordHash) => {
  await pool.query(
    `UPDATE Company
     SET
       password_hash = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id_company = ?`,
    [passwordHash, companyId]
  );

  return findCompanyById(companyId);
};

const updateCompanyRoleByAdmin = async (companyId, roleId) => {
  await pool.query(
    `UPDATE Company
     SET
       id_role_fk = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id_company = ?`,
    [roleId, companyId]
  );

  return findCompanyById(companyId);
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
  findRoleByName,
  listCompanyRolesForAdmin,
  findCompanyByEmail,
  findCompanyByRif,
  findCompanyById,
  listCompaniesForAdmin,
  updateCompanyPasswordByAdmin,
  updateCompanyRoleByAdmin,
  increaseLoginAttemptsCompany,
  resetLoginAttemptsCompany,
  toggleCompanyActive,
  updateCompany,
  updateCompanyImage
};