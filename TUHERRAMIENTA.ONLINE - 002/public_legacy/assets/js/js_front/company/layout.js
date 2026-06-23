if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

const COMPANY_MODULES = [
  { label: 'Dashboard', path: '/modules/company/dashboard.html' },
  { label: 'Perfil', path: '/modules/company/profile.html' },
  { label: 'Cotizaciones B2B (Detallista)', path: '/modules/company/b2b-retailer.html', requiredRole: 3, requiresApprovedBuy: true },
  { label: 'Cotizaciones B2B (Mayorista)', path: '/modules/company/b2b-wholesaler.html', requiredRole: 2, requiresApprovedSell: true },
  { label: 'Productos', path: '/modules/company/products.html', hideForAdmin: true, requiresApprovedSell: true },
  { label: 'Compras', path: '/modules/company/purchases.html', requiresApprovedSell: true },
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
    <div style="margin-bottom:16px;">
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
        ${profileImageUrl
          ? `<img src="${profileImageUrl}" alt="Imagen de empresa" style="width:56px; height:56px; object-fit:cover; border-radius:50%; border:1px solid #ccc;">`
          : `<div style="width:56px; height:56px; border-radius:50%; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-weight:700; background:#f5f5f5;">${getCompanyAvatarFallback(session)}</div>`}
        <div>
          <p style="margin:0;">Bienvenido <b>${displayName}</b></p>
          <p style="margin:4px 0 0 0; color:#555;">Gestiona el estado jurídico, tus ventas y la operación de la empresa.</p>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        ${getCompanyModulesForSession(session).map((module) => `
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