if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

const CUSTOMER_MODULES = [
  { label: 'Perfil', path: '/modules/customer/profile.html' },
  { label: 'Favoritos', path: '/modules/customer/favorites.html' },
  { label: 'Carrito', path: '/modules/customer/cart.html' },
  { label: 'Mis compras', path: '/modules/customer/purchases.html' },
  { label: 'Cashback', path: '/modules/customer/cashback.html' }
];

const getCustomerDisplayName = (session) => session?.data?.user?.name || session?.data?.user?.email || 'Customer';

const getCustomerImageUrl = (session) => {
  const imageName = String(session?.data?.user?.img_profile || '').trim();

  if (!imageName) {
    return null;
  }

  return `/uploads/profiles/customers/${imageName}`;
};

const renderCustomerLayout = (session) => {
  const layoutContainer = globalThis.document.getElementById('customer-layout-nav');
  const displayName = getCustomerDisplayName(session);
  const customerImageUrl = getCustomerImageUrl(session);
  const fallbackLetter = String(displayName || 'C').trim().charAt(0).toUpperCase() || 'C';

  globalThis.document.title = displayName;

  if (!layoutContainer) {
    return;
  }

  layoutContainer.innerHTML = `
    <div class="customer-layout-shell">
      <div class="customer-layout-header">
        <div class="customer-layout-brand">
          ${customerImageUrl
      ? `<img src="${customerImageUrl}" alt="Avatar" class="customer-layout-avatar">`
      : `<span class="customer-layout-avatar customer-layout-avatar--fallback">${fallbackLetter}</span>`}
          <div>
          <p class="customer-layout-welcome">Bienvenido</p>
          <h2>${displayName}</h2>
          <p class="customer-layout-subtitle">Gestiona tu perfil, compras y datos desde este panel.</p>
          </div>
        </div>
      </div>
      <div class="customer-layout-nav-buttons">
        ${CUSTOMER_MODULES.map((module) => `
          <button
            class="customer-layout-nav-button"
            type="button"
            onclick="location.href='${module.path}'"
            ${globalThis.location.pathname === module.path ? 'disabled' : ''}
          >${module.label}</button>
        `).join('')}
      </div>
    </div>
  `;
};

globalThis.CUSTOMER_MODULES = CUSTOMER_MODULES;
globalThis.refreshCustomerLayout = (user) => {
  renderCustomerLayout({
    data: {
      user
    }
  });
};

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    renderCustomerLayout(session);
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });