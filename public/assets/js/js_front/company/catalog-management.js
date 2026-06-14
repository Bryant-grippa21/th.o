const ROLE_RETAILER = 3;

const summaryElement = document.getElementById('company-wholesale-summary');
const feedbackElement = document.getElementById('company-wholesale-feedback');
const productsListElement = document.getElementById('company-wholesale-products-list');
const searchInputElement = document.getElementById('company-wholesale-search');
const sortSelectElement = document.getElementById('company-wholesale-sort');
const categorySelectElement = document.getElementById('company-wholesale-category');
const prevPageButton = document.getElementById('company-wholesale-prev-page');
const nextPageButton = document.getElementById('company-wholesale-next-page');
const pageLabelElement = document.getElementById('company-wholesale-page-label');

const state = {
  session: null,
  products: [],
  categories: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  },
  filters: {
    query: '',
    sort: 'recent',
    categoryId: ''
  }
};

let searchDebounceId = null;

if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders()
    }
  });
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();
  const data = contentType.includes('application/json') ? JSON.parse(rawBody || '{}') : null;

  if (!response.ok) {
    throw new Error(data?.error || `Error en la solicitud (${response.status})`);
  }

  return data || {};
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

const setFeedback = (message, type = 'info') => {
  feedbackElement.textContent = message || '';
  feedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const renderSummary = () => {
  const companyName = state.session?.data?.company?.name || state.session?.data?.company?.email || 'Empresa';
  summaryElement.innerHTML = `
    Empresa: <b>${companyName}</b> |
    Productos visibles: <b>${state.products.length}</b> |
    Total: <b>${state.pagination.total}</b> |
    Página: <b>${state.pagination.page} / ${state.pagination.total_pages}</b>
  `;

  if (pageLabelElement) {
    pageLabelElement.textContent = `Página ${state.pagination.page} de ${state.pagination.total_pages}`;
  }

  if (prevPageButton) {
    prevPageButton.disabled = state.pagination.page <= 1;
  }

  if (nextPageButton) {
    nextPageButton.disabled = state.pagination.page >= state.pagination.total_pages;
  }
};

const renderCategoryOptions = () => {
  if (!categorySelectElement) {
    return;
  }

  const options = ['<option value="">Todas las categorías</option>']
    .concat(state.categories.map((category) => (
      `<option value="${category.id_category}">${category.name}</option>`
    )));

  categorySelectElement.innerHTML = options.join('');
  categorySelectElement.value = state.filters.categoryId;
};

const renderProducts = () => {
  if (!state.products.length) {
    productsListElement.innerHTML = '<p>No hay productos mayoristas para este filtro.</p>';
    return;
  }

  productsListElement.innerHTML = `
    <div class="company-wholesale-grid">
      ${state.products.map((product) => `
        <article class="company-wholesale-card">
          <div class="company-wholesale-card__media">
            ${product.image_url
              ? `<img src="${product.image_url}" alt="${product.name || 'Producto'}">`
              : '<div class="company-wholesale-card__media-placeholder">Sin imagen</div>'}
          </div>

          <div class="company-wholesale-card__body">
            <h3>${product.name || 'Sin nombre'}</h3>
            <p class="company-wholesale-card__seller">Mayorista: ${product.company_name || `Empresa #${product.id_company_fk}`}</p>
            <p class="company-wholesale-card__stock">Stock: ${Number(product.quantity || 0)}</p>
            <p class="company-wholesale-card__price">USD ${formatAmount(product.price)}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;
};

const buildQueryParams = () => {
  const queryParams = new URLSearchParams();

  queryParams.set('page', String(state.pagination.page));
  queryParams.set('limit', String(state.pagination.limit));
  queryParams.set('sort', state.filters.sort);

  if (state.filters.categoryId) {
    queryParams.set('category_id', state.filters.categoryId);
  }

  if (state.filters.query) {
    queryParams.set('q', state.filters.query);
  }

  return queryParams.toString();
};

const loadWholesaleCatalog = async () => {
  const queryString = buildQueryParams();
  const response = await requestJson(`${API_BASE_URL}/api/products/company/wholesale-catalog?${queryString}`);

  state.products = Array.isArray(response.products) ? response.products : [];
  state.pagination = response.pagination || state.pagination;

  renderSummary();
  renderProducts();
};

const loadCategories = async () => {
  const response = await requestJson(`${API_BASE_URL}/api/products/categories`);
  state.categories = Array.isArray(response.categories) ? response.categories : [];
  renderCategoryOptions();
};

const changePage = (delta) => {
  const nextPage = state.pagination.page + delta;

  if (nextPage < 1 || nextPage > state.pagination.total_pages) {
    return;
  }

  state.pagination.page = nextPage;
  loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
};

const handleSearchInput = (event) => {
  state.filters.query = String(event.target.value || '').trim();
  state.pagination.page = 1;

  if (searchDebounceId) {
    clearTimeout(searchDebounceId);
  }

  searchDebounceId = setTimeout(() => {
    loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
  }, 250);
};

const handleSortChange = (event) => {
  state.filters.sort = String(event.target.value || 'recent');
  state.pagination.page = 1;
  loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
};

const handleCategoryChange = (event) => {
  state.filters.categoryId = String(event.target.value || '');
  state.pagination.page = 1;
  loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
};

searchInputElement?.addEventListener('input', handleSearchInput);
sortSelectElement?.addEventListener('change', handleSortChange);
categorySelectElement?.addEventListener('change', handleCategoryChange);
prevPageButton?.addEventListener('click', () => changePage(-1));
nextPageButton?.addEventListener('click', () => changePage(1));

fetchCurrentSession()
  .then(async (session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesión no válida para empresa');
    }

    const company = session.data.company || {};
    const roleId = Number(company.id_role_fk || company.id_role || 0);

    if (roleId !== ROLE_RETAILER) {
      throw new Error('Acceso solo para detallista');
    }

    if (company.verification_status !== 'APPROVED' || !company.can_buy) {
      throw new Error('Tu empresa debe estar aprobada y con permiso de compra para ver este catálogo');
    }

    state.session = session;
    await loadCategories();
    await loadWholesaleCatalog();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
