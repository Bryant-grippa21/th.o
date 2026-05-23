if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

const customerModulesElement = globalThis.document.getElementById('customer-modules');

const CUSTOMER_MODULES = [
  { label: 'Perfil', path: '/modules/customer/profile.html' },
  { label: 'Favoritos', path: '/modules/customer/favorites.html' },
  { label: 'Carrito', path: '/modules/customer/cart.html' },
  { label: 'Mis compras', path: '/modules/customer/purchases.html' },
  { label: 'Cashback', path: '/modules/customer/cashback.html' }
];

const renderCustomerModules = () => {
  customerModulesElement.innerHTML = CUSTOMER_MODULES
    .map((module) => `<button type="button" onclick="location.href='${module.path}'">${module.label}</button>`)
    .join('\n');
};

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    globalThis.document.getElementById('welcome').innerText =
      'Bienvenido ' + (session.data.user.name || session.data.user.email);
    renderCustomerModules();
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });