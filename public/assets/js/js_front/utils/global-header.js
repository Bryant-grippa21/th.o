(function renderGlobalHeader() {
  const path = globalThis.location?.pathname || "";
  const isLanding = path === "/" || path === "/index.html";

  if (isLanding) {
    return;
  }

  const body = globalThis.document?.body;
  if (!body || globalThis.document.getElementById("global-site-header")) {
    return;
  }

  const API_URL = "http://localhost:3000";
  const header = globalThis.document.createElement("header");
  header.id = "global-site-header";
  header.className = "site-global-header";
  body.prepend(header);

  const state = {
    session: null,
    exchangeRate: null,
    loading: true
  };

  const formatExchangeRate = (value) => Number(value || 0).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });

  const getDisplayName = (session) => {
    if (!session) {
      return "Invitado";
    }

    if (session.entity === "company") {
      return session?.data?.company?.name || session?.data?.company?.company_name || session?.data?.company?.email || "Empresa";
    }

    return session?.data?.user?.name || session?.data?.user?.email || "Cliente";
  };

  const renderAuthActions = () => {
    if (!state.session) {
      return `
        <a class="site-global-chip" href="/auth/login.html">Login</a>
        <a class="site-global-chip" href="/auth/register.html">Registro</a>
      `;
    }

    const dashboardPath = typeof globalThis.getDashboardPathFromSession === "function"
      ? globalThis.getDashboardPathFromSession(state.session)
      : "/index.html";
    const cartButton = state.session.entity === "customer"
      ? '<a class="site-global-chip" href="/modules/customer/cart.html">Carrito</a>'
      : "";

    return `
      <span class="site-global-chip site-global-chip--account">${getDisplayName(state.session)}</span>
      <a class="site-global-chip" href="${dashboardPath}">Dashboard</a>
      ${cartButton}
      <button type="button" id="site-global-logout">Cerrar sesion</button>
    `;
  };

  const render = () => {
    const rateLabel = state.exchangeRate?.rate_bs_per_usd
      ? `Bs.S ${formatExchangeRate(state.exchangeRate.rate_bs_per_usd)}`
      : "N/D";

    header.innerHTML = `
      <div class="site-global-header__inner">
        <a class="site-global-header__brand" href="/index.html" aria-label="Volver al landing">
          <img src="/uploads/default/Logo.png" alt="Logo tuherramienta.online">
        </a>

        <form id="site-global-search-form" class="site-global-header__search" role="search">
          <input id="site-global-search-input" type="search" placeholder="Buscar productos, lineas o categorias..." autocomplete="off">
          <button type="submit" aria-label="Buscar">Buscar</button>
        </form>

        <div class="site-global-header__meta">
          <span class="site-global-chip">Tasa: ${rateLabel}</span>
          ${renderAuthActions()}
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

    const logoutButton = globalThis.document.getElementById("site-global-logout");
    if (logoutButton && typeof globalThis.logout === "function") {
      logoutButton.addEventListener("click", () => {
        globalThis.logout();
      });
    }
  };

  const loadSession = async () => {
    if (!globalThis.isLogged?.()) {
      state.session = null;
      return;
    }

    try {
      if (typeof globalThis.fetchCurrentSession === "function") {
        state.session = await globalThis.fetchCurrentSession();
      }
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

  Promise.all([loadSession(), loadExchangeRate()])
    .finally(() => {
      state.loading = false;
      render();
    });
})();
