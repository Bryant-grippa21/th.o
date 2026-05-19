if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesion no valida para empresa');
    }

    const company = session.data.company;
    const companyName = company.name || company.email;

    document.getElementById('company-welcome').innerText = `Bienvenido ${companyName}`;

    if (company.id_role_fk !== 1) {
      document.getElementById('company-product-access').innerHTML =
        '<a href="/modules/company/products.html">Gestionar mis productos</a>';
    }

    if (company.id_role_fk === 1) {
      document.getElementById('admin-access').innerHTML =
        '<a href="/modules/admin/dashboard.html">Ir al dashboard admin</a>';
    }
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });
