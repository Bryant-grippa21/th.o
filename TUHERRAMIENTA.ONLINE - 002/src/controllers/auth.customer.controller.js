const bcrypt = require('bcrypt');
const client = require('../config/google');
const { generateToken } = require('../utils/jwt');
const { hashPassword } = require('../utils/hash');

const {
  registerGoogleUser,
  findUserByEmail,
  findUserById,
  getCustomerCashbackOverview,
  listCustomersForAdmin,
  updateCustomerBasicByAdmin,
  updateCustomerPasswordByAdmin,
  registerLocalUser,
  updateUser,
  enableLocalAuthForCustomer,
  linkGoogleAuthForCustomer,
  increaseLoginAttempts,
  resetLoginAttempts,
  toggleUserActive,
  updateCustomerImage
} = require('../services/auth.customer.service');
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  getCart,
  setCartItem,
  removeCartItem,
  clearCart
} = require('../services/customer.collections.service');
const {
  getLatestRecoveryRequest,
  submitRecoveryRequest,
  reviewRecoveryRequest
} = require('../services/account.recovery.service');

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

const requireCustomer = (req, res) => {
  if (req.user?.entity && req.user.entity !== 'customer') {
    res.status(403).json({ error: 'Token no válido para customer' });
    return false;
  }

  if (!Number.isInteger(Number(req.user?.id)) || Number(req.user.id) <= 0) {
    res.status(401).json({ error: 'Token inválido' });
    return false;
  }

  return true;
};

// 🟢 REGISTER
const registerLocal = async (req, res) => {
  try {
    const { name, email, password, cell_phone, mail_address } = req.body;
    const missingFields = [];

    if (!String(name || '').trim()) {
      missingFields.push('nombre');
    }

    if (!String(email || '').trim()) {
      missingFields.push('correo');
    }

    if (!String(password || '').trim()) {
      missingFields.push('contraseña');
    }

    if (missingFields.length) {
      return res.status(400).json({
        error: `Faltan campos obligatorios: ${missingFields.join(', ')}`
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      if (existingUser.auth_provider === 'google') {
        const password_hash = await hashPassword(password);

        await enableLocalAuthForCustomer(existingUser.id_customer, password_hash);

        return res.status(200).json({
          message: 'Usuario actualizado a login local y Google correctamente'
        });
      }

      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const password_hash = await hashPassword(password);

    await registerLocalUser({
      name,
      email,
      password_hash,
      cell_phone,
      mail_address
    });

    res.json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    console.error('❌ ERROR REGISTER:', error);   // ← agrega esto
    res.status(500).json({ error: error.message });
  }
};

// 🔐 LOGIN LOCAL (🔥 actualizado)
const loginLocal = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Usuario bloqueado' });
    }

    if (!['local', 'both'].includes(user.auth_provider)) {
      return res.status(400).json({ error: 'Este usuario usa login con Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    // ❌ PASSWORD INCORRECTA
    if (!isMatch) {
      await increaseLoginAttempts(user.id_customer);        // ✅ era id_user_n

      const updatedUser = await findUserByEmail(email);

      if (updatedUser.attempts >= 3) {
        await toggleUserActive(user.id_customer, false);    // ✅ era id_user_n

        return res.status(403).json({
          error: 'Usuario bloqueado por múltiples intentos fallidos'
        });
      }

      return res.status(400).json({
        error: 'Correo o contraseña incorrectos'
      });
    }

    // ✅ LOGIN CORRECTO
    await resetLoginAttempts(user.id_customer);             // ✅ era id_user_n

    const token = generateToken(user);

    res.json({
      message: 'Inicio de sesión exitoso',
      token
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAccountRecoveryRequest = async (req, res) => {
  try {
    const { email, phone } = req.body;

    const result = await submitRecoveryRequest({ email, phone });

    return res.status(201).json({
      message: 'Solicitud de recuperación enviada. Un administrador revisará tus datos.',
      request: result.request
    });
  } catch (error) {
    console.error('❌ ERROR CREATE ACCOUNT RECOVERY REQUEST:', error);
    const statusCode = [
      'Debes indicar email y número telefónico',
      'No se encontró un usuario con esos datos',
      'Los datos no coinciden con el usuario registrado',
      'La recuperación solo está disponible para clientes bloqueados'
    ].includes(error.message)
      ? 400
      : 500;

    return res.status(statusCode).json({ error: error.message });
  }
};

// 🔵 GOOGLE LOGIN
const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID   // ✅ era Client ID hardcodeado
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await findUserByEmail(email);

    if (!user) {
      await registerGoogleUser({
        name,
        email,
        provider_id: sub,
        cell_phone: '',
        mail_address: ''
      });

      user = await findUserByEmail(email);
    } else if (['local', 'both'].includes(user.auth_provider)) {
      await linkGoogleAuthForCustomer(user.id_customer, sub);
      user = await findUserByEmail(email);
    }

    const token = generateToken(user);

    res.json({
      message: 'Login con Google exitoso',
      token
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👤 PROFILE GET
const getCurrentCustomerSession = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const user = await findUserById(Number(req.user.id));

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const safeUser = { ...user };
    delete safeUser.password_hash;

    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error('❌ ERROR GET CURRENT CUSTOMER SESSION:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password_hash, ...safeUser } = user;

    return res.status(200).json({
      message: 'Perfil obtenido correctamente',
      user: safeUser
    });
  } catch (error) {
    console.error('❌ ERROR GET PROFILE:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ✏️ PROFILE UPDATE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentUser = await findUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const {
      name,
      email,
      password,
      cell_phone,
      mail_address,
      img_profile
    } = req.body;

    if (email && email !== currentUser.email) {
      const existingUser = await findUserByEmail(email);

      if (existingUser && existingUser.id_customer !== userId) {
        return res.status(400).json({ error: 'El correo ya está en uso' });
      }
    }

    let password_hash = currentUser.password_hash;
    let enableLocalAuth = false;

    if (password && password.trim() !== '') {
      password_hash = await hashPassword(password);
      enableLocalAuth = currentUser.auth_provider === 'google';
    }

    await updateUser({
      id: userId,
      name: name ?? currentUser.name,
      email: email ?? currentUser.email,
      password_hash,
      enable_local_auth: enableLocalAuth,
      cell_phone: cell_phone ?? currentUser.cell_phone,
      mail_address: mail_address ?? currentUser.mail_address,
      img_profile: img_profile ?? currentUser.img_profile
    });

    const updatedUser = await findUserById(userId);
    const safeUser = { ...updatedUser };
    delete safeUser.password_hash;

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
      user: safeUser
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE PROFILE:', error);
    return res.status(500).json({ error: error.message });
  }
};

// 📷 UPDATE CUSTOMER PROFILE IMAGE
const updateCustomerProfileImage = async (req, res) => {
  try {
    if (req.user.entity && req.user.entity !== 'customer') {
      return res.status(403).json({ error: 'Token no válido para customer' });
    }

    const customerId = req.user.id;
    const currentUser = await findUserById(customerId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    await updateCustomerImage(customerId, req.file.filename);

    const updatedUser = await findUserById(customerId);
    const safeUser = { ...updatedUser };
    delete safeUser.password_hash;

    return res.status(200).json({
      message: 'Imagen de perfil actualizada correctamente',
      user: safeUser
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE CUSTOMER IMAGE:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getCustomerFavorites = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const favorites = await getFavorites(Number(req.user.id));

    return res.status(200).json({ favorites });
  } catch (error) {
    console.error('❌ ERROR GET FAVORITES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const addCustomerFavorite = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const favorites = await addFavorite(Number(req.user.id), req.body.id_product);

    return res.status(200).json({
      message: 'Producto agregado a favoritos',
      favorites
    });
  } catch (error) {
    const statusCode = ['id_product inválido', 'Producto no existe'].includes(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const removeCustomerFavorite = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const favorites = await removeFavorite(Number(req.user.id), req.params.productId);

    return res.status(200).json({
      message: 'Producto eliminado de favoritos',
      favorites
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCustomerCart = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const cart = await getCart(Number(req.user.id));

    return res.status(200).json({ cart });
  } catch (error) {
    console.error('❌ ERROR GET CART:', error);
    return res.status(500).json({ error: error.message });
  }
};

const setCustomerCartItem = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const cart = await setCartItem(Number(req.user.id), req.body.id_product, req.body.quantity);

    return res.status(200).json({
      message: 'Carrito actualizado correctamente',
      cart
    });
  } catch (error) {
    const statusCode = ['id_product inválido', 'Producto no existe', 'quantity inválida'].includes(error.message) ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const removeCustomerCartItem = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const cart = await removeCartItem(Number(req.user.id), req.params.productId);

    return res.status(200).json({
      message: 'Producto eliminado del carrito',
      cart
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const clearCustomerCart = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const cart = await clearCart(Number(req.user.id));

    return res.status(200).json({
      message: 'Carrito vaciado correctamente',
      cart
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCustomerCashback = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const cashback = await getCustomerCashbackOverview(Number(req.user.id));

    return res.status(200).json(cashback);
  } catch (error) {
    console.error('❌ ERROR GET CUSTOMER CASHBACK:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminCustomers = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const baseCustomers = await listCustomersForAdmin();
    const customers = await Promise.all(baseCustomers.map(async (customer) => {
      const request = await getLatestRecoveryRequest(customer.id_customer);

      return {
        ...customer,
        recovery_request_status: request?.status || null,
        recovery_request_requested_at: request?.requested_at || null
      };
    }));

    return res.status(200).json({ customers });
  } catch (error) {
    console.error('❌ ERROR GET ADMIN CUSTOMERS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminCustomerRecoveryRequest = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const customerId = Number(req.params.customerId);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ error: 'customerId inválido' });
    }

    const customer = await findUserById(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const request = await getLatestRecoveryRequest(customerId);

    return res.status(200).json({
      customer: {
        id_customer: customer.id_customer,
        name: customer.name,
        email: customer.email,
        cell_phone: customer.cell_phone,
        mail_address: customer.mail_address
      },
      request
    });
  } catch (error) {
    console.error('❌ ERROR GET ADMIN CUSTOMER RECOVERY REQUEST:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminCustomerStatus = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const customerId = Number(req.params.customerId);
    const { is_active } = req.body;

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ error: 'customerId inválido' });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active inválido' });
    }

    const customer = await findUserById(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await toggleUserActive(customerId, is_active);

    if (is_active) {
      await resetLoginAttempts(customerId);
    }

    const updatedCustomer = await findUserById(customerId);
    const { password_hash, ...safeCustomer } = updatedCustomer;

    return res.status(200).json({
      message: is_active
        ? 'Usuario desbloqueado correctamente'
        : 'Usuario bloqueado correctamente',
      customer: safeCustomer
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE ADMIN CUSTOMER STATUS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminCustomerBasic = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const customerId = Number(req.params.customerId);
    const name = String(req.body.name ?? '').trim();
    const email = String(req.body.email ?? '').trim();

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ error: 'customerId inválido' });
    }

    if (!name || !email) {
      return res.status(400).json({ error: 'name y email son requeridos' });
    }

    const customer = await findUserById(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (email !== customer.email) {
      const existingUser = await findUserByEmail(email);

      if (existingUser && existingUser.id_customer !== customerId) {
        return res.status(400).json({ error: 'El correo ya está en uso' });
      }
    }

    const updatedCustomer = await updateCustomerBasicByAdmin(customerId, name, email);
    const { password_hash, ...safeCustomer } = updatedCustomer;

    return res.status(200).json({
      message: 'Información de customer actualizada correctamente',
      customer: safeCustomer
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE ADMIN CUSTOMER BASIC:', error);
    return res.status(500).json({ error: error.message });
  }
};

const resetAdminCustomerAttempts = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const customerId = Number(req.params.customerId);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ error: 'customerId inválido' });
    }

    const customer = await findUserById(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await resetLoginAttempts(customerId);

    const updatedCustomer = await findUserById(customerId);
    const { password_hash, ...safeCustomer } = updatedCustomer;

    return res.status(200).json({
      message: 'Intentos de customer reiniciados correctamente',
      customer: safeCustomer
    });
  } catch (error) {
    console.error('❌ ERROR RESET ADMIN CUSTOMER ATTEMPTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminCustomerPassword = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const customerId = Number(req.params.customerId);
    const password = String(req.body.password ?? '').trim();

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ error: 'customerId inválido' });
    }

    if (!password) {
      return res.status(400).json({ error: 'password es requerido' });
    }

    const customer = await findUserById(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordHash = await hashPassword(password);
    const updatedCustomer = await updateCustomerPasswordByAdmin(customerId, passwordHash);
    const { password_hash, ...safeCustomer } = updatedCustomer;

    return res.status(200).json({
      message: 'Contraseña de customer actualizada correctamente',
      customer: safeCustomer
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE ADMIN CUSTOMER PASSWORD:', error);
    return res.status(500).json({ error: error.message });
  }
};

const reviewAdminCustomerRecoveryRequest = async (req, res) => {
  try {
    if (!requireAdminCompany(req, res)) {
      return;
    }

    const customerId = Number(req.params.customerId);
    const status = String(req.body?.status || '').trim().toUpperCase();
    const reviewNote = req.body?.review_note;

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ error: 'customerId inválido' });
    }

    if (!['RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status inválido' });
    }

    const result = await reviewRecoveryRequest({
      customerId,
      status,
      reviewNote,
      reviewedByCompanyId: req.user.id
    });

    return res.status(200).json({
      message: 'Solicitud de recuperación actualizada correctamente',
      request: result.request
    });
  } catch (error) {
    console.error('❌ ERROR REVIEW ADMIN CUSTOMER RECOVERY REQUEST:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerLocal,
  loginLocal,
  createAccountRecoveryRequest,
  loginGoogle,
  getCurrentCustomerSession,
  getProfile,
  updateProfile,
  updateCustomerProfileImage,
  getCustomerFavorites,
  addCustomerFavorite,
  removeCustomerFavorite,
  getCustomerCart,
  setCustomerCartItem,
  removeCustomerCartItem,
  clearCustomerCart,
  getCustomerCashback,
  getAdminCustomers,
  getAdminCustomerRecoveryRequest,
  updateAdminCustomerStatus,
  updateAdminCustomerBasic,
  resetAdminCustomerAttempts,
  updateAdminCustomerPassword,
  reviewAdminCustomerRecoveryRequest
};