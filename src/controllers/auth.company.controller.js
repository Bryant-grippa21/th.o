const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../utils/hash');

const {
  registerCompany,
  findCompanyByEmail,
  findCompanyByRif,
  findCompanyById,
  increaseLoginAttemptsCompany,
  resetLoginAttemptsCompany,
  toggleCompanyActive,
  updateCompany,
  updateCompanyImage
} = require('../services/auth.company.service');

const buildCompanyToken = (company) => {
  return jwt.sign(
    {
      id: company.id_company,
      email: company.email,
      company_name: company.name ?? null,
      id_role: company.id_role_fk ?? null,
      entity: 'company'
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
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
      id_role
    } = req.body;

    if (!company_name || !rif || !email || !password) {
      return res.status(400).json({
        error: 'company_name, rif, email y password son requeridos'
      });
    }

    const existingCompany = await findCompanyByEmail(email);
    if (existingCompany) {
      return res.status(400).json({ error: 'La empresa ya existe' });
    }

    const existingRif = await findCompanyByRif(rif);
    if (existingRif) {
      return res.status(400).json({ error: 'El RIF ya está en uso' });
    }

    const password_hash = await hashPassword(password);

    await registerCompany({
      company_name,
      rif,
      email,
      password_hash,
      phone: phone ?? null,
      address: address ?? null,
      id_role: id_role ?? null
    });

    return res.status(201).json({
      message: 'Empresa registrada correctamente'
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
      company_name,
      rif,
      email,
      password,
      phone,
      address,
      id_role
    } = req.body;

    if (email && email !== currentCompany.email) {
      const existingCompany = await findCompanyByEmail(email);

      if (existingCompany && existingCompany.id_company !== companyId) {
        return res.status(400).json({ error: 'El correo ya está en uso' });
      }
    }

    if (rif && rif !== currentCompany.rif) {
      const existingRif = await findCompanyByRif(rif);

      if (existingRif && existingRif.id_company !== companyId) {
        return res.status(400).json({ error: 'El RIF ya está en uso' });
      }
    }

    let password_hash = currentCompany.password_hash;

    if (password && password.trim() !== '') {
      password_hash = await hashPassword(password);
    }

    await updateCompany({
      id: companyId,
      company_name: company_name ?? currentCompany.name,
      rif: rif ?? currentCompany.rif,
      email: email ?? currentCompany.email,
      password_hash,
      phone: phone ?? currentCompany.cell_phone,
      address: address ?? currentCompany.mail_address,
      id_role: id_role ?? currentCompany.id_role_fk
    });

    const updatedCompany = await findCompanyById(companyId);
    const { password_hash: _, ...safeCompany } = updatedCompany;

    return res.status(200).json({
      message: 'Perfil de empresa actualizado correctamente',
      company: safeCompany
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
    const { password_hash, ...safeCompany } = updatedCompany;

    return res.status(200).json({
      message: 'Imagen de empresa actualizada correctamente',
      company: safeCompany
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE COMPANY IMAGE:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerLocalCompany,
  loginLocalCompany,
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanyProfileImage
};