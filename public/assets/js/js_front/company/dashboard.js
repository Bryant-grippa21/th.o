if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

const companyVerificationReminder = document.getElementById('company-verification-reminder');
const companyDashboardStats = document.getElementById('company-dashboard-stats');
const companyWelcome = document.getElementById('company-welcome');

const COMPANY_VERIFICATION_LABELS = {
  PENDING_REVIEW: 'pendiente de revisión',
  CHANGES_REQUESTED: 'con correcciones solicitadas',
  APPROVED: 'aprobada',
  REJECTED: 'rechazada'
};

const COMPANY_DOCUMENT_LABELS = {
  COMMERCIAL_REGISTER: 'Registro mercantil',
  LAST_SHAREHOLDERS_MEETING_MINUTES: 'Última acta de asamblea',
  COMPANY_RIF: 'RIF de la empresa',
  LEGAL_REPRESENTATIVE_ID: 'Cédula del representante legal',
  LEGAL_REPRESENTATIVE_RIF: 'RIF del representante legal',
  ECONOMIC_ACTIVITY_LICENSE: 'Licencia de actividad económica'
};

const normalizeCompanyTechnicalText = (value) => {
  const rawText = String(value || '').trim();

  if (!rawText) {
    return 'Revisa tu perfil y carga o actualiza los recaudos jurídicos.';
  }

  let normalizedText = rawText;

  Object.entries(COMPANY_DOCUMENT_LABELS).forEach(([code, label]) => {
    normalizedText = normalizedText.replaceAll(code, label);
  });

  return normalizedText;
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

  const note = normalizeCompanyTechnicalText(company?.verification_note);
  const label = COMPANY_VERIFICATION_LABELS[status] || status;

  companyVerificationReminder.innerHTML = `
    <section class="company-panel company-panel--warning">
      <p><b>Tu solicitud jurídica está ${label}.</b></p>
      <p>${note}</p>
      <button class="company-layout-nav-button" type="button" onclick="location.href='/modules/company/profile.html'">Ir a perfil de empresa</button>
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
    <section class="company-panel">
      <h2>Resumen</h2>
      <div class="company-summary-grid">
        <article class="company-summary-card">
          <p><b>Estado jurídico</b></p>
          <p>${legalStatus}</p>
        </article>
        <article class="company-summary-card">
          <p><b>Permiso de compra</b></p>
          <p>${canBuy}</p>
        </article>
        <article class="company-summary-card">
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
      throw new Error('Sesión no válida para empresa');
    }

    const company = session.data.company;
    const companyName = company.name || company.company_name || company.email;

    document.title = companyName;
    if (companyWelcome) {
      companyWelcome.innerText = `Bienvenido ${companyName}`;
    }
    globalThis.refreshCompanyLayout?.(company);
    renderVerificationReminder(company);
    renderCompanyDashboardStats(company);
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });
