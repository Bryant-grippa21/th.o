if (!requireCustomerSession()) {
  throw new Error('Sesion requerida');
}

const purchasesSummary = document.getElementById('purchases-summary');
const purchasesList = document.getElementById('purchases-list');
const purchasesFeedback = document.getElementById('purchases-feedback');

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

const setFeedback = (message, type = 'info') => {
  if (!purchasesFeedback) {
    return;
  }

  purchasesFeedback.textContent = message || '';
  purchasesFeedback.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const renderPaymentMethods = (paymentMethods) => {
  if (!Array.isArray(paymentMethods) || !paymentMethods.length) {
    return '<li>La empresa aun no ha registrado metodos de pago.</li>';
  }

  return paymentMethods.map((method) => {
    const bankSegment = method.bank_name ? ` - ${method.bank_name}` : '';
    const accountSegment = method.account_number ? ` - ${method.account_number}` : '';

    return `<li>${method.label} (${method.method_type})${bankSegment}${accountSegment}</li>`;
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
    return `<li>${productName} x ${item.quantity} | USD ${formatAmount(item.subtotal_usd)} | Bs ${formatAmount(item.subtotal_bs)}${cashbackLabel}</li>`;
  }).join('');
};

const renderGroupEvidences = (evidences) => {
  if (!Array.isArray(evidences) || !evidences.length) {
    return '<li>Sin evidencias cargadas.</li>';
  }

  return evidences.map((evidence) => {
    const fileName = evidence.original_name || 'Archivo';
    return `<li>${fileName} - ${getPurchaseStatusLabel(evidence.review_status)} - <a href="${evidence.file_url}" target="_blank" rel="noopener noreferrer">Ver archivo</a></li>`;
  }).join('');
};

const renderCheckoutGroups = (groups) => groups.map((group) => {
  const items = Array.isArray(group.items) ? group.items : [];
  const evidences = Array.isArray(group.evidences) ? group.evidences : [];
  const canUploadEvidence = group.status === 'PENDING_PAYMENT';
  const groupSummary = `${group.company?.name || 'Proveedor'} | ${getPurchaseStatusLabel(group.status)} | Total ${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}`;

  return `
    <details style="border-top:1px solid #e0e0e0; margin-top:12px; padding-top:12px;">
      <summary><b>Grupo #${group.id_purchase_group}</b> | ${groupSummary}</summary>
      <div style="margin-top:12px;">
        <p><b>Proveedor:</b> ${group.company?.name || 'Sin nombre'}</p>
        <p>Subtotal: ${buildCurrencyPairLabel(group.subtotal_usd, group.subtotal_bs)}</p>
        <p>Cashback usado: ${buildCurrencyPairLabel(group.cashback_redeemed_usd, group.cashback_redeemed_bs)}</p>
        <p>Total a pagar: ${buildCurrencyPairLabel(group.total_payable_usd, group.total_payable_bs)}</p>
        <p>Cashback ${group.status === 'APPROVED' ? 'acreditado' : 'potencial'}: USD ${formatAmount(items.reduce((sum, item) => sum + Number(item.cashback_generated || 0), 0))}</p>
        <p>Pago vence: ${formatDateTime(group.payment_due_at)}</p>
        <p>Nota de revision: ${group.review_note || 'Sin observaciones'}</p>
        <details>
          <summary>Metodos de pago</summary>
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
          <details style="margin-top:12px;">
            <summary>Subir evidencia de pago</summary>
            <form data-evidence-form="${group.id_purchase_group}" style="margin-top:12px; border:1px solid #ddd; padding:12px;">
              <input name="evidence" type="file" accept="image/*,.pdf" required>
              <br><br>
              <textarea name="note" rows="3" placeholder="Nota opcional para la empresa" style="width:100%; max-width:420px;"></textarea>
              <br><br>
              <button type="submit">Enviar evidencia</button>
            </form>
          </details>
        ` : ''}
      </div>
    </details>
  `;
}).join('');

const renderPurchases = (checkouts) => {
  const list = Array.isArray(checkouts) ? checkouts : [];
  const totalGroups = list.reduce((sum, checkout) => sum + (Array.isArray(checkout.groups) ? checkout.groups.length : 0), 0);
  purchasesSummary.innerHTML = `Compras registradas: <b>${list.length}</b> | Grupos por proveedor: <b>${totalGroups}</b>`;

  if (!list.length) {
    purchasesList.innerHTML = '<p>Aun no tienes compras registradas.</p>';
    return;
  }

  purchasesList.innerHTML = list.map((checkout) => {
    const groups = Array.isArray(checkout.groups) ? checkout.groups : [];
    const checkoutSummary = `${getPurchaseStatusLabel(checkout.status)} | Total ${buildCurrencyPairLabel(checkout.total_payable_usd, checkout.total_payable_bs)} | Grupos ${groups.length}`;

    return `
      <details style="border:1px solid #ccc; padding:16px; margin-bottom:16px;">
        <summary><b>Orden ${checkout.order_code || `#${checkout.id_checkout}`}</b> | ${checkoutSummary}</summary>
        <div style="margin-top:12px;">
          <p>Estado: ${getPurchaseStatusLabel(checkout.status)}</p>
          <p>Total original: ${buildCurrencyPairLabel(checkout.total_usd, checkout.total_bs)}</p>
          <p>Cashback usado: ${buildCurrencyPairLabel(checkout.cashback_redeemed_usd, checkout.cashback_redeemed_bs)}</p>
          <p>Total a pagar: ${buildCurrencyPairLabel(checkout.total_payable_usd, checkout.total_payable_bs)}</p>
          <p>Tasa usada: ${formatAmount(checkout.exchange_rate_snapshot)}</p>
          <p>Creado: ${formatDateTime(checkout.created_at)}</p>
          <div>
            ${renderCheckoutGroups(groups)}
          </div>
        </div>
      </details>
    `;
  }).join('');
};

const loadPurchases = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/purchases/my-checkouts`);
  renderPurchases(data.checkouts);
  bindEvidenceForms();
};

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

const bindEvidenceForms = () => {
  document.querySelectorAll('[data-evidence-form]').forEach((form) => {
    form.addEventListener('submit', handleEvidenceSubmit);
  });
};

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesion no valida para customer');
    }

    return loadPurchases();
  })
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });