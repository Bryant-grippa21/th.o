if (!requireCustomerSession()) {
  throw new Error('Sesion requerida');
}

const cashbackSummary = document.getElementById('cashback-summary');
const cashbackHistory = document.getElementById('cashback-history');

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

const formatDateTime = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const getTransactionLabel = (transactionType) => {
  if (transactionType === 'acumulate') {
    return 'Acumulado';
  }

  if (transactionType === 'redemption') {
    return 'Redención';
  }

  return transactionType || 'Movimiento';
};

const getCashbackOriginLabel = (entry) => {
  if (entry.purchase_checkout) {
    return `Redención aplicada a la orden ${entry.purchase_checkout.order_code}`;
  }

  if (entry.purchase_group) {
    return `Reintegro por ajuste del grupo #${entry.purchase_group.id_purchase_group} de ${entry.purchase_group.company_name}`;
  }

  if (entry.purchase_item) {
    const productName = entry.purchase_item.product_name || `Producto ${entry.purchase_item.id_product}`;
    return `${productName} x ${entry.purchase_item.quantity}`;
  }

  return 'Movimiento manual';
};

const renderCashback = (data) => {
  const currentValue = Number(data?.cashback?.value || 0);
  const history = Array.isArray(data?.history) ? data.history : [];

  cashbackSummary.innerHTML = `Saldo disponible: <b>USD ${formatAmount(currentValue)}</b> | Movimientos: <b>${history.length}</b>`;

  if (!history.length) {
    cashbackHistory.innerHTML = '<p>Aun no tienes movimientos de cashback.</p>';
    return;
  }

  cashbackHistory.innerHTML = history.map((entry) => {
    const purchaseItem = entry.purchase_item;
    const purchaseCheckout = entry.purchase_checkout;
    const purchaseGroup = entry.purchase_group;
    const originLabel = getCashbackOriginLabel(entry);
    const subtotalLabel = purchaseItem
      ? ` | Base USD ${formatAmount(purchaseItem.subtotal_usd)}`
      : purchaseCheckout
        ? ` | Total orden USD ${formatAmount(purchaseCheckout.total_usd)}`
        : purchaseGroup
          ? ` | Base grupo USD ${formatAmount(purchaseGroup.subtotal_usd)}`
          : '';

    return `
      <article style="border:1px solid #ccc; padding:12px; margin-bottom:12px;">
        <p><b>${getTransactionLabel(entry.transaction_type)}</b></p>
        <p>Valor: USD ${formatAmount(entry.value)}</p>
        <p>Origen: ${originLabel}${subtotalLabel}</p>
        <p>Orden: ${purchaseCheckout?.order_code || purchaseGroup?.id_checkout || purchaseItem?.id_purchase_group || 'N/D'}</p>
        <p>Fecha: ${formatDateTime(entry.created_at)}</p>
      </article>
    `;
  }).join('');
};

const loadCashback = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/auth/cashback`);
  renderCashback(data);
};

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesion no valida para customer');
    }

    return loadCashback();
  })
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });