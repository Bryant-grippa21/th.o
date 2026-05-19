const companyProductsRoleNote = document.getElementById('company-products-role-note');
const companyProductForm = document.getElementById('company-product-form');
const companyProductFormMessage = document.getElementById('company-product-form-message');
const companyProductsSummary = document.getElementById('company-products-summary');
const companyProductsList = document.getElementById('company-products-list');
const companyProductsPagination = document.getElementById('company-products-pagination');
const productLineSearchInput = document.getElementById('product-line-search');
const productLineSelect = document.getElementById('product-line');
const productLineContext = document.getElementById('product-line-context');
const productMainImageInput = document.getElementById('product-main-image');
const productMainImagePreview = document.getElementById('product-main-image-preview');
const productSecondaryImagesInput = document.getElementById('product-secondary-images');
const productSecondaryImagesPreview = document.getElementById('product-secondary-images-preview');
const productSecondaryImagesClearButton = document.getElementById('product-secondary-images-clear');
const companyProductEditorSection = document.getElementById('company-product-editor-section');
const companyProductEditorForm = document.getElementById('company-product-editor-form');
const companyProductEditorMessage = document.getElementById('company-product-editor-message');
const editProductIdInput = document.getElementById('edit-product-id');
const editProductNameInput = document.getElementById('edit-product-name');
const editProductBrandInput = document.getElementById('edit-product-brand');
const editProductDescriptionInput = document.getElementById('edit-product-description');
const editProductPriceInput = document.getElementById('edit-product-price');
const editProductMinStockInput = document.getElementById('edit-product-min-stock');
const editProductCurrentImages = document.getElementById('edit-product-current-images');
const editProductStockHistory = document.getElementById('edit-product-stock-history');
const editProductStockHistoryPagination = document.getElementById('edit-product-stock-history-pagination');
const editProductMainImageInput = document.getElementById('edit-product-main-image');
const editProductMainImagePreview = document.getElementById('edit-product-main-image-preview');
const editProductSecondaryImagesInput = document.getElementById('edit-product-secondary-images');
const editProductSecondaryImagesPreview = document.getElementById('edit-product-secondary-images-preview');
const editProductCancelButton = document.getElementById('edit-product-cancel');

const MAX_SECONDARY_IMAGES = 7;
const PREVIEW_IMAGE_STYLE = 'width:96px; height:96px; object-fit:cover; border:1px solid #ccc; border-radius:4px;';

const state = {
  session: null,
  lines: [],
  filteredLines: [],
  secondaryImageFiles: [],
  mainImagePreviewUrl: null,
  secondaryImagePreviewUrls: [],
  editorMainImagePreviewUrl: null,
  editorSecondaryImagePreviewUrls: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  },
  editor: {
    productId: null,
    product: null,
    stockHistoryPagination: {
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 1
    }
  }
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

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase();

const parseAttributesObject = (attributes) => {
  if (!attributes) {
    return {};
  }

  try {
    const parsed = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
};

const populateAttributeInputs = (prefix, attributes) => {
  const entries = Object.entries(parseAttributesObject(attributes)).slice(0, 4);

  for (let index = 1; index <= 4; index += 1) {
    const [key, value] = entries[index - 1] || ['', ''];
    document.getElementById(`${prefix}-attribute-key-${index}`).value = key || '';
    document.getElementById(`${prefix}-attribute-value-${index}`).value = value || '';
  }
};

const buildAttributesValue = (prefix, requireAtLeastOne = true) => {
  const attributes = {};

  for (let index = 1; index <= 4; index += 1) {
    const key = document.getElementById(`${prefix}-attribute-key-${index}`).value.trim();
    const value = document.getElementById(`${prefix}-attribute-value-${index}`).value.trim();

    if (!key && !value) {
      continue;
    }

    if (!key || !value) {
      throw new Error(`Debes completar nombre y valor del atributo ${index}`);
    }

    attributes[key] = value;
  }

  if (requireAtLeastOne && !Object.keys(attributes).length) {
    throw new Error('Debes ingresar al menos un atributo');
  }

  return JSON.stringify(attributes);
};

const revokeObjectUrlList = (previewUrls) => {
  previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
};

const revokeCreatePreviewUrls = () => {
  if (state.mainImagePreviewUrl) {
    URL.revokeObjectURL(state.mainImagePreviewUrl);
    state.mainImagePreviewUrl = null;
  }

  revokeObjectUrlList(state.secondaryImagePreviewUrls);
  state.secondaryImagePreviewUrls = [];
};

const revokeEditorPreviewUrls = () => {
  if (state.editorMainImagePreviewUrl) {
    URL.revokeObjectURL(state.editorMainImagePreviewUrl);
    state.editorMainImagePreviewUrl = null;
  }

  revokeObjectUrlList(state.editorSecondaryImagePreviewUrls);
  state.editorSecondaryImagePreviewUrls = [];
};

const renderLineOptions = () => {
  productLineSelect.innerHTML = ['<option value="">Seleccione una línea</option>']
    .concat(state.filteredLines.map((line) => (
      `<option value="${line.id_line}">${line.category_name} / ${line.subcategory_name} / ${line.name}</option>`
    )))
    .join('');
};

const renderSelectedLineContext = () => {
  const selectedLineId = Number(productLineSelect.value || 0);
  const selectedLine = state.lines.find((line) => line.id_line === selectedLineId);

  if (!selectedLine) {
    productLineContext.innerHTML = `
      <p><b>Categoría:</b> No seleccionada</p>
      <p><b>Subcategoría:</b> No seleccionada</p>
      <p><b>Línea:</b> No seleccionada</p>
    `;
    return;
  }

  productLineContext.innerHTML = `
    <p><b>Categoría:</b> ${selectedLine.category_name}</p>
    <p><b>Subcategoría:</b> ${selectedLine.subcategory_name}</p>
    <p><b>Línea:</b> ${selectedLine.name}</p>
  `;
};

const filterLines = () => {
  const searchValue = normalizeSearchValue(productLineSearchInput.value);

  state.filteredLines = state.lines.filter((line) => {
    if (!searchValue) {
      return true;
    }

    return [line.name, line.category_name, line.subcategory_name]
      .some((value) => normalizeSearchValue(value).includes(searchValue));
  });

  renderLineOptions();
};

const loadLines = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/products/management/line-references`);
  state.lines = data.lines || [];
  state.filteredLines = state.lines;
  renderLineOptions();
  renderSelectedLineContext();
};

const summarizeProducts = (pagination) => {
  companyProductsSummary.innerHTML = `
    <p>Total productos propios: <b>${pagination.total}</b></p>
    <p>Página actual: <b>${pagination.page}</b> de <b>${pagination.total_pages}</b></p>
  `;
};

const renderStockHistory = (entries = [], pagination = null) => {
  if (!entries.length) {
    editProductStockHistory.innerHTML = '<p>Sin movimientos de stock.</p>';
    editProductStockHistoryPagination.innerHTML = '';
    return;
  }

  editProductStockHistory.innerHTML = `
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
    editProductStockHistoryPagination.innerHTML = '';
    return;
  }

  editProductStockHistoryPagination.innerHTML = `
    <button type="button" onclick="goToManagedProductHistoryPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>&lt;-</button>
    <span>${pagination.page} de ${pagination.total_pages}</span>
    <button type="button" onclick="goToManagedProductHistoryPage(${pagination.page + 1})" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>-&gt;</button>
  `;
};

const renderCurrentImages = (product) => {
  const images = Array.isArray(product.images) ? product.images : [];

  if (!images.length) {
    editProductCurrentImages.innerHTML = '<p>Sin imágenes guardadas.</p>';
    return;
  }

  editProductCurrentImages.innerHTML = `
    <p><b>Imágenes guardadas</b></p>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      ${images.map((image, index) => `
        <div style="display:flex; flex-direction:column; gap:6px; max-width:160px;">
          <img src="${image.image_url}" alt="${product.name} imagen ${index + 1}" style="width:120px; height:120px; object-fit:cover; border:1px solid #ccc;">
          <span>${image.is_main ? 'Principal' : 'Secundaria'}</span>
          <button type="button" onclick="deleteManagedProductImage(${product.id_product}, ${image.id_image})">Eliminar</button>
        </div>
      `).join('')}
    </div>
  `;
};

const renderProducts = (products) => {
  if (!products.length) {
    companyProductsList.innerHTML = '<p>No has cargado productos todavía.</p>';
    return;
  }

  companyProductsList.innerHTML = products.map((product) => `
    <div style="display:flex; gap:16px; align-items:flex-start; margin-bottom:16px; border-bottom:1px solid #ccc; padding-bottom:16px; opacity:${product.is_active ? '1' : '0.6'};">
      <div>
        ${product.main_image_url
    ? `<img src="${product.main_image_url}" alt="${product.line_name}" style="width:96px; height:96px; object-fit:cover; border:1px solid #ccc;">`
    : '<div style="width:96px; height:96px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">Sin imagen</div>'}
      </div>
      <div>
        <p><b>${product.name || 'Sin nombre'}</b></p>
        <p>SKU: ${product.sku}</p>
        <p>Empresa: ${state.session?.data?.company?.name || 'Mi empresa'}</p>
        <p>Categoría: ${product.category_name}</p>
        <p>Subcategoría: ${product.subcategory_name}</p>
        <p>Línea: ${product.line_name}</p>
        <p>Marca: ${product.brand || 'Sin marca'}</p>
        <p>Precio: ${product.price}</p>
        <p>Estado producto: ${product.is_active ? 'Activo' : 'Inactivo'}</p>
        <p>Estado línea: ${product.line_is_active ? 'Activa' : 'Inactiva'}</p>
        <p>Stock actual: ${product.quantity ?? 0}</p>
        <p>Stock mínimo: ${product.min_stock ?? 0}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">
          <button type="button" onclick="editManagedProduct(${product.id_product})">Editar</button>
          <button type="button" onclick="toggleManagedProductStatus(${product.id_product}, ${product.is_active})">${product.is_active ? 'Desactivar' : 'Activar'}</button>
          <button type="button" onclick="adjustManagedProductStock(${product.id_product}, 'increase')">+ Stock</button>
          <button type="button" onclick="adjustManagedProductStock(${product.id_product}, 'decrease')">- Stock</button>
          <button type="button" onclick="adjustManagedProductStock(${product.id_product}, 'set')">Sincronizar stock</button>
        </div>
      </div>
    </div>
  `).join('');
};

const renderPagination = (pagination) => {
  if (!pagination.total) {
    companyProductsPagination.innerHTML = '';
    return;
  }

  companyProductsPagination.innerHTML = `
    <button type="button" onclick="goToOwnProductsPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>&lt;-</button>
    <span>${pagination.page}</span>
    <button type="button" onclick="goToOwnProductsPage(${pagination.page + 1})" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>-&gt;</button>
  `;
};

const loadOwnProducts = async (page = 1) => {
  const data = await requestJson(`${API_BASE_URL}/api/products/management/products?page=${page}&limit=${state.pagination.limit}`);
  state.pagination = data.pagination || state.pagination;
  summarizeProducts(state.pagination);
  renderProducts(data.products || []);
  renderPagination(state.pagination);
};

const renderMainImagePreview = () => {
  const mainImage = productMainImageInput.files[0];

  if (state.mainImagePreviewUrl) {
    URL.revokeObjectURL(state.mainImagePreviewUrl);
    state.mainImagePreviewUrl = null;
  }

  if (!mainImage) {
    productMainImagePreview.innerHTML = '<p>No has seleccionado imagen principal.</p>';
    return;
  }

  state.mainImagePreviewUrl = URL.createObjectURL(mainImage);
  productMainImagePreview.innerHTML = `
    <p><b>Principal seleccionada:</b> ${mainImage.name}</p>
    <img src="${state.mainImagePreviewUrl}" alt="Vista previa imagen principal" style="width:160px; height:160px; object-fit:cover; border:1px solid #ccc; border-radius:4px;">
  `;
};

const renderSecondaryImagesPreview = () => {
  revokeObjectUrlList(state.secondaryImagePreviewUrls);
  state.secondaryImagePreviewUrls = [];

  if (!state.secondaryImageFiles.length) {
    productSecondaryImagesPreview.innerHTML = '<p>No has seleccionado imágenes secundarias.</p>';
    return;
  }

  state.secondaryImagePreviewUrls = state.secondaryImageFiles.map((file) => URL.createObjectURL(file));

  productSecondaryImagesPreview.innerHTML = `
    <p><b>Secundarias seleccionadas:</b> ${state.secondaryImageFiles.length} de ${MAX_SECONDARY_IMAGES}</p>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      ${state.secondaryImageFiles.map((file, index) => `
        <div style="display:flex; flex-direction:column; gap:6px; max-width:110px;">
          <img src="${state.secondaryImagePreviewUrls[index]}" alt="Vista previa secundaria ${index + 1}" style="${PREVIEW_IMAGE_STYLE}">
          <span style="font-size:12px; word-break:break-word;">${file.name}</span>
        </div>
      `).join('')}
    </div>
  `;
};

const renderEditorMainImagePreview = () => {
  const mainImage = editProductMainImageInput.files[0];

  if (state.editorMainImagePreviewUrl) {
    URL.revokeObjectURL(state.editorMainImagePreviewUrl);
    state.editorMainImagePreviewUrl = null;
  }

  if (!mainImage) {
    editProductMainImagePreview.innerHTML = '<p>No has seleccionado nueva imagen principal.</p>';
    return;
  }

  state.editorMainImagePreviewUrl = URL.createObjectURL(mainImage);
  editProductMainImagePreview.innerHTML = `
    <p><b>Nueva principal:</b> ${mainImage.name}</p>
    <img src="${state.editorMainImagePreviewUrl}" alt="Vista previa nueva imagen principal" style="width:160px; height:160px; object-fit:cover; border:1px solid #ccc; border-radius:4px;">
  `;
};

const renderEditorSecondaryImagesPreview = () => {
  revokeObjectUrlList(state.editorSecondaryImagePreviewUrls);
  state.editorSecondaryImagePreviewUrls = [];

  const secondaryFiles = Array.from(editProductSecondaryImagesInput.files || []);

  if (!secondaryFiles.length) {
    editProductSecondaryImagesPreview.innerHTML = '<p>No has seleccionado nuevas imágenes secundarias.</p>';
    return;
  }

  state.editorSecondaryImagePreviewUrls = secondaryFiles.map((file) => URL.createObjectURL(file));

  editProductSecondaryImagesPreview.innerHTML = `
    <p><b>Nuevas secundarias:</b> ${secondaryFiles.length}</p>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      ${secondaryFiles.map((file, index) => `
        <div style="display:flex; flex-direction:column; gap:6px; max-width:110px;">
          <img src="${state.editorSecondaryImagePreviewUrls[index]}" alt="Vista previa secundaria nueva ${index + 1}" style="${PREVIEW_IMAGE_STYLE}">
          <span style="font-size:12px; word-break:break-word;">${file.name}</span>
        </div>
      `).join('')}
    </div>
  `;
};

const buildSecondaryImageKey = (file) => [file.name, file.size, file.lastModified].join('::');

const mergeSecondaryImages = (incomingFiles) => {
  const currentKeys = new Set(state.secondaryImageFiles.map(buildSecondaryImageKey));

  incomingFiles.forEach((file) => {
    const fileKey = buildSecondaryImageKey(file);

    if (!currentKeys.has(fileKey)) {
      state.secondaryImageFiles.push(file);
      currentKeys.add(fileKey);
    }
  });

  if (state.secondaryImageFiles.length > MAX_SECONDARY_IMAGES) {
    state.secondaryImageFiles = state.secondaryImageFiles.slice(0, MAX_SECONDARY_IMAGES);
  }
};

const handleSecondaryImagesChange = () => {
  mergeSecondaryImages(Array.from(productSecondaryImagesInput.files));
  productSecondaryImagesInput.value = '';
  renderSecondaryImagesPreview();
};

const clearSecondaryImages = () => {
  state.secondaryImageFiles = [];
  productSecondaryImagesInput.value = '';
  renderSecondaryImagesPreview();
};

const resetProductForm = () => {
  revokeCreatePreviewUrls();
  companyProductForm.reset();
  state.filteredLines = state.lines;
  state.secondaryImageFiles = [];
  renderLineOptions();
  renderSelectedLineContext();
  renderMainImagePreview();
  renderSecondaryImagesPreview();
  populateAttributeInputs('product', {});
};

const hideProductEditor = () => {
  state.editor.productId = null;
  state.editor.product = null;
  companyProductEditorSection.hidden = true;
  companyProductEditorForm.reset();
  companyProductEditorMessage.innerText = '';
  editProductCurrentImages.innerHTML = '';
  editProductStockHistory.innerHTML = '<p>Sin movimientos de stock.</p>';
  editProductStockHistoryPagination.innerHTML = '';
  state.editor.stockHistoryPagination = {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  };
  revokeEditorPreviewUrls();
  renderEditorMainImagePreview();
  renderEditorSecondaryImagesPreview();
  populateAttributeInputs('edit-product', {});
};

const showProductEditor = (product) => {
  state.editor.productId = product.id_product;
  state.editor.product = product;
  companyProductEditorSection.hidden = false;
  editProductIdInput.value = String(product.id_product);
  editProductNameInput.value = product.name || '';
  editProductBrandInput.value = product.brand || '';
  editProductDescriptionInput.value = product.description || '';
  editProductPriceInput.value = product.price ?? '';
  editProductMinStockInput.value = product.min_stock ?? 0;
  populateAttributeInputs('edit-product', product.attributes);
  renderCurrentImages(product);
  renderStockHistory(product.stock_history || []);
  companyProductEditorMessage.innerText = '';
  editProductMainImageInput.value = '';
  editProductSecondaryImagesInput.value = '';
  revokeEditorPreviewUrls();
  renderEditorMainImagePreview();
  renderEditorSecondaryImagesPreview();
};

const loadManagedProductDetail = async (productId) => {
  const data = await requestJson(`${API_BASE_URL}/api/products/management/products/${productId}`);
  showProductEditor(data.product);
};

const refreshManagedProductDetail = async () => {
  if (!state.editor.productId) {
    return;
  }

  await loadManagedProductDetail(state.editor.productId);
  await loadManagedProductStockHistory(state.editor.stockHistoryPagination.page);
};

const loadManagedProductStockHistory = async (page = 1) => {
  if (!state.editor.productId) {
    return;
  }

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(state.editor.stockHistoryPagination.limit));

  const data = await requestJson(`${API_BASE_URL}/api/products/management/products/${state.editor.productId}/stock-history?${params.toString()}`);
  state.editor.stockHistoryPagination = data.pagination || state.editor.stockHistoryPagination;
  renderStockHistory(data.entries || [], state.editor.stockHistoryPagination);
};

async function handleCreateProduct(event) {
  event.preventDefault();

  try {
    companyProductFormMessage.innerText = 'Guardando producto...';

    const selectedLineId = Number(productLineSelect.value || 0);

    if (!selectedLineId) {
      throw new Error('Debes seleccionar una línea');
    }

    if (state.secondaryImageFiles.length > MAX_SECONDARY_IMAGES) {
      throw new Error(`Solo puedes cargar hasta ${MAX_SECONDARY_IMAGES} imágenes secundarias`);
    }

    const formData = new FormData();
    formData.set('name', document.getElementById('product-name').value.trim());
    formData.set('brand', document.getElementById('product-brand').value.trim());
    formData.set('description', document.getElementById('product-description').value.trim());
    formData.set('price', document.getElementById('product-price').value);
    formData.set('quantity', document.getElementById('product-quantity').value);
    formData.set('min_stock', document.getElementById('product-min-stock').value || '0');
    formData.set('attributes', buildAttributesValue('product'));

    const mainImage = productMainImageInput.files[0];
    if (mainImage) {
      formData.append('main_image', mainImage);
    }

    state.secondaryImageFiles.forEach((file) => {
      formData.append('secondary_images', file);
    });

    formData.set('reference_line_id', String(selectedLineId));

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo crear el producto');
    }

    companyProductFormMessage.innerText = data.message;
    resetProductForm();
    await loadOwnProducts(1);
  } catch (error) {
    companyProductFormMessage.innerText = error.message;
  }
}

async function handleEditProduct(event) {
  event.preventDefault();

  try {
    const productId = Number(editProductIdInput.value || 0);

    if (!productId) {
      throw new Error('Producto no válido');
    }

    companyProductEditorMessage.innerText = 'Guardando cambios...';

    const formData = new FormData();
    formData.set('name', editProductNameInput.value.trim());
    formData.set('brand', editProductBrandInput.value.trim());
    formData.set('description', editProductDescriptionInput.value.trim());
    formData.set('price', editProductPriceInput.value);
    formData.set('min_stock', editProductMinStockInput.value || '0');
    formData.set('attributes', buildAttributesValue('edit-product'));

    const mainImage = editProductMainImageInput.files[0];
    if (mainImage) {
      formData.append('main_image', mainImage);
    }

    Array.from(editProductSecondaryImagesInput.files || []).forEach((file) => {
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

    companyProductEditorMessage.innerText = data.message;
    await loadOwnProducts(state.pagination.page);
    await loadManagedProductDetail(productId);
  } catch (error) {
    companyProductEditorMessage.innerText = error.message;
  }
}

async function editManagedProduct(productId) {
  try {
    await loadManagedProductDetail(productId);
    await loadManagedProductStockHistory(1);
    companyProductEditorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    companyProductFormMessage.innerText = error.message;
  }
}

async function deleteManagedProductImage(productId, imageId) {
  try {
    if (!confirm('¿Deseas eliminar esta imagen?')) {
      return;
    }

    const data = await requestJson(`${API_BASE_URL}/api/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    companyProductEditorMessage.innerText = data.message;
    await loadOwnProducts(state.pagination.page);
    await refreshManagedProductDetail();
  } catch (error) {
    companyProductEditorMessage.innerText = error.message;
  }
}

async function toggleManagedProductStatus(productId, isActive) {
  try {
    const actionLabel = isActive ? 'desactivar' : 'activar';

    if (!confirm(`¿Deseas ${actionLabel} este producto?`)) {
      return;
    }

    const data = await requestJson(`${API_BASE_URL}/api/products/${productId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_active: !isActive
      })
    });

    companyProductFormMessage.innerText = data.message;
    await loadOwnProducts(state.pagination.page);
    if (state.editor.productId === productId) {
      await refreshManagedProductDetail();
    }
  } catch (error) {
    companyProductFormMessage.innerText = error.message;
  }
}

async function adjustManagedProductStock(productId, operation) {
  try {
    const labels = {
      increase: 'aumentar',
      decrease: 'disminuir',
      set: 'sincronizar'
    };
    const quantityLabel = operation === 'set'
      ? 'Indica la cantidad final de stock:'
      : `Indica cuánto deseas ${labels[operation]}:`;
    const quantityValue = prompt(quantityLabel, '1');

    if (quantityValue == null) {
      return;
    }

    const quantity = Number(quantityValue);

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('La cantidad debe ser un número entero mayor o igual a 0');
    }

    const notes = prompt('Nota del movimiento (opcional):', '') || '';
    const data = await requestJson(`${API_BASE_URL}/api/products/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        quantity,
        notes
      })
    });

    companyProductFormMessage.innerText = data.message;
    await loadOwnProducts(state.pagination.page);
    if (state.editor.productId === productId) {
      await refreshManagedProductDetail();
    }
  } catch (error) {
    companyProductFormMessage.innerText = error.message;
  }
}

function goToOwnProductsPage(page) {
  if (page < 1 || page > state.pagination.total_pages) {
    return;
  }

  loadOwnProducts(page).catch((error) => {
    companyProductFormMessage.innerText = error.message;
  });
}

function goToManagedProductHistoryPage(page) {
  if (page < 1 || page > state.editor.stockHistoryPagination.total_pages) {
    return;
  }

  loadManagedProductStockHistory(page).catch((error) => {
    companyProductEditorMessage.innerText = error.message;
  });
}

globalThis.goToOwnProductsPage = goToOwnProductsPage;
globalThis.goToManagedProductHistoryPage = goToManagedProductHistoryPage;
globalThis.editManagedProduct = editManagedProduct;
globalThis.deleteManagedProductImage = deleteManagedProductImage;
globalThis.toggleManagedProductStatus = toggleManagedProductStatus;
globalThis.adjustManagedProductStock = adjustManagedProductStock;

productLineSearchInput.addEventListener('input', filterLines);
productLineSelect.addEventListener('change', renderSelectedLineContext);
productMainImageInput.addEventListener('change', renderMainImagePreview);
productSecondaryImagesInput.addEventListener('change', handleSecondaryImagesChange);
productSecondaryImagesClearButton.addEventListener('click', clearSecondaryImages);
editProductMainImageInput.addEventListener('change', renderEditorMainImagePreview);
editProductSecondaryImagesInput.addEventListener('change', renderEditorSecondaryImagesPreview);
editProductCancelButton.addEventListener('click', hideProductEditor);
window.addEventListener('beforeunload', () => {
  revokeCreatePreviewUrls();
  revokeEditorPreviewUrls();
});

companyProductForm.addEventListener('submit', handleCreateProduct);
companyProductEditorForm.addEventListener('submit', handleEditProduct);

fetchCurrentSession()
  .then(async (session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesión no válida para empresa');
    }

    const company = session.data.company;
    if (company.id_role_fk === 1) {
      throw new Error('Este módulo es solo para detallistas y mayoristas');
    }

    state.session = session;
    companyProductsRoleNote.innerText = `Empresa actual: ${company.name}. Los productos que cargues quedan asociados a tu empresa.`;

    await loadLines();
    resetProductForm();
    hideProductEditor();
    await loadOwnProducts();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
