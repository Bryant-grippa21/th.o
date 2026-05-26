const headerContainer = globalThis.document.getElementById('landing-header');
const categoriesContainer = globalThis.document.getElementById('landing-categories');
const productsContainer = globalThis.document.getElementById('landing-products');
const cartDrawer = globalThis.document.getElementById('landing-cart-drawer');
const exchangeRateCard = globalThis.document.getElementById('exchange-rate-card');
const landingQueryParams = new URLSearchParams(globalThis.location.search);
const initialLandingQuery = String(landingQueryParams.get('q') || '').trim();

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
  notificationOpen: false,
  notificationsLoading: false
};

let searchDebounceId = null;

const formatExchangeRate = (value) => Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4
});

const formatAmount = (value) => Number(value || 0).toFixed(2);

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

const renderExchangeRateInline = () => {
  if (!state.exchangeRate?.rate_bs_per_usd) {
    return '';
  }

  return `
    <span>
      Tasa del día <b>Bs.S ${formatExchangeRate(state.exchangeRate.rate_bs_per_usd)}</b>
    </span>
  `;
};

const renderCashbackInline = () => {
  if (state.session?.entity !== 'customer') {
    return '';
  }

  return `
    <span>
      Cashback acumulado <b>USD ${formatAmount(state.cashback?.value || 0)}</b>
    </span>
  `;
};

const renderNotificationsControl = () => {
  if (!state.session) {
    return '';
  }

  const notifications = Array.isArray(state.notifications?.items) ? state.notifications.items : [];
  const unreadCount = Number(state.notifications?.unread_count || 0);
  const unreadLabel = unreadCount > 0 ? ` (${unreadCount})` : '';
  const markAllDisabled = notifications.length ? '' : 'disabled';
  const loadingMessage = state.notificationsLoading ? '<p>Cargando notificaciones...</p>' : '';
  const emptyMessage = !state.notificationsLoading && !notifications.length
    ? '<p>No tienes notificaciones pendientes.</p>'
    : '';
  const panelContent = state.notificationOpen
    ? `
        <div class="landing-notifications-panel" style="position:absolute; top:100%; right:0; width:340px; max-width:90vw; background:#fff; border:1px solid #ccc; padding:12px; z-index:40;">
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
      `
    : '';

  return `
    <div class="landing-notifications" style="position:relative;">
      <button class="landing-notifications__toggle" type="button" onclick="toggleLandingNotifications()" aria-label="Notificaciones">
        &#128276;${unreadLabel}
      </button>
      ${panelContent}
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
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <a href="/auth/login.html">Login</a>
        <a href="/auth/register.html">Registro</a>
      </div>
    `;
  }

  const profile = state.session.entity === 'company'
    ? state.session.data.company
    : state.session.data.user;
  const name = profile?.name || profile?.company_name || profile?.email || 'Usuario';
  let dashboardLabel = 'Ir a mi dashboard';

  if (state.session.entity === 'company') {
    dashboardLabel = profile?.id_role_fk === 1
      ? 'Ir a dashboard admin'
      : 'Ir a dashboard empresa';
  }

  return `
    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
      <span>Bienvenido <b>${name}</b></span>
      ${renderExchangeRateInline()}
      ${renderCashbackInline()}
      ${renderNotificationsControl()}
      <button type="button" onclick="goDashboard()">${dashboardLabel}</button>
      <button type="button" onclick="logout()">Cerrar sesión</button>
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
  const visibleCategories = state.categories.filter((category) => category.name.toLowerCase().includes(state.categorySearch.toLowerCase()));

  return `
    <button type="button" onclick="selectCategory()">Todas</button>
    ${visibleCategories.map((category) => `
      <button type="button" onclick="selectCategory(${category.id_category})">${category.name}</button>
    `).join('')}
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
  const guestExchangeRate = state.session ? '' : renderExchangeRateInline();

  headerContainer.innerHTML = `
    <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap; padding:16px; border:1px solid #ccc; margin-bottom:16px;">
      <a href="/index.html" class="landing-header-logo" aria-label="Volver al landing">
        <img src="/uploads/default/Logo.png" alt="Logo tuherramienta.online" style="height:48px; width:auto; display:block;">
      </a>
      <div style="position:relative; flex:1 1 360px; min-width:280px;">
        <form id="landing-search-form" style="display:flex; gap:8px; align-items:center;">
          <input id="landing-search-input" type="search" placeholder="Buscar productos, líneas o categorías" value="${state.filters.query}">
          <button type="submit">Buscar</button>
          <button id="landing-search-clear" type="button">Limpiar</button>
        </form>
        <div id="landing-search-suggestions"></div>
      </div>
      ${renderAuthControls()}
      ${guestExchangeRate}
      <button type="button" onclick="goToCartPage()">Ir al carrito / checkout</button>
    </div>
  `;

  const searchForm = globalThis.document.getElementById('landing-search-form');
  const searchInput = globalThis.document.getElementById('landing-search-input');
  const clearButton = globalThis.document.getElementById('landing-search-clear');

  if (searchForm) {
    searchForm.addEventListener('submit', handleSearchSubmit);
  }

  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }

  if (clearButton) {
    clearButton.addEventListener('click', clearSearch);
  }

  renderSuggestionsPanel();
};

const renderCategories = () => {
  categoriesContainer.innerHTML = `
    <div style="padding:16px; border:1px solid #ccc; margin-bottom:16px;">
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
        <h2 style="margin:0;">Categorías</h2>
        <input id="landing-category-search" type="search" placeholder="Buscar categoría" value="${state.categorySearch}">
      </div>
      <div id="landing-category-buttons" style="display:flex; gap:8px; flex-wrap:wrap;">
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
  <div style="display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; margin-bottom:12px;">
    <div>
      <h2 style="margin:0;">Productos</h2>
      <p style="margin:4px 0 0 0;">Ordenados por reseñas de mayor a menor</p>
    </div>
    <div>
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
    const priceBs = convertUsdToBs(product.price);

    return `
      <article style="display:flex; gap:16px; align-items:flex-start; border:1px solid #ccc; padding:12px; margin-bottom:12px;">
        <div>
          <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}">
            ${product.image_url
              ? `<img src="${product.image_url}" alt="${product.name}" style="width:120px; height:120px; object-fit:cover; border:1px solid #ccc; display:block;">`
              : '<div style="width:120px; height:120px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">Sin imagen</div>'}
          </a>
        </div>
        <div style="flex:1 1 auto; min-width:220px;">
          <p><b>${product.name || 'Sin nombre'}</b></p>
          <p><b>SKU:</b> ${product.sku}</p>
          <p><b>Línea:</b> ${product.line_name || 'Sin línea'}</p>
          <p><b>Categoría:</b> ${product.category_name || 'Sin categoría'}</p>
          <p><b>Precio USD:</b> USD ${formatAmount(product.price)}</p>
          <p><b>Precio Bs:</b> ${priceBs === null ? 'Tasa no disponible' : `Bs.S ${formatBsAmount(priceBs)}`}</p>
          <p><b>Stock:</b> ${Number(product.quantity || 0)}</p>
          <p><b>Promedio:</b> ${renderRatingSummary(product.reviews)}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}">Ver detalle</a>
            <button type="button" onclick="addLandingProductToCart(${product.id_product})">Añadir</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
};

const renderPagination = () => {
  const { page, total_pages: totalPages, total } = state.pagination;

  return `
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:16px;">
      <button type="button" onclick="changeCatalogPage(-1)" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
      <span>Página ${page} de ${totalPages}</span>
      <button type="button" onclick="changeCatalogPage(1)" ${page >= totalPages ? 'disabled' : ''}>Siguiente</button>
      <span>Total visible: ${total}</span>
    </div>
  `;
};

const renderProducts = () => {
  productsContainer.innerHTML = `
    <div style="padding:16px; border:1px solid #ccc; margin-bottom:16px;">
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
      <div style="position:fixed; inset:0; background:rgba(0,0,0,0.35); padding:24px; overflow:auto; z-index:50;">
        <div style="background:#fff; border:1px solid #ccc; padding:16px; max-width:960px; margin:0 auto;">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
            <h2 style="margin:0;">Carrito</h2>
            <button type="button" onclick="hideCartDrawer()">Ocultar</button>
          </div>
          <p>Debes iniciar sesión como cliente para usar el carrito.</p>
          <p><a href="/auth/login.html">Ir a login</a></p>
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
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.35); padding:24px; overflow:auto; z-index:50;">
      <div style="background:#fff; border:1px solid #ccc; padding:16px; max-width:1100px; margin:0 auto;">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:12px;">
          <h2 style="margin:0;">Carrito desplegable</h2>
          <button type="button" onclick="hideCartDrawer()">Ocultar</button>
        </div>
        <p><b>Productos:</b> ${items.length}</p>
        <p><b>Subtotal USD:</b> USD ${formatAmount(subtotalUsd)}</p>
        <p><b>Subtotal Bs:</b> ${subtotalBs === null ? 'Tasa no disponible' : `Bs.S ${formatBsAmount(subtotalBs)}`}</p>
        ${state.cartLoading ? '<p>Actualizando carrito...</p>' : ''}
        ${items.length ? items.map((item) => `
          <article style="border-top:1px solid #ccc; padding-top:12px; margin-top:12px; display:flex; gap:12px; align-items:flex-start;">
            <div>
              ${item.product?.main_image_url
                ? `<img src="${item.product.main_image_url}" alt="${item.product.name}" style="width:96px; height:96px; object-fit:cover; border:1px solid #ccc;">`
                : '<div style="width:96px; height:96px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">Sin imagen</div>'}
            </div>
            <div>
              <p><b>${item.product?.name || `Producto ${item.id_product}`}</b></p>
              <p><b>SKU:</b> ${item.product?.sku || 'Sin SKU'}</p>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <span><b>Cantidad:</b> ${Number(item.quantity || 0)}</span>
                <button type="button" onclick="decreaseLandingCartItem(${item.id_product})" ${cartActionDisabled}>-</button>
                <button type="button" onclick="increaseLandingCartItem(${item.id_product})" ${cartActionDisabled}>+</button>
                <button type="button" onclick="removeLandingCartItem(${item.id_product})" ${cartActionDisabled}>Eliminar</button>
              </div>
              <p><b>Subtotal:</b> USD ${formatAmount(Number(item.quantity || 0) * Number(item.product?.price || 0))}</p>
            </div>
          </article>
        `).join('') : '<p>Tu carrito está vacío.</p>'}
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:16px;">
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
      sort: state.filters.sort
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
  renderHeader();
}

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
globalThis.markLandingNotificationAsRead = markLandingNotificationAsRead;
globalThis.markAllLandingNotificationsAsRead = markAllLandingNotificationsAsRead;
globalThis.openLandingNotification = openLandingNotification;

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