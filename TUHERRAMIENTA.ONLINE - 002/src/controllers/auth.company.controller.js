const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/hash');

const {
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
} = require('../services/auth.company.service');

const requireAdminCompany = (req, res) => {
  if (req.user?.entity !== 'company') {
    res.status(403).json({ error: 'Token no válido para admin' });
    return false;
  }

  if (req.user.id_role !== 1) {
    res.status(403).json({ error: 'Solo el admin puede realizar esta acción' });
    return false;
  }

  return true;
};

const buildCompanyToken = (company) => {
  return jwt.sign(
    {
      id: company.id_company,
      email: company.email,
      company_name: company.name ?? null,
      id_role: company.id_role_fk ?? null,
      verification_status: company.verification_status ?? null,
      verification_note: company.verification_note ?? null,
      can_buy: company.can_buy,
      can_sell: company.can_sell,
      entity: 'company'
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

const sanitizeCompany = (company) => {
  const safeCompany = { ...company };
  delete safeCompany.password_hash;
  return safeCompany;
};

const normalizeCompanyRif = (rif) => {
  const digits = String(rif ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return `J-${digits}`;
};

const ensureCompanyRifAvailable = async (rif, companyId, currentRif) => {
  if (!rif || rif === currentRif) {
    return;
  }

  const existingRif = await findCompanyByRif(rif);

  if (existingRif && existingRif.id_company !== companyId) {
    throw new Error('El RIF ya está en uso');
  }
};

const registerLocalCompany = async (req, res) => {
  try {
    const {
      company_name,
      rif,
      email,
      password,
      phone,
      address,
    } = req.body;

    if (!company_name || !rif || !email || !password) {
      return res.status(400).json({
        error: 'company_name, rif, email y password son requeridos'
      });
    }

    const normalizedRif = normalizeCompanyRif(rif);

    if (!normalizedRif) {
      return res.status(400).json({ error: 'RIF inválido' });
    }

    const existingCompany = await findCompanyByEmail(email);
    if (existingCompany) {
      return res.status(400).json({ error: 'La empresa ya existe' });
    }

    const existingRif = await findCompanyByRif(normalizedRif);
    if (existingRif) {
      return res.status(400).json({ error: 'El RIF ya está en uso' });
    }

    const password_hash = await hashPassword(password);
    const retailerRole = await findRoleByName('DETALLISTA');

    if (!retailerRole) {
      return res.status(500).json({ error: 'Rol DETALLISTA no configurado en la base de datos' });
    }

    await registerCompany({
      company_name,
      rif: normalizedRif,
      email,
      password_hash,
      phone: phone ?? null,
      address: address ?? null,
      id_role: retailerRole.id_role,
      verification_status: 'PENDING_REVIEW',
      can_buy: false,
      can_sell: false
    });

    return res.status(201).json({
      message: 'Empresa registrada correctamente. Tu solicitud juridica quedo pendiente de revision.'
    });
  } catch (error) {
    console.error('❌ ERROR REGISTER COMPANY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const loginLocalCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    const company = await findCompanyByEmail(email);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    if (!company.is_active) {
      return res.status(403).json({ error: 'Empresa bloqueada o inactiva' });
    }

    const isMatch = await bcrypt.compare(password, company.password_hash);

    if (!isMatch) {
      await increaseLoginAttemptsCompany(company.id_company);

      const updatedCompany = await findCompanyByEmail(email);

      if ((updatedCompany.attempts ?? 0) >= 3) {
        await toggleCompanyActive(company.id_company, false);

        return res.status(403).json({
          error: 'Empresa bloqueada por múltiples intentos fallidos'
        });
      }

      return res.status(400).json({
        error: 'Contraseña incorrecta',
        attempts_left: 3 - (updatedCompany.attempts ?? 0)
      });
    }

    await resetLoginAttemptsCompany(company.id_company);

    const token = buildCompanyToken(company);

    return res.status(200).json({
      message: 'Inicio de sesión de empresa exitoso',
      token
    });
  } catch (error) {
    console.error('❌ ERROR LOGIN COMPANY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getCompanyProfile = async (req, res) => {
  try {
    if (req.user.entity && req.user.entity !== 'company') {
      return res.status(403).json({ error: 'Token no válido para empresa' });
    }

    const companyId = req.user.id;
    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const { password_hash, ...safeCompany } = company;

    return res.status(200).json({
      message: 'Datos de empresa obtenidos correctamente',
      company: safeCompany
    });
  } catch (error) {
    console.error('❌ ERROR GET COMPANY PROFILE:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    if (req.user.entity && req.user.entity !== 'company') {
      return res.status(403).json({ error: 'Token no válido para empresa' });
    }

    const companyId = req.user.id;
    const currentCompany = await findCompanyById(companyId);

    if (!currentCompany) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const {
      password,
      phone,
      address,
    } = req.body;

    let password_hash = currentCompany.password_hash;

    if (password && password.trim() !== '') {
      password_hash = await hashPassword(password);
    }

    await updateCompany({
      id: companyId,
      company_name: currentCompany.name,
      rif: currentCompany.rif,
      email: currentCompany.email,
      password_hash,
      phone: phone ?? currentCompany.cell_phone,
      address: address ?? currentCompany.mail_address,
      id_role: currentCompany.id_role_fk,
      verification_status: currentCompany.verification_status,
      verification_note: currentCompany.verification_note,
      verified_by_company_id: currentCompany.verified_by_company_id,
      can_buy: Boolean(currentCompany.can_buy),
      can_sell: Boolean(currentCompany.can_sell)
    });

    const updatedCompany = await findCompanyById(companyId);

    return res.status(200).json({
      message: 'Perfil de empresa actualizado correctamente',
      company: sanitizeCompany(updatedCompany)
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE COMPANY PROFILE:', error);

    return res.status(500).json({ error: error.message });
  }
};

const updateCompanyProfileImage = async (req, res) => {
  try {
    if (req.user.entity && req.user.entity !== 'company') {
      return res.status(403).json({ error: 'Token no válido para empresa' });
    }

    const companyId = req.user.id;
    const currentCompany = await findCompanyById(companyId);

    if (!currentCompany) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    await updateCompanyImage(companyId, req.file.filename);

    const updatedCompany = await findCompanyById(companyId);
    return res.status(200).json({
      message: 'Imagen de empresa actualizada correctamente',
      company: sanitizeCompany(updatedCompany)
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE COMPANY IMAGE:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminCompanies = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const companies = await listCompaniesForAdmin();

    return res.status(200).json({ companies });
  } catch (error) {
    console.error('❌ ERROR GET ADMIN COMPANIES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminCompanyRoles = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const roles = await listCompanyRolesForAdmin();

    return res.status(200).json({ roles });
  } catch (error) {
    console.error('❌ ERROR GET ADMIN COMPANY ROLES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getCompanyVerificationSummary = async (req, res) => {
  try {
    if (req.user.entity && req.user.entity !== 'company') {
      return res.status(403).json({ error: 'Token no válido para empresa' });
    }

    const companyId = req.user.id;
    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const [documents, history] = await Promise.all([
      listCompanyLegalDocuments(companyId),
      listCompanyVerificationHistory(companyId)
    ]);

    return res.status(200).json({
      company: sanitizeCompany(company),
      documents,
      history,
      allowed_document_types: [...COMPANY_LEGAL_DOCUMENT_TYPES]
    });
  } catch (error) {
    console.error('❌ ERROR GET COMPANY VERIFICATION SUMMARY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createCompanyVerificationDocuments = async (req, res) => {
  try {
    if (req.user.entity && req.user.entity !== 'company') {
      return res.status(403).json({ error: 'Token no válido para empresa' });
    }

    const result = await submitCompanyLegalDocuments({
      companyId: req.user.id,
      documentType: req.body?.document_type,
      files: req.files
    });

    return res.status(201).json({
      message: 'Recaudos cargados correctamente',
      company: sanitizeCompany(result.company),
      documents: result.documents
    });
  } catch (error) {
    console.error('❌ ERROR CREATE COMPANY VERIFICATION DOCUMENTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminCompanyVerificationSummary = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const companyId = Number(req.params.companyId);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId inválido' });
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const [documents, history] = await Promise.all([
      listCompanyLegalDocuments(companyId),
      listCompanyVerificationHistory(companyId)
    ]);

    return res.status(200).json({
      company: sanitizeCompany(company),
      documents,
      history
    });
  } catch (error) {
    console.error('❌ ERROR GET ADMIN COMPANY VERIFICATION SUMMARY:', error);
    return res.status(500).json({ error: error.message });
  }
};

const reviewAdminCompanyVerification = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const companyId = Number(req.params.companyId);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId inválido' });
    }

    const company = await reviewCompanyVerification({
      companyId,
      status: req.body?.status,
      note: req.body?.note,
      adminCompanyId: req.user.id,
      canBuy: req.body?.can_buy,
      canSell: req.body?.can_sell
    });

    return res.status(200).json({
      message: 'Estado de verificacion actualizado correctamente',
      company: sanitizeCompany(company)
    });
  } catch (error) {
    console.error('❌ ERROR REVIEW ADMIN COMPANY VERIFICATION:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminCompanyRole = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const companyId = Number(req.params.companyId);
    const roleId = Number(req.body.role_id);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId inválido' });
    }

    if (!Number.isInteger(roleId) || roleId <= 0) {
      return res.status(400).json({ error: 'role_id inválido' });
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    if (company.id_role_fk === 1) {
      return res.status(400).json({ error: 'No se puede cambiar el rol de una empresa admin desde este modulo' });
    }

    const allowedRoles = await listCompanyRolesForAdmin();
    const selectedRole = allowedRoles.find((role) => role.id_role === roleId);

    if (!selectedRole) {
      return res.status(400).json({ error: 'Rol no permitido para este modulo' });
    }

    const updatedCompany = await updateCompanyRoleByAdmin(companyId, roleId);
    return res.status(200).json({
      message: 'Rol de empresa actualizado correctamente',
      company: sanitizeCompany(updatedCompany)
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE ADMIN COMPANY ROLE:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminCompanyStatus = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const companyId = Number(req.params.companyId);
    const { is_active } = req.body;

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId inválido' });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active inválido' });
    }

    if (req.user.id === companyId && is_active === false) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta admin' });
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    await toggleCompanyActive(companyId, is_active);

    if (is_active) {
      await resetLoginAttemptsCompany(companyId);
    }

    const updatedCompany = await findCompanyById(companyId);
    return res.status(200).json({
      message: is_active
        ? 'Empresa activada correctamente'
        : 'Empresa desactivada correctamente',
      company: sanitizeCompany(updatedCompany)
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE ADMIN COMPANY STATUS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const resetAdminCompanyAttempts = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const companyId = Number(req.params.companyId);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId inválido' });
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    await resetLoginAttemptsCompany(companyId);

    const updatedCompany = await findCompanyById(companyId);
    return res.status(200).json({
      message: 'Intentos de empresa reiniciados correctamente',
      company: sanitizeCompany(updatedCompany)
    });
  } catch (error) {
    console.error('❌ ERROR RESET ADMIN COMPANY ATTEMPTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminCompanyPassword = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const companyId = Number(req.params.companyId);
    const password = String(req.body.password ?? '').trim();

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId inválido' });
    }

    if (!password) {
      return res.status(400).json({ error: 'password es requerido' });
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const passwordHash = await hashPassword(password);
    const updatedCompany = await updateCompanyPasswordByAdmin(companyId, passwordHash);
    return res.status(200).json({
      message: 'Contraseña de empresa actualizada correctamente',
      company: sanitizeCompany(updatedCompany)
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE ADMIN COMPANY PASSWORD:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerLocalCompany,
  loginLocalCompany,
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanyProfileImage,
  getAdminCompanies,
  getAdminCompanyRoles,
  getCompanyVerificationSummary,
  createCompanyVerificationDocuments,
  getAdminCompanyVerificationSummary,
  reviewAdminCompanyVerification,
  updateAdminCompanyRole,
  updateAdminCompanyStatus,
  resetAdminCompanyAttempts,
  updateAdminCompanyPassword
};