const pool = require('../config/db');

const registerCompany = async (companyData) => {
  const {
    company_name,
    rif,
    email,
    password_hash,
    phone,
    address,
    id_role,
    verification_status = 'PENDING_REVIEW',
    can_buy = false,
    can_sell = false
  } = companyData;

  await pool.query(
    'CALL sp_register_company(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [company_name, rif, email, password_hash, phone, address, id_role, verification_status, can_buy, can_sell]
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
       c.img_profile,
       c.id_role_fk,
       r.name AS role_name,
      c.verification_status,
      c.verification_note,
      c.verified_at,
      c.verified_by_company_id,
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
    id_role,
    verification_status = null,
    verification_note = null,
    verified_by_company_id = null,
    can_buy = null,
    can_sell = null
  } = companyData;

  await pool.query(
    'CALL sp_update_company(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      company_name,
      rif,
      email,
      password_hash,
      phone,
      address,
      id_role,
      verification_status,
      verification_note,
      verified_by_company_id,
      can_buy,
      can_sell
    ]
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

const COMPANY_LEGAL_DOCUMENT_TYPES = new Set([
  'COMMERCIAL_REGISTER',
  'LAST_SHAREHOLDERS_MEETING_MINUTES',
  'COMPANY_RIF',
  'LEGAL_REPRESENTATIVE_ID',
  'LEGAL_REPRESENTATIVE_RIF',
  'ECONOMIC_ACTIVITY_LICENSE'
]);

const normalizeDocumentType = (documentType) => String(documentType || '').trim().toUpperCase();

const assertValidDocumentType = (documentType) => {
  const normalizedDocumentType = normalizeDocumentType(documentType);

  if (!COMPANY_LEGAL_DOCUMENT_TYPES.has(normalizedDocumentType)) {
    throw new Error('document_type no permitido');
  }

  return normalizedDocumentType;
};

const listCompanyLegalDocuments = async (companyId) => {
  const [rows] = await pool.query(
    `SELECT id_company_legal_document,
            id_company_fk,
            document_type,
            file_url,
            original_name,
            mime_type,
            submission_round,
            is_active,
            admin_note,
            uploaded_at
     FROM Company_Legal_Document
     WHERE id_company_fk = ?
     ORDER BY document_type ASC, submission_round DESC, uploaded_at DESC, id_company_legal_document DESC`,
    [companyId]
  );

  return rows.map((row) => ({
    ...row,
    is_active: Boolean(row.is_active)
  }));
};

const listCompanyVerificationHistory = async (companyId) => {
  const [rows] = await pool.query(
    `SELECT id_company_verification_history,
            id_company_fk,
            status,
            note,
            reviewed_by_company_id,
            created_at
     FROM Company_Verification_History
     WHERE id_company_fk = ?
     ORDER BY created_at DESC, id_company_verification_history DESC`,
    [companyId]
  );

  return rows;
};

const addCompanyVerificationHistory = async ({ companyId, status, note, reviewedByCompanyId = null, connection = pool }) => {
  await connection.query(
    `INSERT INTO Company_Verification_History (
       id_company_fk,
       status,
       note,
       reviewed_by_company_id
     ) VALUES (?, ?, ?, ?)`,
    [companyId, status, note || null, reviewedByCompanyId]
  );
};

const submitCompanyLegalDocuments = async ({ companyId, documentType, files }) => {
  const normalizedCompanyId = Number(companyId);
  const normalizedDocumentType = assertValidDocumentType(documentType);

  if (!Array.isArray(files) || !files.length) {
    throw new Error('Debes adjuntar al menos un archivo');
  }

  const company = await findCompanyById(normalizedCompanyId);

  if (!company) {
    throw new Error('Empresa no encontrada');
  }

  if (company.id_role_fk === 1) {
    throw new Error('La empresa admin no usa este flujo');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [roundRows] = await connection.query(
      `SELECT COALESCE(MAX(submission_round), 0) AS max_round
       FROM Company_Legal_Document
       WHERE id_company_fk = ?
         AND document_type = ?`,
      [normalizedCompanyId, normalizedDocumentType]
    );

    const nextRound = Number(roundRows[0]?.max_round || 0) + 1;

    for (const file of files) {
      await connection.query(
        `INSERT INTO Company_Legal_Document (
           id_company_fk,
           document_type,
           file_url,
           original_name,
           mime_type,
           submission_round,
           is_active,
           admin_note
         ) VALUES (?, ?, ?, ?, ?, ?, TRUE, NULL)`,
        [
          normalizedCompanyId,
          normalizedDocumentType,
          `/uploads/company/legal-documents/${file.filename}`,
          file.originalname || null,
          file.mimetype || null,
          nextRound
        ]
      );
    }

    await connection.query(
      `UPDATE Company
       SET verification_status = 'PENDING_REVIEW',
           verification_note = NULL,
           verified_at = NULL,
           verified_by_company_id = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_company = ?`,
      [normalizedCompanyId]
    );

    await addCompanyVerificationHistory({
      companyId: normalizedCompanyId,
      status: 'PENDING_REVIEW',
      note: `Recaudos reenviados para ${normalizedDocumentType}`,
      reviewedByCompanyId: null,
      connection
    });

    await connection.commit();

    return {
      company: await findCompanyById(normalizedCompanyId),
      documents: await listCompanyLegalDocuments(normalizedCompanyId)
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const reviewCompanyVerification = async ({ companyId, status, note, adminCompanyId, canBuy, canSell }) => {
  const normalizedCompanyId = Number(companyId);
  const normalizedAdminCompanyId = Number(adminCompanyId);
  const normalizedStatus = String(status || '').trim().toUpperCase();
  const allowedStatuses = new Set(['PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED']);

  if (!allowedStatuses.has(normalizedStatus)) {
    throw new Error('status de verificacion no permitido');
  }

  const company = await findCompanyById(normalizedCompanyId);

  if (!company) {
    throw new Error('Empresa no encontrada');
  }

  if (company.id_role_fk === 1) {
    throw new Error('No aplica para la empresa admin');
  }

  const nextCanBuy = typeof canBuy === 'boolean'
    ? canBuy
    : normalizedStatus === 'APPROVED';

  const nextCanSell = typeof canSell === 'boolean'
    ? canSell
    : false;

  await updateCompany({
    id: normalizedCompanyId,
    company_name: company.name,
    rif: company.rif,
    email: company.email,
    password_hash: company.password_hash,
    phone: company.cell_phone,
    address: company.mail_address,
    id_role: company.id_role_fk,
    verification_status: normalizedStatus,
    verification_note: String(note || '').trim() || null,
    verified_by_company_id: normalizedStatus === 'APPROVED' ? normalizedAdminCompanyId : null,
    can_buy: nextCanBuy,
    can_sell: nextCanSell
  });

  await addCompanyVerificationHistory({
    companyId: normalizedCompanyId,
    status: normalizedStatus,
    note: String(note || '').trim() || null,
    reviewedByCompanyId: normalizedAdminCompanyId
  });

  return findCompanyById(normalizedCompanyId);
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
  updateCompanyImage,
  listCompanyLegalDocuments,
  listCompanyVerificationHistory,
  submitCompanyLegalDocuments,
  reviewCompanyVerification,
  COMPANY_LEGAL_DOCUMENT_TYPES
};