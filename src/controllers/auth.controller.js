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
  increaseLoginAttempts,
  resetLoginAttempts,
  toggleUserActive
} = require('../services/auth.service');

// 🟢 REGISTER
const registerLocal = async (req, res) => {
  try {
    const { name, email, password, DOB, cell_phone, mail_address } = req.body;

    if (!name || !email || !password || !DOB) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const password_hash = await hashPassword(password);

    await registerLocalUser({
      name,
      email,
      password_hash,
      DOB,
      cell_phone,
      mail_address
    });

    res.json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
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

    if (user.auth_provider !== 'local') {
      return res.status(400).json({ error: 'Este usuario usa login con Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    // ❌ PASSWORD INCORRECTA
    if (!isMatch) {
      await increaseLoginAttempts(user.id_user_n);

      const updatedUser = await findUserByEmail(email);

      if (updatedUser.attempts >= 3) {
        await toggleUserActive(user.id_user_n, false);

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
    await resetLoginAttempts(user.id_user_n);

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
      audience: '748491841488-u4vboqoa5cqi43klpa5686n5fdo1qnj6.apps.googleusercontent.com'
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await findUserByEmail(email);

    if (!user) {
      await registerGoogleUser({
        name,
        email,
        provider_id: sub,
        DOB: '2000-01-01',
        cell_phone: '',
        mail_address: ''
      });

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
    const user = await findUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ PROFILE UPDATE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      DOB,
      cell_phone,
      mail_address,
      password
    } = req.body;

    let password_hash = null;

    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    await updateUser({
      id: userId,
      name: null,
      email: null,
      password_hash,
      DOB,
      cell_phone,
      mail_address,
      img_profile: null
    });

    res.json({ message: 'Perfil actualizado' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerLocal,
  loginLocal,
  loginGoogle,
  getProfile,
  updateProfile
};