if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

const ROLE_RETAILER = 3;

const summaryElement = document.getElementById('b2b-retailer-summary');
const feedbackElement = document.getElementById('b2b-retailer-feedback');
const cartSummaryElement = document.getElementById('b2b-retailer-cart-summary');
const cartFeedbackElement = document.getElementById('b2b-retailer-cart-feedback');
const cartListElement = document.getElementById('b2b-retailer-cart-list');
const cartSubmitButton = document.getElementById('b2b-retailer-cart-submit');
const cartClearButton = document.getElementById('b2b-retailer-cart-clear');
const quotesList = document.getElementById('b2b-retailer-quotes-list');
const paginationContainer = document.getElementById('b2b-retailer-pagination');
const filterStatusInput = document.getElementById('b2b-retailer-filter-status');
const filterFromInput = document.getElementById('b2b-retailer-filter-from');
const filterToInput = document.getElementById('b2b-retailer-filter-to');
const filterWholesalerInput = document.getElementById('b2b-retailer-filter-wholesaler');
const filterApplyButton = document.getElementById('b2b-retailer-filter-apply');
const filterClearButton = document.getElementById('b2b-retailer-filter-clear');

const state = {
  session: null,
  cart: null,
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

const formatDate = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const formatDateKey = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleDateString('es-VE');
};

const formatMoney = (value) => Number(value || 0).toFixed(2);

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const showToast = (message, type = 'info', duration = 3500) => {
  if (!message) return;
  const toastId = 'b2b-retailer-toast';
  let toast = document.getElementById(toastId);

  if (!toast) {
    toast = document.createElement('div');
    toast.id = toastId;
    toast.style = 'position:fixed; bottom:20px; right:20px; z-index:10000; display:grid; gap:10px;';
    document.body.appendChild(toast);
  }

  const toastItem = document.createElement('div');
  toastItem.textContent = message;
  toastItem.style = `min-width:220px; max-width:320px; padding:12px 14px; border-radius:12px; color:#fff; box-shadow:0 8px 22px rgba(0,0,0,0.18); font-size:14px; line-height:1.4; background:${type === 'error' ? '#c92a2a' : '#0b5ed7'};`;
  toast.appendChild(toastItem);

  setTimeout(() => {
    toastItem.style.opacity = '0';
    toastItem.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.removeChild(toastItem), 250);
  }, duration);
};

const setFeedback = (message, type = 'info') => {
  feedbackElement.textContent = message || '';
  feedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
  if (message) {
    showToast(message, type);
  }
};

const setCartFeedback = (message, type = 'info') => {
  if (!cartFeedbackElement) {
    return;
  }

  cartFeedbackElement.textContent = message || '';
  cartFeedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
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

const historyStatusLabel = (status) => {
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

const paymentModeLabel = (value) => (String(value || '').toUpperCase() === 'INSTALLMENTS' ? 'Cuotas' : 'Pago único');

const renderPaymentMethodsHtml = (paymentMethods) => {
  if (!Array.isArray(paymentMethods) || !paymentMethods.length) {
    return '<p>El mayorista no ha registrado métodos de pago.</p>';
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

const renderSummary = () => {
  const company = state.session?.data?.company;
  summaryElement.innerHTML = `
    Empresa: <b>${company?.name || company?.email || 'Detalle'}</b> |
    Carrito: <b>Activo</b> |
    Cotizaciones enviadas: <b>${state.quotes.length}</b>
  `;
};

const renderCart = () => {
  const cart = state.cart || { groups: [], total_items: 0, subtotal_usd: 0 };
  const groups = Array.isArray(cart.groups) ? cart.groups : [];
  const isLocked = false;

  if (cartSummaryElement) {
    cartSummaryElement.innerHTML = `
      Estado: <b>Activo</b> |
      Empresas: <b>${Number(cart.groups_count || groups.length || 0)}</b> |
      Productos: <b>${Number(cart.total_items || 0)}</b> |
      Subtotal USD: <b>USD ${formatMoney(cart.subtotal_usd || 0)}</b>
    `;
  }

  if (cartSubmitButton) {
    cartSubmitButton.disabled = !groups.length;
  }

  if (cartClearButton) {
    cartClearButton.disabled = !groups.length;
  }

  if (!groups.length) {
    cartListElement.innerHTML = '<p>No tienes productos en el carrito B2B.</p>';
    return;
  }

  cartListElement.innerHTML = groups.map((group) => {
    const items = Array.isArray(group.items) ? group.items : [];
    const contactParts = [];

    if (group.company_email) {
      contactParts.push(`Email: ${group.company_email}`);
    }

    if (group.company_phone) {
      contactParts.push(`Cel: ${group.company_phone}`);
    }

    return `
      <details style="border:1px solid #ccc; padding:12px; margin-bottom:12px;" ${isLocked ? '' : 'open'}>
        <summary><b>${group.company_name || `Empresa #${group.company_id}`}</b> | ${paymentModeLabel(group.payment_mode)} | Items: ${Number(group.items_count || items.length || 0)} | USD ${formatMoney(group.subtotal_usd || 0)}</summary>
        <p>${contactParts.join(' | ')}</p>
        <p>Comentario: ${group.note || 'Sin comentario'}</p>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
          <label style="display:flex; flex-direction:column; gap:4px; min-width: 220px;">
            Comentario para esta empresa
            <input data-cart-group-note="${group.company_id}" type="text" value="${String(group.note || '').replaceAll('"', '&quot;')}">
          </label>
          <label style="display:flex; flex-direction:column; gap:4px; min-width: 180px;">
            Tipo de pago
            <select data-cart-group-payment="${group.company_id}">
              <option value="ONE_TIME" ${String(group.payment_mode || 'ONE_TIME') === 'ONE_TIME' ? 'selected' : ''}>Pago único</option>
              <option value="INSTALLMENTS" ${String(group.payment_mode || '').toUpperCase() === 'INSTALLMENTS' ? 'selected' : ''}>Cuotas</option>
            </select>
          </label>
          <button type="button" data-cart-group-save="${group.company_id}" ${isLocked ? 'disabled' : ''}>Guardar grupo</button>
        </div>
        <div class="company-wholesale-grid">
          ${items.map((item) => `
            <article class="company-wholesale-card">
              <div class="company-wholesale-card__media">
                ${item.main_image_url
                  ? `<img src="${item.main_image_url}" alt="${item.product_name || 'Producto'}">`
                  : '<div class="company-wholesale-card__media-placeholder">Sin imagen</div>'}
              </div>
              <div class="company-wholesale-card__body">
                <h3>${item.product_name || 'Sin nombre'}</h3>
                <p class="company-wholesale-card__seller">SKU: ${item.sku || 'Sin SKU'}</p>
                <p class="company-wholesale-card__stock">Cantidad: ${Number(item.quantity || 0)}</p>
                <p class="company-wholesale-card__price">USD ${formatMoney(item.unit_price_usd)}</p>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">
                  <button type="button" data-cart-item-remove="${item.id_product}" ${isLocked ? 'disabled' : ''}>Eliminar</button>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </details>
    `;
  }).join('');
};

const renderQuoteDetailInto = (quoteId, containerId) => {
  const detail = state.quoteDetails.get(Number(quoteId));
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  if (!detail) {
    container.innerHTML = '<p>Sin detalle cargado.</p>';
    return;
  }

  const items = Array.isArray(detail.items) ? detail.items : [];
  const evidences = Array.isArray(detail.evidences) ? detail.evidences : [];
  const history = Array.isArray(detail.history) ? detail.history : [];
  const payload = detail.retailer_payload_json || null;
  const payloadItems = Array.isArray(payload?.items) ? payload.items : [];
  const wholesalerLabel = detail.wholesaler_name || detail.company_name || `Empresa #${detail.id_wholesaler_fk}`;

  container.innerHTML = `
    <details open>
      <summary>Detalle de cotización</summary>
      <p>Empresa: ${wholesalerLabel}</p>
      <p>Estado: ${quoteStatusLabel(detail.status)}</p>
      <p>Modo de pago: ${paymentModeLabel(detail.payment_mode)}</p>
      <p>Subtotal: USD ${formatMoney(detail.subtotal_usd)}</p>
      <p>Cargos: USD ${formatMoney(detail.additional_charges_usd)}</p>
      <p>Total: USD ${formatMoney(detail.total_usd)}</p>
      ${Number(detail.remaining_balance_usd || 0) > 0 ? `<p><strong>Saldo pendiente:</strong> USD ${formatMoney(detail.remaining_balance_usd)}</p>` : '<p><strong>Saldo pendiente:</strong> USD 0.00</p>'}
      <p>Creada: ${formatDate(detail.created_at)}</p>
      <p>Vence: ${formatDate(detail.payment_due_at)}${detail.payment_due_at ? ' (30 días desde la aceptación)' : ''}</p>
      <p>Comentario del detallista: ${detail.retailer_note || 'Sin nota'}</p>
      <button type="button" data-quote-action="open-history" data-quote-id="${quoteId}" style="display:inline-block; margin:10px 0; background:#0b5ed7; color:#fff; padding:10px 16px; border-radius:10px; border:none; cursor:pointer; font-weight:600;">Ver historial de cambios y mensajes</button>
      <details style="margin-top:12px; padding:12px; border:1px solid #d1d5db; border-radius:10px; background:#f8f9fa;">
        <summary style="cursor:pointer; font-weight:700;">Métodos de pago del mayorista</summary>
        ${renderPaymentMethodsHtml(detail.payment_methods)}
      </details>
      <p>Snapshot del carrito:</p>
      <ul>${payloadItems.map((item) => `<li>${item.product_name || item.id_product} x ${item.quantity} | USD ${formatMoney(Number(item.unit_price_usd || 0) * Number(item.quantity || 0))}</li>`).join('') || '<li>Sin snapshot</li>'}</ul>
      <p>Items formalizados:</p>
      <ul>${items.map((item) => `<li>${item.product_name_snapshot || item.id_product_fk} x ${item.quantity} | USD ${formatMoney(item.subtotal_usd)}</li>`).join('') || '<li>Sin items</li>'}</ul>
      <div style="margin:14px 0; padding:12px; background:#f8f9fa; border:1px solid #d1d5db; border-radius:8px;">
        <strong>Evidencias de pago</strong>
        <ul style="margin-top:8px;">${evidences.map((evidence) => `
          <li style="margin-bottom:10px;">
            <span style="display:inline-block; min-width:220px;">${escapeHtml(evidence.original_name || 'Archivo')} - ${escapeHtml(evidence.review_status)} - USD ${formatMoney(evidence.amount_reported_usd)}</span>
            <a href="${escapeHtml(evidence.file_url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-left:12px; background:#0b5ed7; color:#fff; padding:8px 14px; border-radius:8px; text-decoration:none; font-weight:600;">Ver evidencia</a>
          </li>`).join('') || '<li>Sin evidencias</li>'}</ul>
      </div>
    </details>
  `;
};

const openQuoteHistoryModal = (quote) => {
  const history = Array.isArray(quote.history) ? quote.history : [];
  const evidences = Array.isArray(quote.evidences) ? quote.evidences : [];
  const modalId = 'b2b-retailer-history-modal';
  let modal = document.getElementById(modalId);

  if (!modal) {
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
  }
};

const renderQuoteActionsHtml = (quote) => {
  const quoteId = Number(quote.id_b2b_quote);

  if (quote.status === 'QUOTED') {
    return `
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
        <button type="button" data-quote-action="accept" data-quote-id="${quoteId}">Aceptar</button>
        <button type="button" data-quote-action="reject" data-quote-id="${quoteId}">Rechazar</button>
      </div>
      <input id="quote-note-${quoteId}" type="text" placeholder="Nota opcional" style="width:100%; max-width:480px; margin-top:8px;">
    `;
  }

  if (quote.status === 'ACCEPTED' || quote.status === 'PAYMENT_PENDING' || quote.status === 'PAYMENT_SUBMITTED') {
    return `
      <div style="margin-top:8px; display:grid; gap:12px; max-width:520px;">
        <p style="margin-bottom:8px;">La cotización fue aceptada. Coordina el pago con el mayorista por fuera del sistema y sube aquí el comprobante o evidencia de pago.</p>
        <label style="display:flex; flex-direction:column; gap:4px;">Comprobante de pago
          <input id="quote-file-${quoteId}" type="file" accept="application/pdf,image/*">
        </label>
        ${quote.payment_mode === 'INSTALLMENTS' ? `
          <label style="display:flex; flex-direction:column; gap:4px;">Monto USD
            <input id="quote-amount-${quoteId}" type="number" step="0.01" min="0">
          </label>
        ` : ''}
        <label style="display:flex; flex-direction:column; gap:4px;">Descripción opcional
          <input id="quote-file-desc-${quoteId}" type="text" placeholder="Breve comentario">
        </label>
        <button type="button" data-quote-action="submit-evidence" data-quote-id="${quoteId}">Enviar evidencia</button>
      </div>
      <input id="quote-note-${quoteId}" type="text" placeholder="Nota opcional" style="width:100%; max-width:520px; margin-top:8px;">
    `;
  }

  return '';
};

const getQuoteReferenceDate = (quote) => {
  const date = new Date(quote.updated_at || quote.requested_at || quote.created_at || null);
  return Number.isFinite(date.getTime()) ? date : null;
};

const groupQuotesByDate = (quotes) => {
  const grouped = new Map();

  for (const quote of quotes) {
    const date = getQuoteReferenceDate(quote);
    const dateKey = date ? formatDateKey(date) : 'Sin fecha';

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey).push(quote);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => {
      const dateA = new Date(a.split('/').reverse().join('-')).getTime();
      const dateB = new Date(b.split('/').reverse().join('-')).getTime();
      return dateB - dateA;
    });
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

const applyQuoteFilters = (quotes) => {
  const statusFilter = String(filterStatusInput?.value || '').trim();
  const wholesalerFilter = String(filterWholesalerInput?.value || '').trim().toLowerCase();
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

      if (wholesalerFilter) {
        const wholesalerName = String(quote.wholesaler_name || quote.company_name || '').toLowerCase();
        if (!wholesalerName.includes(wholesalerFilter)) {
          return false;
        }
      }

      const quoteDate = getQuoteReferenceDate(quote);
      if (fromDate && quoteDate && quoteDate < fromDate) {
        return false;
      }
      if (toDate && quoteDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (quoteDate > endOfDay) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = getQuoteReferenceDate(a) || new Date(0);
      const dateB = getQuoteReferenceDate(b) || new Date(0);
      return dateB - dateA;
    });
};

const renderQuotes = () => {
  if (!state.quotes.length) {
    quotesList.innerHTML = '<p>No tienes cotizaciones enviadas.</p>';
    return;
  }

  const filteredQuotes = applyQuoteFilters(state.quotes);

  if (!filteredQuotes.length) {
    quotesList.innerHTML = '<p>No hay cotizaciones que coincidan con los filtros seleccionados.</p>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  const pageQuotes = paginateQuotes(filteredQuotes);
  const groupedQuotes = groupQuotesByDate(pageQuotes);

  quotesList.innerHTML = groupedQuotes.map(([dateKey, quotes]) => `
    <details open style="border:1px solid #ccc; padding:12px; margin-bottom:12px;">
      <summary><b>${dateKey}</b> | ${quotes.length} empresa(s)</summary>
      <div style="display:grid; gap:12px; margin-top:12px;">
        ${quotes.map((quote) => {
          const quoteId = Number(quote.id_b2b_quote);
          return `
            <article style="border:1px solid #ddd; padding:12px; border-radius:8px;">
              <h3>${quote.wholesaler_name || `Empresa #${quote.id_wholesaler_fk}`}</h3>
              <p>Código: ${quote.quote_code}</p>
              <p>Tipo de pago: ${paymentModeLabel(quote.payment_mode)}</p>
              <p>Estado: ${quoteStatusLabel(quote.status)}</p>
              <p>Total USD: ${formatMoney(quote.total_usd)}</p>
              <p>Actualizado: ${formatDate(quote.updated_at)}</p>
              <p>Comentario: ${quote.retailer_note || 'Sin nota'}</p>
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                <button type="button" data-quote-action="load" data-quote-id="${quoteId}">Ver detalle</button>
              </div>
              ${renderQuoteActionsHtml(quote)}
              <div id="quote-detail-${quoteId}"></div>
            </article>
          `;
        }).join('')}
      </div>
    </details>
  `).join('');

  if (paginationContainer) {
    renderPaginationControls();
  }
};

const loadRetailerCart = async () => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart`);
  state.cart = response.cart || null;
  renderSummary();
  renderCart();
};

const loadQuotes = async () => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/outgoing`);
  state.quotes = Array.isArray(response.quotes) ? response.quotes : [];
  renderSummary();
  renderQuotes();
};

const loadQuoteDetail = async (quoteId) => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}`);
  state.quoteDetails.set(Number(quoteId), response.quote);
  renderQuoteDetailInto(quoteId, `quote-detail-${quoteId}`);
};

const refreshData = async () => {
  await Promise.all([
    loadRetailerCart(),
    loadQuotes()
  ]);
};

const handleCartGroupSave = async (companyId) => {
  const note = document.querySelector(`[data-cart-group-note="${companyId}"]`)?.value || '';
  const paymentMode = document.querySelector(`[data-cart-group-payment="${companyId}"]`)?.value || 'ONE_TIME';

  await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart/groups/${companyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, payment_mode: paymentMode })
  });

  setCartFeedback('Grupo actualizado.', 'success');
  await loadRetailerCart();
};

const handleCartItemRemove = async (productId) => {
  await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart/items/${productId}`, {
    method: 'DELETE'
  });

  setCartFeedback('Producto eliminado.', 'success');
  await loadRetailerCart();
};

const handleCartSubmit = async () => {
  if (!confirm('Se enviarán las cotizaciones agrupadas por empresa. ¿Deseas continuar?')) {
    return;
  }

  if (cartSubmitButton) {
    cartSubmitButton.disabled = true;
  }

  try {
    const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart/submit`, {
      method: 'POST'
    });

    const totalQuotes = Array.isArray(response.quotes) ? response.quotes.length : 0;
    setCartFeedback(`Carrito enviado. Se generaron ${totalQuotes} cotizaciones.`, 'success');
    await refreshData();
  } catch (error) {
    setCartFeedback(error.message, 'error');
  } finally {
    if (cartSubmitButton) {
      cartSubmitButton.disabled = false;
    }
  }
};

const handleCartClear = async () => {
  if (!confirm('¿Deseas vaciar tu carrito B2B?')) {
    return;
  }

  await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart`, {
    method: 'DELETE'
  });

  setCartFeedback('Carrito vaciado.', 'success');
  await loadRetailerCart();
};

const handleQuoteAction = async (button) => {
  const action = button.dataset.quoteAction;
  const quoteId = Number(button.dataset.quoteId);
  const note = document.getElementById(`quote-note-${quoteId}`)?.value || '';

  if (action === 'load') {
    setFeedback('Cargando detalle de cotización...');
    await loadQuoteDetail(quoteId);
    setFeedback('Detalle cargado.', 'success');
    return;
  }

  if (action === 'accept' || action === 'reject') {
    const endpoint = action === 'accept' ? 'accept' : 'reject';
    const question = action === 'accept' ? '¿Aceptar cotización?' : '¿Rechazar cotización?';

    if (!confirm(question)) {
      return;
    }

    await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });

    setFeedback('Estado actualizado.', 'success');
    await loadQuotes();
    return;
  }

  if (action === 'submit-evidence') {
    const evidenceInput = document.getElementById(`quote-file-${quoteId}`);
    const file = evidenceInput?.files?.[0];
    const amountValue = document.getElementById(`quote-amount-${quoteId}`)?.value || '';
    const description = document.getElementById(`quote-file-desc-${quoteId}`)?.value || '';

    if (!file) {
      throw new Error('Selecciona un archivo de evidencia antes de enviar.');
    }

    const formData = new FormData();
    formData.append('evidence', file);
    formData.append('amount_reported_usd', amountValue ? Number(amountValue) : '');
    formData.append('review_note', note);
    formData.append('original_name', description || file.name);

    await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/payment-evidences`, {
      method: 'POST',
      body: formData
    });

    setFeedback('Evidencia enviada.', 'success');
    await loadQuotes();
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
};

cartSubmitButton?.addEventListener('click', () => {
  handleCartSubmit().catch((error) => setCartFeedback(error.message, 'error'));
});

cartClearButton?.addEventListener('click', () => {
  handleCartClear().catch((error) => setCartFeedback(error.message, 'error'));
});

cartListElement?.addEventListener('click', async (event) => {
  const removeButton = event.target.closest('[data-cart-item-remove]');
  const saveButton = event.target.closest('[data-cart-group-save]');

  try {
    if (removeButton) {
      await handleCartItemRemove(Number(removeButton.dataset.cartItemRemove));
      return;
    }

    if (saveButton) {
      await handleCartGroupSave(Number(saveButton.dataset.cartGroupSave));
    }
  } catch (error) {
    setCartFeedback(error.message, 'error');
  }
});

filterApplyButton?.addEventListener('click', () => {
  state.pagination.page = 1;
  renderQuotes();
});

filterClearButton?.addEventListener('click', () => {
  if (filterStatusInput) filterStatusInput.value = '';
  if (filterFromInput) filterFromInput.value = '';
  if (filterToInput) filterToInput.value = '';
  if (filterWholesalerInput) filterWholesalerInput.value = '';
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

  try {
    await handleQuoteAction(button);
  } catch (error) {
    setFeedback(error.message, 'error');
  }
});

fetchCurrentSession()
  .then(async (session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesión no válida para empresa');
    }

    const company = session.data.company || {};
    const roleId = Number(company.id_role_fk || company.id_role || 0);

    if (roleId !== ROLE_RETAILER) {
      throw new Error('Solo detallistas pueden usar este módulo');
    }

    if (company.verification_status !== 'APPROVED' || !company.can_buy) {
      throw new Error('Tu empresa no está habilitada para cotizaciones B2B como detallista');
    }

    state.session = session;
    await refreshData();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
