if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

const ROLE_WHOLESALER = 2;

const summaryElement = document.getElementById('b2b-wholesaler-summary');
const feedbackElement = document.getElementById('b2b-wholesaler-feedback');
const quotesList = document.getElementById('b2b-wholesaler-quotes-list');
const paginationContainer = document.getElementById('b2b-wholesaler-pagination');
const filterStatusInput = document.getElementById('b2b-wholesaler-filter-status');
const filterFromInput = document.getElementById('b2b-wholesaler-filter-from');
const filterToInput = document.getElementById('b2b-wholesaler-filter-to');
const filterRetailerInput = document.getElementById('b2b-wholesaler-filter-retailer');
const filterApplyButton = document.getElementById('b2b-wholesaler-filter-apply');
const filterClearButton = document.getElementById('b2b-wholesaler-filter-clear');

const state = {
  session: null,
  quotes: [],
  quoteDetails: new Map(),
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    total_pages: 1
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
  const data = contentType.includes('application/json') ? JSON.parse(rawBody || '{}') : null;

  if (!response.ok) {
    throw new Error(data?.error || `Error en la solicitud (${response.status})`);
  }

  return data || {};
};

const setFeedback = (message, type = 'info') => {
  feedbackElement.textContent = message || '';
  feedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const formatDate = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const formatMoney = (value) => Number(value || 0).toFixed(2);

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const collectWholesalerResponseItems = (quoteId) => {
  const rows = Array.from(document.querySelectorAll(`#quote-response-form-${quoteId} [data-response-item]`));

  if (!rows.length) {
    throw new Error('No hay productos cargados para responder la cotización. Carga el detalle primero.');
  }

  return rows.map((row) => {
    const productId = Number(row.dataset.productId || 0);
    const index = row.dataset.rowIndex;
    const quantity = Number(document.getElementById(`quote-item-quantity-${quoteId}-${index}`)?.value || 0);
    const unitPrice = Number(document.getElementById(`quote-item-price-${quoteId}-${index}`)?.value || 0);

    if (!productId || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error('Cada producto debe tener cantidad y precio unitario válidos.');
    }

    return {
      id_product_fk: productId,
      quantity,
      unit_price_usd: unitPrice,
      product_name_snapshot: row.dataset.productName || '',
      sku_snapshot: row.dataset.productSku || ''
    };
  });
};

const renderWholesalerResponseForm = (quote) => {
  const quoteId = Number(quote.id_b2b_quote);
  let requestedItems = [];

  if (Array.isArray(quote?.retailer_payload_json?.items)) {
    requestedItems = quote.retailer_payload_json.items;
  } else if (Array.isArray(quote.items)) {
    requestedItems = quote.items;
  }

  if (!requestedItems.length) {
    return '<p>Sin productos solicitados para esta cotización.</p>';
  }

  const currentItemsMap = new Map((quote.items || []).map((item) => [Number(item.id_product_fk), item]));

  const itemsHtml = requestedItems.map((item, index) => {
    const productId = Number(item.id_product || item.id_product_fk || 0);
    const requestedQuantity = Number(item.quantity || item.requested_quantity || 0);
    const productName = item.product_name || item.product_name_snapshot || 'Producto';
    const sku = item.sku || item.sku_snapshot || '';
    const quotedItem = currentItemsMap.get(productId);
    const unitPrice = quotedItem ? quotedItem.unit_price_usd : Number(item.unit_price_usd || 0);
    const skuText = sku ? `(${escapeHtml(sku)})` : '';

    return `
      <div class="company-quote-response-item" data-response-item data-product-id="${productId}" data-row-index="${index}" data-product-name="${escapeHtml(productName)}" data-product-sku="${escapeHtml(sku)}">
        <p><b>${escapeHtml(productName)}</b> ${skuText}</p>
        <p>Cantidad solicitada: ${requestedQuantity}</p>
        <div class="company-quote-response-fields">
          <label>Precio unitario USD
            <input id="quote-item-price-${quoteId}-${index}" type="number" min="0" step="0.01" value="${formatMoney(unitPrice)}" class="company-quote-input company-quote-input--small">
          </label>
          <label>Cantidad
            <input id="quote-item-quantity-${quoteId}-${index}" type="number" min="1" step="1" value="${requestedQuantity}" class="company-quote-input company-quote-input--small">
          </label>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="company-quote-response-form" id="quote-response-form-${quoteId}">
      <h3>Responder cotización</h3>
      ${itemsHtml}
      <label>Nota del mayorista
        <input id="quote-note-${quoteId}" type="text" placeholder="Nota para el cliente" class="company-quote-input company-quote-input--spaced" value="${escapeHtml(quote.wholesaler_note || '')}">
      </label>
      <div class="company-quote-actions-row company-quote-actions-row--spaced">
        <button type="button" data-quote-action="respond" data-quote-id="${quoteId}">Enviar cotización</button>
        <button type="button" data-quote-action="reject" data-quote-id="${quoteId}">Rechazar solicitud</button>
      </div>
    </div>`;
};

const quoteStatusLabel = (status) => {
  const labels = {
    REQUESTED: 'Solicitada',
    QUOTED: 'Cotizada',
    ACCEPTED: 'Aceptada',
    REJECTED: 'Rechazada',
    CANCELLED: 'Cancelada',
    DELIVERED: 'Entregada',
    PAYMENT_PENDING: 'Pago pendiente',
    PAYMENT_SUBMITTED: 'Pago enviado',
    PAID: 'Pagada',
    OVERDUE: 'Vencida'
  };

  return labels[status] || status || 'Sin estado';
};

const historyStatusLabel = (status) => quoteStatusLabel(status);

const renderPaymentMethodsHtml = (paymentMethods) => {
  if (!Array.isArray(paymentMethods) || !paymentMethods.length) {
    return '<p>La empresa no ha registrado métodos de pago.</p>';
  }

  return `
    <ul style="margin-top:8px; padding-left:18px;">
      ${paymentMethods.map((method) => {
        const bank = escapeHtml(method.bank_name || 'Sin banco');
        const type = escapeHtml(method.method_type || 'Sin tipo');
        const label = escapeHtml(method.label || 'Sin etiqueta');
        const holder = escapeHtml(method.account_holder || 'Sin titular');
        const account = escapeHtml(method.account_number || 'Sin número');
        const instructions = escapeHtml(method.instructions || 'Sin instrucciones');

        return `
          <li style="margin-bottom:12px;">
            <p><strong>${label}</strong> (${type})</p>
            <p>Banco: ${bank}</p>
            <p>Titular: ${holder}</p>
            <p>Cuenta: ${account}</p>
            <p>Instrucciones: ${instructions}</p>
          </li>`;
      }).join('')}
    </ul>`;
};

const openQuoteHistoryModal = (quote) => {
  const history = Array.isArray(quote.history) ? quote.history : [];
  const evidences = Array.isArray(quote.evidences) ? quote.evidences : [];
  const modalId = 'b2b-wholesaler-history-modal';
  let modal = document.getElementById(modalId);

  if (modal) {
    document.body.removeChild(modal);
  }

  modal = document.createElement('div');
  modal.id = modalId;
  modal.style = 'position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.55); padding:20px;';
  modal.innerHTML = `
    <div style="width:min(100%,780px); max-height:90vh; overflow:auto; background:#fff; border-radius:14px; box-shadow:0 20px 50px rgba(0,0,0,0.2); padding:24px; position:relative;">
      <button type="button" data-close-history-modal style="position:absolute; top:18px; right:18px; background:#000; color:#fff; border:none; border-radius:999px; width:34px; height:34px; cursor:pointer;">×</button>
      <h2 style="margin-top:0;">Historial de cambios y mensajes</h2>
      <section style="margin-top:18px;">
        <h3 style="margin-bottom:12px;">Eventos de estado</h3>
        <ul style="padding-left:18px;">${history.map((entry) => {
          const fromLabel = entry.from_status ? historyStatusLabel(entry.from_status) : 'Creación';
          const toLabel = historyStatusLabel(entry.to_status);
          return `<li style="margin-bottom:12px;"><strong>${formatDate(entry.created_at)}</strong> | ${fromLabel} → ${toLabel}<br><em>${escapeHtml(entry.note || 'Sin mensaje')}</em></li>`;
        }).join('') || '<li>Sin historial</li>'}</ul>
      </section>
      <section style="margin-top:18px;">
        <h3 style="margin-bottom:12px;">Evidencias de pago</h3>
        <ul style="padding-left:18px;">${evidences.map((evidence) => `
          <li style="margin-bottom:12px;">
            <strong>#${evidence.id_b2b_quote_payment_evidence}</strong> - ${escapeHtml(evidence.original_name || 'Archivo')} - ${escapeHtml(evidence.review_status)} - USD ${formatMoney(evidence.amount_reported_usd)}<br>
            <em>${escapeHtml(evidence.review_note || 'Sin mensaje de revisión')}</em>
          </li>`).join('') || '<li>Sin evidencias</li>'}</ul>
      </section>
    </div>`;

  document.body.appendChild(modal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-close-history-modal]')) {
      document.body.removeChild(modal);
    }
  });
};

const refreshSummary = () => {
  const company = state.session?.data?.company;
  summaryElement.innerHTML = `
    Empresa: <b>${company?.name || company?.email || 'Mayorista'}</b> |
    Cotizaciones entrantes: <b>${state.quotes.length}</b>
  `;
};

const paginateQuotes = (quotes) => {
  const total = quotes.length;
  const limit = Number(state.pagination.limit || 5);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(state.pagination.page || 1, 1), totalPages);
  const startIndex = (page - 1) * limit;
  const items = quotes.slice(startIndex, startIndex + limit);

  state.pagination = {
    ...state.pagination,
    page,
    total,
    total_pages: totalPages
  };

  return items;
};

const renderPaginationControls = () => {
  if (!paginationContainer) {
    return;
  }

  const { page, total, total_pages: totalPages, limit } = state.pagination;

  if (!total || total <= limit) {
    paginationContainer.innerHTML = '';
    return;
  }

  const buttons = Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    return `<button type="button" data-pagination-page="${pageNumber}" style="padding:8px 12px; border-radius:8px; border:1px solid #ccc; background:${pageNumber === page ? '#0b5ed7' : '#fff'}; color:${pageNumber === page ? '#fff' : '#000'}; cursor:pointer;">${pageNumber}</button>`;
  }).join('');

  paginationContainer.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
      <button type="button" data-pagination-page="${Math.max(page - 1, 1)}" style="padding:8px 12px; border-radius:8px; border:1px solid #ccc; background:#f8f9fa; cursor:pointer;" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
      ${buttons}
      <button type="button" data-pagination-page="${Math.min(page + 1, totalPages)}" style="padding:8px 12px; border-radius:8px; border:1px solid #ccc; background:#f8f9fa; cursor:pointer;" ${page >= totalPages ? 'disabled' : ''}>Siguiente</button>
      <span style="margin-left:12px; color:#555;">Página ${page} de ${totalPages}</span>
    </div>
  `;
};

const renderDetailInto = (quoteId, containerId) => {
  const detail = state.quoteDetails.get(Number(quoteId));
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  if (!detail) {
    container.innerHTML = '<p>Sin detalle cargado.</p>';
    return;
  }

  let requestedItems = [];

  if (Array.isArray(detail?.retailer_payload_json?.items)) {
    requestedItems = detail.retailer_payload_json.items;
  } else if (Array.isArray(detail.items)) {
    requestedItems = detail.items;
  }

  const requestedCharges = Array.isArray(detail?.retailer_payload_json?.charges)
    ? detail.retailer_payload_json.charges
    : [];
  const evidences = Array.isArray(detail.evidences) ? detail.evidences : [];

  const requestedItemsList = requestedItems.map((item) => {
    const productId = item.id_product || item.id_product_fk || 'N/A';
    const productName = item.product_name || item.product_name_snapshot || 'Producto';
    const sku = item.sku || item.sku_snapshot || '';
    const quantity = item.quantity || item.requested_quantity || 0;
    const unitPrice = Number(item.unit_price_usd || item.unit_price_snapshot_usd || 0);
    const skuText = sku ? ` (${escapeHtml(sku)})` : '';

    return `<li>Producto ${escapeHtml(productName)}${skuText} | ID ${productId} | Cantidad solicitada: ${quantity} | Precio sugerido: USD ${formatMoney(unitPrice)}</li>`;
  }).join('') || '<li>Sin productos solicitados.</li>';

  const requestedChargesList = requestedCharges.map((charge) => {
    const chargeLabel = charge.label ? `(${charge.label})` : '';
    return `<li>${charge.charge_type}: USD ${formatMoney(charge.amount_usd || 0)} ${chargeLabel}</li>`;
  }).join('') || '<li>Sin cargos solicitados.</li>';

  const responseForm = ['REQUESTED', 'QUOTED'].includes(detail.status)
    ? renderWholesalerResponseForm(detail)
    : '';

  container.innerHTML = `
    <details open>
      <summary>Detalle de cotización</summary>
      <p>Empresa solicitante: <b>${escapeHtml(detail.retailer_payload_json?.company_name || detail.retailer_name || 'N/A')}</b></p>
      <p>Correo: ${escapeHtml(detail.retailer_payload_json?.company_email || 'N/A')}</p>
      <p>Teléfono: ${escapeHtml(detail.retailer_payload_json?.company_phone || 'N/A')}</p>
      <p>Nota del cliente: ${escapeHtml(detail.retailer_payload_json?.note || detail.retailer_note || 'Sin nota')}</p>
      <p>Subtotal cotizado: USD ${formatMoney(detail.subtotal_usd)}</p>
      <p>Cargos cotizados: USD ${formatMoney(detail.additional_charges_usd)}</p>
      <p>Total cotizado: USD ${formatMoney(detail.total_usd)}</p>
      <button type="button" data-quote-action="open-history" data-quote-id="${quoteId}" style="display:inline-block; margin:10px 0; background:#0b5ed7; color:#fff; padding:10px 16px; border-radius:10px; border:none; cursor:pointer; font-weight:600;">Ver historial de cambios y mensajes</button>
      <h4>Productos solicitados</h4>
      <ul>${requestedItemsList}</ul>
      <h4>Cargos solicitados</h4>
      <ul>${requestedChargesList}</ul>
      ${responseForm}
      <p>Evidencias:</p>
      <ul>${evidences.map((evidence) => {
        const isPending = String(evidence.review_status) === 'PENDING';
        return `
          <li style="margin-bottom:16px; padding:12px; border:1px solid #d1d5db; border-radius:10px; background:#f8f9fa;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
              <div>
                <strong>#${evidence.id_b2b_quote_payment_evidence}</strong> - ${escapeHtml(evidence.original_name || 'Archivo')}<br>
                <small>Estado: ${escapeHtml(evidence.review_status)} | Monto reportado: USD ${formatMoney(evidence.amount_reported_usd)}</small>
              </div>
              <a href="${escapeHtml(evidence.file_url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#0b5ed7; color:#fff; padding:8px 14px; border-radius:8px; text-decoration:none; font-weight:600;">Ver evidencia</a>
            </div>
            ${isPending ? `
              <label style="display:block; margin-top:10px;">
                Nota de revisión
                <input id="quote-evidence-note-${quoteId}-${evidence.id_b2b_quote_payment_evidence}" type="text" placeholder="Deja un comentario" class="company-quote-input" style="width:100%; max-width:100%; margin-top:6px;">
              </label>
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
                <button type="button" data-quote-action="review-approve" data-quote-id="${quoteId}" data-evidence-id="${evidence.id_b2b_quote_payment_evidence}" style="background:#198754; color:#fff; padding:8px 14px; border-radius:8px; border:none; cursor:pointer;">Aprobar evidencia</button>
                <button type="button" data-quote-action="review-reject" data-quote-id="${quoteId}" data-evidence-id="${evidence.id_b2b_quote_payment_evidence}" style="background:#dc3545; color:#fff; padding:8px 14px; border-radius:8px; border:none; cursor:pointer;">Rechazar evidencia</button>
              </div>
            ` : ''}
          </li>`;
      }).join('') || '<li>Sin evidencias</li>'}</ul>
    </details>
  `;
};

const quoteActionsHtml = (quote) => {
  const quoteId = Number(quote.id_b2b_quote);

  if (quote.status === 'REQUESTED' || quote.status === 'QUOTED') {
    return `
      <div class="company-quote-action-block">
        <p>Revisa el detalle completo y responde o rechaza desde el panel de detalle.</p>
        <div class="company-quote-actions-row">
          <button type="button" data-quote-action="load" data-quote-id="${quoteId}">Ver detalle</button>
        </div>
      </div>
    `;
  }


  if (quote.status === 'PAYMENT_SUBMITTED') {
    return `
      <div class="company-quote-action-block company-quote-action-block--compact">
        <p>Revisa la evidencia adjunta y luego aprueba o rechaza directamente desde cada archivo.</p>
      </div>
    `;
  }

  return '';
};

const filterQuotes = (quotes) => {
  const statusFilter = String(filterStatusInput?.value || '').trim();
  const retailerFilter = String(filterRetailerInput?.value || '').trim().toLowerCase();
  const fromDate = filterFromInput?.value ? new Date(filterFromInput.value) : null;
  const toDate = filterToInput?.value ? new Date(filterToInput.value) : null;

  return quotes
    .filter((quote) => {
      if (statusFilter) {
        if (statusFilter === 'REVIEW') {
          return quote.status === 'PAYMENT_SUBMITTED';
        }

        if (statusFilter === 'PAYMENT_PENDING') {
          return ['REQUESTED', 'QUOTED', 'ACCEPTED', 'PAYMENT_PENDING'].includes(quote.status);
        }

        if (statusFilter === 'OVERDUE') {
          return quote.status === 'OVERDUE';
        }

        if (quote.status !== statusFilter) {
          return false;
        }
      }

      if (retailerFilter) {
        const retailerName = String(quote.retailer_name || quote.company_name || '').toLowerCase();
        if (!retailerName.includes(retailerFilter)) {
          return false;
        }
      }

      const quoteDate = new Date(quote.updated_at || quote.requested_at || quote.created_at || null);
      const validQuoteDate = Number.isFinite(quoteDate.getTime()) ? quoteDate : null;

      if (fromDate && validQuoteDate && validQuoteDate < fromDate) {
        return false;
      }
      if (toDate && validQuoteDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (validQuoteDate > endOfDay) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.requested_at || a.created_at || null);
      const dateB = new Date(b.updated_at || b.requested_at || b.created_at || null);
      return (Number.isFinite(dateB.getTime()) ? dateB.getTime() : 0) - (Number.isFinite(dateA.getTime()) ? dateA.getTime() : 0);
    });
};

const renderQuotes = () => {
  if (!state.quotes.length) {
    quotesList.innerHTML = '<p>No hay cotizaciones entrantes.</p>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  const filteredQuotes = filterQuotes(state.quotes);

  if (!filteredQuotes.length) {
    quotesList.innerHTML = '<p>No hay cotizaciones entrantes que coincidan con los filtros seleccionados.</p>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  const pageQuotes = paginateQuotes(filteredQuotes);

  quotesList.innerHTML = pageQuotes.map((quote) => {
    const quoteId = Number(quote.id_b2b_quote);

    return `
      <details class="company-quote-card">
        <summary><b>${quote.quote_code}</b> | ${quote.retailer_name || quote.id_retailer_fk} | ${quoteStatusLabel(quote.status)} | USD ${formatMoney(quote.total_usd)}</summary>
        <p>Estado: ${quoteStatusLabel(quote.status)}</p>
        <p>Actualizado: ${formatDate(quote.updated_at)}</p>
        <p>Nota mayorista: ${quote.wholesaler_note || 'Sin nota'}</p>
        <div class="company-quote-actions-row">
          <button type="button" data-quote-action="load" data-quote-id="${quoteId}">Ver detalle</button>
        </div>
        ${quoteActionsHtml(quote)}
        <div id="wh-quote-detail-${quoteId}"></div>
      </details>
    `;
  }).join('');

  if (paginationContainer) {
    renderPaginationControls();
  }
};

const refreshData = async () => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/incoming`);
  state.quotes = Array.isArray(response.quotes) ? response.quotes : [];
  state.pagination.page = 1;
  refreshSummary();
  renderQuotes();
};

const loadQuoteDetail = async (quoteId) => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}`);
  state.quoteDetails.set(Number(quoteId), response.quote);
  renderDetailInto(quoteId, `wh-quote-detail-${quoteId}`);
};

const parseJsonField = (value, fallbackValue) => {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return fallbackValue;
  }

  return JSON.parse(trimmed);
};

filterApplyButton?.addEventListener('click', () => {
  state.pagination.page = 1;
  renderQuotes();
});

filterClearButton?.addEventListener('click', () => {
  if (filterStatusInput) filterStatusInput.value = '';
  if (filterFromInput) filterFromInput.value = '';
  if (filterToInput) filterToInput.value = '';
  if (filterRetailerInput) filterRetailerInput.value = '';
  state.pagination.page = 1;
  renderQuotes();
});

paginationContainer?.addEventListener('click', (event) => {
  const paginationButton = event.target.closest('[data-pagination-page]');

  if (!paginationButton) {
    return;
  }

  const nextPage = Number(paginationButton.dataset.paginationPage || 1);
  state.pagination.page = nextPage;
  renderQuotes();
});

quotesList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-quote-action]');

  if (!button) {
    return;
  }

  const action = button.dataset.quoteAction;
  const quoteId = Number(button.dataset.quoteId);

  try {
    if (action === 'load') {
      setFeedback('Cargando detalle...');
      await loadQuoteDetail(quoteId);
      setFeedback('Detalle cargado.', 'success');
      return;
    }

    if (action === 'respond') {
      const note = document.getElementById(`quote-note-${quoteId}`)?.value || '';
      const items = collectWholesalerResponseItems(quoteId);

      await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          charges: [],
          wholesaler_note: note,
          decision: 'QUOTE'
        })
      });

      setFeedback('Cotización respondida.', 'success');
      await refreshData();
      await loadQuoteDetail(quoteId);
      return;
    }

    if (action === 'reject') {
      const note = document.getElementById(`quote-note-${quoteId}`)?.value || '';

      if (!note.trim()) {
        throw new Error('Debes agregar una nota al rechazar la cotización');
      }

      await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'REJECTED',
          wholesaler_note: note
        })
      });

      setFeedback('Solicitud rechazada.', 'success');
      await refreshData();
      await loadQuoteDetail(quoteId);
      return;
    }

    if (action === 'open-history') {
      const quote = state.quoteDetails.get(Number(quoteId));
      if (!quote) {
        throw new Error('Carga el detalle de la cotización primero.');
      }
      openQuoteHistoryModal(quote);
      return;
    }

    if (action === 'review-approve' || action === 'review-reject') {
      const evidenceId = Number(button.dataset.evidenceId || 0);
      const note = document.getElementById(`quote-evidence-note-${quoteId}-${evidenceId}`)?.value || '';

      if (!evidenceId) {
        throw new Error('Debes indicar el ID de evidencia');
      }

      await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/payment-evidences/${evidenceId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_status: action === 'review-approve' ? 'APPROVED' : 'REJECTED',
          review_note: note
        })
      });

      setFeedback('Evidencia revisada.', 'success');
      await refreshData();
      await loadQuoteDetail(quoteId);
    }
  } catch (error) {
    setFeedback(error.message, 'error');
  }
});

fetchCurrentSession()
  .then(async (session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesión no válida para empresa');
    }

    const company = session.data.company;
    const roleId = Number(company.id_role_fk || company.id_role);

    if (roleId !== ROLE_WHOLESALER) {
      throw new Error('Solo mayoristas pueden usar este módulo');
    }

    if (company.verification_status !== 'APPROVED' || !company.can_sell) {
      throw new Error('Tu empresa no está habilitada para cotizaciones B2B como mayorista');
    }

    state.session = session;
    await refreshData();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
