if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

const COMPANY_MODULES = [
  { label: 'Dashboard', path: '/modules/company/dashboard.html' },
  { label: 'Perfil', path: '/modules/company/profile.html' },
  { label: 'Cotizaciones B2B (Detallista)', path: '/modules/company/b2b-retailer.html', requiredRole: 3, requiresApprovedBuy: true },
  { label: 'Cotizaciones B2B (Mayorista)', path: '/modules/company/b2b-wholesaler.html', requiredRole: 2, requiresApprovedSell: true },
  { label: 'Productos', path: '/modules/company/products.html', hideForAdmin: true, requiresApprovedSell: true },
  { label: 'Compras', path: '/modules/company/purchases.html', requiresApprovedSell: true, hideForRole: 2 },
  { label: 'Catálogo', path: '/modules/company/catalog-management.html', requiredRole: 3, requiresApprovedBuy: true },
  { label: 'Admin', path: '/modules/admin/dashboard.html', adminOnly: true }
];

const getCompanyDisplayName = (session) => session?.data?.company?.name || session?.data?.company?.company_name || session?.data?.company?.email || 'Empresa';
const getCompanyProfileImageUrl = (session) => {
  const imageName = String(session?.data?.company?.img_profile || '').trim();

  return imageName ? `/uploads/profiles/companies/${imageName}` : null;
};

const getCompanyAvatarFallback = (session) => {
  const displayName = getCompanyDisplayName(session);
  return String(displayName || 'E').trim().charAt(0).toUpperCase() || 'E';
};

const hasApprovedVerification = (company) => company?.verification_status === 'APPROVED';
const canUseSellModules = (company) => hasApprovedVerification(company) && Boolean(company?.can_sell);
const canUseBuyModules = (company) => hasApprovedVerification(company) && Boolean(company?.can_buy);

const getCompanyModulesForSession = (session) => {
  const roleId = Number(session?.data?.company?.id_role_fk || 0);
  const company = session?.data?.company || null;

  return COMPANY_MODULES.filter((module) => {
    if (module.adminOnly) {
      return roleId === 1;
    }

    if (module.hideForAdmin) {
      return roleId !== 1;
    }

    if (module.requiredRole && roleId !== module.requiredRole) {
      return false;
    }

    if (module.hideForRole && roleId === module.hideForRole) {
      return false;
    }

    if (roleId !== 1 && module.requiresApprovedBuy) {
      return canUseBuyModules(company);
    }

    if (roleId !== 1 && module.requiresApprovedSell) {
      return canUseSellModules(company);
    }

    return true;
  });
};

const renderCompanyLayout = (session) => {
  const layoutContainer = globalThis.document.getElementById('company-layout-nav');
  const profileImageUrl = getCompanyProfileImageUrl(session);
  const displayName = getCompanyDisplayName(session);

  globalThis.document.title = displayName;

  if (!layoutContainer) {
    return;
  }

  layoutContainer.innerHTML = `
    <div class="company-layout-shell">
      <div class="company-layout-brand">
        ${profileImageUrl
          ? `<img src="${profileImageUrl}" alt="Imagen de empresa" class="company-layout-avatar" loading="lazy">`
          : `<div class="company-layout-avatar company-layout-avatar--fallback">${getCompanyAvatarFallback(session)}</div>`}
        <div class="company-layout-brand-copy">
          <p class="company-layout-brand-title">Bienvenido <b>${displayName}</b></p>
          <p class="company-layout-brand-subtitle">Gestiona el estado jurídico, tus ventas y la operación de la empresa.</p>
        </div>
      </div>

      <div class="company-layout-nav-buttons" role="navigation" aria-label="Navegación de empresa">
        ${getCompanyModulesForSession(session).map((module) => `
          <button
            type="button"
            class="company-layout-nav-button"
            onclick="location.href='${module.path}'"
            ${globalThis.location.pathname === module.path ? 'disabled' : ''}
          >${module.label}</button>
        `).join('')}
      </div>
    </div>
  `;
};

globalThis.COMPANY_MODULES = COMPANY_MODULES;
globalThis.refreshCompanyLayout = (company) => {
  renderCompanyLayout({
    data: {
      company
    }
  });
};
globalThis.canUseCompanySellModules = canUseSellModules;

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesión no válida para empresa');
    }

    renderCompanyLayout(session);
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });