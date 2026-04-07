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

function login() {
  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value.trim()
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      if (data.attempts_left !== undefined) {
        throw new Error(`${data.error} (Intentos restantes: ${data.attempts_left})`);
      }
      throw new Error(data.error);
    }

    return data;
  })
  .then(data => {
    localStorage.setItem('token', data.token);
    window.location.href = '/index.html';
  })
  .catch(err => alert(err.message));
};