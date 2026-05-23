if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

const summaryElement = document.getElementById('company-purchases-summary');
const feedbackElement = document.getElementById('company-purchases-feedback');
const paymentMethodForm = document.getElementById('company-payment-method-form');
const paymentMethodsList = document.getElementById('company-payment-methods-list');
const purchaseGroupsList = document.getElementById('company-purchase-groups-list');

const state = {
  session: null,
  paymentMethods: [],
  purchaseGroups: []
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

const formatAmount = (value) => Number(value || 0).toFixed(2);

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

const buildCurrencyPairLabel = (usdValue, bsValue) => `USD ${formatAmount(usdValue)} | Bs ${formatAmount(bsValue)}`;

const setFeedback = (message, type = 'info') => {
  feedbackElement.textContent = message || '';
  feedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const renderPaymentMethods = () => {
  if (!state.paymentMethods.length) {
    paymentMethodsList.innerHTML = '<p>Esta empresa aun no tiene metodos de pago registrados.</p>';
    return;
  }

  paymentMethodsList.innerHTML = state.paymentMethods.map((method) => `
    <article style="border:1px solid #ccc; padding:12px; margin-bottom:12px;">
      <p><b>${method.label}</b> (${method.method_type})</p>
      <p>Titular: ${method.account_holder || 'No definido'}</p>
      <p>Cuenta: ${method.account_number || 'No definida'}</p>
      <p>Banco: ${method.bank_name || 'No definido'}</p>
      <p>Instrucciones: ${method.instructions || 'Sin instrucciones'}</p>
      <p>Creado: ${formatDateTime(method.created_at)}</p>
    </article>
  `).join('');
};

const getGroupActionsHtml = (group) => {
  if (group.status === 'PAYMENT_SUBMITTED') {
    return `
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
        <button type="button" data-group-action="approve" data-group-id="${group.id_purchase_group}">Aprobar</button>
        <button type="button" data-group-action="reject" data-group-id="${group.id_purchase_group}">Rechazar</button>
      </div>
      <textarea data-group-note="${group.id_purchase_group}" rows="3" placeholder="Nota de revision opcional" style="width:100%; max-width:420px; margin-top:8px;"></textarea>
    `;
  }

  if (group.status === 'PENDING_PAYMENT') {
    return `
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
        <button type="button" data-group-action="expire" data-group-id="${group.id_purchase_group}">Expirar grupo</button>
      </div>
    `;
  }

  return '';
};

const renderGroupItems = (items) => {
  if (!Array.isArray(items) || !items.length) {
    return '<li>Sin items.</li>';
  }

  return items.map((item) => {
    const productName = item.product?.name || `Producto ${item.id_product}`;
    return `<li>${productName} x ${item.quantity} | USD ${formatAmount(item.subtotal_usd)} | Bs ${formatAmount(item.subtotal_bs)}</li>`;
  }).join('');
};

const renderGroupEvidences = (evidences) => {
  if (!Array.isArray(evidences) || !evidences.length) {
    return '<li>Sin evidencias.</li>';
  }

  return evidences.map((evidence) => {
    const fileName = evidence.original_name || 'Archivo';
    const note = evidence.note ? ` | Nota: ${evidence.note}` : '';
    return `<li>${fileName} - ${getPurchaseStatusLabel(evidence.review_status)}${note} - <a href="${evidence.file_url}" target="_blank" rel="noopener noreferrer">Ver archivo</a></li>`;
  }).join('');
};

const renderPurchaseGroups = () => {
  if (!state.purchaseGroups.length) {
    purchaseGroupsList.innerHTML = '<p>No hay grupos de compra para revisar.</p>';
    return;
  }

  purchaseGroupsList.innerHTML = state.purchaseGroups.map((group) => `
    <details style="border:1px solid #ccc; padding:16px; margin-bottom:16px;">
      <summary><b>Grupo #${group.id_purchase_group}</b> | ${group.checkout?.order_code || `#${group.checkout?.id_checkout || group.id_checkout}`} | ${getPurchaseStatusLabel(group.status)} | Total ${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}</summary>
      <div style="margin-top:12px;">
        <p>Cliente: ${group.customer?.name || 'Sin nombre'} (${group.customer?.email || 'Sin correo'})</p>
        <p>Subtotal: ${buildCurrencyPairLabel(group.subtotal_usd, group.subtotal_bs)}</p>
        <p>Cashback aplicado: ${buildCurrencyPairLabel(group.cashback_redeemed_usd, group.cashback_redeemed_bs)}</p>
        <p>Total a pagar del grupo: ${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}</p>
        <p>Total orden: ${buildCurrencyPairLabel(group.checkout?.total_usd, group.checkout?.total_bs)}</p>
        <p>Total orden a pagar: ${buildCurrencyPairLabel(group.checkout?.total_payable_usd, group.checkout?.total_payable_bs)}</p>
        <p>Pago vence: ${formatDateTime(group.payment_due_at)}</p>
        <p>Creado: ${formatDateTime(group.created_at)}</p>
        <p>Nota de revision: ${group.review_note || 'Sin observaciones'}</p>
        <details>
          <summary>Productos (${Array.isArray(group.items) ? group.items.length : 0})</summary>
          <ul>
            ${renderGroupItems(group.items)}
          </ul>
        </details>
        <details>
          <summary>Evidencias (${Array.isArray(group.evidences) ? group.evidences.length : 0})</summary>
          <ul>
            ${renderGroupEvidences(group.evidences)}
          </ul>
        </details>
        ${getGroupActionsHtml(group)}
      </div>
    </details>
  `).join('');
};

const renderSummary = () => {
  const companyName = state.session?.data?.company?.name || state.session?.data?.company?.email || 'Empresa';
  summaryElement.innerHTML = `
    Empresa: <b>${companyName}</b> |
    Metodos de pago: <b>${state.paymentMethods.length}</b> |
    Grupos de compra: <b>${state.purchaseGroups.length}</b>
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

const handlePaymentMethodSubmit = async (event) => {
  event.preventDefault();

  const formData = new FormData(paymentMethodForm);
  const payload = Object.fromEntries(formData.entries());
  const submitButton = paymentMethodForm.querySelector('button[type="submit"]');

  try {
    if (submitButton) {
      submitButton.disabled = true;
    }

    setFeedback('Guardando metodo de pago...');
    await requestJson(`${API_BASE_URL}/api/purchases/company/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    paymentMethodForm.reset();
    setFeedback('Metodo de pago registrado correctamente.', 'success');
    await refreshView();
  } catch (error) {
    setFeedback(error.message, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
};

const getGroupReviewNote = (groupId) => {
  const noteField = document.querySelector(`[data-group-note="${groupId}"]`);
  return noteField ? noteField.value : '';
};

const handleGroupAction = async (action, groupId) => {
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
        review_note: getGroupReviewNote(groupId)
      })
    });

    setFeedback(successMessages[action] || 'Accion ejecutada correctamente.', 'success');
    await refreshView();
  } catch (error) {
    setFeedback(error.message, 'error');
  }
};

purchaseGroupsList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-group-action]');

  if (!button) {
    return;
  }

  const { groupAction: action, groupId } = button.dataset;

  if (!action || !groupId) {
    return;
  }

  if (action === 'reject' && !confirm(`¿Seguro que deseas rechazar el grupo #${groupId}?`)) {
    return;
  }

  if (action === 'approve' && !confirm(`¿Seguro que deseas aprobar el grupo #${groupId}?`)) {
    return;
  }

  if (action === 'expire' && !confirm(`¿Seguro que deseas expirar el grupo #${groupId}?`)) {
    return;
  }

  await handleGroupAction(action, groupId);
});

paymentMethodForm.addEventListener('submit', handlePaymentMethodSubmit);

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesion no valida para empresa');
    }

    state.session = session;
    return refreshView();
  })
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });