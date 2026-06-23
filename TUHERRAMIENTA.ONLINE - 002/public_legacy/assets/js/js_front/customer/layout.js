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
const getCustomerProfileImageUrl = (session) => {
  const imageName = String(session?.data?.user?.img_profile || '').trim();

  return imageName ? `/uploads/profiles/customers/${imageName}` : null;
};

const getCustomerAvatarFallback = (session) => {
  const displayName = getCustomerDisplayName(session);
  return String(displayName || 'C').trim().charAt(0).toUpperCase() || 'C';
};

const renderCustomerLayout = (session) => {
  const layoutContainer = globalThis.document.getElementById('customer-layout-nav');
  const profileImageUrl = getCustomerProfileImageUrl(session);
  const displayName = getCustomerDisplayName(session);

  globalThis.document.title = displayName;

  if (!layoutContainer) {
    return;
  }

  layoutContainer.innerHTML = `
    <div style="margin-bottom:16px;">
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
        ${profileImageUrl
          ? `<img src="${profileImageUrl}" alt="Foto de perfil" style="width:56px; height:56px; object-fit:cover; border-radius:50%; border:1px solid #ccc;">`
          : `<div style="width:56px; height:56px; border-radius:50%; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-weight:700; background:#f5f5f5;">${getCustomerAvatarFallback(session)}</div>`}
        <div>
          <p style="margin:0;">Bienvenido <b>${displayName}</b></p>
          <p style="margin:4px 0 0 0; color:#555;">Gestiona tu perfil, compras y datos desde este panel.</p>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        ${CUSTOMER_MODULES.map((module) => `
          <button
            type="button"
            onclick="location.href='${module.path}'"
            ${globalThis.location.pathname === module.path ? 'disabled' : ''}
          >${module.label}</button>
        `).join('')}
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <a href="/index.html" aria-label="Volver al landing">
          <img src="/uploads/default/Logo.png" alt="Logo tuherramienta.online" style="height:40px; width:auto; display:block;">
        </a>
        <button type="button" onclick="logout()">Cerrar sesión</button>
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