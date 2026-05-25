const catalogRoleInfo = document.getElementById('catalog-role-info');
const adminTaxonomySection = document.getElementById('admin-taxonomy-section');
const categoryList = document.getElementById('category-list');
const subcategoryList = document.getElementById('subcategory-list');
const lineList = document.getElementById('line-list');
const newSubcategoryCategory = document.getElementById('new-subcategory-category');
const lineSubcategory = document.getElementById('line-subcategory');
const lineFilterCategory = document.getElementById('line-filter-category');
const lineFilterSubcategory = document.getElementById('line-filter-subcategory');
const lineCompanyId = document.getElementById('line-company-id');
const lineFilterCompany = document.getElementById('line-filter-company');

const state = {
  session: null,
  isAdmin: false,
  categories: [],
  subcategories: []
};

if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

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

const renderCategoryOptions = () => {
  const categoryOptions = ['<option value="">Seleccione categoria</option>']
    .concat(state.categories.map((category) => (
      `<option value="${category.id_category}">${category.name}</option>`
    )));

  newSubcategoryCategory.innerHTML = categoryOptions.join('');
  lineFilterCategory.innerHTML = ['<option value="">Todas las categorias</option>']
    .concat(state.categories.map((category) => (
      `<option value="${category.id_category}">${category.name}</option>`
    )))
    .join('');
};

const renderSubcategoryOptions = (selectedCategoryId = '') => {
  const filteredSubcategories = selectedCategoryId
    ? state.subcategories.filter((subcategory) => String(subcategory.id_category_fk) === String(selectedCategoryId))
    : state.subcategories;

  lineSubcategory.innerHTML = ['<option value="">Seleccione subcategoria</option>']
    .concat(filteredSubcategories.map((subcategory) => (
      `<option value="${subcategory.id_subcategory}">${subcategory.category_name} / ${subcategory.name}</option>`
    )))
    .join('');

  lineFilterSubcategory.innerHTML = ['<option value="">Todas las subcategorias</option>']
    .concat(filteredSubcategories.map((subcategory) => (
      `<option value="${subcategory.id_subcategory}">${subcategory.category_name} / ${subcategory.name}</option>`
    )))
    .join('');
};

const renderCategories = () => {
  if (!state.categories.length) {
    categoryList.innerHTML = '<p>No hay categorias registradas.</p>';
    return;
  }

  categoryList.innerHTML = state.categories.map((category) => `
    <div>
      <p><b>${category.name}</b> - ${category.is_active ? 'Activa' : 'Inactiva'}</p>
      <input id="category-name-${category.id_category}" value="${category.name}">
      <button onclick="updateCategoryItem(${category.id_category})">Actualizar</button>
      <button onclick="toggleCategoryItem(${category.id_category}, ${category.is_active ? 'false' : 'true'})">
        ${category.is_active ? 'Desactivar' : 'Activar'}
      </button>
      <hr>
    </div>
  `).join('');
};

const renderSubcategories = () => {
  if (!state.subcategories.length) {
    subcategoryList.innerHTML = '<p>No hay subcategorias registradas.</p>';
    return;
  }

  subcategoryList.innerHTML = state.subcategories.map((subcategory) => `
    <div>
      <p><b>${subcategory.category_name}</b> / ${subcategory.name} - ${subcategory.is_active ? 'Activa' : 'Inactiva'}</p>
      <input id="subcategory-name-${subcategory.id_subcategory}" value="${subcategory.name}">
      <select id="subcategory-category-${subcategory.id_subcategory}">
        ${state.categories.map((category) => `
          <option value="${category.id_category}" ${category.id_category === subcategory.id_category_fk ? 'selected' : ''}>
            ${category.name}
          </option>
        `).join('')}
      </select>
      <button onclick="updateSubcategoryItem(${subcategory.id_subcategory})">Actualizar</button>
      <button onclick="toggleSubcategoryItem(${subcategory.id_subcategory}, ${subcategory.is_active ? 'false' : 'true'})">
        ${subcategory.is_active ? 'Desactivar' : 'Activar'}
      </button>
      <hr>
    </div>
  `).join('');
};

const renderLines = (lines) => {
  if (!lines.length) {
    lineList.innerHTML = '<p>No hay lineas registradas para los filtros actuales.</p>';
    return;
  }

  lineList.innerHTML = lines.map((line) => `
    <div>
      <p><b>${line.category_name} / ${line.subcategory_name} / ${line.name}</b></p>
      <p>Empresa: ${line.company_name} (#${line.id_company_fk})</p>
      <p>Marca: ${line.brand || 'Sin marca'}</p>
      <p>Productos: ${line.products_count}</p>
      <p>Estado: ${line.is_active ? 'Activa' : 'Inactiva'}</p>
      <input id="line-name-${line.id_line}" value="${line.name}">
      <input id="line-brand-${line.id_line}" value="${line.brand || ''}" placeholder="Marca base">
      <button onclick="updateLineItem(${line.id_line})">Actualizar linea</button>
      <button onclick="toggleLineItem(${line.id_line}, ${line.is_active ? 'false' : 'true'})">
        ${line.is_active ? 'Desactivar' : 'Activar'}
      </button>
      <hr>
    </div>
  `).join('');
};

const loadCategories = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/products/categories`);
  state.categories = data.categories || [];
  renderCategoryOptions();
  renderCategories();
};

const loadSubcategories = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/products/management/subcategories`);
  state.subcategories = data.subcategories || [];
  renderSubcategoryOptions(lineFilterCategory.value);
  renderSubcategories();
};

const loadLines = async () => {
  const params = new URLSearchParams();

  if (lineFilterCategory.value) {
    params.set('category_id', lineFilterCategory.value);
  }

  if (lineFilterSubcategory.value) {
    params.set('subcategory_id', lineFilterSubcategory.value);
  }

  if (state.isAdmin && lineFilterCompany.value) {
    params.set('company_id', lineFilterCompany.value);
  }

  const query = params.toString();
  const linesUrl = `${API_BASE_URL}/api/products/management/lines${query ? '?' + query : ''}`;
  const data = await requestJson(linesUrl);
  renderLines(data.lines || []);
};

async function createCategoryItem() {
  try {
    const name = document.getElementById('new-category-name').value.trim();
    const data = await requestJson(`${API_BASE_URL}/api/products/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    alert(data.message);
    document.getElementById('new-category-name').value = '';
    await loadCategories();
    await loadSubcategories();
  } catch (error) {
    alert(error.message);
  }
}

async function updateCategoryItem(categoryId) {
  try {
    const name = document.getElementById(`category-name-${categoryId}`).value.trim();
    const data = await requestJson(`${API_BASE_URL}/api/products/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    alert(data.message);
    await loadCategories();
    await loadSubcategories();
    await loadLines();
  } catch (error) {
    alert(error.message);
  }
}

async function toggleCategoryItem(categoryId, isActive) {
  try {
    const data = await requestJson(`${API_BASE_URL}/api/products/categories/${categoryId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive })
    });

    alert(data.message);
    await loadCategories();
    await loadSubcategories();
    await loadLines();
  } catch (error) {
    alert(error.message);
  }
}

async function createSubcategoryItem() {
  try {
    const name = document.getElementById('new-subcategory-name').value.trim();
    const categoryId = Number(newSubcategoryCategory.value);
    const data = await requestJson(`${API_BASE_URL}/api/products/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category_id: categoryId })
    });

    alert(data.message);
    document.getElementById('new-subcategory-name').value = '';
    newSubcategoryCategory.value = '';
    await loadSubcategories();
  } catch (error) {
    alert(error.message);
  }
}

async function updateSubcategoryItem(subcategoryId) {
  try {
    const name = document.getElementById(`subcategory-name-${subcategoryId}`).value.trim();
    const categoryId = Number(document.getElementById(`subcategory-category-${subcategoryId}`).value);
    const data = await requestJson(`${API_BASE_URL}/api/products/subcategories/${subcategoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category_id: categoryId })
    });

    alert(data.message);
    await loadSubcategories();
    await loadLines();
  } catch (error) {
    alert(error.message);
  }
}

async function toggleSubcategoryItem(subcategoryId, isActive) {
  try {
    const data = await requestJson(`${API_BASE_URL}/api/products/subcategories/${subcategoryId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive })
    });

    alert(data.message);
    await loadSubcategories();
    await loadLines();
  } catch (error) {
    alert(error.message);
  }
}

async function createLineItem() {
  try {
    const payload = {
      name: document.getElementById('line-name').value.trim(),
      brand: document.getElementById('line-brand').value.trim() || null,
      description: document.getElementById('line-description').value.trim() || null,
      price: Number(document.getElementById('line-price').value),
      quantity: Number(document.getElementById('line-quantity').value),
      min_stock: Number(document.getElementById('line-min-stock').value || 0),
      id_subcategory: Number(lineSubcategory.value)
    };

    if (state.isAdmin && lineCompanyId.value) {
      payload.id_company = Number(lineCompanyId.value);
    }

    const data = await requestJson(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    alert(data.message);
    document.getElementById('line-name').value = '';
    document.getElementById('line-brand').value = '';
    document.getElementById('line-description').value = '';
    document.getElementById('line-price').value = '';
    document.getElementById('line-quantity').value = '';
    document.getElementById('line-min-stock').value = '';
    await loadLines();
  } catch (error) {
    alert(error.message);
  }
}

async function updateLineItem(lineId) {
  try {
    const payload = {
      name: document.getElementById(`line-name-${lineId}`).value.trim(),
      brand: document.getElementById(`line-brand-${lineId}`).value.trim() || null
    };

    const data = await requestJson(`${API_BASE_URL}/api/products/${lineId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    alert(data.message);
    await loadLines();
  } catch (error) {
    alert(error.message);
  }
}

async function toggleLineItem(lineId, isActive) {
  try {
    const data = await requestJson(`${API_BASE_URL}/api/products/${lineId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive })
    });

    alert(data.message);
    await loadLines();
  } catch (error) {
    alert(error.message);
  }
}

lineFilterCategory.addEventListener('change', () => {
  renderSubcategoryOptions(lineFilterCategory.value);
});

fetchCurrentSession()
  .then(async (session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesion no valida para empresa');
    }

    if (session.data.company.id_role_fk !== 1 && !globalThis.canUseCompanySellModules?.(session.data.company)) {
      throw new Error('Tu empresa aún no está habilitada jurídicamente para gestionar catálogo');
    }

    state.session = session;
    state.isAdmin = session.data.company.id_role_fk === 1;

    catalogRoleInfo.innerText = state.isAdmin
      ? 'Modo admin: puedes gestionar categorias, subcategorias y lineas.'
      : 'Modo company: puedes gestionar tus lineas.';

    adminTaxonomySection.hidden = !state.isAdmin;
    lineCompanyId.hidden = !state.isAdmin;
    lineFilterCompany.hidden = !state.isAdmin;

    await loadCategories();
    await loadSubcategories();
    await loadLines();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
