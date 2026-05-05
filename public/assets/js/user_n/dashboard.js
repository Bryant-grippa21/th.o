if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

globalThis.fetch(`${API_BASE_URL}/api/auth/me`, {
  headers: getAuthHeaders()
})
  .then(res => res.json())
  .then(data => {
    if (!data.user) {
      throw new Error(data.error || 'No se pudo obtener la sesión');
    }

    globalThis.document.getElementById('welcome').innerText =
      'Bienvenido ' + (data.user.name || data.user.email);
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });