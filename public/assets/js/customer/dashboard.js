if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    globalThis.document.getElementById('welcome').innerText =
      'Bienvenido ' + (session.data.user.name || session.data.user.email);
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });