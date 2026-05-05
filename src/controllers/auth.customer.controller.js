const bcrypt = require('bcrypt');
const client = require('../config/google');
const { generateToken } = require('../utils/jwt');
const { hashPassword } = require('../utils/hash');

const {
  registerGoogleUser,
  findUserByEmail,
  findUserById,
  registerLocalUser,
  updateUser,
  enableLocalAuthForCustomer,
  linkGoogleAuthForCustomer,
  increaseLoginAttempts,
  resetLoginAttempts,
  toggleUserActive,
  updateCustomerImage
} = require('../services/auth.customer.service');

// 🟢 REGISTER
const registerLocal = async (req, res) => {
  try {
    const { name, email, password, cell_phone, mail_address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Datos incompletos' });
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
        error: 'Contraseña incorrecta',
        attempts_left: 3 - updatedUser.attempts
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

module.exports = {
  registerLocal,
  loginLocal,
  loginGoogle,
  getProfile,
  updateProfile,
  updateCustomerProfileImage
};