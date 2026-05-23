const adminCustomerSummary = document.getElementById('admin-customer-summary');
const adminCustomerList = document.getElementById('admin-customer-list');
const adminCompanySummary = document.getElementById('admin-company-summary');
const adminCompanyList = document.getElementById('admin-company-list');
const adminExchangeSummary = document.getElementById('admin-exchange-summary');
const adminExchangeForm = document.getElementById('admin-exchange-form');
const adminExchangeRateInput = document.getElementById('admin-exchange-rate-input');
const adminExchangeMessage = document.getElementById('admin-exchange-message');
const adminExchangeList = document.getElementById('admin-exchange-list');
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
const adminProductStockHistory = document.getElementById('admin-product-stock-history');
const adminProductStockHistoryPagination = document.getElementById('admin-product-stock-history-pagination');
const productFilterCategory = document.getElementById('product-filter-category');
const productFilterSubcategory = document.getElementById('product-filter-subcategory');
const productFilterLine = document.getElementById('product-filter-line');
const adminModules = {
  customers: document.getElementById('admin-module-customers'),
  companies: document.getElementById('admin-module-companies'),
  exchange: document.getElementById('admin-module-exchange'),
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
  activeModule: 'customers',
  activeProductSubmenu: 'list',
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
  }
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

const showAdminModule = (moduleName) => {
  state.activeModule = moduleName;

  Object.entries(adminModules).forEach(([key, element]) => {
    element.hidden = key !== moduleName;
  });

  if (moduleName === 'products') {
    showProductSubmenu(state.activeProductSubmenu);
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
  productFilterCategory.innerHTML = ['<option value="">Todas las categorias</option>']
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

  productFilterSubcategory.innerHTML = ['<option value="">Todas las subcategorias</option>']
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

  productFilterLine.innerHTML = ['<option value="">Todas las lineas</option>']
    .concat(availableLines.map((line) => (
      `<option value="${line.id_line}">${line.category_name} / ${line.subcategory_name} / ${line.name}</option>`
    )))
    .join('');
};

function handleProductCategoryChange() {
  renderProductSubcategoryOptions();
  productFilterSubcategory.value = '';
  renderProductLineOptions();
}

function handleProductSubcategoryChange() {
  renderProductLineOptions();
  productFilterLine.value = '';
}

const summarizeCustomers = (customers) => {
  const total = customers.length;
  const active = customers.filter((customer) => customer.is_active).length;
  const blocked = customers.filter((customer) => !customer.is_active).length;
  const googleUsers = customers.filter((customer) => customer.auth_provider === 'google').length;
  const bothUsers = customers.filter((customer) => customer.auth_provider === 'both').length;

  adminCustomerSummary.innerHTML = `
    <p>Total customers: <b>${total}</b></p>
    <p>Activos: <b>${active}</b></p>
    <p>Bloqueados: <b>${blocked}</b></p>
    <p>Google: <b>${googleUsers}</b></p>
    <p>Both: <b>${bothUsers}</b></p>
  `;
};

const renderCustomers = (customers) => {
  if (!customers.length) {
    adminCustomerList.innerHTML = '<p>No hay customers registrados.</p>';
    return;
  }

  adminCustomerList.innerHTML = customers.map((customer) => `
    <div data-customer-id="${customer.id_customer}">
      <p><b>${customer.name}</b></p>
      <p>Email actual: ${customer.email}</p>
      <p>Proveedor auth: ${customer.auth_provider}</p>
      <p>Estado: ${customer.is_active ? 'Activo' : 'Bloqueado'}</p>
      <p>Intentos fallidos: ${customer.attempts}</p>
      <label>
        Nombre
        <input id="customer-name-${customer.id_customer}" value="${customer.name}">
      </label>
      <br>
      <label>
        Email
        <input id="customer-email-${customer.id_customer}" value="${customer.email}">
      </label>
      <br>
      <label>
        Nueva contraseña
        <input id="customer-password-${customer.id_customer}" type="password" placeholder="Nueva contraseña">
      </label>
      <br><br>
      <button onclick="updateCustomerBasic(${customer.id_customer})">Actualizar información</button>
      <button onclick="resetCustomerAttempts(${customer.id_customer})">Reiniciar intentos</button>
      <button onclick="updateCustomerPassword(${customer.id_customer})">Actualizar contraseña</button>
      <button onclick="toggleCustomerStatus(${customer.id_customer}, ${customer.is_active ? 'false' : 'true'})">
        ${customer.is_active ? 'Bloquear' : 'Desbloquear'}
      </button>
      <hr>
    </div>
  `).join('');
};

const filterCustomers = () => {
  const nameFilter = normalizeFilterValue(document.getElementById('customer-filter-name').value);
  const emailFilter = normalizeFilterValue(document.getElementById('customer-filter-email').value);

  const filteredCustomers = state.customers.filter((customer) => {
    const matchesName = matchesFilter(customer.name, nameFilter);
    const matchesEmail = matchesFilter(customer.email, emailFilter);

    return matchesName && matchesEmail;
  });

  summarizeCustomers(filteredCustomers);
  renderCustomers(filteredCustomers);
};

function applyCustomerFilters() {
  filterCustomers();
}

function resetCustomerFilters() {
  document.getElementById('customer-filter-name').value = '';
  document.getElementById('customer-filter-email').value = '';
  filterCustomers();
}

const summarizeCompanies = (companies) => {
  const total = companies.length;
  const active = companies.filter((company) => company.is_active).length;
  const inactive = companies.filter((company) => !company.is_active).length;
  const admins = companies.filter((company) => company.id_role_fk === 1 || company.role_name === 'ADMIN').length;
  const blockedByAttempts = companies.filter((company) => (company.attempts ?? 0) > 0).length;

  adminCompanySummary.innerHTML = `
    <p>Total empresas: <b>${total}</b></p>
    <p>Activas: <b>${active}</b></p>
    <p>Inactivas: <b>${inactive}</b></p>
    <p>Admins: <b>${admins}</b></p>
    <p>Con intentos acumulados: <b>${blockedByAttempts}</b></p>
  `;
};

const renderCompanies = (companies) => {
  if (!companies.length) {
    adminCompanyList.innerHTML = '<p>No hay empresas registradas.</p>';
    return;
  }

  adminCompanyList.innerHTML = companies.map((company) => `
    <div data-company-id="${company.id_company}">
      <p><b>${company.name}</b>${company.id_role_fk === 1 || company.role_name === 'ADMIN' ? ' (ADMIN)' : ''}</p>
      <p>RIF actual: ${company.rif}</p>
      <p>Email actual: ${company.email}</p>
      <p>Rol: ${company.role_name || company.id_role_fk}</p>
      <p>Estado: ${company.is_active ? 'Activa' : 'Inactiva'}</p>
      <p>Intentos fallidos: ${company.attempts}</p>
      ${company.id_role_fk === 1 || company.role_name === 'ADMIN' ? '' : `
      <label>
        Nuevo rol
        <select id="company-role-${company.id_company}">
          ${state.companyRoles.map((role) => `
            <option value="${role.id_role}" ${role.id_role === company.id_role_fk ? 'selected' : ''}>${role.name}</option>
          `).join('')}
        </select>
      </label>
      <br>`}
      <label>
        Nueva contraseña
        <input id="company-password-${company.id_company}" type="password" placeholder="Nueva contraseña">
      </label>
      <br><br>
      ${company.id_role_fk === 1 || company.role_name === 'ADMIN' ? '' : `<button onclick="updateCompanyRole(${company.id_company})">Actualizar rol</button>`}
      <button onclick="resetCompanyAttempts(${company.id_company})">Reiniciar intentos</button>
      <button onclick="updateCompanyPassword(${company.id_company})">Actualizar contraseña</button>
      <button onclick="toggleCompanyStatus(${company.id_company}, ${company.is_active ? 'false' : 'true'})">
        ${company.is_active ? 'Desactivar' : 'Activar'}
      </button>
      <hr>
    </div>
  `).join('');
};

const filterCompanies = () => {
  const nameFilter = normalizeFilterValue(document.getElementById('company-filter-name').value);
  const documentFilter = normalizeFilterValue(document.getElementById('company-filter-document').value);
  const emailFilter = normalizeFilterValue(document.getElementById('company-filter-email').value);

  const filteredCompanies = state.companies.filter((company) => {
    const matchesName = matchesFilter(company.name, nameFilter);
    const matchesDocument = matchesFilter(company.rif, documentFilter);
    const matchesEmail = matchesFilter(company.email, emailFilter);

    return matchesName && matchesDocument && matchesEmail;
  });

  summarizeCompanies(filteredCompanies);
  renderCompanies(filteredCompanies);
};

function applyCompanyFilters() {
  filterCompanies();
}

function resetCompanyFilters() {
  document.getElementById('company-filter-name').value = '';
  document.getElementById('company-filter-document').value = '';
  document.getElementById('company-filter-email').value = '';
  filterCompanies();
}

const summarizeProducts = (pagination) => {
  adminProductSummary.innerHTML = `
    <p>Total productos: <b>${pagination.total}</b></p>
    <p>Pagina actual: <b>${pagination.page}</b> de <b>${pagination.total_pages}</b></p>
    <p>Mostrando hasta <b>${pagination.limit}</b> productos por pagina.</p>
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
  } catch (error) {
    adminExchangeSummary.innerHTML = `<p>${error.message}</p>`;
    adminExchangeList.innerHTML = `<p>${error.message}</p>`;
  }
};

const renderProducts = (products) => {
  if (!products.length) {
    adminProductList.innerHTML = '<p>No hay productos para los filtros actuales.</p>';
    return;
  }

  adminProductList.innerHTML = products.map((product) => `
    <div style="display:flex; gap:16px; align-items:flex-start; margin-bottom:16px; border-bottom:1px solid #ccc; padding-bottom:16px;">
      <div>
        ${product.main_image_url
      ? `<img src="${product.main_image_url}" alt="${product.line_name}" style="width:96px; height:96px; object-fit:cover; border:1px solid #ccc;">`
    : '<div style="width:96px; height:96px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">Sin imagen</div>'}
      </div>
      <div>
        <p><b>${product.name || 'Sin nombre'}</b></p>
        <p>SKU: ${product.sku}</p>
        <p>Empresa: ${product.company_name}</p>
        <p>Categoria: ${product.category_name}</p>
        <p>Subcategoria: ${product.subcategory_name}</p>
        <p>Linea: ${product.line_name}</p>
        <p>Marca: ${product.brand || 'Sin marca'}</p>
        <p>Precio: ${product.price}</p>
        <p>Estado producto: ${product.is_active ? 'Activo' : 'Inactivo'}</p>
        <p>Estado linea: ${product.line_is_active ? 'Activa' : 'Inactiva'}</p>
        <p>Stock actual: ${product.quantity ?? 0}</p>
        <p>Stock mínimo: ${product.min_stock ?? 0}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">
          <button type="button" onclick="editAdminProduct(${product.id_product})">Editar</button>
          <button type="button" onclick="toggleAdminProductStatus(${product.id_product}, ${product.id_company}, ${product.is_active})">${product.is_active ? 'Desactivar' : 'Activar'}</button>
          <button type="button" onclick="adjustAdminProductStock(${product.id_product}, ${product.id_company}, 'increase')">+ Stock</button>
          <button type="button" onclick="adjustAdminProductStock(${product.id_product}, ${product.id_company}, 'decrease')">- Stock</button>
          <button type="button" onclick="adjustAdminProductStock(${product.id_product}, ${product.id_company}, 'set')">Sincronizar stock</button>
        </div>
      </div>
    </div>
  `).join('');
};

const renderAdminCurrentImages = (product) => {
  const images = Array.isArray(product.images) ? product.images : [];

  if (!images.length) {
    adminEditProductImages.innerHTML = '<p>Sin imágenes guardadas.</p>';
    return;
  }

  adminEditProductImages.innerHTML = `
    <p><b>Imágenes guardadas</b></p>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      ${images.map((image, index) => `
        <div style="display:flex; flex-direction:column; gap:6px; max-width:160px;">
          <img src="${image.image_url}" alt="${product.name} imagen ${index + 1}" style="width:120px; height:120px; object-fit:cover; border:1px solid #ccc;">
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
  adminEditProductMainImagePreview.innerHTML = `<img src="${state.productEditor.mainPreviewUrl}" alt="preview" style="width:140px; height:140px; object-fit:cover; border:1px solid #ccc;">`;
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
  adminEditProductSecondaryImagesPreview.innerHTML = files.map((file, index) => `
    <img src="${state.productEditor.secondaryPreviewUrls[index]}" alt="${file.name}" style="width:80px; height:80px; object-fit:cover; border:1px solid #ccc; margin-right:8px;">
  `).join('');
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

  const name = document.getElementById('product-filter-name').value.trim();
  const company = document.getElementById('product-filter-company').value.trim();
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
          throw new Error(data.error || 'No se pudieron cargar las categorias');
        }

        state.productCategories = data.categories || [];
      }),
    fetch(`${API_BASE_URL}/api/products/management/subcategories`, {
      headers: getAuthHeaders()
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar las subcategorias');
        }

        state.productSubcategories = data.subcategories || [];
      }),
    fetch(`${API_BASE_URL}/api/products/management/lines`, {
      headers: getAuthHeaders()
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar las lineas');
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
  document.getElementById('product-filter-name').value = '';
  document.getElementById('product-filter-company').value = '';
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
  fetch(`${API_BASE_URL}/api/auth/admin/customers`, {
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
    })
    .catch((error) => {
      adminCustomerSummary.innerHTML = `<p>${error.message}</p>`;
      adminCustomerList.innerHTML = `<p>${error.message}</p>`;
    });
};

const loadCompanies = () => {
  fetch(`${API_BASE_URL}/api/company-auth/admin/companies`, {
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
      const companies = data.companies || [];
      const sessionCompanyId = Number(localStorage.getItem('session_company_id') || 0);
      const sessionCompanyName = localStorage.getItem('session_company_name') || '';

      if (
        sessionCompanyId > 0 &&
        sessionCompanyName &&
        !companies.some((company) => company.id_company === sessionCompanyId)
      ) {
        companies.unshift({
          id_company: sessionCompanyId,
          name: sessionCompanyName,
          rif: 'Actualiza desde BD',
          email: 'Actualiza desde BD',
          id_role_fk: 1,
          role_name: 'ADMIN',
          is_active: true,
          attempts: 0,
          can_buy: true,
          can_sell: true,
          cell_phone: '',
          mail_address: '',
          created_at: null,
          updated_at: null
        });
      }

      state.companies = companies;
      filterCompanies();
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

function updateCustomerBasic(customerId) {
  const name = document.getElementById(`customer-name-${customerId}`).value.trim();
  const email = document.getElementById(`customer-email-${customerId}`).value.trim();

  fetch(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/basic`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ name, email })
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el customer');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      loadCustomers();
    })
    .catch((error) => {
      alert(error.message);
    });
}

function toggleCustomerStatus(customerId, isActive) {
  fetch(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ is_active: isActive })
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el estado');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      loadCustomers();
    })
    .catch((error) => {
      alert(error.message);
    });
}

function resetCustomerAttempts(customerId) {
  fetch(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/attempts/reset`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron reiniciar los intentos');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      loadCustomers();
    })
    .catch((error) => {
      alert(error.message);
    });
}

function updateCustomerPassword(customerId) {
  const password = document.getElementById(`customer-password-${customerId}`).value.trim();

  fetch(`${API_BASE_URL}/api/auth/admin/customers/${customerId}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ password })
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar la contraseña');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      document.getElementById(`customer-password-${customerId}`).value = '';
      loadCustomers();
    })
    .catch((error) => {
      alert(error.message);
    });
}

function updateCompanyRole(companyId) {
  const role_id = Number(document.getElementById(`company-role-${companyId}`).value);

  fetch(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ role_id })
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el rol de la empresa');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      loadCompanies();
    })
    .catch((error) => {
      alert(error.message);
    });
}

function toggleCompanyStatus(companyId, isActive) {
  fetch(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ is_active: isActive })
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el estado de la empresa');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      loadCompanies();
    })
    .catch((error) => {
      alert(error.message);
    });
}

function resetCompanyAttempts(companyId) {
  fetch(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/attempts/reset`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron reiniciar los intentos de empresa');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      loadCompanies();
    })
    .catch((error) => {
      alert(error.message);
    });
}

function updateCompanyPassword(companyId) {
  const password = document.getElementById(`company-password-${companyId}`).value.trim();

  fetch(`${API_BASE_URL}/api/company-auth/admin/companies/${companyId}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ password })
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar la contraseña de empresa');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
      document.getElementById(`company-password-${companyId}`).value = '';
      loadCompanies();
    })
    .catch((error) => {
      alert(error.message);
    });
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
adminProductEditorForm.addEventListener('submit', handleAdminProductEditorSubmit);
adminEditProductCancel.addEventListener('click', hideAdminProductEditor);
adminEditProductMainImage.addEventListener('change', renderAdminMainPreview);
adminEditProductSecondaryImages.addEventListener('change', renderAdminSecondaryPreview);
window.addEventListener('beforeunload', revokeAdminPreviewUrls);

fetch(`${API_BASE_URL}/api/company-auth/me`, {
  headers: getAuthHeaders()
})
  .then(async (res) => {
    const data = await res.json();

    if (!res.ok || data.company?.id_role_fk !== 1) {
      throw new Error(data.error || 'Acceso solo para admin');
    }

    localStorage.setItem('session_company_id', String(data.company.id_company));
    localStorage.setItem('session_company_name', data.company.name || data.company.company_name || 'Admin');

    return data;
  })
  .then(async () => {
    showAdminModule(state.activeModule);
    showProductSubmenu(state.activeProductSubmenu);
    hideAdminProductEditor();
    await loadCompanyRoles();
    await loadExchangeRates();
    await loadProductFilters();
    loadCustomers();
    loadCompanies();
    loadProducts();
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });
