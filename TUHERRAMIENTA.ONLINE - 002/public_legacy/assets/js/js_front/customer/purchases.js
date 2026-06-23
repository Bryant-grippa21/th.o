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

const state = {
  checkouts: [],
  search: '',
  selectedCheckoutId: null
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

  if (groups.some((group) => group.status === 'PAYMENT_SUBMITTED')) {
    return 'Pago en revisión';
  }

  if (groups.some((group) => group.status === 'PENDING_PAYMENT')) {
    return 'Pago pendiente';
  }

  return 'Pago con incidencias';
};

const getCheckoutTrackingSummary = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const deliveryStatuses = groups.map((group) => group.delivery?.status).filter(Boolean);
  const approvedGroups = groups.filter((group) => group.status === 'APPROVED').length;

  if (!groups.length) {
    return 'Seguimiento no disponible';
  }

  if (deliveryStatuses.every((status) => status === 'DELIVERED') && deliveryStatuses.length) {
    return 'Entrega completada';
  }

  if (deliveryStatuses.includes('SHIPPED')) {
    return 'Pedido enviado';
  }

  if (deliveryStatuses.includes('PREPARING')) {
    return 'Pedido en preparacion';
  }

  if (approvedGroups === groups.length) {
    return 'Entrega completada';
  }

  if (approvedGroups > 0) {
    return 'Entrega parcial';
  }

  return 'Despacho pendiente';
};

const renderPaymentMethods = (paymentMethods) => {
  if (!Array.isArray(paymentMethods) || !paymentMethods.length) {
    return '<li>La empresa aún no ha registrado métodos de pago.</li>';
  }

  return paymentMethods.map((method) => {
    const bankSegment = method.bank_name ? ` - ${method.bank_name}` : '';
    const accountSegment = method.account_number ? ` - ${method.account_number}` : '';

    return `<li>${escapeHtml(method.label)} (${escapeHtml(method.method_type)})${escapeHtml(bankSegment)}${escapeHtml(accountSegment)}</li>`;
  }).join('');
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
    <details>
      <summary><b>Grupo #${group.id_purchase_group}</b> | ${escapeHtml(groupSummary)}</summary>
      <div>
        <p><b>Proveedor:</b> ${escapeHtml(group.company?.name || 'Sin nombre')}</p>
        <p>Subtotal: ${escapeHtml(buildCurrencyPairLabel(group.subtotal_usd, group.subtotal_bs))}</p>
        <p>Cashback usado: ${escapeHtml(buildCurrencyPairLabel(group.cashback_redeemed_usd, group.cashback_redeemed_bs))}</p>
        <p>Total a pagar: ${escapeHtml(buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs))}</p>
        <p>Cashback ${group.status === 'APPROVED' ? 'acreditado' : 'potencial'}: USD ${escapeHtml(formatAmount(items.reduce((sum, item) => sum + Number(item.cashback_generated || 0), 0)))}</p>
        <p>Estado logístico: ${escapeHtml(group.delivery?.status || 'Sin seguimiento')}</p>
        <p>Transportista: ${escapeHtml(group.delivery?.carrier_name || 'Pendiente')}</p>
        <p>Guia: ${escapeHtml(group.delivery?.tracking_code || 'Pendiente')}</p>
        <p>Pago vence: ${escapeHtml(formatDateTime(group.payment_due_at))}</p>
        <p>Nota de revision: ${escapeHtml(group.review_note || 'Sin observaciones')}</p>
        <details>
          <summary>Métodos de pago</summary>
          <ul>
            ${renderPaymentMethods(group.company?.payment_methods)}
          </ul>
        </details>
        <details>
          <summary>Productos (${items.length})</summary>
          <ul>
            ${renderGroupItems(items)}
          </ul>
        </details>
        <details>
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

const renderCheckoutTimeline = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const timelineEntries = groups
    .flatMap((group) => (Array.isArray(group.status_history) ? group.status_history : []))
    .sort((left, right) => new Date(left.created_at) - new Date(right.created_at));

  if (timelineEntries.length) {
    const timelineHtml = timelineEntries.map((entry) => {
      const noteSegment = entry.note ? ` - ${escapeHtml(entry.note)}` : '';
      return `<li><b>${escapeHtml(entry.status)}</b> - ${escapeHtml(formatDateTime(entry.created_at))}${noteSegment}</li>`;
    }).join('');

    return `
      <ol>
        ${timelineHtml}
      </ol>
    `;
  }

  const approvedGroups = groups.filter((group) => group.status === 'APPROVED').length;
  const submittedGroups = groups.filter((group) => group.status === 'PAYMENT_SUBMITTED').length;

  const events = [
    {
      title: 'Pedido confirmado',
      date: formatDateTime(checkout.created_at),
      done: true
    },
    {
      title: 'Pago enviado',
      date: submittedGroups ? `${submittedGroups} grupo(s) con evidencia` : 'Pendiente',
      done: submittedGroups > 0
    },
    {
      title: 'Pago aprobado',
      date: approvedGroups ? `${approvedGroups} grupo(s) aprobados` : 'Pendiente',
      done: approvedGroups > 0
    },
    {
      title: 'Entrega',
      date: approvedGroups === groups.length && groups.length ? 'Completada' : 'Pendiente de módulo logístico',
      done: approvedGroups === groups.length && groups.length > 0
    }
  ];

  return `
    <ol>
      ${events.map((event) => `<li><b>${escapeHtml(event.title)}</b> - ${escapeHtml(event.date)}${event.done ? ' - completado' : ''}</li>`).join('')}
    </ol>
  `;
};

const renderCheckoutDetail = (checkout) => {
  const groups = Array.isArray(checkout?.groups) ? checkout.groups : [];
  const allItems = getCheckoutPrimaryItems(checkout);
  const checkoutCode = checkout.order_code || `#${checkout.id_checkout}`;
  const firstTrackedGroup = groups.find((group) => group.delivery?.tracking_code || group.delivery?.estimated_delivery_at) || null;
  const estimatedDeliveryLabel = firstTrackedGroup?.delivery?.estimated_delivery_at
    ? formatDateTime(firstTrackedGroup.delivery.estimated_delivery_at)
    : 'Pendiente de módulo logístico';
  const shippingAddress = [
    checkout.shipping_address_snapshot,
    checkout.shipping_reference,
    checkout.shipping_city,
    checkout.shipping_state
  ].filter(Boolean).join(', ');
  const itemsHtml = allItems.length
    ? allItems.map((item) => {
        const productName = item.product?.name || `Producto ${item.id_product}`;
        return `<li>${escapeHtml(productName)} | Cantidad: ${escapeHtml(item.quantity)} | ${escapeHtml(buildCurrencyPairLabel(item.subtotal_usd, item.subtotal_bs))}</li>`;
      }).join('')
    : '<li>Sin productos.</li>';

  return `
    <section>
      <p><b>Número de orden:</b> ${escapeHtml(checkoutCode)}</p>
      <p><b>Fecha:</b> ${escapeHtml(formatDateTime(checkout.created_at))}</p>
      <p><b>Estado:</b> ${escapeHtml(getCheckoutDisplayStatus(checkout))}</p>
      <p><b>Total:</b> ${escapeHtml(buildCurrencyPairLabel(checkout.total_payable_usd, checkout.total_payable_bs))}</p>
      <p><b>Pago:</b> ${escapeHtml(getCheckoutPaymentSummary(checkout))}</p>
    </section>

    <section>
      <h3>Productos</h3>
      <ul>
        ${itemsHtml}
      </ul>
    </section>

    <section>
      <h3>Información del pedido</h3>
      <p><b>Cashback usado:</b> ${escapeHtml(buildCurrencyPairLabel(checkout.cashback_redeemed_usd, checkout.cashback_redeemed_bs))}</p>
      <p><b>Total original:</b> ${escapeHtml(buildCurrencyPairLabel(checkout.total_usd, checkout.total_bs))}</p>
      <p><b>Tasa usada:</b> ${escapeHtml(formatAmount(checkout.exchange_rate_snapshot))}</p>
      <p><b>Contacto:</b> ${escapeHtml(checkout.shipping_contact_name || 'Pendiente')}</p>
      <p><b>Teléfono:</b> ${escapeHtml(checkout.shipping_phone || 'Pendiente')}</p>
      <p><b>Dirección de envío:</b> ${escapeHtml(shippingAddress || 'Pendiente de registrar')}</p>
      <p><b>Número de seguimiento:</b> ${escapeHtml(firstTrackedGroup?.delivery?.tracking_code || 'Pendiente de módulo logístico')}</p>
      <p><b>Entrega estimada:</b> ${escapeHtml(estimatedDeliveryLabel)}</p>
    </section>

    <section>
      <h3>Seguimiento del pedido</h3>
      ${renderCheckoutTimeline(checkout)}
    </section>

    <section>
      <h3>Grupos por proveedor</h3>
      ${renderCheckoutGroups(groups)}
    </section>
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
      <article>
        <header>
          <p><b>${escapeHtml(checkoutCode)}</b></p>
          <p>${escapeHtml(getCheckoutDisplayStatus(checkout))}</p>
          <p>Total: <b>${escapeHtml(buildCurrencyPairLabel(checkout.total_payable_usd, checkout.total_payable_bs))}</b></p>
        </header>
        <p>Fecha: ${escapeHtml(formatDateTime(checkout.created_at))}</p>
        <p>Productos: ${escapeHtml(getCheckoutPrimaryItemSummary(checkout))}</p>
        <p>Proveedor(es): ${escapeHtml(providerSummary)}</p>
        <p>Pago: ${escapeHtml(getCheckoutPaymentSummary(checkout))}</p>
        <p>Seguimiento: ${escapeHtml(getCheckoutTrackingSummary(checkout))}</p>
        <button type="button" data-view-purchase="${checkout.id_checkout}">Ver detalles</button>
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