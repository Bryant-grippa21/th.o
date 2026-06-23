if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

const summaryElement = document.getElementById('company-purchases-summary');
const feedbackElement = document.getElementById('company-purchases-feedback');
const paymentMethodForm = document.getElementById('company-payment-method-form');
const paymentMethodIdInput = document.getElementById('company-payment-method-id');
const paymentMethodSubmitButton = document.getElementById('company-payment-method-submit');
const openPaymentMethodModalButton = document.getElementById('open-company-payment-method-modal');
const paymentMethodsList = document.getElementById('company-payment-methods-list');
const purchaseGroupsList = document.getElementById('company-purchase-groups-list');
const purchaseDetailContent = document.getElementById('company-purchase-detail-content');
const companyPurchasesSearchInput = document.getElementById('company-purchases-search');
const companyPurchasesStatusFilter = document.getElementById('company-purchases-status-filter');
const companyPurchasesDateFromFilter = document.getElementById('company-purchases-date-from');
const companyPurchasesDateToFilter = document.getElementById('company-purchases-date-to');
const companyPurchasesFilters = document.getElementById('company-purchases-filters');
const companyPurchasesToggleFilters = document.getElementById('company-purchases-toggle-filters');
const paymentMethodModal = document.getElementById('company-payment-method-modal');
const purchaseDetailModal = document.getElementById('company-purchase-detail-modal');
const deletePaymentMethodModal = document.getElementById('company-delete-payment-method-modal');
const deletePaymentMethodLabel = document.getElementById('company-delete-payment-method-label');
const deletePaymentMethodConfirmButton = document.getElementById('company-delete-payment-method-confirm');
const purchaseGroupActionModal = document.getElementById('company-purchase-group-action-modal');
const purchaseGroupActionModalTitle = document.getElementById('company-purchase-group-action-modal-title');
const purchaseGroupActionModalMessage = document.getElementById('company-purchase-group-action-modal-message');
const purchaseGroupActionModalNote = document.getElementById('company-purchase-group-action-modal-note');
const purchaseGroupActionModalConfirmButton = document.getElementById('company-purchase-group-action-modal-confirm');

const PAYMENT_METHODS_LIMIT = 2;

const state = {
  session: null,
  paymentMethods: [],
  purchaseGroups: [],
  filters: {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  },
  ui: {
    filtersVisible: true,
    editingPaymentMethodId: null,
    deletingPaymentMethodId: null,
    pendingGroupAction: null
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
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();
  const data = contentType.includes('application/json')
    ? JSON.parse(rawBody || '{}')
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `Error en la solicitud (${response.status})`);
  }

  if (!data) {
    throw new Error('La respuesta del servidor no llego en formato JSON');
  }

  return data;
};

const formatAmount = (value) => Number(value || 0).toFixed(2);
const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase();

const getPurchaseStatusLabel = (status) => {
  const labels = {
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

const formatDateOnly = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildCurrencyPairLabel = (usdValue, bsValue) => `USD ${formatAmount(usdValue)} | Bs ${formatAmount(bsValue)}`;

const setFeedback = (message, type = 'info') => {
  feedbackElement.textContent = message || '';
  feedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const openModal = (modalElement) => {
  if (!modalElement) {
    return;
  }

  modalElement.hidden = false;
  document.body.classList.add('modal-open');
};

const closeModal = (modalElement) => {
  if (!modalElement) {
    return;
  }

  modalElement.hidden = true;

  if (!document.querySelector('.company-modal:not([hidden])')) {
    document.body.classList.remove('modal-open');
  }
};

const closeModalById = (modalId) => {
  const modalElement = document.getElementById(modalId);
  closeModal(modalElement);

  if (modalId === 'company-delete-payment-method-modal') {
    state.ui.deletingPaymentMethodId = null;
    if (deletePaymentMethodLabel) {
      deletePaymentMethodLabel.textContent = 'Método seleccionado';
    }
  }

  if (modalId === 'company-purchase-group-action-modal') {
    state.ui.pendingGroupAction = null;
    if (purchaseGroupActionModalNote) {
      purchaseGroupActionModalNote.value = '';
    }
  }
};

const resetPaymentMethodForm = () => {
  paymentMethodForm.reset();
  state.ui.editingPaymentMethodId = null;

  if (paymentMethodIdInput) {
    paymentMethodIdInput.value = '';
  }

  if (paymentMethodSubmitButton) {
    paymentMethodSubmitButton.innerText = 'Guardar metodo';
  }
};

const getGroupPrimaryEvidence = (group) => {
  const evidences = Array.isArray(group?.evidences) ? group.evidences : [];
  return evidences.length ? evidences[0] : null;
};

const updateNewPaymentMethodButtonVisibility = () => {
  if (!openPaymentMethodModalButton) {
    return;
  }

  const limitReached = state.paymentMethods.length >= PAYMENT_METHODS_LIMIT;
  openPaymentMethodModalButton.hidden = limitReached;
};

const getFilteredPurchaseGroups = () => {
  const searchValue = normalizeSearchValue(state.filters.search);
  const statusValue = String(state.filters.status || '').trim();
  const dateFrom = String(state.filters.dateFrom || '').trim();
  const dateTo = String(state.filters.dateTo || '').trim();

  return state.purchaseGroups.filter((group) => {
    const groupDateRaw = group.checkout?.created_at || group.created_at;
    const groupDate = formatDateOnly(groupDateRaw);

    if (statusValue && group.status !== statusValue) {
      return false;
    }

    if (dateFrom && groupDate && groupDate < dateFrom) {
      return false;
    }

    if (dateTo && groupDate && groupDate > dateTo) {
      return false;
    }

    if (!searchValue) {
      return true;
    }

    const items = Array.isArray(group.items) ? group.items : [];
    const itemMatches = items.some((item) => normalizeSearchValue(item.product?.name || item.product_name).includes(searchValue));

    return [
      group.id_purchase_group,
      group.status,
      getPurchaseStatusLabel(group.status),
      group.customer?.name,
      group.customer?.email,
      group.checkout?.order_code,
      group.checkout?.id_checkout
    ].some((value) => normalizeSearchValue(value).includes(searchValue)) || itemMatches;
  });
};

const renderSummary = () => {
  const companyName = state.session?.data?.company?.name || state.session?.data?.company?.email || 'Empresa';
  const filteredGroups = getFilteredPurchaseGroups();

  summaryElement.innerHTML = `
    Empresa: <b>${companyName}</b> |
    Metodos de pago: <b>${state.paymentMethods.length}</b> |
    Grupos visibles: <b>${filteredGroups.length}</b>
  `;
};

const renderPaymentMethods = () => {
  updateNewPaymentMethodButtonVisibility();

  if (!state.paymentMethods.length) {
    paymentMethodsList.innerHTML = '<p>Esta empresa aun no tiene metodos de pago registrados.</p>';
    return;
  }

  paymentMethodsList.innerHTML = state.paymentMethods.map((method) => `
    <article class="company-payment-method-card">
      <div>
        <p><b>${method.label}</b> (${method.method_type})</p>
        <p>Titular: ${method.account_holder || 'No definido'}</p>
        <p>Cuenta o referencia: ${method.account_number || 'No definida'}</p>
        <p>Banco: ${method.bank_name || 'No definido'}</p>
        <p>Instrucciones: ${method.instructions || 'Sin instrucciones'}</p>
        <p>Actualizado: ${formatDateTime(method.updated_at || method.created_at)}</p>
      </div>
      <div class="company-payment-method-card__actions">
        <button type="button" data-edit-payment-method="${method.id_payment_method}">Editar</button>
        <button type="button" class="company-payment-method-card__delete" data-delete-payment-method="${method.id_payment_method}">Eliminar</button>
      </div>
    </article>
  `).join('');
};

const getGroupActionsHtml = (group) => {
  if (group.status === 'PAYMENT_SUBMITTED') {
    return `
      <div class="company-purchase-group-actions">
        <button type="button" data-group-action="approve" data-group-id="${group.id_purchase_group}">Aprobar</button>
        <button type="button" data-group-action="reject" data-group-id="${group.id_purchase_group}">Rechazar</button>
      </div>
    `;
  }

  if (group.status === 'PENDING_PAYMENT') {
    return `
      <div class="company-purchase-group-actions">
        <button type="button" data-group-action="expire" data-group-id="${group.id_purchase_group}">Expirar grupo</button>
      </div>
    `;
  }

  return '';
};

const renderPurchaseGroups = () => {
  const filteredGroups = getFilteredPurchaseGroups();

  if (!filteredGroups.length) {
    purchaseGroupsList.innerHTML = '<p>No hay grupos de compra para revisar.</p>';
    return;
  }

  purchaseGroupsList.innerHTML = filteredGroups.map((group) => `
    <article class="company-purchase-group-card">
      <div class="company-purchase-group-card__header">
        <div>
          <h3>${group.checkout?.order_code || `ORD-${group.checkout?.id_checkout || group.id_checkout}`}</h3>
          <p>Fecha: ${formatDateTime(group.checkout?.created_at || group.created_at)}</p>
          <p><span class="company-product-card__badge">${getPurchaseStatusLabel(group.status)}</span></p>
        </div>
        <div class="company-purchase-group-card__total">
          ${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}
        </div>
      </div>

      <p>Cliente: ${group.customer?.name || 'Sin nombre'} (${group.customer?.email || 'Sin correo'})</p>
      <p>Pago vence: ${formatDateTime(group.payment_due_at)}</p>
      <p>Nota de revision: ${group.review_note || 'Sin observaciones'}</p>

      <div class="company-purchase-group-actions">
        <button type="button" data-group-detail="${group.id_purchase_group}">Ver detalles</button>
        ${(() => {
          const evidences = Array.isArray(group.evidences) ? group.evidences : [];
          if (!evidences.length) {
            return '';
          }

          return `<button type="button" data-group-evidence="${group.id_purchase_group}">Ver evidencia (${evidences.length})</button>`;
        })()}
      </div>

      ${getGroupActionsHtml(group)}
    </article>
  `).join('');
};

const renderPurchaseDetailModal = (groupId) => {
  const group = state.purchaseGroups.find((entry) => Number(entry.id_purchase_group) === Number(groupId));

  if (!group) {
    purchaseDetailContent.innerHTML = '<p>No se encontro el detalle del pedido.</p>';
    return;
  }

  const items = Array.isArray(group.items) ? group.items : [];
  const evidences = Array.isArray(group.evidences) ? group.evidences : [];

  purchaseDetailContent.innerHTML = `
    <section class="company-purchase-detail-grid">
      <div>
        <small>Numero de orden</small>
        <p><b>${group.checkout?.order_code || `ORD-${group.checkout?.id_checkout || group.id_checkout}`}</b></p>
      </div>
      <div>
        <small>Fecha</small>
        <p><b>${formatDateTime(group.checkout?.created_at || group.created_at)}</b></p>
      </div>
      <div>
        <small>Estado</small>
        <p><span class="company-product-card__badge">${getPurchaseStatusLabel(group.status)}</span></p>
      </div>
      <div>
        <small>Total</small>
        <p><b>${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}</b></p>
      </div>
    </section>

    <h3>Productos</h3>
    <div class="company-purchase-detail-items">
      ${items.length
        ? items.map((item) => {
          const productName = item.product?.name || `Producto ${item.id_product}`;
          return `
            <article>
              <p><b>${productName}</b></p>
              <p>Cantidad: ${item.quantity} x ${buildCurrencyPairLabel(item.price_usd, item.price_bs)}</p>
              <p>Total item: ${buildCurrencyPairLabel(item.subtotal_usd, item.subtotal_bs)}</p>
            </article>
          `;
        }).join('')
        : '<p>Sin productos asociados.</p>'}
    </div>

    <h3>Informacion del cliente</h3>
    <section class="company-purchase-detail-shipping">
      <p><b>Nombre:</b> ${group.customer?.name || 'Sin nombre'}</p>
      <p><b>Celular:</b> ${group.customer?.cell_phone || 'No disponible'}</p>
      <p><b>Email:</b> ${group.customer?.email || 'Sin correo'}</p>
      <p><b>Direccion:</b> ${group.customer?.mail_address || 'No disponible'}</p>
    </section>

    <h3>Evidencias de pago</h3>
    <section class="company-purchase-detail-shipping">
      ${evidences.length
        ? evidences.map((evidence) => {
          const evidenceName = evidence.original_name || `Evidencia #${evidence.id_purchase_evidence}`;
          return `
            <p>
              <b>${evidenceName}</b>
              (${getPurchaseStatusLabel(evidence.review_status)})
              - <a href="${evidence.file_url}" target="_blank" rel="noopener noreferrer">Ver archivo</a>
            </p>
          `;
        }).join('')
        : '<p>Sin evidencias cargadas.</p>'}
    </section>
  `;
};

const refreshView = async () => {
  const [methodsResponse, groupsResponse] = await Promise.all([
    requestJson(`${API_BASE_URL}/api/purchases/company/payment-methods`),
    requestJson(`${API_BASE_URL}/api/purchases/company/groups`)
  ]);

  state.paymentMethods = Array.isArray(methodsResponse.payment_methods) ? methodsResponse.payment_methods : [];
  state.purchaseGroups = Array.isArray(groupsResponse.purchase_groups) ? groupsResponse.purchase_groups : [];

  renderSummary();
  renderPaymentMethods();
  renderPurchaseGroups();
};

const openPaymentMethodModal = (paymentMethod = null) => {
  resetPaymentMethodForm();

  if (paymentMethod) {
    state.ui.editingPaymentMethodId = Number(paymentMethod.id_payment_method);
    if (paymentMethodIdInput) {
      paymentMethodIdInput.value = String(paymentMethod.id_payment_method);
    }

    paymentMethodForm.method_type.value = paymentMethod.method_type || '';
    paymentMethodForm.label.value = paymentMethod.label || '';
    paymentMethodForm.account_holder.value = paymentMethod.account_holder || '';
    paymentMethodForm.account_number.value = paymentMethod.account_number || '';
    paymentMethodForm.bank_name.value = paymentMethod.bank_name || '';
    paymentMethodForm.instructions.value = paymentMethod.instructions || '';

    if (paymentMethodSubmitButton) {
      paymentMethodSubmitButton.innerText = 'Guardar cambios';
    }
  }

  openModal(paymentMethodModal);
};

const handlePaymentMethodSubmit = async (event) => {
  event.preventDefault();

  const formData = new FormData(paymentMethodForm);
  const payload = Object.fromEntries(formData.entries());
  const normalizedMethodId = Number(payload.id_payment_method || state.ui.editingPaymentMethodId || 0);
  const submitButton = paymentMethodForm.querySelector('button[type="submit"]');

  try {
    if (!normalizedMethodId && state.paymentMethods.length >= PAYMENT_METHODS_LIMIT) {
      throw new Error('Solo puedes registrar hasta 2 metodos de pago');
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    setFeedback(normalizedMethodId ? 'Actualizando metodo de pago...' : 'Guardando metodo de pago...');

    if (normalizedMethodId) {
      await requestJson(`${API_BASE_URL}/api/purchases/company/payment-methods/${normalizedMethodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      setFeedback('Metodo de pago actualizado correctamente.', 'success');
    } else {
      await requestJson(`${API_BASE_URL}/api/purchases/company/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      setFeedback('Metodo de pago registrado correctamente.', 'success');
    }

    closeModal(paymentMethodModal);
    resetPaymentMethodForm();
    await refreshView();
  } catch (error) {
    setFeedback(error.message, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
};

const openDeletePaymentMethodModal = (paymentMethod) => {
  if (!paymentMethod) {
    setFeedback('No se encontro el metodo de pago seleccionado.', 'error');
    return;
  }

  state.ui.deletingPaymentMethodId = Number(paymentMethod.id_payment_method);

  if (deletePaymentMethodLabel) {
    deletePaymentMethodLabel.textContent = `${paymentMethod.label || 'Método'} (${paymentMethod.method_type || 'N/A'})`;
  }

  openModal(deletePaymentMethodModal);
};

const handlePaymentMethodDelete = async (paymentMethodId) => {
  if (!Number.isInteger(Number(paymentMethodId)) || Number(paymentMethodId) <= 0) {
    setFeedback('Metodo de pago invalido.', 'error');
    return;
  }

  try {
    setFeedback('Eliminando metodo de pago...');

    await requestJson(`${API_BASE_URL}/api/purchases/company/payment-methods/${paymentMethodId}`, {
      method: 'DELETE'
    });

    setFeedback('Metodo de pago eliminado correctamente.', 'success');
    closeModal(deletePaymentMethodModal);
    state.ui.deletingPaymentMethodId = null;
    await refreshView();
  } catch (error) {
    setFeedback(error.message, 'error');
  }
};

const openPurchaseGroupActionModal = (action, groupId) => {
  const normalizedAction = String(action || '').trim().toLowerCase();
  const normalizedGroupId = Number(groupId);

  if (!['approve', 'reject'].includes(normalizedAction) || !Number.isInteger(normalizedGroupId) || normalizedGroupId <= 0) {
    setFeedback('Accion invalida para confirmacion.', 'error');
    return;
  }

  const group = state.purchaseGroups.find((entry) => Number(entry.id_purchase_group) === normalizedGroupId);
  const orderCode = group?.checkout?.order_code || `ORD-${group?.checkout?.id_checkout || group?.id_checkout || normalizedGroupId}`;

  state.ui.pendingGroupAction = {
    action: normalizedAction,
    groupId: normalizedGroupId
  };

  if (purchaseGroupActionModalTitle) {
    purchaseGroupActionModalTitle.textContent = normalizedAction === 'approve' ? 'Confirmar aprobacion' : 'Confirmar rechazo';
  }

  if (purchaseGroupActionModalMessage) {
    purchaseGroupActionModalMessage.textContent = normalizedAction === 'approve'
      ? `¿Deseas aprobar la compra ${orderCode}?`
      : `¿Deseas rechazar la compra ${orderCode}?`;
  }

  if (purchaseGroupActionModalConfirmButton) {
    purchaseGroupActionModalConfirmButton.textContent = normalizedAction === 'approve' ? 'Aprobar compra' : 'Rechazar compra';
  }

  if (purchaseGroupActionModalNote) {
    purchaseGroupActionModalNote.value = '';
  }

  openModal(purchaseGroupActionModal);
};

const handleGroupAction = async (action, groupId, reviewNote = '') => {
  const actionMessages = {
    approve: 'Aprobando grupo...',
    reject: 'Rechazando grupo...',
    expire: 'Expirando grupo...'
  };
  const successMessages = {
    approve: 'Grupo aprobado correctamente.',
    reject: 'Grupo rechazado correctamente.',
    expire: 'Grupo expirado correctamente.'
  };

  try {
    setFeedback(actionMessages[action] || 'Procesando accion...');

    await requestJson(`${API_BASE_URL}/api/purchases/company/groups/${groupId}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        review_note: String(reviewNote || '').trim()
      })
    });

    setFeedback(successMessages[action] || 'Accion ejecutada correctamente.', 'success');
    await refreshView();
  } catch (error) {
    setFeedback(error.message, 'error');
  }
};

const handleModalDocumentClick = (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const closeTarget = event.target.closest('[data-close-modal]');
  if (closeTarget instanceof HTMLElement) {
    const { closeModal: modalId } = closeTarget.dataset;
    if (modalId) {
      closeModalById(modalId);
    }
  }
};

const handleModalEscape = (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  const openedModal = document.querySelector('.company-modal:not([hidden])');
  if (openedModal instanceof HTMLElement) {
    closeModal(openedModal);
  }
};

const handlePurchasesSearch = (event) => {
  state.filters.search = event.target.value.trim();
  renderSummary();
  renderPurchaseGroups();
};

const handlePurchasesStatusFilter = (event) => {
  state.filters.status = event.target.value;
  renderSummary();
  renderPurchaseGroups();
};

const handlePurchasesDateFromFilter = (event) => {
  state.filters.dateFrom = event.target.value;
  renderSummary();
  renderPurchaseGroups();
};

const handlePurchasesDateToFilter = (event) => {
  state.filters.dateTo = event.target.value;
  renderSummary();
  renderPurchaseGroups();
};

const togglePurchaseFilters = () => {
  state.ui.filtersVisible = !state.ui.filtersVisible;

  if (companyPurchasesFilters) {
    companyPurchasesFilters.hidden = !state.ui.filtersVisible;
  }

  if (companyPurchasesToggleFilters) {
    companyPurchasesToggleFilters.textContent = state.ui.filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros';
  }
};

openPaymentMethodModalButton?.addEventListener('click', () => {
  if (state.paymentMethods.length >= PAYMENT_METHODS_LIMIT) {
    setFeedback('Ya tienes 2 metodos de pago registrados. Edita uno existente.', 'error');
    return;
  }

  openPaymentMethodModal();
});

paymentMethodsList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('[data-delete-payment-method]');

  if (deleteButton) {
    const paymentMethodId = Number(deleteButton.dataset.deletePaymentMethod || 0);
    const paymentMethod = state.paymentMethods.find((method) => Number(method.id_payment_method) === paymentMethodId);
    openDeletePaymentMethodModal(paymentMethod);
    return;
  }

  const editButton = event.target.closest('[data-edit-payment-method]');

  if (!editButton) {
    return;
  }

  const paymentMethodId = Number(editButton.dataset.editPaymentMethod || 0);
  const paymentMethod = state.paymentMethods.find((method) => Number(method.id_payment_method) === paymentMethodId);

  if (!paymentMethod) {
    setFeedback('No se encontro el metodo de pago seleccionado.', 'error');
    return;
  }

  openPaymentMethodModal(paymentMethod);
});

purchaseGroupsList.addEventListener('click', async (event) => {
  const detailButton = event.target.closest('[data-group-detail]');

  if (detailButton) {
    const groupId = Number(detailButton.dataset.groupDetail || 0);
    renderPurchaseDetailModal(groupId);
    openModal(purchaseDetailModal);
    return;
  }

  const evidenceButton = event.target.closest('[data-group-evidence]');

  if (evidenceButton) {
    const groupId = Number(evidenceButton.dataset.groupEvidence || 0);
    const group = state.purchaseGroups.find((entry) => Number(entry.id_purchase_group) === groupId);
    const primaryEvidence = getGroupPrimaryEvidence(group);

    if (!primaryEvidence?.file_url) {
      setFeedback('No se encontro la evidencia para este grupo.', 'error');
      return;
    }

    globalThis.open(primaryEvidence.file_url, '_blank', 'noopener,noreferrer');
    return;
  }

  const actionButton = event.target.closest('[data-group-action]');

  if (!actionButton) {
    return;
  }

  const { groupAction: action, groupId } = actionButton.dataset;

  if (!action || !groupId) {
    return;
  }

  if (action === 'approve' || action === 'reject') {
    openPurchaseGroupActionModal(action, groupId);
    return;
  }

  await handleGroupAction(action, groupId);
});

paymentMethodForm.addEventListener('submit', handlePaymentMethodSubmit);
deletePaymentMethodConfirmButton?.addEventListener('click', () => {
  handlePaymentMethodDelete(state.ui.deletingPaymentMethodId);
});
purchaseGroupActionModalConfirmButton?.addEventListener('click', async () => {
  const pendingAction = state.ui.pendingGroupAction;

  if (!pendingAction?.action || !pendingAction?.groupId) {
    setFeedback('No hay una accion pendiente para confirmar.', 'error');
    return;
  }

  const reviewNote = purchaseGroupActionModalNote?.value || '';
  await handleGroupAction(pendingAction.action, pendingAction.groupId, reviewNote);
  closeModal(purchaseGroupActionModal);
});
companyPurchasesSearchInput?.addEventListener('input', handlePurchasesSearch);
companyPurchasesStatusFilter?.addEventListener('change', handlePurchasesStatusFilter);
companyPurchasesDateFromFilter?.addEventListener('change', handlePurchasesDateFromFilter);
companyPurchasesDateToFilter?.addEventListener('change', handlePurchasesDateToFilter);
companyPurchasesToggleFilters?.addEventListener('click', togglePurchaseFilters);
globalThis.document.addEventListener('click', handleModalDocumentClick);
globalThis.addEventListener('keydown', handleModalEscape);

globalThis.addEventListener('beforeunload', () => {
  document.body.classList.remove('modal-open');
});

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesion no valida para empresa');
    }

    if (session.data.company.id_role_fk !== 1 && !globalThis.canUseCompanySellModules?.(session.data.company)) {
      throw new Error('Tu empresa aun no esta habilitada juridicamente para gestionar compras empresariales');
    }

    state.session = session;
    if (companyPurchasesFilters) {
      companyPurchasesFilters.hidden = false;
    }
    return refreshView();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
