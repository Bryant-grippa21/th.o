const companyProductsRoleNote = document.getElementById('company-products-role-note');
const companyProductForm = document.getElementById('company-product-form');
const companyProductFormMessage = document.getElementById('company-product-form-message');
const companyProductsSummary = document.getElementById('company-products-summary');
const companyProductsList = document.getElementById('company-products-list');
const companyProductsPagination = document.getElementById('company-products-pagination');
const companyProductsSearchInput = document.getElementById('company-products-search');
const companyProductsInternalSkuSearchInput = document.getElementById('company-products-internal-sku-search');
const companyProductsCategorySelect = document.getElementById('company-products-category');
const companyProductsSubcategorySelect = document.getElementById('company-products-subcategory');
const companyProductsSortSelect = document.getElementById('company-products-sort');
const openCompanyProductModalButton = document.getElementById('open-company-product-modal');
const companyImportFileInput = document.getElementById('company-import-file');
const companyImportDownloadTemplateButton = document.getElementById('company-import-download-template');
const companyImportUploadBatchButton = document.getElementById('company-import-upload-batch');
const companyImportFeedback = document.getElementById('company-import-feedback');
const companyImportResult = document.getElementById('company-import-result');
const companyImportRefreshBatchesButton = document.getElementById('company-import-refresh-batches');
const companyImportBatchSelect = document.getElementById('company-import-batch-select');
const companyImportReviewFeedback = document.getElementById('company-import-review-feedback');
const companyImportBatchSummary = document.getElementById('company-import-batch-summary');
const companyImportRowsList = document.getElementById('company-import-rows-list');
const companyImportApproveBatchButton = document.getElementById('company-import-approve-batch');
const companyImportPublishBatchButton = document.getElementById('company-import-publish-batch');
const companyImportDeleteBatchButton = document.getElementById('company-import-delete-batch');
const companyImportRowModal = document.getElementById('company-import-row-modal');
const companyImportRowForm = document.getElementById('company-import-row-form');
const importRowNumberInput = document.getElementById('import-row-number');
const importRowNameInput = document.getElementById('import-row-name');
const importRowBrandInput = document.getElementById('import-row-brand');
const importRowDescriptionInput = document.getElementById('import-row-description');
const importRowPriceInput = document.getElementById('import-row-price');
const importRowQuantityInput = document.getElementById('import-row-quantity');
const importRowMinStockInput = document.getElementById('import-row-min-stock');
const importRowAttributesList = document.getElementById('import-row-attributes-list');
const importRowAddAttributeButton = document.getElementById('import-row-add-attribute');
const importRowCategoryNameInput = document.getElementById('import-row-category-name');
const importRowSubcategoryNameInput = document.getElementById('import-row-subcategory-name');
const importRowSkuInternInput = document.getElementById('import-row-sku-intern');
const importRowCostPriceInput = document.getElementById('import-row-cost-price');
const importRowLineIdInput = document.getElementById('import-row-line-id');
const importRowLineSearchInput = document.getElementById('import-row-line-search');
const importRowManualLineIdInput = document.getElementById('import-row-manual-line-id');
const importRowDecisionInput = document.getElementById('import-row-decision');
const importRowMainImageFileInput = document.getElementById('import-row-main-image-file');
const importRowSecondaryImagesFilesInput = document.getElementById('import-row-secondary-images-files');
const importRowImagesPreview = document.getElementById('import-row-images-preview');
const importRowNotesInput = document.getElementById('import-row-notes');
const editProductSkuInternInput = document.getElementById('edit-product-sku-intern');
const editProductCostPriceInput = document.getElementById('edit-product-cost-price');
const companyImportRowMessage = document.getElementById('company-import-row-message');
const companyImportTargetCompanyWrapper = document.getElementById('company-import-target-company-wrapper');
const companyImportTargetCompanyInput = document.getElementById('company-import-target-company');
const closeCompanyProductModalButton = document.getElementById('close-company-product-modal');
const companyProductModal = document.getElementById('company-product-modal');
const companyProductEditorModal = document.getElementById('company-product-editor-modal');
const closeCompanyProductEditorModalButton = document.getElementById('close-company-product-editor-modal');
const productSkuInternInput = document.getElementById('product-sku-intern');
const productCostPriceInput = document.getElementById('product-cost-price');
const companyProductStatusModal = document.getElementById('company-product-status-modal');
const companyProductStatusForm = document.getElementById('company-product-status-form');
const statusProductIdInput = document.getElementById('status-product-id');
const statusNextValueInput = document.getElementById('status-next-value');
const companyProductStatusMessage = document.getElementById('company-product-status-message');
const companyProductStatusConfirmButton = document.getElementById('company-product-status-confirm');
const companyProductStockModal = document.getElementById('company-product-stock-modal');
const companyProductStockForm = document.getElementById('company-product-stock-form');
const stockProductIdInput = document.getElementById('stock-product-id');
const stockOperationInput = document.getElementById('stock-operation');
const stockQuantityInput = document.getElementById('stock-quantity');
const stockNotesInput = document.getElementById('stock-notes');
const companyProductStockMessage = document.getElementById('company-product-stock-message');
const productLineSearchInput = document.getElementById('product-line-search');
const productLineSelect = document.getElementById('product-line');
const productLineContext = document.getElementById('product-line-context');
const productMainImageInput = document.getElementById('product-main-image');
const productMainImagePreview = document.getElementById('product-main-image-preview');
const productSecondaryImagesInput = document.getElementById('product-secondary-images');
const productSecondaryImagesPreview = document.getElementById('product-secondary-images-preview');
const productSecondaryImagesClearButton = document.getElementById('product-secondary-images-clear');
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
const DEFAULT_STAGING_PRODUCT_IMAGE_URL = '/uploads/products/defaults/producto_default.svg';
const state = {
  session: null,
  lines: [],
  filteredLines: [],
  categories: [],
  subcategories: [],
  productSearch: '',
  productInternalSearch: '',
  categoryId: null,
  subcategoryId: null,
  sort: 'price_desc',
  secondaryImageFiles: [],
  mainImagePreviewUrl: null,
  secondaryImagePreviewUrls: [],
  editorMainImagePreviewUrl: null,
  editorSecondaryImagePreviewUrls: [],
  pagination: {
    page: 1,
    limit: 8,
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
  },
  pendingStatus: {
    productId: null,
    nextValue: null
  },
  pendingStock: {
    productId: null,
    operation: null
  },
  importReview: {
    batches: [],
    selectedBatchId: null,
    selectedBatch: null,
    rowEditor: {
      currentRowNumber: null,
      previewUrls: [],
      originalClassification: null,
      suggestedCandidates: [],
      existingMainImage: '',
      existingMainImageSource: 'subcategory_default',
      existingMainImageUrl: '',
      existingSecondaryImages: [],
      selectedSecondaryImageFiles: []
    }
  }
};

const getCompanyRoleId = (company) => Number(company?.id_role_fk ?? company?.id_role ?? 0);

const syncImportTargetCompanyVisibility = (company) => {
  if (!companyImportTargetCompanyWrapper) {
    return;
  }

  const isAdmin = getCompanyRoleId(company) === 1;
  companyImportTargetCompanyWrapper.hidden = !isAdmin;
  companyImportTargetCompanyWrapper.style.display = isAdmin ? 'grid' : 'none';

  if (!isAdmin && companyImportTargetCompanyInput) {
    companyImportTargetCompanyInput.value = '';
  }
};

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
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
};

const setImportFeedback = (message, type = 'info') => {
  if (!companyImportFeedback) {
    return;
  }

  companyImportFeedback.textContent = message || '';
  companyImportFeedback.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const renderImportBatchResult = (batch) => {
  if (!companyImportResult) {
    return;
  }

  if (!batch) {
    companyImportResult.hidden = true;
    companyImportResult.innerHTML = '';
    return;
  }

  const summary = batch.import_data?.summary || {};

  companyImportResult.hidden = false;
  companyImportResult.innerHTML = `
    <p><b>Lote #${batch.id_import_batch}</b> · Estado: <b>${batch.status}</b></p>
    <p>Total filas: <b>${summary.total_rows ?? batch.total_rows ?? 0}</b> | Validadas: <b>${summary.validated_rows ?? batch.validated_rows ?? 0}</b></p>
    <p>Auto-clasificadas: <b>${summary.auto_matched_rows ?? 0}</b> | Pendientes: <b>${summary.pending_review_rows ?? 0}</b> | Inválidas: <b>${summary.invalid_rows ?? 0}</b></p>
  `;
};

const parseFilenameFromContentDisposition = (value) => {
  if (!value) {
    return null;
  }

  const [, utf8Raw = ''] = value.match(/filename\*=UTF-8''([^;]+)/i) ?? [];
  if (utf8Raw) {
    return decodeURIComponent(utf8Raw.split('"').join('').trim());
  }

  const [, plainRaw = ''] = value.match(/filename=([^;]+)/i) ?? [];
  if (!plainRaw) {
    return null;
  }

  return plainRaw.split('"').join('').trim();
};

const handleDownloadImportTemplate = async () => {
  try {
    setImportFeedback('Generando plantilla...');
    const filename = 'plantilla automatizaciones de productos V1.xlsx';

    const response = await fetch(`${API_BASE_URL}/api/products/import/template`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'No se pudo descargar la plantilla');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);

    setImportFeedback('Plantilla descargada correctamente.');
  } catch (error) {
    setImportFeedback(error.message, 'error');
  }
};

const handleUploadImportBatch = async () => {
  try {
    const file = companyImportFileInput?.files?.[0];

    if (!file) {
      throw new Error('Debes seleccionar un archivo para la carga masiva');
    }

    setImportFeedback('Subiendo archivo y validando filas...');

    const formData = new FormData();
    formData.append('file', file);

    const roleId = getCompanyRoleId(state.session?.data?.company);
    if (roleId === 1) {
      const targetCompanyId = Number(companyImportTargetCompanyInput?.value || 0);
      if (targetCompanyId > 0) {
        formData.append('id_company', String(targetCompanyId));
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/products/import/batches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'No se pudo procesar la carga masiva');
    }

    setImportFeedback(payload.message || 'Carga masiva procesada correctamente.');
    renderImportBatchResult(payload.batch || null);
    companyImportFileInput.value = '';
    await loadImportBatches();

    const createdBatchId = Number(payload?.batch?.id_import_batch || 0);
    if (createdBatchId > 0) {
      companyImportBatchSelect.value = String(createdBatchId);
      await loadImportBatchDetail(createdBatchId);
    }
  } catch (error) {
    setImportFeedback(error.message, 'error');
  }
};

const setImportReviewFeedback = (message, type = 'info') => {
  if (!companyImportReviewFeedback) {
    return;
  }

  companyImportReviewFeedback.textContent = message || '';
  companyImportReviewFeedback.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const attributesObjectToInlineText = (attributes) => {
  if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) {
    return '';
  }

  return Object.entries(attributes)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
};

const inlineAttributesToEntries = (attributesInput) => {
  const source = String(attributesInput || '').trim();

  if (!source) {
    return [];
  }

  return source
    .split(/[;|]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const separatorIndex = segment.indexOf(':');
      if (separatorIndex === -1) {
        return { key: segment, value: '' };
      }

      return {
        key: segment.slice(0, separatorIndex).trim(),
        value: segment.slice(separatorIndex + 1).trim()
      };
    });
};

const resolveStagingImageUrl = (imageName, imageSource = '') => {
  const normalizedName = String(imageName || '').trim();
  const normalizedNameForMatch = normalizeSearchValue(normalizedName);
  const normalizedSource = String(imageSource || '').trim().toLowerCase();

  if (!normalizedName) {
    return '';
  }

  if (
    normalizedNameForMatch === 'sin_imagen.png'
    || normalizedNameForMatch.includes('sin imagen')
    || normalizedNameForMatch.endsWith('_default.png')
    || normalizedNameForMatch.endsWith(' default.png')
    || normalizedNameForMatch.includes('default')
  ) {
    return DEFAULT_STAGING_PRODUCT_IMAGE_URL;
  }

  if (normalizedName.startsWith('http://') || normalizedName.startsWith('https://') || normalizedName.startsWith('/')) {
    return normalizedName;
  }

  if (normalizedSource === 'subcategory_default') {
    return `/uploads/products/defaults/${normalizedName}`;
  }

  if (normalizedSource === 'uploaded') {
    return `/uploads/products/${normalizedName}`;
  }

  return `/uploads/products/${normalizedName}`;
};

const getImageFileName = (imageName) => {
  return '';
};

const clearImportRowImagePreviews = () => {
  const previewUrls = state.importReview?.rowEditor?.previewUrls || [];
  previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  state.importReview.rowEditor.previewUrls = [];
};

const renderImportRowImagesPreview = () => {
  if (!importRowImagesPreview) {
    return;
  }

  clearImportRowImagePreviews();

  const previewItems = [];
  const previewMainImageUrl = resolveImportRowPreviewMainImageUrl();

  const mainFile = importRowMainImageFileInput?.files?.[0] || null;
  if (mainFile) {
    const url = URL.createObjectURL(mainFile);
    state.importReview.rowEditor.previewUrls.push(url);
    previewItems.push({ label: 'Principal (archivo)', name: mainFile.name, url });
  } else if (previewMainImageUrl) {
    previewItems.push({
      label: 'Principal actual',
      name: '',
      url: previewMainImageUrl
    });
  }

  const secondaryFiles = Array.isArray(state.importReview.rowEditor.selectedSecondaryImageFiles)
    ? state.importReview.rowEditor.selectedSecondaryImageFiles
    : [];

  if (secondaryFiles.length) {
    secondaryFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      state.importReview.rowEditor.previewUrls.push(url);
      previewItems.push({ label: `Secundaria ${index + 1} (archivo)`, name: file.name, url });
    });
  }

  const secondaryNames = Array.isArray(state.importReview.rowEditor.existingSecondaryImages)
    ? state.importReview.rowEditor.existingSecondaryImages
    : [];

  secondaryNames.forEach((name, index) => {
    const url = resolveStagingImageUrl(name);
    if (url) {
      previewItems.push({ label: `Secundaria actual ${index + 1}`, name, url });
    }
  });

  if (!previewItems.length) {
    importRowImagesPreview.innerHTML = '<p>No hay imágenes asignadas a esta fila.</p>';
    return;
  }

  importRowImagesPreview.innerHTML = `
    <p><b>Previsualización de imágenes</b></p>
    <div class="company-import-image-preview-grid">
      ${previewItems.map((item) => `
        <figure class="company-import-image-preview-card">
          <img src="${item.url}" alt="${item.label}" loading="lazy" onerror="this.closest('figure').classList.add('company-import-image-preview-card--error'); this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div class="company-import-image-preview-fallback" style="display:none;">No disponible</div>
        </figure>
      `).join('')}
    </div>
  `;
};

const createImportAttributeRowMarkup = (key = '', value = '') => `
  <div class="company-import-attribute-row">
    <input type="text" data-import-attr="key" placeholder="Atributo" value="${String(key || '').replaceAll('"', '&quot;')}">
    <input type="text" data-import-attr="value" placeholder="Valor" value="${String(value || '').replaceAll('"', '&quot;')}">
    <button type="button" data-import-attr="remove" class="company-modal-form-secondary-action">Quitar</button>
  </div>
`;

const renderImportAttributeRows = (entries = []) => {
  if (!importRowAttributesList) {
    return;
  }

  if (!entries.length) {
    importRowAttributesList.innerHTML = createImportAttributeRowMarkup('', '');
    return;
  }

  importRowAttributesList.innerHTML = entries
    .map((entry) => createImportAttributeRowMarkup(entry.key, entry.value))
    .join('');
};

const collectImportAttributesInlineText = () => {
  const rows = Array.from(importRowAttributesList?.querySelectorAll('.company-import-attribute-row') || []);
  const parts = rows
    .map((row) => {
      const key = String(row.querySelector('[data-import-attr="key"]')?.value || '').trim();
      const value = String(row.querySelector('[data-import-attr="value"]')?.value || '').trim();

      if (!key && !value) {
        return null;
      }

      if (!key || !value) {
        throw new Error('Cada atributo debe tener nombre y valor');
      }

      return `${key}:${value}`;
    })
    .filter(Boolean);

  return parts.join(';');
};

const renderImportBatchOptions = () => {
  if (!companyImportBatchSelect) {
    return;
  }

  const options = ['<option value="">Seleccione un lote</option>']
    .concat(state.importReview.batches.map((batch) => {
      const status = String(batch.status || '').toUpperCase();
      return `<option value="${batch.id_import_batch}">#${batch.id_import_batch} - ${batch.batch_name} (${status})</option>`;
    }));

  companyImportBatchSelect.innerHTML = options.join('');

  if (state.importReview.selectedBatchId) {
    companyImportBatchSelect.value = String(state.importReview.selectedBatchId);
  }
};

const syncImportBatchActions = (batch) => {
  const hasBatch = Boolean(batch?.id_import_batch);
  const alreadyPublished = Boolean(
    String(batch?.status || '').toLowerCase() === 'completed'
    || (Array.isArray(batch?.import_data?.publication?.created_products)
      && batch.import_data.publication.created_products.length > 0)
  );

  if (companyImportPublishBatchButton) {
    companyImportPublishBatchButton.disabled = !hasBatch || alreadyPublished;
    companyImportPublishBatchButton.title = alreadyPublished
      ? 'Este lote ya fue publicado'
      : '';
  }
};

const renderSelectedBatchSummary = (batch) => {
  if (!companyImportBatchSummary) {
    return;
  }

  if (!batch) {
    syncImportBatchActions(null);
    companyImportBatchSummary.hidden = true;
    companyImportBatchSummary.innerHTML = '';
    return;
  }

  const summary = batch.import_data?.summary || {};
  const alreadyPublished = Boolean(
    String(batch?.status || '').toLowerCase() === 'completed'
    || (Array.isArray(batch?.import_data?.publication?.created_products)
      && batch.import_data.publication.created_products.length > 0)
  );
  const publishedNotice = alreadyPublished
    ? '<div class="company-panel-message company-panel-message--info" style="margin-bottom:12px;"><b>Este lote ya fue subido al catálogo.</b> Puedes revisarlo o eliminarlo, pero no volver a publicarlo.</div>'
    : '';

  companyImportBatchSummary.hidden = false;
  companyImportBatchSummary.innerHTML = `
    ${publishedNotice}
    <p><b>Lote #${batch.id_import_batch}</b> · Estado: <b>${batch.status}</b></p>
    <p>Total: <b>${summary.total_rows ?? batch.total_rows ?? 0}</b> | Validadas: <b>${summary.validated_rows ?? batch.validated_rows ?? 0}</b> | Aprobadas: <b>${batch.approved_rows ?? 0}</b></p>
    <p>Pendientes: <b>${summary.pending_review_rows ?? 0}</b> | Inválidas: <b>${summary.invalid_rows ?? 0}</b></p>
  `;
  syncImportBatchActions(batch);
};

const renderBatchRows = (batch) => {
  if (!companyImportRowsList) {
    return;
  }

  const rows = Array.isArray(batch?.import_data?.rows) ? batch.import_data.rows : [];

  if (!rows.length) {
    companyImportRowsList.innerHTML = '<p>Este lote no tiene filas para revisión.</p>';
    return;
  }

  companyImportRowsList.innerHTML = `
    <div class="company-import-table-wrapper">
      <table class="company-import-table">
        <thead>
          <tr>
            <th>Fila</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Subcategoría</th>
            <th>Línea</th>
            <th>Estado</th>
            <th>Imagen principal</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            const lineName = row?.classification?.line?.name || 'Sin línea';
            const categoryName = row?.classification?.line?.category_name || 'Sin categoría';
            const subcategoryName = row?.classification?.line?.subcategory_name || 'Sin subcategoría';
            const status = row?.validation?.status || 'pending_review';
            const mainImage = row?.staging_images?.main_image || 'sin_imagen.png';
            const mainImageUrl = row?.staging_images?.main_image_url
              || resolveStagingImageUrl(mainImage, row?.staging_images?.main_image_source);
            const productName = row?.normalized?.name || row?.raw_data?.name || 'Sin nombre';

            return `
              <tr>
                <td>${row.row_number}</td>
                <td>${productName}</td>
                <td>${categoryName}</td>
                <td>${subcategoryName}</td>
                <td>${lineName}</td>
                <td><span class="company-import-status company-import-status--${status}">${status}</span></td>
                <td>
                  <div class="company-import-row-image-cell">
                    ${mainImageUrl
                      ? `<img src="${mainImageUrl}" alt="${productName}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'company-import-image-preview-fallback', textContent: 'Sin imagen' }));">`
                      : '<div class="company-import-image-preview-fallback">Sin imagen</div>'}
                  </div>
                </td>
                <td>
                  <button type="button" data-import-action="edit" data-row-number="${row.row_number}">Editar</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const loadImportBatches = async () => {
  try {
    const response = await requestJson(`${API_BASE_URL}/api/products/import/batches?limit=50`);
    state.importReview.batches = Array.isArray(response.batches) ? response.batches : [];
    renderImportBatchOptions();

    if (!state.importReview.batches.length) {
      setImportReviewFeedback('No hay lotes de importación todavía.');
      renderSelectedBatchSummary(null);
      if (companyImportRowsList) {
        companyImportRowsList.innerHTML = '<p>Sube un archivo para empezar la revisión.</p>';
      }
      return;
    }

    setImportReviewFeedback('Lotes cargados. Selecciona uno para revisar.');
  } catch (error) {
    setImportReviewFeedback(error.message, 'error');
  }
};

const loadImportBatchDetail = async (batchId) => {
  if (!batchId) {
    state.importReview.selectedBatchId = null;
    state.importReview.selectedBatch = null;
    renderSelectedBatchSummary(null);
    if (companyImportRowsList) {
      companyImportRowsList.innerHTML = '<p>Selecciona un lote para revisar filas.</p>';
    }
    return;
  }

  const response = await requestJson(`${API_BASE_URL}/api/products/import/batches/${batchId}`);
  state.importReview.selectedBatchId = Number(batchId);
  state.importReview.selectedBatch = response.batch || null;
  renderSelectedBatchSummary(state.importReview.selectedBatch);
  renderBatchRows(state.importReview.selectedBatch);
};

const fillImportRowLineOptions = (row) => {
  if (!importRowLineIdInput) {
    return;
  }

  const candidates = [row?.classification?.line, ...(row?.classification?.alternatives || [])]
    .filter((candidate) => candidate && Number(candidate.id_line) > 0);
  const uniqueMap = new Map();

  candidates.forEach((candidate) => {
    if (!uniqueMap.has(candidate.id_line)) {
      uniqueMap.set(candidate.id_line, candidate);
    }
  });

  const uniqueCandidates = Array.from(uniqueMap.values());
  state.importReview.rowEditor.suggestedCandidates = uniqueCandidates;

  importRowLineIdInput.innerHTML = ['<option value="">Mantener línea detectada</option>']
    .concat(uniqueCandidates.map((candidate) => `<option value="${candidate.id_line}">${candidate.name} (${candidate.subcategory_name || 'sin subcategoría'})</option>`))
    .join('');
};

const setImportDetectedClassification = (classification) => {
  if (!importRowCategoryNameInput || !importRowSubcategoryNameInput) {
    return;
  }

  importRowCategoryNameInput.value = classification?.category_name || '';
  importRowSubcategoryNameInput.value = classification?.subcategory_name || '';
};

const resolveImportRowPreviewMainImageUrl = () => {
  if (state.importReview.rowEditor.existingMainImageUrl) {
    return state.importReview.rowEditor.existingMainImageUrl;
  }

  return resolveStagingImageUrl(
    state.importReview.rowEditor.existingMainImage,
    state.importReview.rowEditor.existingMainImageSource
  );
};

const resolveSelectedClassificationPreview = () => {
  const manualLineId = importRowManualLineIdInput?.value ? Number(importRowManualLineIdInput.value) : null;
  if (manualLineId && Number.isInteger(manualLineId) && manualLineId > 0) {
    const manualLine = state.lines.find((line) => Number(line.id_line) === manualLineId);
    if (manualLine) {
      return {
        category_name: manualLine.category_name || '',
        subcategory_name: manualLine.subcategory_name || '',
        line_name: manualLine.name || ''
      };
    }
  }

  const suggestedLineId = importRowLineIdInput?.value ? Number(importRowLineIdInput.value) : null;
  if (suggestedLineId && Number.isInteger(suggestedLineId) && suggestedLineId > 0) {
    const suggestedLine = (state.importReview.rowEditor.suggestedCandidates || [])
      .find((candidate) => Number(candidate.id_line) === suggestedLineId);

    if (suggestedLine) {
      return {
        category_name: suggestedLine.category_name || '',
        subcategory_name: suggestedLine.subcategory_name || '',
        line_name: suggestedLine.name || ''
      };
    }

    const fallbackLine = state.lines.find((line) => Number(line.id_line) === suggestedLineId);
    if (fallbackLine) {
      return {
        category_name: fallbackLine.category_name || '',
        subcategory_name: fallbackLine.subcategory_name || '',
        line_name: fallbackLine.name || ''
      };
    }
  }

  return state.importReview.rowEditor.originalClassification || { category_name: '', subcategory_name: '', line_name: '' };
};

const syncImportClassificationPreview = () => {
  setImportDetectedClassification(resolveSelectedClassificationPreview());
  renderImportRowImagesPreview();
};

const renderManualLineOptions = (searchValue = '') => {
  if (!importRowManualLineIdInput) {
    return;
  }

  const normalizedSearch = normalizeSearchValue(searchValue);
  const candidates = state.lines.filter((line) => {
    if (!normalizedSearch) {
      return true;
    }

    return [line.name, line.category_name, line.subcategory_name]
      .some((value) => normalizeSearchValue(value).includes(normalizedSearch));
  });

  const limitedCandidates = candidates.slice(0, 120);

  importRowManualLineIdInput.innerHTML = ['<option value="">Sin selección manual</option>']
    .concat(limitedCandidates.map((line) => (
      `<option value="${line.id_line}">${line.category_name} / ${line.subcategory_name} / ${line.name}</option>`
    )))
    .join('');
};

const handleImportRowLineSearch = (event) => {
  renderManualLineOptions(String(event.target.value || ''));
};

const handleImportRowSimilarLineChange = () => {
  if (importRowLineIdInput?.value) {
    if (importRowManualLineIdInput) {
      importRowManualLineIdInput.value = '';
    }
  }

  syncImportClassificationPreview();
};

const handleImportRowManualLineChange = () => {
  if (importRowManualLineIdInput?.value) {
    if (importRowLineIdInput) {
      importRowLineIdInput.value = '';
    }
  }

  syncImportClassificationPreview();
};

const openImportRowEditor = (rowNumber) => {
  const selectedBatch = state.importReview.selectedBatch;
  const rows = Array.isArray(selectedBatch?.import_data?.rows) ? selectedBatch.import_data.rows : [];
  const row = rows.find((candidate) => Number(candidate.row_number) === Number(rowNumber));

  if (!row) {
    setImportReviewFeedback('No se encontró la fila seleccionada.', 'error');
    return;
  }

  importRowNumberInput.value = String(row.row_number);
  importRowNameInput.value = row?.normalized?.name || row?.raw_data?.name || '';
  importRowBrandInput.value = row?.normalized?.brand || row?.raw_data?.brand || '';
  importRowDescriptionInput.value = row?.normalized?.description || row?.raw_data?.description || '';
  importRowPriceInput.value = row?.normalized?.price ?? '';
  importRowSkuInternInput.value = row?.normalized?.sku_intern || row?.raw_data?.sku_intern || '';
  importRowCostPriceInput.value = row?.normalized?.cost_price ?? row?.raw_data?.cost_price ?? '';
  importRowQuantityInput.value = row?.normalized?.quantity ?? '';
  importRowMinStockInput.value = row?.normalized?.min_stock ?? 0;
  renderImportAttributeRows(inlineAttributesToEntries(attributesObjectToInlineText(row?.normalized?.attributes)));
  state.importReview.rowEditor.originalClassification = {
    category_name: row?.classification?.line?.category_name || '',
    subcategory_name: row?.classification?.line?.subcategory_name || '',
    line_name: row?.classification?.line?.name || ''
  };
  setImportDetectedClassification(state.importReview.rowEditor.originalClassification);
  importRowDecisionInput.value = row?.validation?.status === 'rejected' ? 'rejected' : 'approved';
  state.importReview.rowEditor.existingMainImage = String(row?.staging_images?.main_image || '');
  state.importReview.rowEditor.existingMainImageSource = String(row?.staging_images?.main_image_source || 'subcategory_default');
  state.importReview.rowEditor.existingMainImageUrl = String(row?.staging_images?.main_image_url || '');
  state.importReview.rowEditor.existingSecondaryImages = Array.isArray(row?.staging_images?.secondary_images)
    ? row.staging_images.secondary_images
    : [];
  state.importReview.rowEditor.selectedSecondaryImageFiles = [];
  if (importRowMainImageFileInput) {
    importRowMainImageFileInput.value = '';
  }
  if (importRowSecondaryImagesFilesInput) {
    importRowSecondaryImagesFilesInput.value = '';
  }
  importRowNotesInput.value = row?.validation?.notes || '';
  fillImportRowLineOptions(row);
  if (importRowLineSearchInput) {
    importRowLineSearchInput.value = '';
  }
  renderManualLineOptions('');
  if (importRowManualLineIdInput) {
    importRowManualLineIdInput.value = '';
  }
  syncImportClassificationPreview();
  state.importReview.rowEditor.currentRowNumber = Number(row.row_number);
  renderImportRowImagesPreview();

  companyImportRowMessage.textContent = '';
  openCompanyModal(companyImportRowModal);
};

const handleImportRowFormSubmit = async (event) => {
  event.preventDefault();

  try {
    const batchId = Number(state.importReview.selectedBatchId || 0);
    const rowNumber = Number(importRowNumberInput.value || 0);

    if (!batchId || !rowNumber) {
      throw new Error('No hay fila seleccionada para guardar');
    }

    companyImportRowMessage.textContent = 'Guardando revisión de fila...';

    const payload = {
      decision: String(importRowDecisionInput.value || 'approved'),
      line_id: (() => {
        const manualLineId = importRowManualLineIdInput?.value ? Number(importRowManualLineIdInput.value) : null;
        if (manualLineId && Number.isInteger(manualLineId) && manualLineId > 0) {
          return manualLineId;
        }

        return importRowLineIdInput.value ? Number(importRowLineIdInput.value) : null;
      })(),
      notes: String(importRowNotesInput.value || '').trim(),
      row_updates: {
        name: String(importRowNameInput.value || '').trim(),
        brand: String(importRowBrandInput.value || '').trim(),
        sku_intern: String(importRowSkuInternInput?.value || '').trim(),
        cost_price: importRowCostPriceInput?.value ?? '',
        description: String(importRowDescriptionInput.value || '').trim(),
        price: importRowPriceInput.value,
        quantity: importRowQuantityInput.value,
        min_stock: importRowMinStockInput.value,
        attributes: collectImportAttributesInlineText()
      }
    };

    await requestJson(`${API_BASE_URL}/api/products/import/batches/${batchId}/rows/${rowNumber}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const mainImageFile = importRowMainImageFileInput?.files?.[0] || null;
    const secondaryImageFiles = Array.isArray(state.importReview.rowEditor.selectedSecondaryImageFiles)
      ? state.importReview.rowEditor.selectedSecondaryImageFiles
      : [];

    if (mainImageFile || secondaryImageFiles.length) {
      const imageFormData = new FormData();

      if (mainImageFile) {
        imageFormData.append('main_image', mainImageFile);
      }

      secondaryImageFiles.forEach((file) => {
        imageFormData.append('secondary_images', file);
      });

      const imageResponse = await fetch(`${API_BASE_URL}/api/products/import/batches/${batchId}/rows/${rowNumber}/images`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: imageFormData
      });

      const imagePayload = await imageResponse.json();
      if (!imageResponse.ok) {
        throw new Error(imagePayload.error || 'No se pudieron subir imágenes para la fila');
      }
    }

    companyImportRowMessage.textContent = 'Fila actualizada correctamente.';
    await loadImportBatchDetail(batchId);
    closeCompanyModal(companyImportRowModal);
    setImportReviewFeedback('Revisión de fila guardada correctamente.');
  } catch (error) {
    companyImportRowMessage.textContent = error.message;
  }
};

const handleApproveImportBatch = async () => {
  try {
    const batchId = Number(state.importReview.selectedBatchId || 0);

    if (!batchId) {
      throw new Error('Selecciona un lote para aprobar');
    }

    setImportReviewFeedback('Aprobando lote...');

    await requestJson(`${API_BASE_URL}/api/products/import/batches/${batchId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    await loadImportBatchDetail(batchId);
    await loadImportBatches();
    setImportReviewFeedback('Lote aprobado correctamente.');
  } catch (error) {
    setImportReviewFeedback(error.message, 'error');
  }
};

const handleDeleteImportBatch = async () => {
  try {
    const batchId = Number(state.importReview.selectedBatchId || 0);

    if (!batchId) {
      throw new Error('Selecciona un lote para eliminar');
    }

    const shouldDelete = globalThis.confirm(`¿Seguro que deseas eliminar el lote #${batchId}? Esta acción no se puede deshacer.`);
    if (!shouldDelete) {
      return;
    }

    setImportReviewFeedback('Eliminando lote...');

    await requestJson(`${API_BASE_URL}/api/products/import/batches/${batchId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    state.importReview.selectedBatchId = null;
    state.importReview.selectedBatch = null;
    if (companyImportBatchSelect) {
      companyImportBatchSelect.value = '';
    }
    renderSelectedBatchSummary(null);
    if (companyImportRowsList) {
      companyImportRowsList.innerHTML = '<p>Selecciona un lote para revisar filas.</p>';
    }
    renderImportBatchResult(null);

    await loadImportBatches();
    setImportReviewFeedback('Lote eliminado correctamente.');
  } catch (error) {
    setImportReviewFeedback(error.message, 'error');
  }
};

const handlePublishImportBatch = async () => {
  try {
    const batchId = Number(state.importReview.selectedBatchId || 0);

    if (!batchId) {
      throw new Error('Selecciona un lote para publicar');
    }

    const shouldPublish = globalThis.confirm(`¿Publicar el lote #${batchId} al catálogo real?`);
    if (!shouldPublish) {
      return;
    }

    setImportReviewFeedback('Publicando lote en catálogo...');

    const response = await requestJson(`${API_BASE_URL}/api/products/import/batches/${batchId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    await loadImportBatchDetail(batchId);
    await loadImportBatches();
    goToOwnProductsPage(1);

    const createdCount = Array.isArray(response.created_products) ? response.created_products.length : 0;
    const errorsCount = Array.isArray(response.errors) ? response.errors.length : 0;
    const errorDetails = errorsCount
      ? response.errors
        .map((entry) => `Fila ${entry?.row_number || '?'}: ${entry?.error || 'Error desconocido'}`)
        .slice(0, 10)
        .join(' | ')
      : '';
    const message = errorsCount
      ? `Lote publicado parcialmente: ${createdCount} producto(s) creados, ${errorsCount} con error. ${errorDetails}`
      : `Lote publicado correctamente: ${createdCount} producto(s) creados.`;

    setImportReviewFeedback(message);
  } catch (error) {
    setImportReviewFeedback(error.message, 'error');
  }
};

const handleImportRowsListClick = (event) => {
  const targetButton = event.target.closest('button[data-import-action="edit"]');
  if (!targetButton) {
    return;
  }

  const rowNumber = Number(targetButton.dataset.rowNumber || 0);
  if (!rowNumber) {
    return;
  }

  openImportRowEditor(rowNumber);
};

const handleImportRowAttributesClick = (event) => {
  const removeButton = event.target.closest('button[data-import-attr="remove"]');
  if (!removeButton) {
    return;
  }

  const rows = Array.from(importRowAttributesList?.querySelectorAll('.company-import-attribute-row') || []);
  if (rows.length <= 1) {
    const keyInput = rows[0]?.querySelector('[data-import-attr="key"]');
    const valueInput = rows[0]?.querySelector('[data-import-attr="value"]');
    if (keyInput) {
      keyInput.value = '';
    }
    if (valueInput) {
      valueInput.value = '';
    }
    return;
  }

  removeButton.closest('.company-import-attribute-row')?.remove();
};

const handleImportAddAttribute = () => {
  if (!importRowAttributesList) {
    return;
  }

  importRowAttributesList.insertAdjacentHTML('beforeend', createImportAttributeRowMarkup('', ''));
};

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase();

const buildDefaultSubcategoryImageName = (options = {}) => {
  const subcategoryName = String(options.subcategoryName || '').trim();
  const lineName = String(options.lineName || '').trim();
  const productName = String(options.productName || '').trim();
  const categoryName = String(options.categoryName || '').trim();

  const slug = [subcategoryName, lineName, productName, categoryName]
    .map((value) => normalizeSearchValue(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
    .find(Boolean) || 'producto_default';
  if (slug === 'producto_default') {
    return DEFAULT_STAGING_PRODUCT_IMAGE_URL;
  }

  return `/uploads/products/defaults/${slug}.png`;
};

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

const getUniqueCatalogOptions = (items, idKey, nameKey) => {
  const map = new Map();

  items.forEach((item) => {
    const optionId = Number(item[idKey]);
    const optionName = String(item[nameKey] || '').trim();

    if (!Number.isInteger(optionId) || optionId <= 0 || !optionName || map.has(optionId)) {
      return;
    }

    map.set(optionId, { id: optionId, name: optionName });
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
};

const renderCategoryFilterOptions = () => {
  if (!companyProductsCategorySelect) {
    return;
  }

  companyProductsCategorySelect.innerHTML = ['<option value="">Todas las categorías</option>']
    .concat(state.categories.map((category) => `<option value="${category.id}">${category.name}</option>`))
    .join('');

  companyProductsCategorySelect.value = state.categoryId ? String(state.categoryId) : '';
};

const renderSubcategoryFilterOptions = () => {
  if (!companyProductsSubcategorySelect) {
    return;
  }

  const filteredSubcategories = state.categoryId
    ? state.subcategories.filter((subcategory) => Number(subcategory.categoryId) === Number(state.categoryId))
    : state.subcategories;

  if (state.subcategoryId && !filteredSubcategories.some((subcategory) => subcategory.id === state.subcategoryId)) {
    state.subcategoryId = null;
  }

  companyProductsSubcategorySelect.innerHTML = ['<option value="">Todas las subcategorías</option>']
    .concat(filteredSubcategories.map((subcategory) => `<option value="${subcategory.id}">${subcategory.name}</option>`))
    .join('');

  companyProductsSubcategorySelect.value = state.subcategoryId ? String(state.subcategoryId) : '';
};

const syncCatalogFilterOptions = () => {
  state.categories = getUniqueCatalogOptions(state.lines, 'id_category', 'category_name');
  state.subcategories = getUniqueCatalogOptions(state.lines, 'id_subcategory_fk', 'subcategory_name')
    .map((subcategory) => {
      const relatedLine = state.lines.find((line) => Number(line.id_subcategory_fk) === subcategory.id);
      return {
        ...subcategory,
        categoryId: Number(relatedLine?.id_category || 0)
      };
    })
    .filter((subcategory) => Number.isInteger(subcategory.categoryId) && subcategory.categoryId > 0);

  renderCategoryFilterOptions();
  renderSubcategoryFilterOptions();
};

const openCreateProductModal = () => {
  if (!companyProductModal) {
    return;
  }

  companyProductModal.hidden = false;
  document.body.classList.add('modal-open');
  document.getElementById('product-name')?.focus();
};

const closeCreateProductModal = () => {
  if (!companyProductModal) {
    return;
  }

  companyProductModal.hidden = true;
  if (!document.querySelector('.company-modal:not([hidden])')) {
    document.body.classList.remove('modal-open');
  }
};

const openCompanyModal = (modalElement) => {
  if (!modalElement) {
    return;
  }

  modalElement.hidden = false;
  document.body.classList.add('modal-open');
};

const closeCompanyModal = (modalElement) => {
  if (!modalElement) {
    return;
  }

  modalElement.hidden = true;

  if (!document.querySelector('.company-modal:not([hidden])')) {
    document.body.classList.remove('modal-open');
  }
};

const closeCompanyModalById = (modalId) => {
  const modalElement = document.getElementById(modalId);
  closeCompanyModal(modalElement);
};

const handleCreateProductModalClick = (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const closeTarget = event.target.closest('[data-close-modal]');

  if (closeTarget instanceof HTMLElement) {
    const { closeModal: modalId } = closeTarget.dataset;
    if (modalId) {
      closeCompanyModalById(modalId);
    }
  }
};

const handleCreateProductModalKeydown = (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  const openedModal = document.querySelector('.company-modal:not([hidden])');

  if (openedModal instanceof HTMLElement) {
    closeCompanyModal(openedModal);
  }
};

const loadLines = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/products/management/line-references`);
  state.lines = data.lines || [];
  state.filteredLines = state.lines;
  renderLineOptions();
  renderSelectedLineContext();
  syncCatalogFilterOptions();
};

const summarizeProducts = (pagination) => {
  const searchLabel = state.productSearch
    ? `<p>Búsqueda actual: <b>${state.productSearch}</b></p>`
    : '';
  const categoryLabel = state.categoryId
    ? `<p>Filtro categoría activo</p>`
    : '';
  const subcategoryLabel = state.subcategoryId
    ? `<p>Filtro subcategoría activo</p>`
    : '';

  companyProductsSummary.innerHTML = `
    <p>Total productos propios: <b>${pagination.total}</b></p>
    <p>Página actual: <b>${pagination.page}</b> de <b>${pagination.total_pages}</b></p>
    ${searchLabel}
    ${categoryLabel}
    ${subcategoryLabel}
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

  companyProductsList.innerHTML = products.map((product) => {
    const priceLabel = Number(product.price || 0).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const costPriceLabel = product.cost_price == null || product.cost_price === ''
      ? 'No definido'
      : `USD ${Number(product.cost_price || 0).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    const statusLabel = product.is_active ? 'Publicado' : 'Inactivo';
    const statusClass = product.is_active ? 'company-product-card__badge' : 'company-product-card__badge company-product-card__badge--inactive';

    return `
      <article class="company-product-card">
        <div class="company-product-card__media">
          ${product.main_image_url
            ? `<img src="${product.main_image_url}" alt="${product.name || product.line_name}">`
            : '<div class="company-product-card__media-placeholder">Sin imagen</div>'}
        </div>

        <div class="company-product-card__body">
          <div class="company-product-card__title-row">
            <h3>${product.name || 'Sin nombre'}</h3>
            <span class="${statusClass}">${statusLabel}</span>
          </div>
          <p class="company-product-card__meta">${product.category_name} · ${product.subcategory_name} · ${product.line_name}</p>

          <div class="company-product-card__stats">
            <div class="company-product-card__stat">
              <small>Precio</small>
              <strong>USD ${priceLabel}</strong>
            </div>
            <div class="company-product-card__stat">
              <small>Stock</small>
              <strong>${product.quantity ?? 0} unidades</strong>
            </div>
            <div class="company-product-card__stat">
              <small>SKU</small>
              <strong>${product.sku}</strong>
            </div>
            <div class="company-product-card__stat">
              <small>SKU interno</small>
              <strong>${product.sku_intern || 'No definido'}</strong>
            </div>
            <div class="company-product-card__stat">
              <small>Costo</small>
              <strong>${costPriceLabel}</strong>
            </div>
          </div>
        </div>

        <div class="company-product-card__actions">
          <button type="button" onclick="editManagedProduct(${product.id_product})">Editar producto</button>
          <button type="button" onclick="openStockModal(${product.id_product}, 'set')">Sincronizar stock</button>
          <button type="button" class="${product.is_active ? 'company-product-card__status-button company-product-card__status-button--danger' : 'company-product-card__status-button company-product-card__status-button--success'}" onclick="openStatusModal(${product.id_product}, ${product.is_active})">${product.is_active ? 'Desactivar' : 'Activar'}</button>
          <button type="button" onclick="openStockModal(${product.id_product}, 'increase')">+ Stock</button>
          <button type="button" onclick="openStockModal(${product.id_product}, 'decrease')">- Stock</button>
        </div>
      </article>
    `;
  }).join('');
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
  const query = new URLSearchParams({
    page: String(page),
    limit: String(state.pagination.limit)
  });

  if (state.productSearch) {
    query.set('query', state.productSearch);
  }

  if (state.productInternalSearch) {
    query.set('sku_intern', state.productInternalSearch);
  }

  if (state.categoryId) {
    query.set('category_id', String(state.categoryId));
  }

  if (state.subcategoryId) {
    query.set('subcategory_id', String(state.subcategoryId));
  }

  if (state.sort) {
    query.set('sort', state.sort);
  }

  const data = await requestJson(`${API_BASE_URL}/api/products/management/products?${query.toString()}`);
  state.pagination = data.pagination || state.pagination;
  summarizeProducts(state.pagination);
  renderProducts(data.products || []);
  renderPagination(state.pagination);
};

function handleOwnProductsSearch(event) {
  state.productSearch = event.target.value.trim();
  loadOwnProducts(1).catch((error) => {
    companyProductFormMessage.innerText = error.message;
  });
}

function handleOwnProductsInternalSkuSearch(event) {
  state.productInternalSearch = event.target.value.trim();
  loadOwnProducts(1).catch((error) => {
    companyProductFormMessage.innerText = error.message;
  });
}

function handleOwnProductsCategoryFilter(event) {
  state.categoryId = Number(event.target.value || 0) || null;
  state.subcategoryId = null;
  renderSubcategoryFilterOptions();
  loadOwnProducts(1).catch((error) => {
    companyProductFormMessage.innerText = error.message;
  });
}

function handleOwnProductsSubcategoryFilter(event) {
  state.subcategoryId = Number(event.target.value || 0) || null;
  loadOwnProducts(1).catch((error) => {
    companyProductFormMessage.innerText = error.message;
  });
}

function handleOwnProductsSort(event) {
  state.sort = String(event.target.value || 'price_desc').trim() || 'price_desc';
  loadOwnProducts(1).catch((error) => {
    companyProductFormMessage.innerText = error.message;
  });
}

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

const mergeImportRowSecondaryImages = (incomingFiles) => {
  const currentFiles = Array.isArray(state.importReview.rowEditor.selectedSecondaryImageFiles)
    ? state.importReview.rowEditor.selectedSecondaryImageFiles
    : [];
  const currentKeys = new Set(currentFiles.map(buildSecondaryImageKey));

  incomingFiles.forEach((file) => {
    const fileKey = buildSecondaryImageKey(file);

    if (!currentKeys.has(fileKey)) {
      currentFiles.push(file);
      currentKeys.add(fileKey);
    }
  });

  if (currentFiles.length > MAX_SECONDARY_IMAGES) {
    state.importReview.rowEditor.selectedSecondaryImageFiles = currentFiles.slice(0, MAX_SECONDARY_IMAGES);
    return;
  }

  state.importReview.rowEditor.selectedSecondaryImageFiles = currentFiles;
};

const handleSecondaryImagesChange = () => {
  mergeSecondaryImages(Array.from(productSecondaryImagesInput.files));
  productSecondaryImagesInput.value = '';
  renderSecondaryImagesPreview();
};

const handleImportRowSecondaryImagesChange = () => {
  mergeImportRowSecondaryImages(Array.from(importRowSecondaryImagesFilesInput?.files || []));

  if (importRowSecondaryImagesFilesInput) {
    importRowSecondaryImagesFilesInput.value = '';
  }

  renderImportRowImagesPreview();
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
  closeCompanyModal(companyProductEditorModal);
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
  openCompanyModal(companyProductEditorModal);
  editProductIdInput.value = String(product.id_product);
  editProductNameInput.value = product.name || '';
  editProductBrandInput.value = product.brand || '';
  editProductDescriptionInput.value = product.description || '';
  editProductPriceInput.value = product.price ?? '';
  editProductSkuInternInput.value = product.sku_intern || '';
  editProductCostPriceInput.value = product.cost_price ?? '';
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
    formData.set('sku_intern', String(productSkuInternInput?.value || '').trim());
    formData.set('cost_price', productCostPriceInput?.value || '');
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
    closeCreateProductModal();
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
    formData.set('sku_intern', String(editProductSkuInternInput?.value || '').trim());
    formData.set('cost_price', editProductCostPriceInput?.value || '');
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

function openStatusModal(productId, isActive) {
  const isCurrentlyActive = isActive === true || isActive === 'true';

  state.pendingStatus.productId = Number(productId);
  state.pendingStatus.nextValue = !isCurrentlyActive;

  if (statusProductIdInput) {
    statusProductIdInput.value = String(productId);
  }

  if (statusNextValueInput) {
    statusNextValueInput.value = String(!isCurrentlyActive);
  }

  if (companyProductStatusMessage) {
    companyProductStatusMessage.innerText = isCurrentlyActive
      ? '¿Deseas deshabilitar este producto?'
      : '¿Deseas habilitar este producto?';
  }

  if (companyProductStatusConfirmButton) {
    companyProductStatusConfirmButton.innerText = isCurrentlyActive ? 'Deshabilitar' : 'Habilitar';
  }

  openCompanyModal(companyProductStatusModal);
}

async function handleProductStatusSubmit(event) {
  event.preventDefault();

  try {
    const productId = Number(statusProductIdInput?.value || state.pendingStatus.productId || 0);
    const nextValue = String(statusNextValueInput?.value || String(state.pendingStatus.nextValue)).trim() === 'true';

    if (!productId) {
      throw new Error('Producto no válido para cambiar estado');
    }

    const data = await requestJson(`${API_BASE_URL}/api/products/${productId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_active: nextValue
      })
    });

    companyProductFormMessage.innerText = data.message;
    closeCompanyModal(companyProductStatusModal);
    await loadOwnProducts(state.pagination.page);
    if (state.editor.productId === productId) {
      await refreshManagedProductDetail();
    }
  } catch (error) {
    if (companyProductStatusMessage) {
      companyProductStatusMessage.innerText = error.message;
    }
  }
}

function openStockModal(productId, operation) {
  state.pendingStock.productId = Number(productId);
  state.pendingStock.operation = String(operation || 'set');

  if (stockProductIdInput) {
    stockProductIdInput.value = String(productId);
  }

  if (stockOperationInput) {
    stockOperationInput.value = state.pendingStock.operation;
  }

  if (stockQuantityInput) {
    stockQuantityInput.value = state.pendingStock.operation === 'set' ? '0' : '1';
  }

  if (stockNotesInput) {
    stockNotesInput.value = '';
  }

  if (companyProductStockMessage) {
    const labels = {
      increase: 'Aumentar stock',
      decrease: 'Disminuir stock',
      set: 'Sincronizar stock'
    };
    companyProductStockMessage.innerText = labels[state.pendingStock.operation] || 'Ajustar stock';
  }

  openCompanyModal(companyProductStockModal);
}

async function handleProductStockSubmit(event) {
  event.preventDefault();

  try {
    const productId = Number(stockProductIdInput?.value || state.pendingStock.productId || 0);
    const operation = String(stockOperationInput?.value || state.pendingStock.operation || 'set');
    const quantity = Number(stockQuantityInput?.value || 0);
    const notes = String(stockNotesInput?.value || '').trim();

    if (!productId) {
      throw new Error('Producto no válido para ajustar stock');
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('La cantidad debe ser un número entero mayor o igual a 0');
    }

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
    closeCompanyModal(companyProductStockModal);
    await loadOwnProducts(state.pagination.page);
    if (state.editor.productId === productId) {
      await refreshManagedProductDetail();
    }
  } catch (error) {
    if (companyProductStockMessage) {
      companyProductStockMessage.innerText = error.message;
    }
  }
}

async function goToOwnProductsPage(page) {
  if (page < 1 || page > state.pagination.total_pages) {
    return;
  }

  await loadOwnProducts(page).catch((error) => {
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
globalThis.openStatusModal = openStatusModal;
globalThis.openStockModal = openStockModal;

companyImportDownloadTemplateButton?.addEventListener('click', handleDownloadImportTemplate);
companyImportUploadBatchButton?.addEventListener('click', handleUploadImportBatch);
companyImportRefreshBatchesButton?.addEventListener('click', () => {
  loadImportBatches().catch((error) => setImportReviewFeedback(error.message, 'error'));
});
companyImportBatchSelect?.addEventListener('change', (event) => {
  const nextBatchId = Number(event.target.value || 0);
  loadImportBatchDetail(nextBatchId).catch((error) => setImportReviewFeedback(error.message, 'error'));
});
companyImportRowsList?.addEventListener('click', handleImportRowsListClick);
companyImportApproveBatchButton?.addEventListener('click', handleApproveImportBatch);
companyImportPublishBatchButton?.addEventListener('click', handlePublishImportBatch);
companyImportDeleteBatchButton?.addEventListener('click', handleDeleteImportBatch);
companyImportRowForm?.addEventListener('submit', handleImportRowFormSubmit);
importRowAttributesList?.addEventListener('click', handleImportRowAttributesClick);
importRowAddAttributeButton?.addEventListener('click', handleImportAddAttribute);
importRowMainImageFileInput?.addEventListener('change', renderImportRowImagesPreview);
importRowSecondaryImagesFilesInput?.addEventListener('change', handleImportRowSecondaryImagesChange);
importRowLineSearchInput?.addEventListener('input', handleImportRowLineSearch);
importRowLineIdInput?.addEventListener('change', handleImportRowSimilarLineChange);
importRowManualLineIdInput?.addEventListener('change', handleImportRowManualLineChange);

productLineSearchInput.addEventListener('input', filterLines);
companyProductsSearchInput.addEventListener('input', handleOwnProductsSearch);
companyProductsInternalSkuSearchInput?.addEventListener('input', handleOwnProductsInternalSkuSearch);
companyProductsCategorySelect?.addEventListener('change', handleOwnProductsCategoryFilter);
companyProductsSubcategorySelect?.addEventListener('change', handleOwnProductsSubcategoryFilter);
companyProductsSortSelect?.addEventListener('change', handleOwnProductsSort);
productLineSelect.addEventListener('change', renderSelectedLineContext);
productMainImageInput.addEventListener('change', renderMainImagePreview);
productSecondaryImagesInput.addEventListener('change', handleSecondaryImagesChange);
productSecondaryImagesClearButton.addEventListener('click', clearSecondaryImages);
editProductMainImageInput.addEventListener('change', renderEditorMainImagePreview);
editProductSecondaryImagesInput.addEventListener('change', renderEditorSecondaryImagesPreview);
editProductCancelButton.addEventListener('click', hideProductEditor);
closeCompanyProductEditorModalButton?.addEventListener('click', hideProductEditor);
openCompanyProductModalButton?.addEventListener('click', openCreateProductModal);
closeCompanyProductModalButton?.addEventListener('click', closeCreateProductModal);
globalThis.document.addEventListener('click', handleCreateProductModalClick);
globalThis.addEventListener('keydown', handleCreateProductModalKeydown);
globalThis.addEventListener('beforeunload', () => {
  revokeCreatePreviewUrls();
  revokeEditorPreviewUrls();
});

companyProductForm.addEventListener('submit', handleCreateProduct);
companyProductEditorForm.addEventListener('submit', handleEditProduct);
companyProductStatusForm?.addEventListener('submit', handleProductStatusSubmit);
companyProductStockForm?.addEventListener('submit', handleProductStockSubmit);

fetchCurrentSession()
  .then(async (session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesión no válida para empresa');
    }

    const company = session.data.company;
    if (getCompanyRoleId(company) === 1) {
      throw new Error('Este módulo es solo para detallistas y mayoristas');
    }

    if (!globalThis.canUseCompanySellModules?.(company)) {
      throw new Error('Tu empresa aún no está habilitada jurídicamente para gestionar productos');
    }

    state.session = session;
    companyProductsRoleNote.innerText = `Empresa actual: ${company.name}. Los productos que cargues quedan asociados a tu empresa.`;

    syncImportTargetCompanyVisibility(company);

    if (companyProductsSortSelect) {
      companyProductsSortSelect.value = state.sort;
    }

    await loadLines();
    await loadImportBatches();
    resetProductForm();
    hideProductEditor();
    closeCompanyModal(companyProductStatusModal);
    closeCompanyModal(companyProductStockModal);
    await loadOwnProducts();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
