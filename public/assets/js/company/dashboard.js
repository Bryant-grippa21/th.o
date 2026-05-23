if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

const companyModulesElement = document.getElementById('company-modules');

const renderCompanyModules = (company) => {
  const modules = [
    { label: 'Perfil', path: '/modules/company/profile.html' },
    { label: 'Compras', path: '/modules/company/purchases.html' }
  ];

  if (company.id_role_fk !== 1) {
    modules.splice(1, 0, { label: 'Productos', path: '/modules/company/products.html' });
  }

  if (company.id_role_fk === 1) {
    modules.push({ label: 'Admin', path: '/modules/admin/dashboard.html' });
  }

  companyModulesElement.innerHTML = modules
    .map((module) => `<button type="button" onclick="location.href='${module.path}'">${module.label}</button>`)
    .join('\n');
};

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesion no valida para empresa');
    }

    const company = session.data.company;
    const companyName = company.name || company.email;

    document.getElementById('company-welcome').innerText = `Bienvenido ${companyName}`;
    renderCompanyModules(company);
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });
