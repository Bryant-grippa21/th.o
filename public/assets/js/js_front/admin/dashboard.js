const adminCustomerSummary = document.getElementById('admin-customer-summary');
const adminCustomerList = document.getElementById('admin-customer-list');
const adminCustomerPagination = document.getElementById('admin-customer-pagination');
const adminCompanySummary = document.getElementById('admin-company-summary');
const adminCompanyList = document.getElementById('admin-company-list');
const adminCompanyPagination = document.getElementById('admin-company-pagination');
const adminDashboardOverview = document.getElementById('admin-dashboard-overview');
const adminDashboardReports = document.getElementById('admin-dashboard-reports');
const adminDashboardReportTabs = Array.from(document.querySelectorAll('[data-admin-report-tab]'));
const adminDashboardSectionEyebrow = document.getElementById('admin-dashboard-section-eyebrow');
const adminDashboardSectionTitle = document.getElementById('admin-dashboard-section-title');
const adminDashboardSectionDescription = document.getElementById('admin-dashboard-section-description');
const adminExchangeSummary = document.getElementById('admin-exchange-summary');
const adminExchangeForm = document.getElementById('admin-exchange-form');
const adminExchangeRateInput = document.getElementById('admin-exchange-rate-input');
const adminExchangeMessage = document.getElementById('admin-exchange-message');
const adminExchangeList = document.getElementById('admin-exchange-list');
const adminPurchasesSummary = document.getElementById('admin-purchases-summary');
const adminPurchasesCheckoutsList = document.getElementById('admin-purchases-checkouts-list');
const adminPurchasesSearchInput = document.getElementById('admin-purchases-search');
const adminPurchasesStatusFilter = document.getElementById('admin-purchases-status-filter');
const adminPurchasesDateFromFilter = document.getElementById('admin-purchases-date-from');
const adminPurchasesDateToFilter = document.getElementById('admin-purchases-date-to');
const adminPurchasesResetFiltersButton = document.getElementById('admin-purchases-reset-filters');
const adminProductSummary = document.getElementById('admin-product-summary');
const adminProductList = document.getElementById('admin-product-list');
const adminProductPagination = document.getElementById('admin-product-pagination');
const adminProductEditor = document.getElementById('admin-product-editor');
const adminProductEditorForm = document.getElementById('admin-product-editor-form');
const adminProductEditorMessage = document.getElementById('admin-product-editor-message');
const adminEditProductId = document.getElementById('admin-edit-product-id');
const adminEditProductCompanyId = document.getElementById('admin-edit-product-company-id');
const adminEditProductName = document.getElementById('admin-edit-product-name');
const adminEditProductBrand = document.getElementById('admin-edit-product-brand');
const adminEditProductDescription = document.getElementById('admin-edit-product-description');
const adminEditProductPrice = document.getElementById('admin-edit-product-price');
const adminEditProductMinStock = document.getElementById('admin-edit-product-min-stock');
const adminEditProductImages = document.getElementById('admin-edit-product-images');
const adminEditProductMainImage = document.getElementById('admin-edit-product-main-image');
const adminEditProductMainImagePreview = document.getElementById('admin-edit-product-main-image-preview');
const adminEditProductSecondaryImages = document.getElementById('admin-edit-product-secondary-images');
const adminEditProductSecondaryImagesPreview = document.getElementById('admin-edit-product-secondary-images-preview');
const adminEditProductCancel = document.getElementById('admin-edit-product-cancel');
const adminCustomerModal = document.getElementById('admin-customer-modal');
const adminCustomerModalForm = document.getElementById('admin-customer-modal-form');
const adminCustomerModalClose = document.getElementById('admin-customer-modal-close');
const adminCustomerModalId = document.getElementById('admin-customer-modal-id');
const adminCustomerModalName = document.getElementById('admin-customer-modal-name');
const adminCustomerModalEmail = document.getElementById('admin-customer-modal-email');
const adminCustomerModalPassword = document.getElementById('admin-customer-modal-password');
const adminCustomerModalRecoverySummary = document.getElementById('admin-customer-modal-recovery-summary');
const adminCustomerModalRecoveryAction = document.getElementById('admin-customer-modal-recovery-action');
const adminCustomerModalRecoveryNote = document.getElementById('admin-customer-modal-recovery-note');
const adminCustomerModalMessage = document.getElementById('admin-customer-modal-message');
const adminCompanyModal = document.getElementById('admin-company-modal');
const adminCompanyModalForm = document.getElementById('admin-company-modal-form');
const adminCompanyModalClose = document.getElementById('admin-company-modal-close');
const adminCompanyModalId = document.getElementById('admin-company-modal-id');
const adminCompanyModalName = document.getElementById('admin-company-modal-name');
const adminCompanyModalRif = document.getElementById('admin-company-modal-rif');
const adminCompanyModalEmail = document.getElementById('admin-company-modal-email');
const adminCompanyModalRole = document.getElementById('admin-company-modal-role');
const adminCompanyModalPassword = document.getElementById('admin-company-modal-password');
const adminCompanyModalVerificationStatus = document.getElementById('admin-company-modal-verification-status');
const adminCompanyModalVerificationNote = document.getElementById('admin-company-modal-verification-note');
const adminCompanyModalCombinedAccess = document.getElementById('admin-company-modal-combined-access');
const adminCompanyModalCombinedAccessState = document.getElementById('admin-company-modal-combined-access-state');
const adminCompanyModalDocumentsList = document.getElementById('admin-company-modal-documents-list');
const adminCompanyModalHistoryList = document.getElementById('admin-company-modal-history-list');
const adminCompanyModalMessage = document.getElementById('admin-company-modal-message');
const adminConfirmModal = document.getElementById('admin-confirm-modal');
const adminConfirmModalTitle = document.getElementById('admin-confirm-modal-title');
const adminConfirmModalMessage = document.getElementById('admin-confirm-modal-message');
const adminConfirmModalClose = document.getElementById('admin-confirm-modal-close');
const adminConfirmModalCancel = document.getElementById('admin-confirm-modal-cancel');
const adminConfirmModalConfirm = document.getElementById('admin-confirm-modal-confirm');
const adminProductStockHistory = document.getElementById('admin-product-stock-history');
const adminProductStockHistoryPagination = document.getElementById('admin-product-stock-history-pagination');
const customerFilterNameInput = document.getElementById('customer-filter-name');
const customerFilterEmailInput = document.getElementById('customer-filter-email');
const customerFilterStatusInput = document.getElementById('customer-filter-status');
const companyFilterNameInput = document.getElementById('company-filter-name');
const companyFilterDocumentInput = document.getElementById('company-filter-document');
const companyFilterEmailInput = document.getElementById('company-filter-email');
const companyFilterVerificationStatusInput = document.getElementById('company-filter-verification-status');
const productFilterNameInput = document.getElementById('product-filter-name');
const productFilterCompanyInput = document.getElementById('product-filter-company');
const productFilterCategory = document.getElementById('product-filter-category');
const productFilterSubcategory = document.getElementById('product-filter-subcategory');
const productFilterLine = document.getElementById('product-filter-line');
const adminModuleButtons = Array.from(document.querySelectorAll('[data-admin-module-button]'));
const adminModules = {
  dashboard: document.getElementById('admin-module-dashboard'),
  customers: document.getElementById('admin-module-customers'),
  companies: document.getElementById('admin-module-companies'),
  exchange: document.getElementById('admin-module-exchange'),
  purchases: document.getElementById('admin-module-purchases'),
  products: document.getElementById('admin-module-products')
};
const adminProductSubmenus = {
  list: document.getElementById('admin-product-submenu-list')
};
const state = {
  companyRoles: [],
  customers: [],
  companies: [],
  exchangeRates: [],
  adminCheckouts: [],
  adminSales: [],
  activeModule: 'dashboard',
  activeDashboardReportTab: 'general',
  activeProductSubmenu: 'list',
  customerPagination: {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  },
  companyPagination: {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  },
  products: [],
  productCategories: [],
  productSubcategories: [],
  productLines: [],
  productPagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  },
  productEditor: {
    product: null,
    mainPreviewUrl: null,
    secondaryPreviewUrls: [],
    stockHistoryPagination: {
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 1
    }
  },
  customerEditor: {
    customerId: null,
    recoveryRequest: null
  },
  companyEditor: {
    companyId: null,
    verificationSnapshot: null,
    commercialAccess: false
  },
  purchasesFilters: {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  },
  confirmDialog: {
    resolver: null
  }
};

const closeAdminConfirmModal = (result = false) => {
  if (adminConfirmModal) {
    adminConfirmModal.hidden = true;
  }

  if (typeof state.confirmDialog.resolver === 'function') {
    state.confirmDialog.resolver(Boolean(result));
  }

  state.confirmDialog.resolver = null;
};

const openAdminConfirmModal = ({ title, message, confirmLabel = 'Confirmar' }) => {
  if (!adminConfirmModal) {
    return Promise.resolve(true);
  }

  if (adminConfirmModalTitle) {
    adminConfirmModalTitle.textContent = title || 'Confirmar acción';
  }

  if (adminConfirmModalMessage) {
    adminConfirmModalMessage.textContent = message || '¿Deseas continuar?';
  }

  if (adminConfirmModalConfirm) {
    adminConfirmModalConfirm.textContent = confirmLabel;
  }

  adminConfirmModal.hidden = false;

  return new Promise((resolve) => {
    state.confirmDialog.resolver = resolve;
  });
};

const COMPANY_VERIFICATION_LABELS = {
  PENDING_REVIEW: 'Pendiente de revisión',
  CHANGES_REQUESTED: 'Correcciones solicitadas',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
};

const COMPANY_DOCUMENT_LABELS = {
  COMMERCIAL_REGISTER: 'Registro mercantil',
  LAST_SHAREHOLDERS_MEETING_MINUTES: 'Última acta de asamblea',
  COMPANY_RIF: 'RIF de la empresa',
  LEGAL_REPRESENTATIVE_ID: 'Cédula del representante legal',
  LEGAL_REPRESENTATIVE_RIF: 'RIF del representante legal',
  ECONOMIC_ACTIVITY_LICENSE: 'Licencia de actividad económica'
};

const isCommercialAccessEnabled = (company) => Boolean(company?.can_buy) && Boolean(company?.can_sell);

const renderCommercialAccessState = (enabled) => {
  if (!adminCompanyModalCombinedAccess || !adminCompanyModalCombinedAccessState) {
    return;
  }

  adminCompanyModalCombinedAccess.textContent = enabled
    ? 'Puede comprar y vender'
    : 'No puede comprar ni vender';
  adminCompanyModalCombinedAccessState.textContent = enabled
    ? 'Ambos permisos están activos.'
    : 'Ambos permisos están desactivados.';
  adminCompanyModalCombinedAccess.classList.toggle('admin-company-access-control__button--active', enabled);
};

const toggleCommercialAccess = () => {
  state.companyEditor.commercialAccess = !state.companyEditor.commercialAccess;
  renderCommercialAccessState(state.companyEditor.commercialAccess);
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders()
    }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
};

const parseAttributesObject = (attributes) => {
  if (!attributes) {
    return {};
  }

  try {
    const parsed = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    return !parsed || typeof parsed !== 'object' || Array.isArray(parsed) ? {} : parsed;
  } catch {
    return {};
  }
};

const populateAdminAttributeInputs = (attributes) => {
  const entries = Object.entries(parseAttributesObject(attributes)).slice(0, 4);

  for (let index = 1; index <= 4; index += 1) {
    const [key, value] = entries[index - 1] || ['', ''];
    document.getElementById(`admin-edit-product-attribute-key-${index}`).value = key || '';
    document.getElementById(`admin-edit-product-attribute-value-${index}`).value = value || '';
  }
};

const buildAdminAttributesValue = () => {
  const attributes = {};

  for (let index = 1; index <= 4; index += 1) {
    const key = document.getElementById(`admin-edit-product-attribute-key-${index}`).value.trim();
    const value = document.getElementById(`admin-edit-product-attribute-value-${index}`).value.trim();

    if (!key && !value) {
      continue;
    }

    if (!key || !value) {
      throw new Error(`Debes completar nombre y valor del atributo ${index}`);
    }

    attributes[key] = value;
  }

  if (!Object.keys(attributes).length) {
    throw new Error('Debes ingresar al menos un atributo');
  }

  return JSON.stringify(attributes);
};

const revokeAdminPreviewUrls = () => {
  if (state.productEditor.mainPreviewUrl) {
    URL.revokeObjectURL(state.productEditor.mainPreviewUrl);
    state.productEditor.mainPreviewUrl = null;
  }

  state.productEditor.secondaryPreviewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  state.productEditor.secondaryPreviewUrls = [];
};

const normalizeFilterValue = (value) => String(value || '').trim().toLowerCase();

const matchesFilter = (value, filterValue) => {
  if (!filterValue) {
    return true;
  }

  return normalizeFilterValue(value).includes(filterValue);
};

const formatAdminDateTime = (value) => {
  return formatExchangeDate(value);
};

const getInitialLetter = (value, fallback = 'U') => String(value || fallback).trim().charAt(0).toUpperCase() || fallback;

const buildProfileMedia = (displayName, imageUrl, altLabel) => imageUrl
  ? `
      <div class="admin-entity-media">
        <img src="${imageUrl}" alt="${altLabel}">
      </div>
    `
  : `
      <div class="admin-entity-media">${getInitialLetter(displayName)}</div>
    `;

const getCustomerProfileImageUrl = (customer) => {
  const imageName = String(customer?.img_profile || '').trim();
  return imageName ? `/uploads/profiles/customers/${imageName}` : null;
};

const getCompanyProfileImageUrl = (company) => {
  const imageName = String(company?.img_profile || '').trim();
  return imageName ? `/uploads/profiles/companies/${imageName}` : null;
};

const paginateItems = (items, paginationState) => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / paginationState.limit));
  const currentPage = Math.min(Math.max(paginationState.page, 1), totalPages);
  const startIndex = (currentPage - 1) * paginationState.limit;

  paginationState.page = currentPage;
  paginationState.total = total;
  paginationState.total_pages = totalPages;

  return {
    items: items.slice(startIndex, startIndex + paginationState.limit),
    pagination: paginationState
  };
};

const renderSimplePagination = (container, pagination, handlerName) => {
  if (!container) {
    return;
  }

  if (!pagination.total || pagination.total_pages <= 1) {
    container.innerHTML = pagination.total
      ? `<span>Página ${pagination.page} de ${pagination.total_pages}</span>`
      : '';
    return;
  }

  const pageButtons = Array.from({ length: pagination.total_pages }, (_value, index) => {
    const pageNumber = index + 1;

    if (pageNumber === pagination.page) {
      return `<b>${pageNumber}</b>`;
    }

    return `<button type="button" onclick="${handlerName}(${pageNumber})">${pageNumber}</button>`;
  }).join(' ');

  container.innerHTML = `
    <button type="button" onclick="${handlerName}(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>Anterior</button>
    ${pageButtons}
    <button type="button" onclick="${handlerName}(${pagination.page + 1})" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>Siguiente</button>
  `;
};

const getVisibleCompanies = () => state.companies.filter((company) => !(company.id_role_fk === 1 || company.role_name === 'ADMIN'));

const DASHBOARD_TAB_META = {
  general: {
    eyebrow: 'Módulo 1',
    title: 'Visión General - Home Ejecutivo',
    description: 'Entrada ejecutiva del administrador general: GMV, usuarios, riesgo, rentabilidad, actividad, rankings, gráficos y alertas críticas.'
  },
  risk: {
    eyebrow: 'Módulo 2',
    title: 'Riesgo y Morosidad',
    description: 'Monitoreo de cartera vencida, niveles de riesgo, cobranza activa y alertas tempranas del ecosistema comercial.'
  },
  wholesalers: {
    eyebrow: 'Módulo 3',
    title: 'Mayoristas',
    description: 'Vista reservada para desempeño de mayoristas, actividad y cobertura territorial.'
  },
  hardware: {
    eyebrow: 'Módulo 4',
    title: 'Ferreterías',
    description: 'Vista reservada para operación de ferreterías y comportamiento de compras/ventas.'
  },
  customers: {
    eyebrow: 'Módulo 5',
    title: 'Clientes Finales',
    description: 'Vista reservada para adopción de clientes finales, comportamiento y recurrencia.'
  },
  collections: {
    eyebrow: 'Módulo 6',
    title: 'Cobranza y Recuperación',
    description: 'Vista reservada para indicadores de cobranza, promesas de pago y recuperación.'
  },
  operations: {
    eyebrow: 'Módulo 7',
    title: 'Operaciones',
    description: 'Vista reservada para tiempos operativos, despachos y cumplimiento de SLA.'
  },
  finances: {
    eyebrow: 'Módulo 8',
    title: 'Finanzas TH.O',
    description: 'Vista reservada para margen, comisiones, flujo de caja y rentabilidad consolidada.'
  },
  audit: {
    eyebrow: 'Módulo 9',
    title: 'Control y Auditoría',
    description: 'Vista reservada para trazabilidad, cambios sensibles y control interno.'
  },
  inventory: {
    eyebrow: 'Módulo 10',
    title: 'Inventario y Catálogo',
    description: 'Vista reservada para cobertura de catálogo, rotación y salud de inventario.'
  }
};

const updateAdminDashboardSectionHead = () => {
  const activeMeta = DASHBOARD_TAB_META[state.activeDashboardReportTab] || DASHBOARD_TAB_META.general;

  if (adminDashboardSectionEyebrow) {
    adminDashboardSectionEyebrow.innerText = activeMeta.eyebrow;
  }

  if (adminDashboardSectionTitle) {
    adminDashboardSectionTitle.innerText = activeMeta.title;
  }

  if (adminDashboardSectionDescription) {
    adminDashboardSectionDescription.innerText = activeMeta.description;
  }
};

const showAdminDashboardReportTab = (tabName) => {
  const resolvedTabName = DASHBOARD_TAB_META[tabName] ? tabName : 'general';
  state.activeDashboardReportTab = resolvedTabName;

  adminDashboardReportTabs.forEach((tabButton) => {
    const isActive = tabButton.dataset.adminReportTab === resolvedTabName;
    tabButton.classList.toggle('is-active', isActive);
    tabButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  updateAdminDashboardSectionHead();
  renderAdminOverview();
};

const renderAdminOverview = () => {
  if (!adminDashboardOverview || !adminDashboardReports) {
    return;
  }

  const visibleCompanies = getVisibleCompanies();
  const pendingReview = visibleCompanies.filter((company) => company.verification_status === 'PENDING_REVIEW').length;
  const changesRequested = visibleCompanies.filter((company) => company.verification_status === 'CHANGES_REQUESTED').length;
  const blockedUsers = state.customers.filter((customer) => !customer.is_active).length;
  const activeWholesalers = new Set(state.adminSales.map((group) => group.id_company_fk).filter(Boolean)).size;
  const activeStores = new Set(state.adminCheckouts.map((checkout) => checkout.id_customer_fk).filter(Boolean)).size;

  const gmvTotal = state.adminCheckouts.reduce((total, checkout) => total + Number(checkout.total_payable_usd || 0), 0);
  const gmvB2B = state.adminSales.reduce((total, group) => total + Number(group.total_payable_usd || 0), 0);
  const gmvB2C = Math.max(0, gmvTotal - gmvB2B);
  const totalOperations = state.adminCheckouts.length + state.adminSales.length;
  const averageTicket = state.adminCheckouts.length ? gmvTotal / state.adminCheckouts.length : 0;

  const carteraActiva = state.adminSales
    .filter((group) => ['OPEN', 'PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'PARTIAL_SUBMITTED', 'PARTIAL_APPROVED'].includes(group.status))
    .reduce((total, group) => total + Number(group.total_payable_usd || 0), 0);
  const carteraVencida = state.adminSales
    .filter((group) => ['EXPIRED', 'REJECTED'].includes(group.status))
    .reduce((total, group) => total + Number(group.total_payable_usd || 0), 0);
  const commissionB2B = gmvB2B * 0.015;
  const adjustedProfit = commissionB2B + (gmvB2C * 0.02) - (carteraVencida * 0.08);

  const formatDashboardCurrency = (value) => Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  const formatDashboardAmount = (value) => `USD ${formatDashboardCurrency(value)}`;

  const barsData = [28, 46, 36, 58, 42, 64, 53, 68];
  const barsMarkup = barsData.map((height, index) => `
    <span class="admin-dashboard-bar ${index % 3 === 0 ? 'is-highlight' : ''}" style="height:${height}px;"></span>
  `).join('');

  const recentActivityRows = state.adminCheckouts
    .slice()
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 4)
    .map((checkout) => {
      const date = new Date(checkout.created_at || Date.now());
      return {
        date: date.toLocaleDateString('es-VE'),
        time: date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        type: getPurchaseStatusLabel(checkout.status),
        user: checkout.customer?.name || checkout.customer?.email || 'Cliente'
      };
    });

  const alertRows = [
    {
      priority: carteraVencida > 0 ? 'Alta' : 'Media',
      type: 'Financiera',
      description: carteraVencida > 0
        ? `Cartera vencida detectada: ${formatDashboardAmount(carteraVencida)}`
        : 'Sin mora crítica registrada.'
    },
    {
      priority: changesRequested > 2 ? 'Alta' : 'Media',
      type: 'Operativa',
      description: `${changesRequested} jurídicos con correcciones solicitadas.`
    },
    {
      priority: blockedUsers > 0 ? 'Media' : 'Baja',
      type: 'Comercial',
      description: `${blockedUsers} clientes bloqueados en revisión.`
    }
  ];

  const wholesalerRanking = Object.values(state.adminSales.reduce((accumulator, group) => {
    const key = String(group.id_company_fk || group.company?.name || 'unknown');
    if (!accumulator[key]) {
      accumulator[key] = {
        name: group.company?.name || 'Mayorista sin nombre',
        sales: 0,
        operations: 0
      };
    }
    accumulator[key].sales += Number(group.total_payable_usd || 0);
    accumulator[key].operations += 1;
    return accumulator;
  }, {}))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6);

  const hardwareRanking = Object.values(state.adminCheckouts.reduce((accumulator, checkout) => {
    const key = String(checkout.id_customer_fk || checkout.customer?.email || 'unknown');
    if (!accumulator[key]) {
      accumulator[key] = {
        name: checkout.customer?.name || checkout.customer?.email || 'Cliente sin nombre',
        purchases: 0,
        operations: 0
      };
    }
    accumulator[key].purchases += Number(checkout.total_payable_usd || 0);
    accumulator[key].operations += 1;
    return accumulator;
  }, {}))
    .sort((a, b) => b.purchases - a.purchases)
    .slice(0, 6);

  const overdueGroups = state.adminSales.filter((group) => ['EXPIRED', 'REJECTED'].includes(group.status));
  const atRiskGroups = state.adminSales.filter((group) => ['PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'PARTIAL_SUBMITTED'].includes(group.status));
  const riskCoverageRatio = carteraActiva > 0 ? (carteraVencida / carteraActiva) * 100 : 0;
  const riskScore = Math.min(100, Math.round((riskCoverageRatio * 0.6) + (blockedUsers * 1.2) + (changesRequested * 2.5)));
  const collectionEffectiveness = carteraActiva > 0 ? ((carteraActiva - carteraVencida) / carteraActiva) * 100 : 100;

  const topRiskRows = overdueGroups
    .slice()
    .sort((a, b) => Number(b.total_payable_usd || 0) - Number(a.total_payable_usd || 0))
    .slice(0, 6)
    .map((group) => ({
      account: group.company?.name || `Grupo #${group.id_purchase_group}`,
      amount: Number(group.total_payable_usd || 0),
      status: getPurchaseStatusLabel(group.status),
      updatedAt: formatExchangeDate(group.updated_at || group.created_at)
    }));

  if (state.activeDashboardReportTab !== 'general' && state.activeDashboardReportTab !== 'risk') {
    adminDashboardOverview.innerHTML = `
      <article class="admin-dashboard-kpi">
        <h4>Módulo en preparación</h4>
        <p>${DASHBOARD_TAB_META[state.activeDashboardReportTab]?.title || 'Próximamente'}</p>
        <small>La barra horizontal ya está preparada para habilitar este módulo con data real.</small>
      </article>
    `;

    adminDashboardReports.innerHTML = `
      <article class="admin-report-card">
        <p><b>Vista reservada para reportes</b></p>
        <p>Este tab está habilitado visualmente y listo para conectar sus KPIs, tablas y gráficos específicos.</p>
      </article>
    `;

    return;
  }

  if (state.activeDashboardReportTab === 'risk') {
    adminDashboardOverview.innerHTML = `
      <article class="admin-dashboard-kpi admin-dashboard-kpi--danger">
        <h4>Cartera vencida</h4>
        <p>${formatDashboardAmount(carteraVencida)}</p>
        <small>Montos en estados vencido/rechazado</small>
      </article>
      <article class="admin-dashboard-kpi admin-dashboard-kpi--warning">
        <h4>Cartera en riesgo</h4>
        <p>${formatDashboardAmount(atRiskGroups.reduce((sum, group) => sum + Number(group.total_payable_usd || 0), 0))}</p>
        <small>Operaciones pendientes de pago parcial/total</small>
      </article>
      <article class="admin-dashboard-kpi">
        <h4>Score de riesgo</h4>
        <p>${riskScore}/100</p>
        <small>Modelo interno de señales operativas y financieras</small>
      </article>
      <article class="admin-dashboard-kpi admin-dashboard-kpi--success">
        <h4>Efectividad de cobranza</h4>
        <p>${collectionEffectiveness.toFixed(1)}%</p>
        <small>Porcentaje de cartera sana sobre cartera activa</small>
      </article>
      <article class="admin-dashboard-kpi">
        <h4>Grupos vencidos</h4>
        <p>${overdueGroups.length}</p>
        <small>Cuentas en mora con impacto financiero</small>
      </article>
      <article class="admin-dashboard-kpi">
        <h4>Grupos en seguimiento</h4>
        <p>${atRiskGroups.length}</p>
        <small>Casos en cobranza preventiva activa</small>
      </article>
      <article class="admin-dashboard-kpi admin-dashboard-kpi--warning">
        <h4>Jurídicos pendientes</h4>
        <p>${pendingReview + changesRequested}</p>
        <small>Pendientes + correcciones solicitadas</small>
      </article>
      <article class="admin-dashboard-kpi">
        <h4>Clientes bloqueados</h4>
        <p>${blockedUsers}</p>
        <small>Usuarios restringidos por riesgo operativo</small>
      </article>
    `;

    adminDashboardReports.innerHTML = `
      <section class="admin-dashboard-chart-row">
        <article class="admin-dashboard-card">
          <h4>Severidad de mora</h4>
          <p class="admin-dashboard-card__meta">Bajo · Medio · Alto · Crítico</p>
          <div class="admin-dashboard-bars">${barsMarkup}</div>
        </article>
        <article class="admin-dashboard-card">
          <h4>Tendencia de recuperación</h4>
          <p class="admin-dashboard-card__meta">Promesas · Cumplidas · Pendientes</p>
          <div class="admin-dashboard-bars">${barsMarkup}</div>
        </article>
        <article class="admin-dashboard-card">
          <h4>Exposición por tipo</h4>
          <p class="admin-dashboard-card__meta">Financiera · Operativa · Comercial</p>
          <div class="admin-dashboard-bars">${barsMarkup}</div>
        </article>
      </section>

      <section class="admin-dashboard-table-row">
        <article class="admin-dashboard-card">
          <h4>Top cuentas con mayor riesgo</h4>
          <p class="admin-dashboard-card__meta">${topRiskRows.length} registros</p>
          <div class="admin-dashboard-table-wrap">
            <table class="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Monto USD</th>
                  <th>Estado</th>
                  <th>Última actualización</th>
                </tr>
              </thead>
              <tbody>
                ${(topRiskRows.length ? topRiskRows : [{ account: 'Sin datos', amount: 0, status: 'N/A', updatedAt: '-' }]).map((entry) => `
                  <tr>
                    <td>${entry.account}</td>
                    <td>${formatDashboardCurrency(entry.amount)}</td>
                    <td>${entry.status}</td>
                    <td>${entry.updatedAt}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </article>
        <article class="admin-dashboard-card">
          <h4>Alertas de riesgo</h4>
          <p class="admin-dashboard-card__meta">3 señales clave</p>
          <div class="admin-dashboard-table-wrap">
            <table class="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Prioridad</th>
                  <th>Indicador</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${riskScore >= 70 ? 'Alta' : 'Media'}</td>
                  <td>Score agregado</td>
                  <td>${riskScore}/100 basado en mora, bloqueos y jurídico</td>
                </tr>
                <tr>
                  <td>${overdueGroups.length >= 5 ? 'Alta' : 'Media'}</td>
                  <td>Cartera vencida</td>
                  <td>${overdueGroups.length} grupos en vencido/rechazado</td>
                </tr>
                <tr>
                  <td>${changesRequested > 2 ? 'Media' : 'Baja'}</td>
                  <td>Correcciones jurídicas</td>
                  <td>${changesRequested} empresas requieren ajustes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article class="admin-report-card">
        <p><b>Resumen de riesgo y morosidad</b></p>
        <p>Cartera activa: ${formatDashboardAmount(carteraActiva)}</p>
        <p>Cartera vencida: ${formatDashboardAmount(carteraVencida)}</p>
        <p>Ratio de exposición: ${riskCoverageRatio.toFixed(1)}%</p>
        <p>Operaciones en seguimiento preventivo: ${atRiskGroups.length}</p>
      </article>
    `;

    return;
  }

  adminDashboardOverview.innerHTML = `
    <article class="admin-dashboard-kpi admin-dashboard-kpi--success">
      <h4>GMV total</h4>
      <p>${formatDashboardAmount(gmvTotal)}</p>
      <small>GMV B2B + GMV B2C</small>
    </article>
    <article class="admin-dashboard-kpi">
      <h4>GMV B2B</h4>
      <p>${formatDashboardAmount(gmvB2B)}</p>
      <small>Pedidos despachados/cobrados/vencidos</small>
    </article>
    <article class="admin-dashboard-kpi">
      <h4>GMV B2C</h4>
      <p>${formatDashboardAmount(gmvB2C)}</p>
      <small>Ventas B2C confirmadas</small>
    </article>
    <article class="admin-dashboard-kpi">
      <h4>Total operaciones</h4>
      <p>${Number(totalOperations || 0).toLocaleString('es-VE')}</p>
      <small>Pedidos B2B + ventas B2C</small>
    </article>
    <article class="admin-dashboard-kpi">
      <h4>Ticket promedio general</h4>
      <p>${formatDashboardAmount(averageTicket)}</p>
      <small>GMV total / operaciones</small>
    </article>
    <article class="admin-dashboard-kpi">
      <h4>Mayoristas activos</h4>
      <p>${activeWholesalers}</p>
      <small>Con actividad en el período</small>
    </article>
    <article class="admin-dashboard-kpi">
      <h4>Ferreterías activas</h4>
      <p>${activeStores}</p>
      <small>Compras o ventas registradas</small>
    </article>
    <article class="admin-dashboard-kpi admin-dashboard-kpi--warning">
      <h4>Usuarios bloqueados</h4>
      <p>${blockedUsers}</p>
      <small>Actuales del ecosistema</small>
    </article>
    <article class="admin-dashboard-kpi admin-dashboard-kpi--warning">
      <h4>Cartera activa</h4>
      <p>${formatDashboardAmount(carteraActiva)}</p>
      <small>Saldo pendiente B2B</small>
    </article>
    <article class="admin-dashboard-kpi admin-dashboard-kpi--danger">
      <h4>Cartera vencida</h4>
      <p>${formatDashboardAmount(carteraVencida)}</p>
      <small>Mora global estimada</small>
    </article>
    <article class="admin-dashboard-kpi">
      <h4>Comisión B2B</h4>
      <p>${formatDashboardAmount(commissionB2B)}</p>
      <small>Ventas B2B x 1,5%</small>
    </article>
    <article class="admin-dashboard-kpi admin-dashboard-kpi--success">
      <h4>Utilidad ajustada</h4>
      <p>${formatDashboardAmount(adjustedProfit)}</p>
      <small>Ingreso bruto - riesgo vigente</small>
    </article>
  `;

  adminDashboardReports.innerHTML = `
    <section class="admin-dashboard-chart-row">
      <article class="admin-dashboard-card">
        <h4>Evolución del GMV</h4>
        <p class="admin-dashboard-card__meta">GMV Total · GMV B2B · GMV B2C</p>
        <div class="admin-dashboard-bars">${barsMarkup}</div>
      </article>
      <article class="admin-dashboard-card">
        <h4>Estado de la cartera</h4>
        <p class="admin-dashboard-card__meta">Corriente · Próxima · Vencida</p>
        <div class="admin-dashboard-bars">${barsMarkup}</div>
      </article>
      <article class="admin-dashboard-card">
        <h4>Rentabilidad TH.O</h4>
        <p class="admin-dashboard-card__meta">Comisión B2B · Utilidad B2C · Reinserción</p>
        <div class="admin-dashboard-bars">${barsMarkup}</div>
      </article>
    </section>

    <section class="admin-dashboard-table-row">
      <article class="admin-dashboard-card">
        <h4>Actividad reciente</h4>
        <p class="admin-dashboard-card__meta">${recentActivityRows.length} registros</p>
        <div class="admin-dashboard-table-wrap">
          <table class="admin-dashboard-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo de evento</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              ${(recentActivityRows.length ? recentActivityRows : [{ date: '-', time: '-', type: 'Sin registros', user: 'Sistema' }]).map((entry) => `
                <tr>
                  <td>${entry.date}</td>
                  <td>${entry.time}</td>
                  <td>${entry.type}</td>
                  <td>${entry.user}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </article>
      <article class="admin-dashboard-card">
        <h4>Alertas críticas</h4>
        <p class="admin-dashboard-card__meta">${alertRows.length} registros</p>
        <div class="admin-dashboard-table-wrap">
          <table class="admin-dashboard-table">
            <thead>
              <tr>
                <th>Prioridad</th>
                <th>Tipo</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${alertRows.map((entry) => `
                <tr>
                  <td>${entry.priority}</td>
                  <td>${entry.type}</td>
                  <td>${entry.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <section class="admin-dashboard-ranking-row">
      <article class="admin-dashboard-card">
        <h4>Ranking de Mayoristas</h4>
        <p class="admin-dashboard-card__meta">${wholesalerRanking.length} registros</p>
        <div class="admin-dashboard-table-wrap">
          <table class="admin-dashboard-table">
            <thead>
              <tr>
                <th>Mayorista</th>
                <th>Ventas B2B USD</th>
                <th>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              ${(wholesalerRanking.length ? wholesalerRanking : [{ name: 'Sin datos', sales: 0, operations: 0 }]).map((entry) => `
                <tr>
                  <td>${entry.name}</td>
                  <td>${formatDashboardCurrency(entry.sales)}</td>
                  <td>${entry.operations}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </article>
      <article class="admin-dashboard-card">
        <h4>Ranking de Ferreterías</h4>
        <p class="admin-dashboard-card__meta">${hardwareRanking.length} registros</p>
        <div class="admin-dashboard-table-wrap">
          <table class="admin-dashboard-table">
            <thead>
              <tr>
                <th>Ferretería</th>
                <th>Compras USD</th>
                <th>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              ${(hardwareRanking.length ? hardwareRanking : [{ name: 'Sin datos', purchases: 0, operations: 0 }]).map((entry) => `
                <tr>
                  <td>${entry.name}</td>
                  <td>${formatDashboardCurrency(entry.purchases)}</td>
                  <td>${entry.operations}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <article class="admin-report-card">
      <p><b>Alertas rápidas del ecosistema</b></p>
      <p>Jurídicos con correcciones solicitadas: ${changesRequested}</p>
      <p>Jurídicos pendientes por revisar: ${pendingReview}</p>
      <p>Clientes bloqueados: ${blockedUsers}</p>
      <p>Tasa vigente: ${state.exchangeRates[0] ? `Bs.S ${formatExchangeRate(state.exchangeRates[0].rate_bs_per_usd)}` : 'Sin tasa registrada'}</p>
    </article>
  `;
};

const getRecoveryRequestStatusLabel = (status) => {
  const labels = {
    PENDING: 'Pendiente',
    RESOLVED: 'Resuelta',
    REJECTED: 'Rechazada'
  };

  return labels[status] || 'Sin solicitudes';
};

const renderAdminCustomerRecoverySummary = (request) => {
  if (!adminCustomerModalRecoverySummary) {
    return;
  }

  if (!request) {
    adminCustomerModalRecoverySummary.innerHTML = '<p>No hay solicitudes de recuperación registradas.</p>';
    return;
  }

  adminCustomerModalRecoverySummary.innerHTML = `
    <p><b>Estado:</b> ${request.status}</p>
    <p><b>Email verificado:</b> ${request.email || 'No disponible'}</p>
    <p><b>Teléfono verificado:</b> ${request.phone || 'No disponible'}</p>
    <p><b>Solicitada:</b> ${formatAdminDateTime(request.requested_at)}</p>
    <p><b>Revisada:</b> ${formatAdminDateTime(request.reviewed_at)}</p>
    <p><b>Nota:</b> ${request.review_note || 'Sin observaciones.'}</p>
  `;
};

const closeCustomerModal = () => {
  state.customerEditor.customerId = null;
  state.customerEditor.recoveryRequest = null;
  adminCustomerModal.hidden = true;
  adminCustomerModalForm.reset();
  adminCustomerModalRecoverySummary.innerHTML = '<p>Cargando solicitud...</p>';
  adminCustomerModalMessage.innerText = '';
};

const closeCompanyModal = () => {
  state.companyEditor.companyId = null;
  state.companyEditor.verificationSnapshot = null;
  adminCompanyModal.hidden = true;
  adminCompanyModalForm.reset();
  adminCompanyModalDocumentsList.innerHTML = '<p>Cargando recaudos...</p>';
  adminCompanyModalHistoryList.innerHTML = '<p>Cargando historial...</p>';
  adminCompanyModalMessage.innerText = '';
};

const openCustomerModal = async (customerId) => {
  const customer = state.customers.find((item) => Number(item.id_customer) === Number(customerId));

  if (!customer) {
    return;
  }

  state.customerEditor.customerId = customer.id_customer;
  adminCustomerModalId.value = String(customer.id_customer);
  adminCustomerModalName.value = customer.name || '';
  adminCustomerModalEmail.value = customer.email || '';
  adminCustomerModalPassword.value = '';
  adminCustomerModalRecoveryAction.value = '';
  adminCustomerModalRecoveryNote.value = '';
  adminCustomerModalRecoverySummary.innerHTML = '<p>Cargando solicitud...</p>';
  adminCustomerModalMessage.innerText = '';
  adminCustomerModal.hidden = false;

  try {
    const data = await requestJson(`${API_BASE_URL}/api/auth/admin/customers/${customer.id_customer}/recovery-request`);
    state.customerEditor.recoveryRequest = data.request || null;
    renderAdminCustomerRecoverySummary(state.customerEditor.recoveryRequest);

    if (state.customerEditor.recoveryRequest?.review_note) {
      adminCustomerModalRecoveryNote.value = state.customerEditor.recoveryRequest.review_note;
    }
  } catch (error) {
    state.customerEditor.recoveryRequest = null;
    adminCustomerModalMessage.innerText = error.message;
    renderAdminCustomerRecoverySummary(null);
  }
};

const openCompanyModal = async (companyId) => {
  const company = state.companies.find((item) => Number(item.id_company) === Number(companyId));

  if (!company) {
    return;
  }

  state.companyEditor.companyId = company.id_company;
  adminCompanyModalId.value = String(company.id_company);
  adminCompanyModalName.innerText = company.name || 'Sin nombre';
  adminCompanyModalRif.innerText = company.rif || 'Sin RIF';
  adminCompanyModalEmail.innerText = company.email || 'Sin email';
  adminCompanyModalRole.innerHTML = state.companyRoles.map((role) => `
    <option value="${role.id_role}" ${role.id_role === company.id_role_fk ? 'selected' : ''}>${role.name}</option>
  `).join('');
  adminCompanyModalPassword.value = '';
  adminCompanyModalVerificationStatus.value = company.verification_status || 'PENDING_REVIEW';
  adminCompanyModalVerificationNote.value = company.verification_note || '';
  state.companyEditor.commercialAccess = isCommercialAccessEnabled(company);
  renderCommercialAccessState(state.companyEditor.commercialAccess);
  adminCompanyModalDocumentsList.innerHTML = '<p>Cargando recaudos...</p>';
  adminCompanyModalHistoryList.innerHTML = '<p>Cargando historial...</p>';
  state.companyEditor.verificationSnapshot = {
    status: company.verification_status || 'PENDING_REVIEW',
    note: company.verification_note || '',
    commercialAccess: isCommercialAccessEnabled(company)
  };
  adminCompanyModalMessage.innerText = '';
  adminCompanyModal.hidden = false;

  try {
    const data = await requestJson(`${API_BASE_URL}/api/company-auth/admin/companies/${company.id_company}/verification`);
    const summaryCompany = data.company || company;

    adminCompanyModalVerificationStatus.value = summaryCompany.verification_status || 'PENDING_REVIEW';
    adminCompanyModalVerificationNote.value = summaryCompany.verification_note || '';
    state.companyEditor.commercialAccess = isCommercialAccessEnabled(summaryCompany);
    renderCommercialAccessState(state.companyEditor.commercialAccess);
    renderAdminCompanyVerificationDocuments(data.documents || []);
    renderAdminCompanyVerificationHistory(data.history || []);
    state.companyEditor.verificationSnapshot = {
      status: summaryCompany.verification_status || 'PENDING_REVIEW',
      note: summaryCompany.verification_note || '',
      commercialAccess: isCommercialAccessEnabled(summaryCompany)
    };
  } catch (error) {
    adminCompanyModalMessage.innerText = error.message;
    renderAdminCompanyVerificationDocuments([]);
    renderAdminCompanyVerificationHistory([]);
  }
};

const showAdminModule = (moduleName) => {
  state.activeModule = moduleName;

  Object.entries(adminModules).forEach(([key, element]) => {
    element.hidden = key !== moduleName;
  });

  adminModuleButtons.forEach((button) => {
    button.dataset.active = button.dataset.adminModuleButton === moduleName ? 'true' : 'false';
  });

  if (moduleName === 'products') {
    showProductSubmenu(state.activeProductSubmenu);
  }

  if (moduleName === 'dashboard') {
    showAdminDashboardReportTab(state.activeDashboardReportTab);
  }
};

globalThis.showAdminModule = showAdminModule;

const showProductSubmenu = (submenuName) => {
  state.activeProductSubmenu = submenuName;

  Object.entries(adminProductSubmenus).forEach(([key, element]) => {
    element.hidden = key !== submenuName;
  });
};

globalThis.showProductSubmenu = showProductSubmenu;

const renderProductCategoryOptions = () => {
  productFilterCategory.innerHTML = ['<option value="">Todas las categorías</option>']
    .concat(state.productCategories.map((category) => (
      `<option value="${category.id_category}">${category.name}</option>`
    )))
    .join('');
};

const renderProductSubcategoryOptions = () => {
  const selectedCategoryId = Number(productFilterCategory.value || 0);
  const availableSubcategories = selectedCategoryId > 0
    ? state.productSubcategories.filter((subcategory) => subcategory.id_category_fk === selectedCategoryId)
    : state.productSubcategories;

  productFilterSubcategory.innerHTML = ['<option value="">Todas las subcategorías</option>']
    .concat(availableSubcategories.map((subcategory) => (
      `<option value="${subcategory.id_subcategory}">${subcategory.category_name} / ${subcategory.name}</option>`
    )))
    .join('');
};

const renderProductLineOptions = () => {
  const selectedCategoryId = Number(productFilterCategory.value || 0);
  const selectedSubcategoryId = Number(productFilterSubcategory.value || 0);

  const availableLines = state.productLines.filter((line) => {
    const matchesCategory = !selectedCategoryId || line.id_category === selectedCategoryId;
    const matchesSubcategory = !selectedSubcategoryId || line.id_subcategory_fk === selectedSubcategoryId;

    return matchesCategory && matchesSubcategory;
  });

  productFilterLine.innerHTML = ['<option value="">Todas las líneas</option>']
    .concat(availableLines.map((line) => (
      `<option value="${line.id_line}">${line.category_name} / ${line.subcategory_name} / ${line.name}</option>`
    )))
    .join('');
};

function handleProductCategoryChange() {
  renderProductSubcategoryOptions();
  productFilterSubcategory.value = '';
  renderProductLineOptions();
  loadProducts(1);
}

function handleProductSubcategoryChange() {
  renderProductLineOptions();
  productFilterLine.value = '';
  loadProducts(1);
}

const summarizeCustomers = (customers) => {
  const total = customers.length;
  const active = customers.filter((customer) => customer.is_active).length;
  const blocked = customers.filter((customer) => !customer.is_active).length;

  adminCustomerSummary.innerHTML = `
    <div class="admin-summary-grid">
      <article class="admin-summary-card">
        <p><b>Total clientes</b></p>
        <p>${total}</p>
      </article>
      <article class="admin-summary-card">
        <p><b>Activos</b></p>
        <p>${active}</p>
      </article>
      <article class="admin-summary-card">
        <p><b>Bloqueados</b></p>
        <p>${blocked}</p>
      </article>
    </div>
  `;
};

const renderCustomers = (customers) => {
  if (!customers.length) {
    adminCustomerList.innerHTML = '<p>No hay customers registrados.</p>';
    adminCustomerPagination.innerHTML = '';
    return;
  }

  const { items: visibleCustomers, pagination } = paginateItems(customers, state.customerPagination);

  adminCustomerList.innerHTML = visibleCustomers.map((customer) => `
    <article class="admin-entity-card" data-customer-id="${customer.id_customer}">
      ${buildProfileMedia(customer.name, getCustomerProfileImageUrl(customer), `Perfil de ${customer.name || 'cliente'}`)}
      <div class="admin-entity-content">
        <p><b>${customer.name || 'Sin nombre'}</b></p>
        <p>Email actual: ${customer.email}</p>
        <p>Estado: ${customer.is_active ? 'Activo' : 'Bloqueado'}</p>
        <p>Recuperación de cuenta: ${getRecoveryRequestStatusLabel(customer.recovery_request_status)}</p>
        <p>Intentos fallidos: ${customer.attempts}</p>
        <p>Registrado: ${formatAdminDateTime(customer.created_at)}</p>
        <div class="admin-card-actions">
          <button type="button" onclick="openCustomerModal(${customer.id_customer})">Editar</button>
          <button type="button" onclick="resetCustomerAttempts(${customer.id_customer})">Reiniciar intentos</button>
          <button type="button" onclick="toggleCustomerStatus(${customer.id_customer}, ${customer.is_active ? 'false' : 'true'})">
            ${customer.is_active ? 'Bloquear' : 'Desbloquear'}
          </button>
        </div>
      </div>
    </article>
  `).join('');

  renderSimplePagination(adminCustomerPagination, pagination, 'goToCustomerPage');
};

const filterCustomers = (resetPage = false) => {
  if (resetPage) {
    state.customerPagination.page = 1;
  }

  const nameFilter = normalizeFilterValue(customerFilterNameInput.value);
  const emailFilter = normalizeFilterValue(customerFilterEmailInput.value);
  const statusFilter = customerFilterStatusInput.value;

  const filteredCustomers = state.customers.filter((customer) => {
    const matchesName = matchesFilter(customer.name, nameFilter);
    const matchesEmail = matchesFilter(customer.email, emailFilter);
    const matchesStatus = !statusFilter
      || (statusFilter === 'blocked' && !customer.is_active)
      || (statusFilter === 'active' && customer.is_active);

    return matchesName && matchesEmail && matchesStatus;
  });

  summarizeCustomers(filteredCustomers);
  renderCustomers(filteredCustomers);
};

function applyCustomerFilters() {
  filterCustomers(true);
}

function resetCustomerFilters() {
  customerFilterNameInput.value = '';
  customerFilterEmailInput.value = '';
  customerFilterStatusInput.value = '';
  filterCustomers(true);
}

function goToCustomerPage(page) {
  if (page < 1 || page > state.customerPagination.total_pages) {
    return;
  }

  state.customerPagination.page = page;
  filterCustomers();
}

const summarizeCompanies = (companies) => {
  const total = companies.length;
  const active = companies.filter((company) => company.is_active).length;
  const pendingReview = companies.filter((company) => company.verification_status === 'PENDING_REVIEW').length;
  const changesRequested = companies.filter((company) => company.verification_status === 'CHANGES_REQUESTED').length;
  const approved = companies.filter((company) => company.verification_status === 'APPROVED').length;
  const rejected = companies.filter((company) => company.verification_status === 'REJECTED').length;

  adminCompanySummary.innerHTML = `
    <div class="admin-summary-grid">
      <article class="admin-summary-card">
        <p><b>Total jurídicos</b></p>
        <p>${total}</p>
      </article>
      <article class="admin-summary-card">
        <p><b>Activos</b></p>
        <p>${active}</p>
      </article>
      <article class="admin-summary-card">
        <p><b>Pendientes</b></p>
        <p>${pendingReview}</p>
      </article>
      <article class="admin-summary-card">
        <p><b>Correcciones</b></p>
        <p>${changesRequested}</p>
      </article>
      <article class="admin-summary-card">
        <p><b>Aprobados</b></p>
        <p>${approved}</p>
      </article>
      <article class="admin-summary-card">
        <p><b>Rechazados</b></p>
        <p>${rejected}</p>
      </article>
    </div>
  `;
};

const renderCompanies = (companies) => {
  if (!companies.length) {
    adminCompanyList.innerHTML = '<p>No hay empresas registradas.</p>';
    adminCompanyPagination.innerHTML = '';
    return;
  }

  const { items: visibleCompanies, pagination } = paginateItems(companies, state.companyPagination);

  adminCompanyList.innerHTML = visibleCompanies.map((company) => `
    <article class="admin-entity-card" data-company-id="${company.id_company}">
      ${buildProfileMedia(company.name, getCompanyProfileImageUrl(company), `Perfil de ${company.name || 'empresa'}`)}
      <div class="admin-entity-content">
        <p><b>${company.name || 'Sin nombre'}</b></p>
        <p>RIF actual: ${company.rif}</p>
        <p>Email actual: ${company.email}</p>
        <p>Estado: ${company.is_active ? 'Activa' : 'Inactiva'}</p>
        <p>Estado jurídico: ${getCompanyVerificationLabel(company.verification_status)}</p>
        <p>Permisos: comprar ${company.can_buy ? 'si' : 'no'} | vender ${company.can_sell ? 'si' : 'no'}</p>
        <p>Nota jurídica: ${normalizeCompanyTechnicalText(company.verification_note)}</p>
        <p>Registrada: ${formatAdminDateTime(company.created_at)}</p>
        <div class="admin-card-actions">
          <button type="button" onclick="openCompanyModal(${company.id_company})">Editar y revisar</button>
          <button type="button" onclick="resetCompanyAttempts(${company.id_company})">Reiniciar intentos</button>
          <button type="button" onclick="toggleCompanyStatus(${company.id_company}, ${company.is_active ? 'false' : 'true'})">
            ${company.is_active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    </article>
  `).join('');

  renderSimplePagination(adminCompanyPagination, pagination, 'goToCompanyPage');
};

const filterCompanies = (resetPage = false) => {
  if (resetPage) {
    state.companyPagination.page = 1;
  }

  const visibleCompanies = getVisibleCompanies();
  const nameFilter = normalizeFilterValue(companyFilterNameInput.value);
  const documentFilter = normalizeFilterValue(companyFilterDocumentInput.value);
  const emailFilter = normalizeFilterValue(companyFilterEmailInput.value);
  const verificationStatusFilter = companyFilterVerificationStatusInput.value;

  const filteredCompanies = visibleCompanies.filter((company) => {
    const matchesName = matchesFilter(company.name, nameFilter);
    const matchesDocument = matchesFilter(company.rif, documentFilter);
    const matchesEmail = matchesFilter(company.email, emailFilter);
    const matchesVerificationStatus = !verificationStatusFilter || company.verification_status === verificationStatusFilter;

    return matchesName && matchesDocument && matchesEmail && matchesVerificationStatus;
  });

  summarizeCompanies(filteredCompanies);
  renderCompanies(filteredCompanies);
};

function applyCompanyFilters() {
  filterCompanies(true);
}

function resetCompanyFilters() {
  companyFilterNameInput.value = '';
  companyFilterDocumentInput.value = '';
  companyFilterEmailInput.value = '';
  companyFilterVerificationStatusInput.value = '';
  filterCompanies(true);
}

function goToCompanyPage(page) {
  if (page < 1 || page > state.companyPagination.total_pages) {
    return;
  }

  state.companyPagination.page = page;
  filterCompanies();
}

const summarizeProducts = (pagination) => {
  adminProductSummary.innerHTML = `
    <p>Total productos: <b>${pagination.total}</b></p>
    <p>Página actual: <b>${pagination.page}</b> de <b>${pagination.total_pages}</b></p>
    <p>Mostrando hasta <b>${pagination.limit}</b> productos por página.</p>
  `;
};

const formatExchangeRate = (value) => Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4
});

const formatExchangeDate = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const formatDateOnly = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getCompanyVerificationLabel = (status) => COMPANY_VERIFICATION_LABELS[status] || status || 'Sin estado';

const getCompanyDocumentLabel = (documentType) => COMPANY_DOCUMENT_LABELS[documentType] || documentType || 'Documento';

const normalizeCompanyTechnicalText = (value) => {
  const rawText = String(value || '').trim();

  if (!rawText) {
    return 'Sin observaciones.';
  }

  let normalizedText = rawText;

  Object.entries(COMPANY_DOCUMENT_LABELS).forEach(([code, label]) => {
    normalizedText = normalizedText.replaceAll(code, label);
  });

  return normalizedText;
};

const renderAdminCompanyVerificationDocuments = (documents = []) => {
  if (!adminCompanyModalDocumentsList) {
    return;
  }

  if (!documents.length) {
    adminCompanyModalDocumentsList.innerHTML = '<p>No hay recaudos cargados.</p>';
    return;
  }

  adminCompanyModalDocumentsList.innerHTML = documents.map((document) => `
    <article class="admin-inline-card">
      <p><b>${getCompanyDocumentLabel(document.document_type)}</b></p>
      <p>Ronda: ${document.submission_round}</p>
      <p>Archivo: <a href="${document.file_url}" target="_blank" rel="noopener noreferrer">${document.original_name || 'Ver archivo'}</a></p>
      <p>Formato: ${document.mime_type || 'No disponible'}</p>
      <p>Subido: ${formatExchangeDate(document.uploaded_at)}</p>
      <p>Nota admin: ${normalizeCompanyTechnicalText(document.admin_note || 'Sin observaciones en archivo.')}</p>
    </article>
  `).join('');
};

const renderAdminCompanyVerificationHistory = (history = []) => {
  if (!adminCompanyModalHistoryList) {
    return;
  }

  if (!history.length) {
    adminCompanyModalHistoryList.innerHTML = '<p>No hay historial jurídico.</p>';
    return;
  }

  adminCompanyModalHistoryList.innerHTML = history.map((entry) => `
    <article class="admin-inline-card">
      <p><b>${getCompanyVerificationLabel(entry.status)}</b></p>
      <p>Fecha: ${formatExchangeDate(entry.created_at)}</p>
      <p>Nota: ${normalizeCompanyTechnicalText(entry.note)}</p>
    </article>
  `).join('');
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

const buildCurrencyPairLabel = (usdValue, bsValue) => `USD ${formatAmount(usdValue)} | Bs ${formatAmount(bsValue)}`;

const getPurchaseStatusLabel = (status) => {
  const labels = {
    OPEN: 'Abierta',
    PENDING_PAYMENT: 'Pendiente de pago',
    PAYMENT_SUBMITTED: 'Pago enviado',
    PARTIAL_SUBMITTED: 'Pago parcial enviado',
    PARTIAL_APPROVED: 'Pago parcial aprobado',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    EXPIRED: 'Expirado',
    COMPLETED: 'Completada',
    COMPLETED_WITH_INCIDENTS: 'Completada con incidencias',
    SUBMITTED: 'Enviada'
  };

  return labels[status] || status || 'Sin estado';
};

const getFilteredAdminCheckouts = () => {
  const searchValue = normalizeFilterValue(state.purchasesFilters.search);
  const statusValue = String(state.purchasesFilters.status || '').trim();
  const dateFrom = String(state.purchasesFilters.dateFrom || '').trim();
  const dateTo = String(state.purchasesFilters.dateTo || '').trim();

  return state.adminCheckouts.filter((checkout) => {
    const checkoutDate = formatDateOnly(checkout.created_at);

    if (statusValue && checkout.status !== statusValue) {
      return false;
    }

    if (dateFrom && checkoutDate && checkoutDate < dateFrom) {
      return false;
    }

    if (dateTo && checkoutDate && checkoutDate > dateTo) {
      return false;
    }

    if (!searchValue) {
      return true;
    }

    const groups = Array.isArray(checkout.groups) ? checkout.groups : [];
    const groupsMatch = groups.some((group) => {
      const items = Array.isArray(group.items) ? group.items : [];

      return [
        group.id_purchase_group,
        group.company?.name,
        group.status,
        getPurchaseStatusLabel(group.status)
      ].some((value) => normalizeFilterValue(value).includes(searchValue))
        || items.some((item) => normalizeFilterValue(item.product?.name).includes(searchValue));
    });

    return [
      checkout.id_checkout,
      checkout.order_code,
      checkout.status,
      getPurchaseStatusLabel(checkout.status),
      checkout.customer?.name,
      checkout.customer?.email
    ].some((value) => normalizeFilterValue(value).includes(searchValue)) || groupsMatch;
  });
};

const getFilteredAdminSales = () => {
  const searchValue = normalizeFilterValue(state.purchasesFilters.search);
  const statusValue = String(state.purchasesFilters.status || '').trim();
  const dateFrom = String(state.purchasesFilters.dateFrom || '').trim();
  const dateTo = String(state.purchasesFilters.dateTo || '').trim();

  return state.adminSales.filter((group) => {
    const groupDate = formatDateOnly(group.created_at);

    if (statusValue && group.status !== statusValue) {
      return false;
    }

    if (dateFrom && groupDate && groupDate < dateFrom) {
      return false;
    }

    if (dateTo && groupDate && groupDate > dateTo) {
      return false;
    }

    if (!searchValue) {
      return true;
    }

    const items = Array.isArray(group.items) ? group.items : [];

    return [
      group.id_purchase_group,
      group.id_checkout,
      group.checkout?.order_code,
      group.company?.name,
      group.customer?.name,
      group.customer?.email,
      group.status,
      getPurchaseStatusLabel(group.status)
    ].some((value) => normalizeFilterValue(value).includes(searchValue))
      || items.some((item) => normalizeFilterValue(item.product?.name).includes(searchValue));
  });
};

const renderAdminPurchasesModule = () => {
  renderAdminPurchaseSummary();
  renderAdminCheckouts();
};

const renderAdminPurchaseSummary = () => {
  const filteredCheckouts = getFilteredAdminCheckouts();

  adminPurchasesSummary.innerHTML = `
    <p>Compras visibles: <b>${filteredCheckouts.length}</b> de <b>${state.adminCheckouts.length}</b></p>
  `;
};

const renderAdminCheckouts = () => {
  const checkouts = getFilteredAdminCheckouts();

  if (!checkouts.length) {
    adminPurchasesCheckoutsList.innerHTML = '<p>No hay compras registradas.</p>';
    return;
  }

  adminPurchasesCheckoutsList.innerHTML = checkouts.map((checkout) => {
    const groups = Array.isArray(checkout.groups) ? checkout.groups : [];

    return `
      <details class="admin-checkout-card">
        <summary><b>Orden ${checkout.order_code || `#${checkout.id_checkout}`}</b> | ${getPurchaseStatusLabel(checkout.status)} | ${buildCurrencyPairLabel(checkout.total_payable_usd, checkout.total_payable_bs)}</summary>
        <div class="admin-checkout-card__body">
          <p>Cliente: ${checkout.customer?.name || 'Sin nombre'} (${checkout.customer?.email || 'Sin correo'})</p>
          <p>Total original: ${buildCurrencyPairLabel(checkout.total_usd, checkout.total_bs)}</p>
          <p>Cashback usado: ${buildCurrencyPairLabel(checkout.cashback_redeemed_usd, checkout.cashback_redeemed_bs)}</p>
          <p>Total a pagar: ${buildCurrencyPairLabel(checkout.total_payable_usd, checkout.total_payable_bs)}</p>
          <p>Tasa usada: ${formatExchangeRate(checkout.exchange_rate_snapshot)}</p>
          <p>Creado: ${formatExchangeDate(checkout.created_at)}</p>
          <details>
            <summary>Grupos (${groups.length})</summary>
            ${groups.map((group) => `
              <div class="admin-inline-row">
                <p><b>Grupo #${group.id_purchase_group}</b> | ${group.company?.name || 'Empresa'} | ${getPurchaseStatusLabel(group.status)}</p>
                <p>Subtotal: ${buildCurrencyPairLabel(group.subtotal_usd, group.subtotal_bs)}</p>
                <p>Total a pagar: ${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}</p>
              </div>
            `).join('')}
          </details>
        </div>
      </details>
    `;
  }).join('');
};

const renderExchangeSummary = (exchangeRates) => {
  const latestRate = exchangeRates[0] || null;

  if (!latestRate) {
    adminExchangeSummary.innerHTML = '<p>No hay tasas registradas todavía.</p>';
    return;
  }

  adminExchangeSummary.innerHTML = `
    <p>Tasa vigente: <b>Bs.S ${formatExchangeRate(latestRate.rate_bs_per_usd)}</b></p>
    <p>Último registro: <b>${formatExchangeDate(latestRate.created_at)}</b></p>
  `;
};

const renderExchangeList = (exchangeRates) => {
  if (!exchangeRates.length) {
    adminExchangeList.innerHTML = '<p>No hay historial de tasas.</p>';
    return;
  }

  adminExchangeList.innerHTML = `
    <h3>Historial de tasas</h3>
    <ul>
      ${exchangeRates.map((exchangeRate) => `
        <li>
          Bs.S ${formatExchangeRate(exchangeRate.rate_bs_per_usd)} |
          ${formatExchangeDate(exchangeRate.created_at)}
        </li>
      `).join('')}
    </ul>
  `;
};

const loadExchangeRates = async () => {
  try {
    const data = await requestJson(`${API_BASE_URL}/api/exchange-rate`);
    state.exchangeRates = data.exchange_rates || [];
    renderExchangeSummary(state.exchangeRates);
    renderExchangeList(state.exchangeRates);
    renderAdminOverview();
  } catch (error) {
    adminExchangeSummary.innerHTML = `<p>${error.message}</p>`;
    adminExchangeList.innerHTML = `<p>${error.message}</p>`;
  }
};

const loadAdminPurchaseViews = async () => {
  try {
    const [checkoutsData, salesData] = await Promise.all([
      requestJson(`${API_BASE_URL}/api/purchases/admin/checkouts`),
      requestJson(`${API_BASE_URL}/api/purchases/company/groups`)
    ]);

    state.adminCheckouts = Array.isArray(checkoutsData.checkouts) ? checkoutsData.checkouts : [];
    state.adminSales = Array.isArray(salesData.purchase_groups) ? salesData.purchase_groups : [];

    renderAdminPurchasesModule();
    renderAdminOverview();
  } catch (error) {
    adminPurchasesSummary.innerHTML = `<p>${error.message}</p>`;
    adminPurchasesCheckoutsList.innerHTML = `<p>${error.message}</p>`;
  }
};

const filterAdminPurchases = () => {
  state.purchasesFilters.search = adminPurchasesSearchInput?.value || '';
  state.purchasesFilters.status = adminPurchasesStatusFilter?.value || '';
  state.purchasesFilters.dateFrom = adminPurchasesDateFromFilter?.value || '';
  state.purchasesFilters.dateTo = adminPurchasesDateToFilter?.value || '';

  renderAdminPurchasesModule();
};

const resetAdminPurchasesFilters = () => {
  if (adminPurchasesSearchInput) {
    adminPurchasesSearchInput.value = '';
  }

  if (adminPurchasesStatusFilter) {
    adminPurchasesStatusFilter.value = '';
  }

  if (adminPurchasesDateFromFilter) {
    adminPurchasesDateFromFilter.value = '';
  }

  if (adminPurchasesDateToFilter) {
    adminPurchasesDateToFilter.value = '';
  }

  state.purchasesFilters = {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  renderAdminPurchasesModule();
};

const renderProducts = (products) => {
  if (!products.length) {
    adminProductList.innerHTML = '<p>No hay productos para los filtros actuales.</p>';
    return;
  }

  adminProductList.innerHTML = `
    <div class="admin-catalog-grid">
      ${products.map((product) => `
        <article class="admin-catalog-card">
          <div class="admin-catalog-card__media">
            ${product.main_image_url
      ? `<img src="${product.main_image_url}" alt="${product.name || 'Producto'}">`
      : '<div class="admin-catalog-card__media-placeholder">Sin imagen</div>'}
          </div>
          <div class="admin-catalog-card__body">
            <h3>${product.name || 'Sin nombre'}</h3>
            <p class="admin-catalog-card__stock">Stock: ${product.quantity ?? 0}</p>
            <p class="admin-catalog-card__seller">Mayorista: ${product.company_name || 'Sin proveedor'}</p>
            <p class="admin-catalog-card__price">USD ${formatAmount(product.price)}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;
};

const renderAdminCurrentImages = (product) => {
  const images = Array.isArray(product.images) ? product.images : [];

  if (!images.length) {
    adminEditProductImages.innerHTML = '<p>Sin imágenes guardadas.</p>';
    return;
  }

  adminEditProductImages.innerHTML = `
    <p><b>Imágenes guardadas</b></p>
    <div class="admin-product-image-grid">
      ${images.map((image, index) => `
        <div class="admin-product-image-item">
          <img src="${image.image_url}" alt="${product.name} imagen ${index + 1}">
          <span>${image.is_main ? 'Principal' : 'Secundaria'}</span>
          <button type="button" onclick="deleteAdminProductImage(${product.id_product}, ${product.id_company}, ${image.id_image})">Eliminar</button>
        </div>
      `).join('')}
    </div>
  `;
};

const renderAdminStockHistory = (entries = [], pagination = null) => {
  if (!entries.length) {
    adminProductStockHistory.innerHTML = '<p>Sin movimientos de stock.</p>';
    adminProductStockHistoryPagination.innerHTML = '';
    return;
  }

  adminProductStockHistory.innerHTML = `
    <ul>
      ${entries.map((entry) => `
        <li>
          ${entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Sin fecha'} |
          ${entry.movement_type} |
          ${entry.previous_quantity} -> ${entry.new_quantity}
          ${entry.notes ? `| ${entry.notes}` : ''}
        </li>
      `).join('')}
    </ul>
  `;

  if (!pagination || pagination.total_pages <= 1) {
    adminProductStockHistoryPagination.innerHTML = '';
    return;
  }

  adminProductStockHistoryPagination.innerHTML = `
    <button type="button" onclick="goToAdminProductHistoryPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>&lt;-</button>
    <span>${pagination.page} de ${pagination.total_pages}</span>
    <button type="button" onclick="goToAdminProductHistoryPage(${pagination.page + 1})" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>-&gt;</button>
  `;
};

const renderAdminMainPreview = () => {
  const file = adminEditProductMainImage.files[0];

  if (state.productEditor.mainPreviewUrl) {
    URL.revokeObjectURL(state.productEditor.mainPreviewUrl);
    state.productEditor.mainPreviewUrl = null;
  }

  if (!file) {
    adminEditProductMainImagePreview.innerHTML = '<p>No has seleccionado nueva imagen principal.</p>';
    return;
  }

  state.productEditor.mainPreviewUrl = URL.createObjectURL(file);
  adminEditProductMainImagePreview.innerHTML = `<div class="admin-preview-main"><img src="${state.productEditor.mainPreviewUrl}" alt="preview"></div>`;
};

const renderAdminSecondaryPreview = () => {
  state.productEditor.secondaryPreviewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  state.productEditor.secondaryPreviewUrls = [];

  const files = Array.from(adminEditProductSecondaryImages.files || []);

  if (!files.length) {
    adminEditProductSecondaryImagesPreview.innerHTML = '<p>No has seleccionado nuevas imágenes secundarias.</p>';
    return;
  }

  state.productEditor.secondaryPreviewUrls = files.map((file) => URL.createObjectURL(file));
  const previewImagesHtml = files.map((file, index) => (
    `<img src="${state.productEditor.secondaryPreviewUrls[index]}" alt="${file.name}">`
  )).join('');

  adminEditProductSecondaryImagesPreview.innerHTML = `<div class="admin-preview-secondary">${previewImagesHtml}</div>`;
};

const hideAdminProductEditor = () => {
  state.productEditor.product = null;
  state.productEditor.stockHistoryPagination = {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  };
  adminProductEditor.hidden = true;
  adminProductEditorForm.reset();
  adminProductEditorMessage.innerText = '';
  adminEditProductImages.innerHTML = '';
  adminProductStockHistory.innerHTML = '';
  adminProductStockHistoryPagination.innerHTML = '';
  populateAdminAttributeInputs({});
  revokeAdminPreviewUrls();
  renderAdminMainPreview();
  renderAdminSecondaryPreview();
};

const showAdminProductEditor = (product) => {
  state.productEditor.product = product;
  adminProductEditor.hidden = false;
  adminEditProductId.value = String(product.id_product);
  adminEditProductCompanyId.value = String(product.id_company);
  adminEditProductName.value = product.name || '';
  adminEditProductBrand.value = product.brand || '';
  adminEditProductDescription.value = product.description || '';
  adminEditProductPrice.value = product.price ?? '';
  adminEditProductMinStock.value = product.min_stock ?? 0;
  populateAdminAttributeInputs(product.attributes);
  renderAdminCurrentImages(product);
  renderAdminStockHistory(product.stock_history || []);
  adminProductEditorMessage.innerText = '';
  adminEditProductMainImage.value = '';
  adminEditProductSecondaryImages.value = '';
  revokeAdminPreviewUrls();
  renderAdminMainPreview();
  renderAdminSecondaryPreview();
};

const loadAdminProductDetail = async (productId) => {
  const data = await requestJson(`${API_BASE_URL}/api/products/management/products/${productId}`);
  showAdminProductEditor(data.product);
};

const loadAdminProductHistory = async (page = 1) => {
  if (!state.productEditor.product) {
    return;
  }

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(state.productEditor.stockHistoryPagination.limit));

  const data = await requestJson(`${API_BASE_URL}/api/products/management/products/${state.productEditor.product.id_product}/stock-history?${params.toString()}`);
  state.productEditor.stockHistoryPagination = data.pagination || state.productEditor.stockHistoryPagination;
  renderAdminStockHistory(data.entries || [], state.productEditor.stockHistoryPagination);
};

const renderProductPagination = (pagination) => {
  if (!pagination.total) {
    adminProductPagination.innerHTML = '<p></p>';
    return;
  }

  const pageButtons = Array.from({ length: pagination.total_pages }, (_value, index) => {
    const pageNumber = index + 1;

    if (pageNumber === pagination.page) {
      return `<b>${pageNumber}</b>`;
    }

    return `<button type="button" onclick="goToProductPage(${pageNumber})">${pageNumber}</button>`;
  }).join(' ');

  adminProductPagination.innerHTML = `
    <div>
      <button type="button" onclick="goToProductPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>&lt;-</button>
      ${pageButtons}
      <button type="button" onclick="goToProductPage(${pagination.page + 1})" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>-&gt;</button>
    </div>
  `;
};

const buildProductQuery = (page = 1) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(state.productPagination.limit));

  const name = productFilterNameInput.value.trim();
  const company = productFilterCompanyInput.value.trim();
  const categoryId = productFilterCategory.value.trim();
  const subcategoryId = productFilterSubcategory.value.trim();
  const lineId = productFilterLine.value.trim();

  if (name) {
    params.set('name', name);
  }

  if (company) {
    params.set('company', company);
  }

  if (categoryId) {
    params.set('category_id', categoryId);
  }

  if (subcategoryId) {
    params.set('subcategory_id', subcategoryId);
  }

  if (lineId) {
    params.set('line_id', lineId);
  }

  return params.toString();
};

const loadProductFilters = () => {
  return Promise.all([
    fetch(`${API_BASE_URL}/api/products/categories`, {
      headers: getAuthHeaders()
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar las categorías');
        }

        state.productCategories = data.categories || [];
      }),
    fetch(`${API_BASE_URL}/api/products/management/subcategories`, {
      headers: getAuthHeaders()
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar las subcategorías');
        }

        state.productSubcategories = data.subcategories || [];
      }),
    fetch(`${API_BASE_URL}/api/products/management/lines`, {
      headers: getAuthHeaders()
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar las líneas');
        }

        state.productLines = data.lines || [];
      })
  ]).then(() => {
    renderProductCategoryOptions();
    renderProductSubcategoryOptions();
    renderProductLineOptions();
  });
};

const loadProducts = (page = 1) => {
  fetch(`${API_BASE_URL}/api/products/management/products?${buildProductQuery(page)}`, {
    headers: getAuthHeaders()
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron cargar los productos');
      }

      return data;
    })
    .then((data) => {
      state.products = data.products || [];
      state.productPagination = data.pagination || state.productPagination;
      summarizeProducts(state.productPagination);
      renderProducts(state.products);
      renderProductPagination(state.productPagination);
      renderAdminOverview();
    })
    .catch((error) => {
      adminProductSummary.innerHTML = `<p>${error.message}</p>`;
      adminProductList.innerHTML = `<p>${error.message}</p>`;
      adminProductPagination.innerHTML = '<p></p>';
    });
};

function applyProductFilters() {
  loadProducts(1);
}

function resetProductFilters() {
  productFilterNameInput.value = '';
  productFilterCompanyInput.value = '';
  productFilterCategory.value = '';
  renderProductSubcategoryOptions();
  productFilterSubcategory.value = '';
  renderProductLineOptions();
  productFilterLine.value = '';
  loadProducts(1);
}

function goToProductPage(page) {
  if (page < 1 || page > state.productPagination.total_pages) {
    return;
  }

  loadProducts(page);
}

function goToAdminProductHistoryPage(page) {
  if (page < 1 || page > state.productEditor.stockHistoryPagination.total_pages) {
    return;
  }

  loadAdminProductHistory(page).catch((error) => {
    adminProductEditorMessage.innerText = error.message;
  });
}

async function editAdminProduct(productId) {
  try {
    await loadAdminProductDetail(productId);
    await loadAdminProductHistory(1);
    adminProductEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    alert(error.message);
  }
}

async function toggleAdminProductStatus(productId, companyId, isActive) {
  try {
    const data = await requestJson(`${API_BASE_URL}/api/products/${productId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_company: companyId,
        is_active: !isActive
      })
    });

    alert(data.message);
    loadProducts(state.productPagination.page);
    if (state.productEditor.product?.id_product === productId) {
      await loadAdminProductDetail(productId);
      await loadAdminProductHistory(state.productEditor.stockHistoryPagination.page);
    }
  } catch (error) {
    alert(error.message);
  }
}

async function adjustAdminProductStock(productId, companyId, operation) {
  try {
    const quantityValue = prompt(operation === 'set' ? 'Indica el stock final:' : 'Indica la cantidad:', '1');

    if (quantityValue == null) {
      return;
    }

    const quantity = Number(quantityValue);

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('La cantidad debe ser un entero mayor o igual a 0');
    }

    const notes = prompt('Nota del movimiento (opcional):', '') || '';
    const data = await requestJson(`${API_BASE_URL}/api/products/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_company: companyId,
        operation,
        quantity,
        notes
      })
    });

    alert(data.message);
    loadProducts(state.productPagination.page);
    if (state.productEditor.product?.id_product === productId) {
      await loadAdminProductDetail(productId);
      await loadAdminProductHistory(1);
    }
  } catch (error) {
    alert(error.message);
  }
}

async function deleteAdminProductImage(productId, companyId, imageId) {
  try {
    if (!confirm('¿Deseas eliminar esta imagen?')) {
      return;
    }

    const data = await requestJson(`${API_BASE_URL}/api/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_company: companyId
      })
    });

    adminProductEditorMessage.innerText = data.message;
    loadProducts(state.productPagination.page);
    await loadAdminProductDetail(productId);
  } catch (error) {
    adminProductEditorMessage.innerText = error.message;
  }
}

const loadCustomers = () => {
  return fetch(`${API_BASE_URL}/api/auth/admin/customers`, {
    headers: getAuthHeaders()
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron cargar los customers');
      }

      return data;
    })
    .then((data) => {
      state.customers = data.customers || [];
      filterCustomers();
      renderAdminOverview();
    })
    .catch((error) => {
      adminCustomerSummary.innerHTML = `<p>${error.message}</p>`;
      adminCustomerList.innerHTML = `<p>${error.message}</p>`;
    });
};

const loadCompanies = () => {
  return fetch(`${API_BASE_URL}/api/company-auth/admin/companies`, {
    headers: getAuthHeaders()
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron cargar las empresas');
      }

      return data;
    })
    .then((data) => {
      state.companies = data.companies || [];
      filterCompanies();
      renderAdminOverview();
    })
    .catch((error) => {
      adminCompanySummary.innerHTML = `<p>${error.message}</p>`;
      adminCompanyList.innerHTML = `<p>${error.message}</p>`;
    });
};

const loadCompanyRoles = () => {
  return fetch(`${API_BASE_URL}/api/company-auth/admin/company-roles`, {
    headers: getAuthHeaders()
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron cargar los roles de empresa');
      }

      state.companyRoles = data.roles || [];
    });
};

async function toggleCustomerStatus(customerId, isActive) {
  try {
    const shouldProceed = await openAdminConfirmModal({
      title: isActive ? 'Bloquear cliente' : 'Desbloquear cliente',
      message: isActive
        ? 'El cliente será bloqueado y no podrá iniciar sesión. ¿Deseas continuar?'
        : 'El cliente será desbloqueado para permitir su acceso. ¿Deseas continuar?',
      confirmLabel: isActive ? 'Bloquear' : 'Desbloquear'
    });

    if (!shouldProceed) {
      return;
    }

    const data = await requestJson(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active: isActive })
    });

    alert(data.message);
    await loadCustomers();
  } catch (error) {
    alert(error.message);
  }
}

async function resetCustomerAttempts(customerId) {
  try {
    const shouldProceed = await openAdminConfirmModal({
      title: 'Reiniciar intentos',
      message: 'Se reiniciará el contador de intentos fallidos del cliente. ¿Deseas continuar?',
      confirmLabel: 'Reiniciar'
    });

    if (!shouldProceed) {
      return;
    }

    const data = await requestJson(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/attempts/reset`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    alert(data.message);
    await loadCustomers();
  } catch (error) {
    alert(error.message);
  }
}

async function toggleCompanyStatus(companyId, isActive) {
  try {
    const shouldProceed = await openAdminConfirmModal({
      title: isActive ? 'Desactivar jurídico' : 'Activar jurídico',
      message: isActive
        ? 'La empresa jurídica quedará desactivada. ¿Deseas continuar?'
        : 'La empresa jurídica quedará activa nuevamente. ¿Deseas continuar?',
      confirmLabel: isActive ? 'Desactivar' : 'Activar'
    });

    if (!shouldProceed) {
      return;
    }

    const data = await requestJson(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active: isActive })
    });

    alert(data.message);
    await loadCompanies();
  } catch (error) {
    alert(error.message);
  }
}

async function resetCompanyAttempts(companyId) {
  try {
    const shouldProceed = await openAdminConfirmModal({
      title: 'Reiniciar intentos',
      message: 'Se reiniciará el contador de intentos fallidos del jurídico. ¿Deseas continuar?',
      confirmLabel: 'Reiniciar'
    });

    if (!shouldProceed) {
      return;
    }

    const data = await requestJson(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/attempts/reset`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    alert(data.message);
    await loadCompanies();
  } catch (error) {
    alert(error.message);
  }
}

async function handleCustomerModalSubmit(event) {
  event.preventDefault();

  try {
    const customerId = Number(adminCustomerModalId.value || 0);
    const name = adminCustomerModalName.value.trim();
    const email = adminCustomerModalEmail.value.trim();
    const password = adminCustomerModalPassword.value.trim();
    const recoveryAction = adminCustomerModalRecoveryAction.value;
    const recoveryNote = adminCustomerModalRecoveryNote.value.trim();

    if (!customerId) {
      throw new Error('Cliente inválido');
    }

    const shouldProceed = await openAdminConfirmModal({
      title: 'Guardar cambios del cliente',
      message: 'Se aplicarán los cambios del cliente y, si corresponde, la acción de recuperación. ¿Deseas continuar?',
      confirmLabel: 'Guardar cambios'
    });

    if (!shouldProceed) {
      adminCustomerModalMessage.innerText = 'Actualización cancelada.';
      return;
    }

    adminCustomerModalMessage.innerText = 'Guardando cambios...';

    await requestJson(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/basic`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email })
    });

    if (password) {
      await requestJson(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
    }

    const hasPendingRecoveryRequest = state.customerEditor.recoveryRequest?.status === 'PENDING';

    if (recoveryAction) {
      if (!hasPendingRecoveryRequest) {
        throw new Error('No hay una solicitud pendiente para revisar');
      }

      if (recoveryAction === 'RESOLVED' && !password) {
        throw new Error('Para resolver la solicitud debes indicar una nueva contraseña');
      }

      await requestJson(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/recovery-request`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: recoveryAction,
          review_note: recoveryNote || null
        })
      });
    }

    adminCustomerModalMessage.innerText = 'Cliente actualizado correctamente.';
    await loadCustomers();
    closeCustomerModal();
  } catch (error) {
    adminCustomerModalMessage.innerText = error.message;
  }
}

async function handleCompanyModalSubmit(event) {
  event.preventDefault();

  try {
    const companyId = Number(adminCompanyModalId.value || 0);
    const roleId = Number(adminCompanyModalRole.value || 0);
    const password = adminCompanyModalPassword.value.trim();
    const verificationStatus = adminCompanyModalVerificationStatus.value;
    const verificationNote = adminCompanyModalVerificationNote.value.trim();
    const commercialAccess = Boolean(state.companyEditor.commercialAccess);

    if (!companyId || !roleId) {
      throw new Error('Empresa o rol inválido');
    }

    const shouldProceed = await openAdminConfirmModal({
      title: 'Guardar cambios del jurídico',
      message: 'Se aplicarán cambios de rol, acceso, contraseña y revisión jurídica (si hubo modificaciones). ¿Deseas continuar?',
      confirmLabel: 'Guardar cambios'
    });

    if (!shouldProceed) {
      adminCompanyModalMessage.innerText = 'Actualización cancelada.';
      return;
    }

    adminCompanyModalMessage.innerText = 'Guardando cambios...';

    await requestJson(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role_id: roleId })
    });

    if (password) {
      await requestJson(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
    }

    const previousVerification = state.companyEditor.verificationSnapshot || {};
    const shouldUpdateVerification = previousVerification.status !== verificationStatus
      || (previousVerification.note || '') !== verificationNote
      || Boolean(previousVerification.commercialAccess) !== commercialAccess;

    if (shouldUpdateVerification) {
      await requestJson(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/verification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: verificationStatus,
          note: verificationNote || null,
          can_buy: commercialAccess,
          can_sell: commercialAccess
        })
      });
    }

    adminCompanyModalMessage.innerText = 'Jurídico actualizado correctamente.';
    await loadCompanies();
    closeCompanyModal();
  } catch (error) {
    adminCompanyModalMessage.innerText = error.message;
  }
}

async function handleAdminProductEditorSubmit(event) {
  event.preventDefault();

  try {
    const productId = Number(adminEditProductId.value || 0);
    const companyId = Number(adminEditProductCompanyId.value || 0);

    if (!productId || !companyId) {
      throw new Error('Producto o empresa inválidos');
    }

    const formData = new FormData();
    formData.set('id_company', String(companyId));
    formData.set('name', adminEditProductName.value.trim());
    formData.set('brand', adminEditProductBrand.value.trim());
    formData.set('description', adminEditProductDescription.value.trim());
    formData.set('price', adminEditProductPrice.value);
    formData.set('min_stock', adminEditProductMinStock.value || '0');
    formData.set('attributes', buildAdminAttributesValue());

    const mainImage = adminEditProductMainImage.files[0];
    if (mainImage) {
      formData.append('main_image', mainImage);
    }

    Array.from(adminEditProductSecondaryImages.files || []).forEach((file) => {
      formData.append('secondary_images', file);
    });

    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo actualizar el producto');
    }

    adminProductEditorMessage.innerText = data.message;
    loadProducts(state.productPagination.page);
    await loadAdminProductDetail(productId);
    await loadAdminProductHistory(state.productEditor.stockHistoryPagination.page);
  } catch (error) {
    adminProductEditorMessage.innerText = error.message;
  }
}

async function handleAdminExchangeSubmit(event) {
  event.preventDefault();

  try {
    const rate_bs_per_usd = Number(adminExchangeRateInput.value);

    const data = await requestJson(`${API_BASE_URL}/api/exchange-rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rate_bs_per_usd })
    });

    adminExchangeMessage.innerText = data.message;
    adminExchangeForm.reset();
    await loadExchangeRates();
  } catch (error) {
    adminExchangeMessage.innerText = error.message;
  }
}

adminExchangeForm.addEventListener('submit', handleAdminExchangeSubmit);
adminCustomerModalForm.addEventListener('submit', handleCustomerModalSubmit);
adminCompanyModalForm.addEventListener('submit', handleCompanyModalSubmit);
adminCompanyModalCombinedAccess?.addEventListener('click', toggleCommercialAccess);
adminProductEditorForm.addEventListener('submit', handleAdminProductEditorSubmit);
adminCustomerModalClose.addEventListener('click', closeCustomerModal);
adminCompanyModalClose.addEventListener('click', closeCompanyModal);
adminConfirmModalClose.addEventListener('click', () => closeAdminConfirmModal(false));
adminConfirmModalCancel.addEventListener('click', () => closeAdminConfirmModal(false));
adminConfirmModalConfirm.addEventListener('click', () => closeAdminConfirmModal(true));
adminEditProductCancel.addEventListener('click', hideAdminProductEditor);
adminEditProductMainImage.addEventListener('change', renderAdminMainPreview);
adminEditProductSecondaryImages.addEventListener('change', renderAdminSecondaryPreview);
customerFilterNameInput.addEventListener('input', filterCustomers);
customerFilterEmailInput.addEventListener('input', filterCustomers);
customerFilterStatusInput.addEventListener('change', () => filterCustomers(true));
companyFilterNameInput.addEventListener('input', filterCompanies);
companyFilterDocumentInput.addEventListener('input', filterCompanies);
companyFilterEmailInput.addEventListener('input', filterCompanies);
companyFilterVerificationStatusInput.addEventListener('change', () => filterCompanies(true));
adminPurchasesSearchInput.addEventListener('input', filterAdminPurchases);
adminPurchasesStatusFilter.addEventListener('change', filterAdminPurchases);
adminPurchasesDateFromFilter.addEventListener('change', filterAdminPurchases);
adminPurchasesDateToFilter.addEventListener('change', filterAdminPurchases);
adminPurchasesResetFiltersButton.addEventListener('click', resetAdminPurchasesFilters);
productFilterNameInput.addEventListener('input', () => loadProducts(1));
productFilterCompanyInput.addEventListener('input', () => loadProducts(1));
productFilterLine.addEventListener('change', () => loadProducts(1));
adminDashboardReportTabs.forEach((tabButton) => {
  tabButton.addEventListener('click', () => {
    showAdminDashboardReportTab(tabButton.dataset.adminReportTab || 'general');
  });
});
window.addEventListener('beforeunload', revokeAdminPreviewUrls);
globalThis.openCustomerModal = openCustomerModal;
globalThis.openCompanyModal = openCompanyModal;
globalThis.goToCustomerPage = goToCustomerPage;
globalThis.goToCompanyPage = goToCompanyPage;

fetch(`${API_BASE_URL}/api/company-auth/me`, {
  headers: getAuthHeaders()
})
  .then(async (res) => {
    const data = await res.json();

    if (!res.ok || data.company?.id_role_fk !== 1) {
      throw new Error(data.error || 'Acceso solo para admin');
    }

    return data;
  })
  .then(async () => {
    showAdminModule(state.activeModule);
    showAdminDashboardReportTab(state.activeDashboardReportTab);
    showProductSubmenu(state.activeProductSubmenu);
    hideAdminProductEditor();
    await loadCompanyRoles();
    await loadExchangeRates();
    await loadAdminPurchaseViews();
    await loadProductFilters();
    loadCustomers();
    loadCompanies();
    loadProducts();
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });
