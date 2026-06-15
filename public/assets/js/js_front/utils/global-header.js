(function renderGlobalHeader() {
  const body = globalThis.document?.body;
  if (!body || globalThis.document.getElementById("global-site-header")) {
    return;
  }

  const API_URL = "http://localhost:3000";
  const token = localStorage.getItem("token");
  const storedEntity = localStorage.getItem("auth_entity");

  const isLoggedSafe = () => {
    if (typeof isLogged === "function") {
      return isLogged();
    }

    return Boolean(localStorage.getItem("token"));
  };

  const getAuthHeadersSafe = () => {
    if (typeof getAuthHeaders === "function") {
      return getAuthHeaders();
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCurrentSessionSafe = async () => {
    if (typeof fetchCurrentSession === "function") {
      return fetchCurrentSession();
    }

    if (!token) {
      throw new Error("Sesión requerida");
    }

    const meEndpoint = storedEntity === "company"
      ? `${API_URL}/api/company-auth/me`
      : `${API_URL}/api/auth/me`;
    const response = await globalThis.fetch(meEndpoint, {
      headers: getAuthHeadersSafe()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo validar la sesión");
    }

    return storedEntity === "company"
      ? { entity: "company", data }
      : { entity: "customer", data };
  };
  const header = globalThis.document.createElement("header");
  header.id = "global-site-header";
  header.className = "site-global-header";
  body.prepend(header);

  const state = {
    session: null,
    exchangeRate: null,
    cashback: null,
    notifications: null,
    notificationsLoading: false,
    notificationOpen: false,
    accountMenuOpen: false,
    loading: true
  };

  const formatExchangeRate = (value) => Number(value || 0).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });

  const getCompanyRoleLabel = (roleId) => {
    if (roleId === 1) {
      return "Administrador";
    }

    if (roleId === 2) {
      return "Distribuidora";
    }

    if (roleId === 3) {
      return "Ferreteria";
    }

    return "Empresa";
  };

  const renderAuthActions = () => {
    if (!state.session) {
      return `
        <div class="landing-header-actions">
          <span class="landing-chip landing-chip--stack landing-chip--muted"><small>Sesión</small><b>Invitado</b></span>
          <a class="landing-chip landing-chip--cta" href="/auth/login.html">Iniciar sesión</a>
          <a class="landing-chip landing-chip--outline" href="/auth/register.html">Registrarse</a>
        </div>
      `;
    }

    const accountValue = state.session.entity === "company"
      ? getCompanyRoleLabel(Number(state.session?.data?.company?.id_role_fk || 0))
      : (state.session?.data?.user?.name || state.session?.data?.user?.email || "Cliente");
    const unreadCount = Number(state.notifications?.unread_count || 0);
    const unreadLabel = unreadCount > 0 ? ` (${unreadCount})` : "";
    const cashbackChip = state.session.entity === "customer"
      ? `<span class="landing-chip landing-chip--stack"><small>Cashback disponible</small><b>USD ${Number(state.cashback?.value || 0).toFixed(2)}</b></span>`
      : "";

    return `
      <div class="landing-header-actions">
        <div class="landing-account-dropdown">
          <button class="landing-chip landing-chip--stack landing-chip--account landing-account-trigger" type="button" onclick="toggleGlobalHeaderAccountMenu()" aria-expanded="${state.accountMenuOpen ? "true" : "false"}"><small>Mi cuenta</small><b>${accountValue}</b></button>
        ${state.accountMenuOpen
          ? `<div class="landing-account-menu">
              <button type="button" onclick="openGlobalHeaderDashboard()">Mi cuenta (dashboard)</button>
              <button type="button" onclick="openGlobalHeaderNotifications()">Mis notificaciones${unreadLabel}</button>
              <button type="button" onclick="openGlobalHeaderLogout()">Cerrar sesión</button>
            </div>`
          : ""}
        </div>
        ${cashbackChip}
      </div>
    `;
  };

  const formatNotificationDate = (value) => {
    if (!value) {
      return "Sin fecha";
    }

    return new Date(value).toLocaleString("es-VE");
  };

  const renderNotificationsPanel = () => {
    if (!state.session || !state.notificationOpen) {
      return "";
    }

    const notifications = Array.isArray(state.notifications?.items) ? state.notifications.items : [];
    const markAllDisabled = notifications.length ? "" : "disabled";
    const loadingMessage = state.notificationsLoading ? "<p>Cargando notificaciones...</p>" : "";
    const emptyMessage = !state.notificationsLoading && !notifications.length
      ? "<p>No tienes notificaciones pendientes.</p>"
      : "";

    return `
      <div class="landing-notifications-panel">
        <div class="landing-notifications-panel__header">
          <p class="landing-notifications-panel__title"><b>Notificaciones</b></p>
          <button type="button" onclick="markAllGlobalHeaderNotificationsAsRead()" ${markAllDisabled}>Marcar todas</button>
        </div>
        ${loadingMessage}
        ${emptyMessage}
        ${notifications.map((notification) => `
          <article class="landing-notification-item">
            <p class="landing-notification-item__title"><b>${notification.title || "Notificacion"}</b>${notification.is_read ? " (leida)" : ""}</p>
            <p class="landing-notification-item__message">${notification.message || ""}</p>
            <p class="landing-notification-item__date"><small>${formatNotificationDate(notification.created_at)}</small></p>
            <div class="landing-notification-item__actions">
              <button type="button" onclick="markGlobalHeaderNotificationAsRead('${encodeURIComponent(notification.id)}')" ${notification.is_read ? "disabled" : ""}>Marcar leida</button>
              <button type="button" onclick="openGlobalHeaderNotification('${encodeURIComponent(notification.id)}', '${encodeURIComponent(notification.action_path || "")}')">Abrir</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  };

  const render = () => {
    const rateLabel = state.exchangeRate?.rate_bs_per_usd
      ? `Bs.S ${formatExchangeRate(state.exchangeRate.rate_bs_per_usd)}`
      : "N/D";
    const cartChip = state.session?.entity === "customer"
      ? '<a class="landing-chip landing-chip--cart" href="/modules/customer/cart.html">Carrito</a>'
      : "";
    const unreadCount = Number(state.notifications?.unread_count || 0);
    const unreadBadge = unreadCount > 0
      ? `<span class="site-global-notifications-badge">${unreadCount}</span>`
      : "";
    const notificationsExpanded = state.notificationOpen ? "true" : "false";
    const notificationsChip = state.session
      ? `<button class="landing-chip landing-chip--notifications" type="button" onclick="toggleGlobalHeaderNotifications()" aria-expanded="${notificationsExpanded}">Notificaciones${unreadBadge}</button>`
      : "";

    header.innerHTML = `
      <div class="site-global-header__inner landing-topbar">
        <div class="site-global-header__left">
          <a class="site-global-header__brand landing-header-logo" href="/index.html" aria-label="Volver al landing">
            <img src="/uploads/default/logo_full.png" alt="Logo tuherramienta.online">
          </a>

          <form id="site-global-search-form" class="site-global-header__search landing-header-search-form" role="search">
            <span class="site-global-search-scope-label landing-search-scope-label" aria-hidden="true">Todo</span>
            <input id="site-global-search-input" type="search" placeholder="Buscar productos, líneas o categorías..." autocomplete="off">
            <button type="submit" aria-label="Buscar">&#128269;</button>
          </form>
        </div>

        <div class="site-global-header__right">
          <div class="site-global-header__meta landing-header-actions">
            <span class="landing-chip landing-chip--stack"><small>Tasa del día</small><b>${rateLabel}</b></span>
            ${renderAuthActions()}
            ${notificationsChip}
            ${cartChip}
          </div>
          ${renderNotificationsPanel()}
        </div>
      </div>
    `;

    const searchForm = globalThis.document.getElementById("site-global-search-form");
    const searchInput = globalThis.document.getElementById("site-global-search-input");
    if (searchForm && searchInput) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const q = String(searchInput.value || "").trim();
        const qs = q ? `?q=${encodeURIComponent(q)}` : "";
        globalThis.location.href = `/index.html${qs}`;
      });
    }

  };

  const loadSession = async () => {
    if (!isLoggedSafe()) {
      state.session = null;
      return;
    }

    try {
      state.session = await fetchCurrentSessionSafe();
    } catch {
      state.session = null;
    }
  };

  const loadExchangeRate = async () => {
    try {
      const response = await globalThis.fetch(`${API_URL}/api/exchange-rate/latest`);
      const data = await response.json();
      if (response.ok) {
        state.exchangeRate = data.exchange_rate || null;
      }
    } catch {
      state.exchangeRate = null;
    }
  };

  const loadCashback = async () => {
    if (state.session?.entity !== "customer") {
      state.cashback = null;
      return;
    }

    try {
      const response = await globalThis.fetch(`${API_URL}/api/auth/cashback`, {
        headers: {
          ...getAuthHeadersSafe()
        }
      });
      const data = await response.json();

      if (response.ok) {
        state.cashback = data.cashback || null;
      }
    } catch {
      state.cashback = null;
    }
  };

  const loadNotifications = async () => {
    if (!state.session) {
      state.notifications = null;
      state.notificationsLoading = false;
      return;
    }

    state.notificationsLoading = true;

    try {
      const response = await globalThis.fetch(`${API_URL}/api/notifications`, {
        headers: {
          ...getAuthHeadersSafe()
        }
      });
      const data = await response.json();

      if (response.ok) {
        state.notifications = data.notifications || { items: [], unread_count: 0 };
      } else {
        state.notifications = { items: [], unread_count: 0 };
      }
    } catch {
      state.notifications = { items: [], unread_count: 0 };
    } finally {
      state.notificationsLoading = false;
    }
  };

  globalThis.toggleGlobalHeaderAccountMenu = () => {
    if (!state.session) {
      return;
    }

    state.accountMenuOpen = !state.accountMenuOpen;
    render();
  };

  globalThis.openGlobalHeaderDashboard = () => {
    state.accountMenuOpen = false;
    const dashboardPath = typeof getDashboardPathFromSession === "function"
      ? getDashboardPathFromSession(state.session)
      : "/index.html";
    globalThis.location.href = dashboardPath;
  };

  globalThis.openGlobalHeaderNotifications = () => {
    state.accountMenuOpen = false;
    state.notificationOpen = true;
    render();
  };

  globalThis.openGlobalHeaderLogout = () => {
    state.accountMenuOpen = false;
    if (typeof logout === "function") {
      logout();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("auth_entity");
    globalThis.location.href = "/index.html";
  };

  globalThis.toggleGlobalHeaderNotifications = () => {
    if (!state.session) {
      return;
    }

    state.notificationOpen = !state.notificationOpen;
    state.accountMenuOpen = false;
    render();
  };

  globalThis.markGlobalHeaderNotificationAsRead = async (encodedNotificationId) => {
    if (!state.session) {
      return;
    }

    try {
      const notificationId = decodeURIComponent(encodedNotificationId);
      const response = await globalThis.fetch(`${API_URL}/api/notifications/${encodeURIComponent(notificationId)}/read`, {
        method: "PUT",
        headers: {
          ...getAuthHeadersSafe()
        }
      });
      const data = await response.json();

      if (response.ok) {
        state.notifications = data.notifications || state.notifications;
      }
    } catch {
      return;
    }

    render();
  };

  globalThis.markAllGlobalHeaderNotificationsAsRead = async () => {
    if (!state.session) {
      return;
    }

    try {
      const response = await globalThis.fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          ...getAuthHeadersSafe()
        }
      });
      const data = await response.json();

      if (response.ok) {
        state.notifications = data.notifications || state.notifications;
      }
    } catch {
      return;
    }

    render();
  };

  globalThis.openGlobalHeaderNotification = async (encodedNotificationId, encodedActionPath) => {
    await globalThis.markGlobalHeaderNotificationAsRead(encodedNotificationId);
    state.notificationOpen = false;

    const actionPath = decodeURIComponent(encodedActionPath || "");

    if (actionPath) {
      globalThis.location.href = actionPath;
      return;
    }

    render();
  };

  const closeGlobalHeaderMenu = () => {
    if (!state.accountMenuOpen && !state.notificationOpen) {
      return;
    }

    state.accountMenuOpen = false;
    state.notificationOpen = false;
    render();
  };

  const handleGlobalHeaderDocumentClick = (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (
      event.target.closest(".landing-account-dropdown")
      || event.target.closest(".landing-notifications-panel")
      || event.target.closest(".landing-chip--notifications")
    ) {
      return;
    }

    closeGlobalHeaderMenu();
  };

  const handleGlobalHeaderDocumentKeydown = (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeGlobalHeaderMenu();
  };

  globalThis.document.addEventListener("click", handleGlobalHeaderDocumentClick);
  globalThis.document.addEventListener("keydown", handleGlobalHeaderDocumentKeydown);

  Promise.all([loadSession(), loadExchangeRate()])
    .then(async () => {
      await loadCashback();
      await loadNotifications();
    })
    .finally(() => {
      state.loading = false;
      render();
    });
})();
