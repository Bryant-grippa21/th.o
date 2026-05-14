const adminCustomerSummary = document.getElementById('admin-customer-summary');
const adminCustomerList = document.getElementById('admin-customer-list');
const adminCompanySummary = document.getElementById('admin-company-summary');
const adminCompanyList = document.getElementById('admin-company-list');
const adminProductSummary = document.getElementById('admin-product-summary');
const adminProductList = document.getElementById('admin-product-list');
const adminProductPagination = document.getElementById('admin-product-pagination');
const productFilterCategory = document.getElementById('product-filter-category');
const productFilterSubcategory = document.getElementById('product-filter-subcategory');
const productFilterLine = document.getElementById('product-filter-line');
const adminModules = {
  customers: document.getElementById('admin-module-customers'),
  companies: document.getElementById('admin-module-companies'),
  products: document.getElementById('admin-module-products')
};
const adminProductSubmenus = {
  list: document.getElementById('admin-product-submenu-list')
};
const state = {
  companyRoles: [],
  customers: [],
  companies: [],
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
  }
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
        <p><b>${product.line_name}</b></p>
        <p>SKU: ${product.sku}</p>
        <p>Empresa: ${product.company_name}</p>
        <p>Categoria: ${product.category_name}</p>
        <p>Subcategoria: ${product.subcategory_name}</p>
        <p>Linea: ${product.line_name}</p>
        <p>Marca: ${product.brand || 'Sin marca'}</p>
        <p>Precio: ${product.price}</p>
        <p>Estado producto: ${product.is_active ? 'Activo' : 'Inactivo'}</p>
        <p>Estado linea: ${product.line_is_active ? 'Activa' : 'Inactiva'}</p>
      </div>
    </div>
  `).join('');
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
    await loadCompanyRoles();
    await loadProductFilters();
    loadCustomers();
    loadCompanies();
    loadProducts();
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });
