if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

const purchasesSummary = document.getElementById('purchases-summary');
const purchasesList = document.getElementById('purchases-list');
const purchasesFeedback = document.getElementById('purchases-feedback');
const purchasesSearchInput = document.getElementById('purchases-search');
const purchaseDetailModal = document.getElementById('purchase-detail-modal');
const purchaseDetailContent = document.getElementById('purchase-detail-content');
const purchaseDetailCloseButton = document.getElementById('purchase-detail-close');
const purchasePaymentsModal = document.getElementById('purchase-payments-modal');
const purchasePaymentsContent = document.getElementById('purchase-payments-content');
const purchasePaymentsCloseButton = document.getElementById('purchase-payments-close');

const state = {
  checkouts: [],
  search: '',
  selectedCheckoutId: null,
  selectedPaymentsCheckoutId: null
};

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
  const data = contentType.includes('application/json')
    ? JSON.parse(rawBody || '{}')
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `Error en la solicitud (${response.status})`);
  }

  if (!data) {
    throw new Error('La respuesta del servidor no llegó en formato JSON');
  }

  return data;
};

const uploadEvidence = async (groupId, formData) => {
  const response = await fetch(`${API_BASE_URL}/api/purchases/groups/${groupId}/evidence`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders()
    },
    body: formData
  });
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();
  const data = contentType.includes('application/json')
    ? JSON.parse(rawBody || '{}')
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `No se pudo cargar la evidencia (${response.status})`);
  }

  if (!data) {
    throw new Error('La respuesta del servidor no llegó en formato JSON');
  }

  return data;
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

const getPurchaseStatusLabel = (status) => {
  const labels = {
    OPEN: 'Abierta',
    PARTIAL_SUBMITTED: 'Pago enviado parcialmente',
    PARTIAL_APPROVED: 'Aprobada parcialmente',
    COMPLETED: 'Completada',
    COMPLETED_WITH_INCIDENTS: 'Completada con incidencias',
    PENDING_PAYMENT: 'Pendiente de pago',
    PAYMENT_SUBMITTED: 'Pago enviado',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    EXPIRED: 'Expirado',
    SUBMITTED: 'Enviada'
  };

  return labels[status] || status || 'Sin estado';
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const buildCurrencyPairLabel = (usdValue, bsValue) => `USD ${formatAmount(usdValue)} | Bs ${formatAmount(bsValue)}`;

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase();

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const setFeedback = (message, type = 'info') => {
  if (!purchasesFeedback) {
    return;
  }

  purchasesFeedback.textContent = message || '';
  purchasesFeedback.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const resolveCompanyLogoUrl = (company) => {
  const imageName = String(company?.img_profile || '').trim();

  if (!imageName) {
    return '';
  }

  if (imageName.startsWith('http://') || imageName.startsWith('https://') || imageName.startsWith('/')) {
    return imageName;
  }

  return `/uploads/profiles/companies/${imageName}`;
};

const resolveProductImageUrl = (product) => String(product?.main_image_url || '').trim();

const getCheckoutDisplayStatus = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const deliveryStatuses = groups.map((group) => group.delivery?.status).filter(Boolean);

  if (deliveryStatuses.length && deliveryStatuses.every((status) => status === 'DELIVERED')) {
    return 'Entregado';
  }

  if (deliveryStatuses.includes('SHIPPED')) {
    return 'Enviado';
  }

  if (deliveryStatuses.includes('PREPARING')) {
    return 'En preparacion';
  }

  if (!groups.length) {
    return getPurchaseStatusLabel(checkout?.status);
  }

  if (groups.every((group) => group.status === 'APPROVED')) {
    return 'Entregado';
  }

  if (groups.every((group) => group.status === 'REJECTED')) {
    return 'Rechazado';
  }

  if (groups.some((group) => group.status === 'PAYMENT_SUBMITTED')) {
    return 'Pago enviado';
  }

  if (groups.some((group) => group.status === 'PENDING_PAYMENT')) {
    return 'Pendiente de pago';
  }

  return getPurchaseStatusLabel(checkout?.status);
};

const getCheckoutPrimaryItems = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  return groups.flatMap((group) => (Array.isArray(group.items) ? group.items : []));
};

const getCheckoutPrimaryItemSummary = (checkout) => {
  const items = getCheckoutPrimaryItems(checkout);

  if (!items.length) {
    return 'Sin productos registrados';
  }

  const [firstItem] = items;
  const firstName = firstItem.product?.name || `Producto ${firstItem.id_product}`;
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (items.length === 1) {
    return `${quantity}x ${firstName}`;
  }

  return `${quantity} producto(s) | principal: ${firstName}`;
};

const getCheckoutPaymentSummary = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const approvedGroups = groups.filter((group) => group.status === 'APPROVED').length;

  if (!groups.length) {
    return 'Sin grupos registrados';
  }

  if (approvedGroups === groups.length) {
    return 'Pago validado';
  }

  if (groups.every((group) => group.status === 'REJECTED')) {
    return 'Pago rechazado';
  }

  if (groups.some((group) => group.status === 'PAYMENT_SUBMITTED')) {
    return 'Pago en revisión';
  }

  if (groups.some((group) => group.status === 'PENDING_PAYMENT')) {
    return 'Pago pendiente';
  }

  return 'Pago con incidencias';
};

const renderPaymentMethods = (paymentMethods) => {
  if (!Array.isArray(paymentMethods) || !paymentMethods.length) {
    return '<li>La empresa aún no ha registrado métodos de pago.</li>';
  }

  return paymentMethods.map((method) => {
    const bankName = String(method.bank_name || 'Sin banco').trim();
    const methodType = String(method.method_type || 'Sin tipo').trim();
    const accountNumber = String(method.account_number || 'Sin número de cuenta').trim();
    const accountHolder = String(method.account_holder || 'Sin titular').trim();
    const instructions = String(method.instructions || 'Sin instrucciones').trim();

    return `
      <li>
        <p><b>Banco:</b> ${escapeHtml(bankName)}</p>
        <p><b>Titular:</b> ${escapeHtml(accountHolder)}</p>
        <p><b>Tipo:</b> ${escapeHtml(methodType)}</p>
        <p><b>Número de cuenta:</b> ${escapeHtml(accountNumber)}</p>
        <p><b>Instrucciones:</b> ${escapeHtml(instructions)}</p>
      </li>
    `;
  }).join('');
};

const renderPaymentHistoryGroups = (groups) => groups.map((group) => {
  const items = Array.isArray(group.items) ? group.items : [];
  const evidences = Array.isArray(group.evidences) ? group.evidences : [];
  const paymentMethods = Array.isArray(group.company?.payment_methods) ? group.company.payment_methods : [];
  const companyName = group.company?.name || 'Sin proveedor';
  const companyLogoUrl = resolveCompanyLogoUrl(group.company);
  const companyEmail = group.company?.email || 'No disponible';
  const companyPhone = group.company?.cell_phone || 'No disponible';
  const paymentDueAt = group.payment_due_at || null;
  const paymentWindowOpen = Boolean(paymentDueAt) && new Date(paymentDueAt).getTime() >= Date.now();
  const canUploadEvidence = group.status === 'PENDING_PAYMENT'
    || (group.status === 'REJECTED' && paymentWindowOpen);
  const paymentStatus = getPurchaseStatusLabel(group.status);
  const decisions = String(group.review_note || 'Sin observaciones').trim();
  const uploadActionLabel = group.status === 'REJECTED' ? 'Reenviar pago' : 'Subir pago';

  return `
    <details class="customer-card customer-purchase-group">
      <summary class="customer-purchase-group__summary">
        <div class="customer-purchase-group__header">
          <div class="customer-purchase-group__logo">
            ${companyLogoUrl
              ? `<img src="${escapeHtml(companyLogoUrl)}" alt="Logo de ${escapeHtml(companyName)}">`
              : '<span>Sin logo</span>'}
          </div>
          <div class="customer-purchase-group__header-copy">
            <p class="customer-purchase-group__eyebrow">Grupo #${escapeHtml(group.id_purchase_group)}</p>
            <h4 class="customer-purchase-group__title">${escapeHtml(companyName)}</h4>
            <p class="customer-purchase-group__meta"><b>Email:</b> ${escapeHtml(companyEmail)}</p>
            <p class="customer-purchase-group__meta"><b>Celular:</b> ${escapeHtml(companyPhone)}</p>
            <p class="customer-purchase-group__meta"><b>Estado:</b> ${escapeHtml(paymentStatus)}</p>
          </div>
        </div>
      </summary>
      <div class="customer-card__body">
        <p><b>Estado del pago:</b> ${escapeHtml(paymentStatus)}</p>
        <p><b>Vencimiento:</b> ${escapeHtml(formatDateTime(group.payment_due_at))}</p>
        <p><b>Total a pagar:</b> ${escapeHtml(buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs))}</p>
        <p><b>Decisión / observación:</b> ${escapeHtml(decisions)}</p>
        <details class="customer-subdetails">
          <summary>Métodos de pago</summary>
          <ul>${renderPaymentMethods(paymentMethods)}</ul>
        </details>
        <details class="customer-subdetails">
          <summary>Historial de evidencias (${evidences.length})</summary>
          <ul>${renderGroupEvidences(evidences)}</ul>
        </details>
        ${canUploadEvidence ? `
          <details class="customer-subdetails">
            <summary>${uploadActionLabel}</summary>
            <form data-evidence-form="${group.id_purchase_group}">
              <input name="evidence" type="file" accept="image/*,.pdf" required>
              <br><br>
              <textarea name="note" rows="3" placeholder="Nota opcional para la empresa"></textarea>
              <br><br>
              <button type="submit">${uploadActionLabel}</button>
            </form>
          </details>
        ` : ''}
      </div>
    </details>
  `;
}).join('');

const renderCheckoutProductsOnly = (groups) => {
  if (!Array.isArray(groups) || !groups.length) {
    return '<p>Sin grupos registrados.</p>';
  }

  return groups.map((group) => {
    const items = Array.isArray(group.items) ? group.items : [];
    const companyName = group.company?.name || 'Sin proveedor';
    const companyLogoUrl = resolveCompanyLogoUrl(group.company);
    const companyEmail = group.company?.email || 'No disponible';
    const companyPhone = group.company?.cell_phone || 'No disponible';

    return `
      <details class="customer-card customer-purchase-group">
        <summary class="customer-purchase-group__summary">
          <div class="customer-purchase-group__header">
            <div class="customer-purchase-group__logo">
              ${companyLogoUrl
                ? `<img src="${escapeHtml(companyLogoUrl)}" alt="Logo de ${escapeHtml(companyName)}">`
                : '<span>Sin logo</span>'}
            </div>
            <div class="customer-purchase-group__header-copy">
              <p class="customer-purchase-group__eyebrow">Grupo #${escapeHtml(group.id_purchase_group)}</p>
              <h4 class="customer-purchase-group__title">${escapeHtml(companyName)}</h4>
              <p class="customer-purchase-group__meta"><b>Email:</b> ${escapeHtml(companyEmail)}</p>
              <p class="customer-purchase-group__meta"><b>Celular:</b> ${escapeHtml(companyPhone)}</p>
              <p class="customer-purchase-group__meta"><b>Estado:</b> ${escapeHtml(getPurchaseStatusLabel(group.status))}</p>
            </div>
          </div>
        </summary>
        <div class="customer-purchase-group__items">
          ${items.length ? items.map((item) => renderGroupProductItem(item)).join('') : '<p>Sin productos registrados.</p>'}
        </div>
      </details>
    `;
  }).join('');
};

const getCheckoutCustomerInfo = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const firstGroup = groups.find(Boolean) || {};
  const groupCheckout = firstGroup.checkout || {};

  return {
    name: firstGroup.customer?.name || checkout?.shipping_contact_name || groupCheckout.shipping_contact_name || 'Pendiente',
    phone: firstGroup.checkout?.shipping_phone || checkout?.shipping_phone || groupCheckout.shipping_phone || 'Pendiente',
    email: firstGroup.customer?.email || 'Pendiente',
    address: firstGroup.checkout?.shipping_address_snapshot || checkout?.shipping_address_snapshot || groupCheckout.shipping_address_snapshot || 'Pendiente de registrar'
  };
};

const renderGroupProductItem = (item) => {
  const productName = item.product?.name || `Producto ${item.id_product}`;
  const productImageUrl = resolveProductImageUrl(item.product);
  const productSku = item.product?.sku || 'Sin SKU';
  const productBrand = item.product?.brand || 'Sin marca';
  const unitPriceLabel = buildCurrencyPairLabel(item.unit_price_usd_snapshot, item.unit_price_bs_snapshot);
  const cashbackLabel = Number(item.cashback_generated || 0) > 0
    ? `<p><b>Cashback potencial:</b> USD ${escapeHtml(formatAmount(item.cashback_generated))}</p>`
    : '';

  return `
    <article class="customer-purchase-product">
      <div class="customer-purchase-product__media">
        ${productImageUrl
          ? `
            <button
              type="button"
              class="customer-purchase-product__image"
              data-product-preview-trigger
              data-product-preview-src="${escapeHtml(productImageUrl)}"
              data-product-preview-title="${escapeHtml(productName)}"
            >
              <img src="${escapeHtml(productImageUrl)}" alt="${escapeHtml(productName)}">
            </button>
          `
          : '<div class="customer-purchase-product__image-placeholder">Sin imagen</div>'}
      </div>
      <div class="customer-purchase-product__details">
        <p class="customer-purchase-product__title"><b>${escapeHtml(productName)}</b></p>
        <p><b>SKU:</b> ${escapeHtml(productSku)}</p>
        <p><b>Marca:</b> ${escapeHtml(productBrand)}</p>
        <p><b>Cantidad:</b> ${escapeHtml(item.quantity)}</p>
        <p><b>Precio unitario:</b> ${escapeHtml(unitPriceLabel)}</p>
        <p><b>Total item:</b> ${escapeHtml(buildCurrencyPairLabel(item.subtotal_usd, item.subtotal_bs))}</p>
        ${cashbackLabel}
      </div>
    </article>
  `;
};

const renderGroupItems = (items) => {
  if (!Array.isArray(items) || !items.length) {
    return '<li>Sin productos registrados.</li>';
  }

  return items.map((item) => {
    const productName = item.product?.name || `Producto ${item.id_product}`;
    const cashbackLabel = Number(item.cashback_generated || 0) > 0
      ? ` | Cashback potencial: USD ${formatAmount(item.cashback_generated)}`
      : '';
    return `<li>${escapeHtml(productName)} x ${escapeHtml(item.quantity)} | USD ${escapeHtml(formatAmount(item.subtotal_usd))} | Bs ${escapeHtml(formatAmount(item.subtotal_bs))}${escapeHtml(cashbackLabel)}</li>`;
  }).join('');
};

const renderGroupEvidences = (evidences) => {
  if (!Array.isArray(evidences) || !evidences.length) {
    return '<li>Sin evidencias cargadas.</li>';
  }

  return evidences.map((evidence) => {
    const fileName = evidence.original_name || 'Archivo';
    return `<li>${escapeHtml(fileName)} - ${escapeHtml(getPurchaseStatusLabel(evidence.review_status))} - <a href="${escapeHtml(evidence.file_url)}" target="_blank" rel="noopener noreferrer">Ver archivo</a></li>`;
  }).join('');
};

const renderCheckoutGroups = (groups) => groups.map((group) => {
  const items = Array.isArray(group.items) ? group.items : [];
  const evidences = Array.isArray(group.evidences) ? group.evidences : [];
  const canUploadEvidence = group.status === 'PENDING_PAYMENT';
  const groupSummary = `${group.company?.name || 'Proveedor'} | ${getPurchaseStatusLabel(group.status)} | Total ${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}`;

  return `
    <details class="customer-card">
      <summary><b>Grupo #${group.id_purchase_group}</b> | ${escapeHtml(groupSummary)}</summary>
      <div class="customer-card__body">
        <p><b>Proveedor:</b> ${escapeHtml(group.company?.name || 'Sin nombre')}</p>
        <p>Subtotal: ${escapeHtml(buildCurrencyPairLabel(group.subtotal_usd, group.subtotal_bs))}</p>
        <p>Cashback usado: ${escapeHtml(buildCurrencyPairLabel(group.cashback_redeemed_usd, group.cashback_redeemed_bs))}</p>
        <p>Total a pagar: ${escapeHtml(buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs))}</p>
        <p>Cashback ${group.status === 'APPROVED' ? 'acreditado' : 'potencial'}: USD ${escapeHtml(formatAmount(items.reduce((sum, item) => sum + Number(item.cashback_generated || 0), 0)))}</p>
        <p>Pago vence: ${escapeHtml(formatDateTime(group.payment_due_at))}</p>
        <p>Nota de revision: ${escapeHtml(group.review_note || 'Sin observaciones')}</p>
        <details class="customer-subdetails">
          <summary>Métodos de pago</summary>
          <ul>
            ${renderPaymentMethods(group.company?.payment_methods)}
          </ul>
        </details>
        <details class="customer-subdetails">
          <summary>Productos (${items.length})</summary>
          <ul>
            ${renderGroupItems(items)}
          </ul>
        </details>
        <details class="customer-subdetails">
          <summary>Evidencias (${evidences.length})</summary>
          <ul>
            ${renderGroupEvidences(evidences)}
          </ul>
        </details>
        ${canUploadEvidence ? `
          <details>
            <summary>Subir evidencia de pago</summary>
            <form data-evidence-form="${group.id_purchase_group}">
              <input name="evidence" type="file" accept="image/*,.pdf" required>
              <br><br>
              <textarea name="note" rows="3" placeholder="Nota opcional para la empresa"></textarea>
              <br><br>
              <button type="submit">Enviar evidencia</button>
            </form>
          </details>
        ` : ''}
      </div>
    </details>
  `;
}).join('');

const renderCheckoutDetail = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const customerInfo = getCheckoutCustomerInfo(checkout);
  return `
    <section class="customer-detail-section">
      <h3>Información del cliente</h3>
      <p><b>Nombre:</b> ${escapeHtml(customerInfo.name)}</p>
      <p><b>Celular:</b> ${escapeHtml(customerInfo.phone)}</p>
      <p><b>Email:</b> ${escapeHtml(customerInfo.email)}</p>
      <p><b>Dirección:</b> ${escapeHtml(customerInfo.address)}</p>
    </section>

    <section class="customer-detail-section">
      <h3>Productos</h3>
      ${renderCheckoutProductsOnly(groups)}
    </section>

    <dialog id="customer-product-preview-dialog">
      <article class="customer-product-preview-dialog">
        <div class="customer-dialog-header">
          <h3 data-product-preview-title>Vista ampliada</h3>
          <button type="button" class="customer-button-secondary" data-product-preview-close>Cerrar</button>
        </div>
        <img data-product-preview-image src="" alt="Vista ampliada del producto">
      </article>
    </dialog>
  `;
};

const openPurchaseDetail = (checkoutId) => {
  const checkout = state.checkouts.find((item) => Number(item.id_checkout) === Number(checkoutId));

  if (!checkout || !purchaseDetailModal || !purchaseDetailContent) {
    return;
  }

  state.selectedCheckoutId = Number(checkout.id_checkout);
  purchaseDetailContent.innerHTML = renderCheckoutDetail(checkout);
  purchaseDetailModal.showModal();
  bindProductPreviewButtons();
  bindEvidenceForms();
};

const bindProductPreviewButtons = () => {
  if (!purchaseDetailContent) {
    return;
  }

  const dialog = purchaseDetailContent.querySelector('#customer-product-preview-dialog');

  if (!dialog) {
    return;
  }

  const previewImage = dialog.querySelector('[data-product-preview-image]');
  const previewTitle = dialog.querySelector('[data-product-preview-title]');

  const closeDialog = () => {
    dialog.close();

    if (previewImage) {
      previewImage.src = '';
      previewImage.alt = 'Vista ampliada del producto';
    }

    if (previewTitle) {
      previewTitle.textContent = 'Vista ampliada';
    }
  };

  dialog.querySelectorAll('[data-product-preview-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const imageUrl = String(trigger.dataset.productPreviewSrc || '').trim();
      const imageTitle = String(trigger.dataset.productPreviewTitle || 'Producto').trim();

      if (!imageUrl) {
        return;
      }

      if (previewImage) {
        previewImage.src = imageUrl;
        previewImage.alt = imageTitle;
      }

      if (previewTitle) {
        previewTitle.textContent = imageTitle;
      }

      dialog.showModal();
    });
  });

  const closeButton = dialog.querySelector('[data-product-preview-close]');
  if (closeButton) {
    closeButton.addEventListener('click', closeDialog);
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });
};

const renderPurchasePaymentsDetail = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const checkoutCode = checkout.order_code || `#${checkout.id_checkout}`;
  const paymentDueAt = checkout.payment_due_at
    || groups.find((group) => group?.payment_due_at)?.payment_due_at
    || null;

  return `
    <section class="customer-detail-section">
      <p><b>Número de orden:</b> ${escapeHtml(checkoutCode)}</p>
       <p><b>Resumen de pago:</b> ${escapeHtml(getCheckoutPaymentSummary(checkout))}</p>
    </section>

    <section class="customer-detail-section">
       <p><b>Estado:</b> ${escapeHtml(getCheckoutDisplayStatus(checkout))}</p>
       <p><b>Pago vence:</b> ${escapeHtml(formatDateTime(paymentDueAt))}</p>
      <h3>Pagos e historial</h3>
      ${renderPaymentHistoryGroups(groups)}
    </section>
  `;
};

const openPurchasePayments = (checkoutId) => {
  const checkout = state.checkouts.find((item) => Number(item.id_checkout) === Number(checkoutId));

  if (!checkout || !purchasePaymentsModal || !purchasePaymentsContent) {
    return;
  }

  state.selectedPaymentsCheckoutId = Number(checkout.id_checkout);
  purchasePaymentsContent.innerHTML = renderPurchasePaymentsDetail(checkout);
  purchasePaymentsModal.showModal();
  bindEvidenceForms();
};

const closePurchaseDetail = () => {
  if (!purchaseDetailModal) {
    return;
  }

  purchaseDetailModal.close();
};

const renderPurchases = (checkouts) => {
  const list = Array.isArray(checkouts) ? checkouts : [];
  const totalGroups = list.reduce((sum, checkout) => sum + (Array.isArray(checkout.groups) ? checkout.groups.length : 0), 0);
  const filterSegment = state.search ? ` | Filtro: <b>${escapeHtml(state.search)}</b>` : '';
  purchasesSummary.innerHTML = `Compras visibles: <b>${list.length}</b> | Grupos por proveedor: <b>${totalGroups}</b>${filterSegment}`;

  if (!list.length) {
    purchasesList.innerHTML = '<p>Aún no tienes compras registradas.</p>';
    return;
  }

  purchasesList.innerHTML = list.map((checkout) => {
    const groups = Array.isArray(checkout.groups) ? checkout.groups : [];
    const providerSummary = groups.map((group) => group.company?.name).filter(Boolean).slice(0, 2).join(', ') || 'Sin proveedor';
    const checkoutCode = checkout.order_code || `#${checkout.id_checkout}`;

    return `
      <article class="customer-card">
        <div class="customer-card__body">
          <p><b>${escapeHtml(checkoutCode)}</b></p>
          <p><span class="customer-card__badge">${escapeHtml(getCheckoutDisplayStatus(checkout))}</span></p>
          <p class="customer-card__price">${escapeHtml(buildCurrencyPairLabel(checkout.total_payable_usd, checkout.total_payable_bs))}</p>
          <p class="customer-card__meta">Fecha: ${escapeHtml(formatDateTime(checkout.created_at))}</p>
          <p class="customer-card__meta">Productos: ${escapeHtml(getCheckoutPrimaryItemSummary(checkout))}</p>
          <p class="customer-card__meta">Proveedor(es): ${escapeHtml(providerSummary)}</p>
          <p class="customer-card__meta">Pago: ${escapeHtml(getCheckoutPaymentSummary(checkout))}</p>
          <div class="customer-card__actions">
            <button type="button" data-view-purchase="${checkout.id_checkout}">Detalles de la compra</button>
            <button type="button" class="customer-button-secondary" data-view-purchase-payments="${checkout.id_checkout}">Pagos e historial</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
};

const bindEvidenceForms = () => {
  document.querySelectorAll('[data-evidence-form]').forEach((form) => {
    form.addEventListener('submit', handleEvidenceSubmit);
  });
};

const bindPurchaseDetailButtons = () => {
  document.querySelectorAll('[data-view-purchase]').forEach((button) => {
    button.addEventListener('click', () => {
      openPurchaseDetail(button.dataset.viewPurchase);
    });
  });

  document.querySelectorAll('[data-view-purchase-payments]').forEach((button) => {
    button.addEventListener('click', () => {
      openPurchasePayments(button.dataset.viewPurchasePayments);
    });
  });
};

const bindPurchaseInteractions = () => {
  bindEvidenceForms();
  bindPurchaseDetailButtons();
};

const filterPurchases = () => {
  const searchValue = normalizeSearchValue(state.search);

  if (!searchValue) {
    renderPurchases(state.checkouts);
    bindPurchaseInteractions();
    return;
  }

  const filteredCheckouts = state.checkouts.filter((checkout) => {
    const groups = Array.isArray(checkout.groups) ? checkout.groups : [];
    const groupMatches = groups.some((group) => {
      const items = Array.isArray(group.items) ? group.items : [];
      const itemMatches = items.some((item) => normalizeSearchValue(item.product?.name || item.product_name).includes(searchValue));

      return [
        group.id_purchase_group,
        group.company?.name,
        group.status,
        getPurchaseStatusLabel(group.status)
      ].some((value) => normalizeSearchValue(value).includes(searchValue)) || itemMatches;
    });

    return [
      checkout.order_code,
      checkout.id_checkout,
      checkout.status,
      getPurchaseStatusLabel(checkout.status),
      getCheckoutDisplayStatus(checkout)
    ].some((value) => normalizeSearchValue(value).includes(searchValue)) || groupMatches;
  });

  renderPurchases(filteredCheckouts);
  bindPurchaseInteractions();
};

const loadPurchases = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/purchases/my-checkouts`);
  state.checkouts = Array.isArray(data.checkouts) ? data.checkouts : [];
  filterPurchases();
};

function handlePurchasesSearch(event) {
  state.search = event.target.value.trim();
  filterPurchases();
}

const handleEvidenceSubmit = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const { evidenceForm: groupId } = form.dataset;
  const fileInput = form.querySelector('input[name="evidence"]');
  const noteInput = form.querySelector('textarea[name="note"]');
  const file = fileInput?.files?.[0];

  if (!groupId || !file) {
    setFeedback('Debes seleccionar un archivo para enviar la evidencia.', 'error');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData();
  formData.append('evidence', file);
  formData.append('note', noteInput?.value || '');

  try {
    if (submitButton) {
      submitButton.disabled = true;
    }

    setFeedback(`Enviando evidencia del grupo #${groupId}...`);
    await uploadEvidence(groupId, formData);
    setFeedback(`Evidencia enviada correctamente para el grupo #${groupId}.`, 'success');
    await loadPurchases();
  } catch (error) {
    setFeedback(error.message, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
};

purchasesSearchInput.addEventListener('input', handlePurchasesSearch);

if (purchaseDetailCloseButton) {
  purchaseDetailCloseButton.addEventListener('click', closePurchaseDetail);
}

if (purchaseDetailModal) {
  purchaseDetailModal.addEventListener('close', () => {
    state.selectedCheckoutId = null;
  });
}

if (purchasePaymentsCloseButton) {
  purchasePaymentsCloseButton.addEventListener('click', () => {
    if (purchasePaymentsModal) {
      purchasePaymentsModal.close();
    }
  });
}

if (purchasePaymentsModal) {
  purchasePaymentsModal.addEventListener('close', () => {
    state.selectedPaymentsCheckoutId = null;
  });
}

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    return loadPurchases();
  })
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });