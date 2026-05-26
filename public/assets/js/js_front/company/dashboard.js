if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

const companyVerificationReminder = document.getElementById('company-verification-reminder');
const companyDashboardStats = document.getElementById('company-dashboard-stats');

const COMPANY_VERIFICATION_LABELS = {
  PENDING_REVIEW: 'pendiente de revisión',
  CHANGES_REQUESTED: 'con correcciones solicitadas',
  APPROVED: 'aprobada',
  REJECTED: 'rechazada'
};

const renderVerificationReminder = (company) => {
  if (!companyVerificationReminder) {
    return;
  }

  const status = company?.verification_status;

  if (!status || status === 'APPROVED' || Number(company?.id_role_fk) === 1) {
    companyVerificationReminder.innerHTML = '';
    return;
  }

  const note = company?.verification_note || 'Revisa tu perfil y carga o actualiza los recaudos jurídicos.';
  const label = COMPANY_VERIFICATION_LABELS[status] || status;

  companyVerificationReminder.innerHTML = `
    <section>
      <p><b>Tu solicitud jurídica está ${label}.</b></p>
      <p>${note}</p>
      <button type="button" onclick="location.href='/modules/company/profile.html'">Ir a perfil de empresa</button>
    </section>
  `;
};

const renderCompanyDashboardStats = (company) => {
  if (!companyDashboardStats) {
    return;
  }

  const legalStatus = COMPANY_VERIFICATION_LABELS[company?.verification_status] || 'Sin estado';
  const canBuy = company?.can_buy ? 'Habilitado' : 'No habilitado';
  const canSell = company?.can_sell ? 'Habilitado' : 'No habilitado';

  companyDashboardStats.innerHTML = `
    <section>
      <h2>Resumen</h2>
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <article style="border:1px solid #ccc; padding:12px; min-width:180px;">
          <p><b>Estado jurídico</b></p>
          <p>${legalStatus}</p>
        </article>
        <article style="border:1px solid #ccc; padding:12px; min-width:180px;">
          <p><b>Permiso de compra</b></p>
          <p>${canBuy}</p>
        </article>
        <article style="border:1px solid #ccc; padding:12px; min-width:180px;">
          <p><b>Permiso de venta</b></p>
          <p>${canSell}</p>
        </article>
      </div>
    </section>
  `;
};

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesion no valida para empresa');
    }

    const company = session.data.company;
    const companyName = company.name || company.company_name || company.email;

    document.title = companyName;
    document.getElementById('company-welcome').innerText = `Bienvenido ${companyName}`;
    globalThis.refreshCompanyLayout?.(company);
    renderVerificationReminder(company);
    renderCompanyDashboardStats(company);
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });
