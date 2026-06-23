const headerContainer = globalThis.document.getElementById('landing-header');
const categoriesContainer = globalThis.document.getElementById('landing-categories');
const productsContainer = globalThis.document.getElementById('landing-products');
const cartDrawer = globalThis.document.getElementById('landing-cart-drawer');
const exchangeRateCard = globalThis.document.getElementById('exchange-rate-card');
const landingQueryParams = new URLSearchParams(globalThis.location.search);
const initialLandingQuery = String(landingQueryParams.get('q') || '').trim();
const initialOpenNotifications = landingQueryParams.get('openNotifications') === '1';

const state = {
  session: null,
  exchangeRate: null,
  cashback: null,
  categories: [],
  categorySearch: '',
  catalog: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  },
  filters: {
    query: initialLandingQuery,
    categoryId: null,
    sort: 'reviews_desc'
  },
  suggestions: [],
  suggestionOpen: false,
  cart: null,
  cartVisible: false,
  cartLoading: false,
  notifications: null,
  notificationOpen: initialOpenNotifications,
  accountMenuOpen: false,
  notificationsLoading: false
};

const PREFERRED_CATEGORY_NAMES = [
  'Accesorios Herramientas Eléctricas',
  'Adhesivos y Selladores',
  'Almacenamiento y Estanterías',
  'Automotriz'
];

let searchDebounceId = null;

const normalizeCategoryName = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const formatExchangeRate = (value) => Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4
});

const formatAmount = (value) => Number(value || 0).toFixed(2);

const formatUsdCompact = (value) => {
  const numeric = Number(value || 0);
  const formatted = numeric.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `USD ${formatted}`;
};

const formatBsAmount = (value) => Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatNotificationDate = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const convertUsdToBs = (usdAmount) => {
  if (!state.exchangeRate?.rate_bs_per_usd) {
    return null;
  }

  return Number(usdAmount || 0) * Number(state.exchangeRate.rate_bs_per_usd || 0);
};

const requestJson = async (url, options = {}) => {
  const response = await globalThis.fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders()
    }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo completar la solicitud');
  }

  return data;
};

const renderRatingSummary = (reviewSummary) => {
  const totalReviews = Number(reviewSummary?.total_reviews || 0);
  const averageRating = Number(reviewSummary?.average_rating || 0);

  if (!totalReviews) {
    return 'Sin reseñas';
  }

  return `${averageRating.toFixed(1)} / 5 (${totalReviews})`;
};

const renderRatingStars = (reviewSummary) => {
  const averageRating = Number(reviewSummary?.average_rating || 0);
  const rounded = Math.max(0, Math.min(5, Math.round(averageRating)));
  const filled = '★'.repeat(rounded);
  const empty = '☆'.repeat(5 - rounded);
  const numeric = averageRating > 0 ? averageRating.toFixed(1) : '0.0';

  return `<span class="landing-catalog-card__stars" aria-hidden="true">${filled}${empty}</span><span class="landing-catalog-card__rating-value">${numeric}</span>`;
};

const getProductSellerLabel = (product = {}) => {
  return String(
    product.company_name
    || product.seller_name
    || product.companyName
    || product.sellerName
    || 'Proveedor'
  );
};

const getProductStockLabel = (product = {}) => {
  const stockValue = Number(
    product.available_stock
    ?? product.stock
    ?? product.stock_quantity
    ?? product.quantity
    ?? 0
  );

  if (!Number.isFinite(stockValue) || stockValue <= 0) {
    return 'Stock por confirmar';
  }

  if (stockValue <= 5) {
    return `Pocas unidades (${stockValue})`;
  }

  return `Disponible (${stockValue})`;
};

const renderExchangeRateInline = () => {
  if (!state.exchangeRate?.rate_bs_per_usd) {
    return '<span class="landing-chip landing-chip--stack"><small>Tasa del dia</small><b>Bs.S N/D</b></span>';
  }

  return `
    <span class="landing-chip landing-chip--stack"><small>Tasa del dia</small><b>Bs.S ${formatExchangeRate(state.exchangeRate.rate_bs_per_usd)}</b></span>
  `;
};

const renderCashbackInline = () => {
  if (state.session?.entity !== 'customer') {
    return '';
  }

  return `
    <span class="landing-chip landing-chip--stack"><small>Cashback disponible</small><b>USD ${formatAmount(state.cashback?.value || 0)}</b></span>
  `;
};

const getCompanyRoleLabel = (roleId) => {
  if (roleId === 1) {
    return 'Administrador';
  }

  if (roleId === 2) {
    return 'Distribuidora';
  }

  if (roleId === 3) {
    return 'Ferreteria';
  }

  return 'Empresa';
};

const renderNotificationsPanel = () => {
  if (!state.session || !state.notificationOpen) {
    return '';
  }

  const notifications = Array.isArray(state.notifications?.items) ? state.notifications.items : [];
  const markAllDisabled = notifications.length ? '' : 'disabled';
  const loadingMessage = state.notificationsLoading ? '<p>Cargando notificaciones...</p>' : '';
  const emptyMessage = !state.notificationsLoading && !notifications.length
    ? '<p>No tienes notificaciones pendientes.</p>'
    : '';

  return `
    <div class="landing-notifications-panel" style="position:absolute; top:calc(100% + 8px); right:0; width:340px; max-width:90vw; background:#fff; border:1px solid #ccc; padding:12px; z-index:40;">
      <div class="landing-notifications-panel__header" style="display:flex; justify-content:space-between; gap:8px; align-items:center; margin-bottom:12px;">
        <p class="landing-notifications-panel__title" style="margin:0;"><b>Notificaciones</b></p>
        <button type="button" onclick="markAllLandingNotificationsAsRead()" ${markAllDisabled}>Marcar todas</button>
      </div>
      ${loadingMessage}
      ${emptyMessage}
      ${notifications.map((notification) => `
        <article class="landing-notification-item" style="border-top:1px solid #ccc; padding-top:10px; margin-top:10px;">
          <p class="landing-notification-item__title" style="margin:0 0 6px 0;"><b>${notification.title || 'Notificación'}</b>${notification.is_read ? ' (leída)' : ''}</p>
          <p class="landing-notification-item__message" style="margin:0 0 6px 0;">${notification.message || ''}</p>
          <p class="landing-notification-item__date" style="margin:0 0 8px 0;"><small>${formatNotificationDate(notification.created_at)}</small></p>
          <div class="landing-notification-item__actions" style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" onclick="markLandingNotificationAsRead('${encodeURIComponent(notification.id)}')" ${notification.is_read ? 'disabled' : ''}>Marcar leída</button>
            <button type="button" onclick="openLandingNotification('${encodeURIComponent(notification.id)}', '${encodeURIComponent(notification.action_path || '')}')">Abrir</button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
};

const renderExchangeRate = (exchangeRate) => {
  state.exchangeRate = exchangeRate || null;
  exchangeRateCard.innerHTML = '';
  renderHeader();
};

const renderAuthControls = () => {
  if (!state.session) {
    return `
      <div class="landing-header-actions">
        <span class="landing-chip landing-chip--stack landing-chip--muted"><small>Sesión</small><b>Invitado</b></span>
        <a class="landing-chip landing-chip--cta" href="/auth/login.html">Iniciar sesión</a>
        <a class="landing-chip landing-chip--outline" href="/auth/register.html">Registrarse</a>
      </div>
    `;
  }

  const profile = state.session.entity === 'company'
    ? state.session.data.company
    : state.session.data.user;
  const accountLabel = state.session.entity === 'company'
    ? getCompanyRoleLabel(Number(profile?.id_role_fk || 0))
    : (profile?.name || profile?.email || 'Cliente');
  const unreadCount = Number(state.notifications?.unread_count || 0);
  const unreadLabel = unreadCount > 0 ? ` (${unreadCount})` : '';

  return `
    <div class="landing-header-actions">
      <div class="landing-account-dropdown">
        <button class="landing-chip landing-chip--stack landing-chip--account landing-account-trigger" type="button" onclick="toggleLandingAccountMenu()" aria-expanded="${state.accountMenuOpen ? 'true' : 'false'}"><small>Mi cuenta</small><b>${accountLabel}</b></button>
        ${state.accountMenuOpen
          ? `<div class="landing-account-menu">
              <button type="button" onclick="openLandingAccountDashboard()">Mi cuenta (dashboard)</button>
              <button type="button" onclick="openLandingAccountNotifications()">Mis notificaciones${unreadLabel}</button>
              <button type="button" onclick="openLandingAccountLogout()">Cerrar sesión</button>
            </div>`
          : ''}
        ${renderNotificationsPanel()}
      </div>
      ${renderCashbackInline()}
    </div>
  `;
};

const renderSuggestions = () => {
  if (!state.suggestionOpen || !state.suggestions.length) {
    return '';
  }

  return `
    <div style="position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid #ccc; padding:8px; z-index:20;">
      ${state.suggestions.map((product) => `
        <button
          type="button"
          onclick="selectSuggestion('${encodeURIComponent(product.sku)}')"
          style="display:block; width:100%; text-align:left; margin-bottom:6px;"
        >
          ${product.name || 'Sin nombre'} | ${product.line_name || 'Sin línea'} | ${renderRatingSummary(product.reviews)}
        </button>
      `).join('')}
    </div>
  `;
};

const renderSuggestionsPanel = () => {
  const suggestionsContainer = globalThis.document.getElementById('landing-search-suggestions');

  if (!suggestionsContainer) {
    return;
  }

  suggestionsContainer.innerHTML = renderSuggestions();
};

const renderCategoryButtons = () => {
  const searchQuery = normalizeCategoryName(state.categorySearch);
  const catalogCategories = state.categories
    .map((category) => ({
      ...category,
      _normalized: normalizeCategoryName(category.name)
    }))
    .filter((category) => category._normalized && category._normalized !== 'todas');

  const visibleCategories = searchQuery
    ? catalogCategories.filter((category) => category._normalized.includes(searchQuery))
    : PREFERRED_CATEGORY_NAMES
      .map((name) => {
        const normalizedName = normalizeCategoryName(name);
        return catalogCategories.find((category) => category._normalized === normalizedName) || null;
      })
      .filter(Boolean);

  const emptyState = searchQuery && !visibleCategories.length
    ? '<button type="button" class="landing-category-btn" disabled>No se encontraron categorías</button>'
    : '';

  const isAllSelected = !state.filters.categoryId;

  return `
    <button type="button" class="landing-category-btn ${isAllSelected ? 'is-active' : ''}" onclick="selectCategory()" aria-pressed="${isAllSelected ? 'true' : 'false'}">Todas</button>
    ${visibleCategories.map((category) => `
      <button type="button" class="landing-category-btn ${state.filters.categoryId === Number(category.id_category) ? 'is-active' : ''}" onclick="selectCategory(${category.id_category})" aria-pressed="${state.filters.categoryId === Number(category.id_category) ? 'true' : 'false'}">${category.name}</button>
    `).join('')}
    ${emptyState}
  `;
};

const renderCategoryButtonsPanel = () => {
  const categoryButtonsContainer = globalThis.document.getElementById('landing-category-buttons');

  if (!categoryButtonsContainer) {
    return;
  }

  categoryButtonsContainer.innerHTML = renderCategoryButtons();
};

const renderHeader = () => {
  if (globalThis.document.getElementById('global-site-header')) {
    return;
  }

  const cartChip = state.session?.entity === 'customer'
    ? '<a class="landing-chip landing-chip--cart" href="/modules/customer/cart.html">Carrito</a>'
    : '';

  headerContainer.innerHTML = `
    <div class="landing-topbar">
      <a href="/index.html" class="landing-header-logo" aria-label="Volver al landing">
        <img src="/uploads/default/logo_full.png" alt="Logo tuherramienta.online" style="height:42px; width:auto; display:block;">
      </a>
      <div class="landing-header-search-wrap" style="position:relative; flex:1 1 360px; min-width:280px;">
        <form id="landing-search-form" class="landing-header-search-form" style="display:flex; gap:8px; align-items:center;">
          <span class="landing-search-scope-label" aria-hidden="true">Todo</span>
          <input id="landing-search-input" type="search" placeholder="Buscar productos, líneas o categorías" value="${state.filters.query}">
          <button type="submit" aria-label="Buscar">&#128269;</button>
        </form>
        <div id="landing-search-suggestions"></div>
      </div>
      ${renderExchangeRateInline()}
      ${renderAuthControls()}
      ${cartChip}
    </div>
  `;

  const searchForm = globalThis.document.getElementById('landing-search-form');
  const searchInput = globalThis.document.getElementById('landing-search-input');

  if (searchForm) {
    searchForm.addEventListener('submit', handleSearchSubmit);
  }

  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }

  renderSuggestionsPanel();
};

const renderCategories = () => {
  categoriesContainer.innerHTML = `
    <div class="landing-category-panel">
      <div class="landing-category-panel__head">
        <h2>Categorías</h2>
        <p class="landing-category-panel__summary">Filtra el catálogo por familia de productos.</p>
        <input id="landing-category-search" type="search" placeholder="Buscar categoría" value="${state.categorySearch}">
      </div>
      <div id="landing-category-buttons" class="landing-category-panel__buttons">
      </div>
    </div>
  `;

  const categorySearchInput = globalThis.document.getElementById('landing-category-search');
  if (categorySearchInput) {
    categorySearchInput.addEventListener('input', (event) => {
      state.categorySearch = event.target.value;
      renderCategoryButtonsPanel();
    });
  }

  renderCategoryButtonsPanel();
};

const renderCatalogHeader = () => `
  <div class="landing-catalog-header">
    <div>
      <h2 class="landing-catalog-header__title">Productos</h2>
      <p class="landing-catalog-header__summary">Catálogo visible - ${Number(state.pagination.total || state.catalog.length || 0)} productos disponibles</p>
    </div>
    <div class="landing-catalog-header__sort">
      <label for="landing-sort-select">Orden</label>
      <select id="landing-sort-select">
        <option value="reviews_desc" ${state.filters.sort === 'reviews_desc' ? 'selected' : ''}>Más reseñados</option>
        <option value="recent" ${state.filters.sort === 'recent' ? 'selected' : ''}>Más recientes</option>
      </select>
    </div>
  </div>
`;

const renderCatalogCards = () => {
  if (!state.catalog.length) {
    return '<p>No se encontraron productos para estos filtros.</p>';
  }

  return state.catalog.map((product) => {
    const categoryLabel = (product.category_name || product.line_name || 'Categoría').toUpperCase();
    const lineLabel = String(product.line_name || product.line || 'Línea general');
    const productName = product.name || 'Sin nombre';
    const productPrice = formatUsdCompact(product.price);
    const ratingBlock = renderRatingStars(product.reviews);
    const sellerLabel = getProductSellerLabel(product);
    const stockLabel = getProductStockLabel(product);
    const skuLabel = String(product.sku || 'Sin SKU');
    const imageBlock = product.image_url
      ? `<img src="${product.image_url}" alt="${productName}">`
      : '<div class="landing-catalog-card__img-placeholder">Sin imagen</div>';

    return `
      <article class="landing-catalog-card">
        <div class="landing-catalog-card__top">
          <a class="landing-catalog-card__media" href="/products/detail.html?sku=${encodeURIComponent(product.sku)}">
            ${imageBlock}
          </a>

          <div class="landing-catalog-card__content">
            <p class="landing-catalog-card__category">${categoryLabel}</p>
            <h3 class="landing-catalog-card__title">${productName}</h3>
            <p class="landing-catalog-card__line">${lineLabel}</p>
            <p class="landing-catalog-card__rating">${ratingBlock}</p>
            <div class="landing-catalog-card__meta">
              <span class="landing-catalog-card__chip">${sellerLabel}</span>
              <span class="landing-catalog-card__chip landing-catalog-card__chip--soft">${stockLabel}</span>
              <span class="landing-catalog-card__chip landing-catalog-card__chip--ghost">SKU ${skuLabel}</span>
            </div>
          </div>

          <p class="landing-catalog-card__price">${productPrice}</p>
        </div>

        <div class="landing-catalog-card__actions">
          <button type="button" onclick="addLandingProductToCart(${product.id_product})">+ Agregar</button>
          <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}">Ver</a>
        </div>
      </article>
    `;
  }).join('');
};

const renderPagination = () => {
  const { page, total_pages: totalPages, total } = state.pagination;

  return `
    <div class="landing-catalog-pagination">
      <button type="button" onclick="changeCatalogPage(-1)" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
      <span class="landing-catalog-pagination__meta">Página ${page} de ${totalPages}</span>
      <button type="button" onclick="changeCatalogPage(1)" ${page >= totalPages ? 'disabled' : ''}>Siguiente</button>
      <span class="landing-catalog-pagination__meta">Total visible: ${total}</span>
    </div>
  `;
};

const renderProducts = () => {
  productsContainer.innerHTML = `
    <div class="landing-products-panel">
      ${renderCatalogHeader()}
      ${renderCatalogCards()}
      ${renderPagination()}
    </div>
  `;

  const sortSelect = globalThis.document.getElementById('landing-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      state.filters.sort = event.target.value;
      state.pagination.page = 1;
      loadCatalog();
    });
  }
};

const renderCartDrawer = () => {
  if (!state.cartVisible) {
    cartDrawer.hidden = true;
    cartDrawer.innerHTML = '';
    return;
  }

  cartDrawer.hidden = false;

  if (state.session?.entity !== 'customer') {
    cartDrawer.innerHTML = `
      <div class="landing-cart-overlay" onclick="if (event.target === this) hideCartDrawer()">
        <div class="landing-cart-modal landing-cart-modal--guest" role="dialog" aria-modal="true" aria-label="Carrito">
          <div class="landing-cart-modal__header">
            <h2>Carrito</h2>
            <button type="button" onclick="hideCartDrawer()">Ocultar</button>
          </div>
          <p class="landing-cart-modal__message">Debes iniciar sesión como cliente para usar el carrito.</p>
          <p class="landing-cart-modal__message"><a href="/auth/login.html">Ir a login</a></p>
        </div>
      </div>
    `;
    return;
  }

  const items = Array.isArray(state.cart?.items) ? state.cart.items : [];
  const subtotalUsd = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.product?.price || 0)), 0);
  const subtotalBs = convertUsdToBs(subtotalUsd);
  const cartActionDisabled = state.cartLoading ? 'disabled' : '';

  cartDrawer.innerHTML = `
    <div class="landing-cart-overlay" onclick="if (event.target === this) hideCartDrawer()">
      <div class="landing-cart-modal" role="dialog" aria-modal="true" aria-label="Carrito desplegable">
        <div class="landing-cart-modal__header">
          <h2>Carrito desplegable</h2>
          <button type="button" onclick="hideCartDrawer()">Ocultar</button>
        </div>

        <div class="landing-cart-summary">
          <p><b>Productos:</b> ${items.length}</p>
          <p><b>Subtotal USD:</b> ${formatUsdCompact(subtotalUsd)}</p>
          <p><b>Subtotal Bs:</b> ${subtotalBs === null ? 'Tasa no disponible' : `Bs.S ${formatBsAmount(subtotalBs)}`}</p>
        </div>
        ${state.cartLoading ? '<p class="landing-cart-modal__message">Actualizando carrito...</p>' : ''}
        ${items.length ? items.map((item) => `
          <article class="landing-cart-item">
            <div class="landing-cart-item__media">
              ${item.product?.main_image_url
                ? `<img src="${item.product.main_image_url}" alt="${item.product.name}">`
                : '<div class="landing-cart-item__placeholder">Sin imagen</div>'}
            </div>
            <div class="landing-cart-item__content">
              <p class="landing-cart-item__title"><b>${item.product?.name || `Producto ${item.id_product}`}</b></p>
              <p class="landing-cart-item__meta"><b>SKU:</b> ${item.product?.sku || 'Sin SKU'}</p>
              <div class="landing-cart-item__actions-row">
                <div class="landing-cart-item__qty-control">
                  <button type="button" aria-label="Disminuir cantidad" onclick="decreaseLandingCartItem(${item.id_product})" ${cartActionDisabled}>-</button>
                  <span>${Number(item.quantity || 0)}</span>
                  <button type="button" aria-label="Aumentar cantidad" onclick="increaseLandingCartItem(${item.id_product})" ${cartActionDisabled}>+</button>
                </div>
                <button class="landing-cart-item__remove" type="button" onclick="removeLandingCartItem(${item.id_product})" ${cartActionDisabled}>Eliminar</button>
              </div>
              <p class="landing-cart-item__meta"><b>Subtotal:</b> ${formatUsdCompact(Number(item.quantity || 0) * Number(item.product?.price || 0))}</p>
            </div>
          </article>
        `).join('') : '<p class="landing-cart-modal__message">Tu carrito está vacío.</p>'}

        <div class="landing-cart-modal__footer">
          <a href="/modules/customer/cart.html">Ir al carrito</a>
          <button type="button" onclick="hideCartDrawer()">Seguir comprando</button>
        </div>
      </div>
    </div>
  `;
};

const loadCatalog = async () => {
  try {
    const query = new URLSearchParams({
      page: String(state.pagination.page),
      limit: String(state.pagination.limit),
      sort: state.filters.sort
    });

    if (state.filters.query) {
      query.set('q', state.filters.query);
    }

    if (state.filters.categoryId) {
      query.set('category_id', String(state.filters.categoryId));
    }

    query.set('view', 'home');

    const data = await requestJson(`${API_BASE_URL}/api/products/catalog?${query.toString()}`);
    state.catalog = Array.isArray(data.products) ? data.products : [];
    state.pagination = data.pagination || state.pagination;
    renderProducts();
  } catch {
    productsContainer.innerHTML = '<p>No se pudo cargar el catálogo.</p>';
  }
};

const loadCategories = async () => {
  try {
    const data = await requestJson(`${API_BASE_URL}/api/products/categories`);
    state.categories = Array.isArray(data.categories)
      ? data.categories.filter((category) => category.is_active !== false)
      : [];
    renderCategories();
  } catch {
    categoriesContainer.innerHTML = '<p>No se pudieron cargar las categorías.</p>';
  }
};

const loadSearchSuggestions = async () => {
  if (!state.filters.query || state.filters.query.length < 2) {
    state.suggestions = [];
    state.suggestionOpen = false;
    renderSuggestionsPanel();
    return;
  }

  try {
    const query = new URLSearchParams({
      q: state.filters.query,
      page: '1',
      limit: '6',
      sort: state.filters.sort,
      view: 'home'
    });
    const data = await requestJson(`${API_BASE_URL}/api/products/catalog?${query.toString()}`);
    state.suggestions = Array.isArray(data.products) ? data.products : [];
    state.suggestionOpen = true;
  } catch {
    state.suggestions = [];
    state.suggestionOpen = false;
  }

  renderSuggestionsPanel();
};

const loadLatestExchangeRate = () => {
  globalThis.fetch(`${API_BASE_URL}/api/exchange-rate/latest`)
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cargar la tasa');
      }

      return data;
    })
    .then((data) => {
      renderExchangeRate(data.exchange_rate || null);
      renderProducts();
      renderCartDrawer();
    })
    .catch(() => {
      exchangeRateCard.innerHTML = '';
    });
};

const loadSession = async () => {
  if (!isLogged()) {
    state.session = null;
    state.cashback = null;
    state.notifications = null;
    state.notificationOpen = false;
    renderHeader();
    return;
  }

  try {
    state.session = await fetchCurrentSession();
  } catch {
    clearSession();
    state.session = null;
    state.cashback = null;
    state.notifications = null;
    state.notificationOpen = false;
  }

  renderHeader();
};

const loadNotifications = async () => {
  if (!state.session) {
    state.notifications = null;
    state.notificationOpen = false;
    state.notificationsLoading = false;
    renderHeader();
    return;
  }

  state.notificationsLoading = true;
  renderHeader();

  try {
    const data = await requestJson(`${API_BASE_URL}/api/notifications`);
    state.notifications = data.notifications || { items: [], unread_count: 0 };
  } catch {
    state.notifications = { items: [], unread_count: 0 };
  } finally {
    state.notificationsLoading = false;
  }

  renderHeader();
};

const loadCashback = async () => {
  if (state.session?.entity !== 'customer') {
    state.cashback = null;
    renderHeader();
    return;
  }

  try {
    const data = await requestJson(`${API_BASE_URL}/api/auth/cashback`);
    state.cashback = data.cashback || null;
  } catch {
    state.cashback = null;
  }

  renderHeader();
};

const loadCart = async () => {
  if (state.session?.entity !== 'customer') {
    state.cart = null;
    renderCartDrawer();
    return;
  }

  state.cartLoading = true;
  renderCartDrawer();

  try {
    const data = await requestJson(`${API_BASE_URL}/api/auth/cart`);
    state.cart = data.cart || null;
  } catch {
    state.cart = null;
  } finally {
    state.cartLoading = false;
  }

  renderCartDrawer();
  loadNotifications();
};

async function markLandingNotificationAsRead(encodedNotificationId) {
  if (!state.session) {
    return;
  }

  try {
    const notificationId = decodeURIComponent(encodedNotificationId);
    const data = await requestJson(`${API_BASE_URL}/api/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PUT'
    });
    state.notifications = data.notifications || state.notifications;
  } catch {
    return;
  }

  renderHeader();
}

async function markAllLandingNotificationsAsRead() {
  if (!state.session) {
    return;
  }

  try {
    const data = await requestJson(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'PUT'
    });
    state.notifications = data.notifications || state.notifications;
  } catch {
    return;
  }

  renderHeader();
}

function toggleLandingNotifications() {
  if (!state.session) {
    return;
  }

  state.notificationOpen = !state.notificationOpen;
  state.accountMenuOpen = false;
  renderHeader();
}

function toggleLandingAccountMenu() {
  if (!state.session) {
    return;
  }

  state.accountMenuOpen = !state.accountMenuOpen;

  if (state.accountMenuOpen) {
    state.notificationOpen = false;
  }

  renderHeader();
}

function openLandingAccountDashboard() {
  state.accountMenuOpen = false;
  state.notificationOpen = false;
  renderHeader();
  goDashboard();
}

function openLandingAccountNotifications() {
  if (!state.session) {
    return;
  }

  state.accountMenuOpen = false;
  state.notificationOpen = !state.notificationOpen;
  renderHeader();
}

function openLandingAccountLogout() {
  state.accountMenuOpen = false;
  state.notificationOpen = false;
  renderHeader();
  logout();
}

const closeLandingHeaderMenus = () => {
  if (!state.accountMenuOpen && !state.notificationOpen) {
    return;
  }

  state.accountMenuOpen = false;
  state.notificationOpen = false;
  renderHeader();
};

const handleLandingHeaderGlobalClick = (event) => {
  if (!state.session) {
    return;
  }

  if (!(event.target instanceof Element)) {
    return;
  }

  if (event.target.closest('.landing-account-dropdown')) {
    return;
  }

  closeLandingHeaderMenus();
};

const handleLandingHeaderGlobalKeydown = (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  closeLandingHeaderMenus();
};

async function openLandingNotification(encodedNotificationId, encodedActionPath) {
  await markLandingNotificationAsRead(encodedNotificationId);
  state.notificationOpen = false;

  const actionPath = decodeURIComponent(encodedActionPath || '');

  if (actionPath) {
    location.href = actionPath;
    return;
  }

  renderHeader();
}

const getLandingCartItemQuantity = (productId) => {
  const items = Array.isArray(state.cart?.items) ? state.cart.items : [];
  const item = items.find((cartItem) => Number(cartItem.id_product) === Number(productId));

  return Number(item?.quantity || 0);
};

const setLandingCartItemQuantity = async (productId, quantity) => {
  state.cartLoading = true;
  renderCartDrawer();

  try {
    await requestJson(`${API_BASE_URL}/api/auth/cart/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_product: Number(productId),
        quantity: Number(quantity)
      })
    });

    await loadCart();
  } catch {
    state.cartLoading = false;
    renderCartDrawer();
  }
};

const deleteLandingCartItem = async (productId) => {
  state.cartLoading = true;
  renderCartDrawer();

  try {
    await requestJson(`${API_BASE_URL}/api/auth/cart/items/${productId}`, {
      method: 'DELETE'
    });

    await loadCart();
  } catch {
    state.cartLoading = false;
    renderCartDrawer();
  }
};

function goDashboard() {
  redirectToDashboard().catch(() => {
    clearSession();
    redirectToLogin();
  });
}

function goToCartPage() {
  location.href = '/modules/customer/cart.html';
}

function selectCategory(categoryId = null) {
  state.filters.categoryId = categoryId ? Number(categoryId) : null;
  state.pagination.page = 1;
  loadCatalog();
}

function changeCatalogPage(delta) {
  const nextPage = state.pagination.page + Number(delta || 0);

  if (nextPage < 1 || nextPage > state.pagination.total_pages) {
    return;
  }

  state.pagination.page = nextPage;
  loadCatalog();
}

async function addLandingProductToCart(productId) {
  state.cartVisible = true;
  renderCartDrawer();

  if (state.session?.entity !== 'customer') {
    return;
  }

  try {
    await requestJson(`${API_BASE_URL}/api/auth/cart/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_product: productId,
        quantity: 1
      })
    });

    await loadCart();
  } catch {
    renderCartDrawer();
  }
}

async function increaseLandingCartItem(productId) {
  const currentQuantity = getLandingCartItemQuantity(productId);
  await setLandingCartItemQuantity(productId, currentQuantity + 1);
}

async function decreaseLandingCartItem(productId) {
  const currentQuantity = getLandingCartItemQuantity(productId);
  const nextQuantity = currentQuantity - 1;

  if (nextQuantity <= 0) {
    await deleteLandingCartItem(productId);
    return;
  }

  await setLandingCartItemQuantity(productId, nextQuantity);
}

async function removeLandingCartItem(productId) {
  await deleteLandingCartItem(productId);
}

function hideCartDrawer() {
  state.cartVisible = false;
  renderCartDrawer();
}

function handleSearchSubmit(event) {
  event.preventDefault();
  state.pagination.page = 1;
  state.suggestionOpen = false;
  renderSuggestionsPanel();
  loadCatalog();
}

function clearSearch() {
  state.filters.query = '';
  state.pagination.page = 1;
  state.suggestions = [];
  state.suggestionOpen = false;
  const searchInput = globalThis.document.getElementById('landing-search-input');

  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }

  renderSuggestionsPanel();
  loadCatalog();
}

function handleSearchInput(event) {
  state.filters.query = event.target.value.trim();
  state.pagination.page = 1;

  if (searchDebounceId) {
    clearTimeout(searchDebounceId);
  }

  searchDebounceId = setTimeout(() => {
    loadSearchSuggestions();
  }, 200);
}

function selectSuggestion(encodedSku) {
  const decodedSku = decodeURIComponent(encodedSku);
  state.suggestionOpen = false;
  state.suggestions = [];
  renderSuggestionsPanel();
  location.href = `/products/detail.html?sku=${encodeURIComponent(decodedSku)}`;
}

globalThis.goDashboard = goDashboard;
globalThis.goToCartPage = goToCartPage;
globalThis.selectCategory = selectCategory;
globalThis.changeCatalogPage = changeCatalogPage;
globalThis.addLandingProductToCart = addLandingProductToCart;
globalThis.increaseLandingCartItem = increaseLandingCartItem;
globalThis.decreaseLandingCartItem = decreaseLandingCartItem;
globalThis.removeLandingCartItem = removeLandingCartItem;
globalThis.hideCartDrawer = hideCartDrawer;
globalThis.selectSuggestion = selectSuggestion;
globalThis.toggleLandingNotifications = toggleLandingNotifications;
globalThis.toggleLandingAccountMenu = toggleLandingAccountMenu;
globalThis.openLandingAccountDashboard = openLandingAccountDashboard;
globalThis.openLandingAccountNotifications = openLandingAccountNotifications;
globalThis.openLandingAccountLogout = openLandingAccountLogout;
globalThis.markLandingNotificationAsRead = markLandingNotificationAsRead;
globalThis.markAllLandingNotificationsAsRead = markAllLandingNotificationsAsRead;
globalThis.openLandingNotification = openLandingNotification;

if (!globalThis.__landingHeaderMenuListenersAttached) {
  globalThis.document.addEventListener('click', handleLandingHeaderGlobalClick);
  globalThis.document.addEventListener('keydown', handleLandingHeaderGlobalKeydown);
  globalThis.__landingHeaderMenuListenersAttached = true;
}

Promise.all([
  loadSession(),
  loadCategories(),
  loadCatalog()
]).then(() => {
  loadCashback();
  loadCart();
  loadNotifications();
});

loadLatestExchangeRate();