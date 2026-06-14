if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

const ROLE_WHOLESALER = 2;

const summaryElement = document.getElementById('b2b-wholesaler-summary');
const feedbackElement = document.getElementById('b2b-wholesaler-feedback');
const quotesList = document.getElementById('b2b-wholesaler-quotes-list');

const state = {
  session: null,
  quotes: [],
  quoteDetails: new Map()
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

const refreshSummary = () => {
  const company = state.session?.data?.company;
  summaryElement.innerHTML = `
    Empresa: <b>${company?.name || company?.email || 'Mayorista'}</b> |
    Cotizaciones entrantes: <b>${state.quotes.length}</b>
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

  const items = Array.isArray(detail.items) ? detail.items : [];
  const charges = Array.isArray(detail.charges) ? detail.charges : [];
  const evidences = Array.isArray(detail.evidences) ? detail.evidences : [];
  const chargesList = charges.map((charge) => {
    const chargeLabel = charge.label ? `(${charge.label})` : '';
    return `<li>${charge.charge_type}: USD ${formatMoney(charge.amount_usd)} ${chargeLabel}</li>`;
  }).join('') || '<li>Sin cargos</li>';

  container.innerHTML = `
    <details open>
      <summary>Detalle de cotización</summary>
      <p>Subtotal: USD ${formatMoney(detail.subtotal_usd)}</p>
      <p>Cargos: USD ${formatMoney(detail.additional_charges_usd)}</p>
      <p>Total: USD ${formatMoney(detail.total_usd)}</p>
      <p>Items:</p>
      <ul>${items.map((item) => `<li>ID producto ${item.id_product_fk} | ${item.product_name_snapshot || '-'} | x${item.quantity} | USD ${formatMoney(item.subtotal_usd)}</li>`).join('') || '<li>Sin items</li>'}</ul>
      <p>Cargos:</p>
      <ul>${chargesList}</ul>
      <p>Evidencias:</p>
      <ul>${evidences.map((evidence) => `<li>#${evidence.id_b2b_quote_payment_evidence} - ${evidence.original_name || 'Archivo'} - ${evidence.review_status} - <a href="${evidence.file_url}" target="_blank" rel="noopener noreferrer">Ver</a></li>`).join('') || '<li>Sin evidencias</li>'}</ul>
    </details>
  `;
};

const quoteActionsHtml = (quote) => {
  const quoteId = Number(quote.id_b2b_quote);

  if (quote.status === 'REQUESTED' || quote.status === 'QUOTED') {
    return `
      <details class="company-quote-action-block">
        <summary>Responder cotización</summary>
        <p>Items JSON ejemplo: [{"id_product_fk":10,"quantity":2,"unit_price_usd":12.5}]</p>
        <textarea id="quote-items-json-${quoteId}" rows="4" class="company-quote-textarea"></textarea>
        <p>Cargos JSON ejemplo: [{"charge_type":"SHIPPING","label":"Envio","amount_usd":3}]</p>
        <textarea id="quote-charges-json-${quoteId}" rows="3" class="company-quote-textarea"></textarea>
        <input id="quote-note-${quoteId}" type="text" placeholder="Nota del mayorista" class="company-quote-input company-quote-input--spaced">
        <div class="company-quote-actions-row company-quote-actions-row--spaced">
          <button type="button" data-quote-action="respond" data-quote-id="${quoteId}">Enviar cotización</button>
        </div>
      </details>
    `;
  }

  if (quote.status === 'ACCEPTED') {
    return `
      <div class="company-quote-action-block company-quote-action-block--compact">
        <input id="quote-tracking-${quoteId}" type="text" placeholder="Tracking code" class="company-quote-input">
        <input id="quote-carrier-${quoteId}" type="text" placeholder="Carrier" class="company-quote-input">
        <input id="quote-note-${quoteId}" type="text" placeholder="Nota despacho" class="company-quote-input company-quote-input--spaced">
        <button type="button" data-quote-action="dispatch" data-quote-id="${quoteId}">Registrar despacho/entrega</button>
      </div>
    `;
  }

  if (quote.status === 'PAYMENT_SUBMITTED') {
    return `
      <div class="company-quote-action-block company-quote-action-block--compact">
        <input id="quote-evidence-id-${quoteId}" type="number" min="1" placeholder="ID evidencia" class="company-quote-input">
        <input id="quote-note-${quoteId}" type="text" placeholder="Nota de revisión" class="company-quote-input company-quote-input--spaced">
        <div class="company-quote-actions-row company-quote-actions-row--spaced">
          <button type="button" data-quote-action="review-approve" data-quote-id="${quoteId}">Aprobar evidencia</button>
          <button type="button" data-quote-action="review-reject" data-quote-id="${quoteId}">Rechazar evidencia</button>
        </div>
      </div>
    `;
  }

  return '';
};

const renderQuotes = () => {
  if (!state.quotes.length) {
    quotesList.innerHTML = '<p>No hay cotizaciones entrantes.</p>';
    return;
  }

  quotesList.innerHTML = state.quotes.map((quote) => {
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
};

const refreshData = async () => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/incoming`);
  state.quotes = Array.isArray(response.quotes) ? response.quotes : [];
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
      const itemsJson = document.getElementById(`quote-items-json-${quoteId}`)?.value || '';
      const chargesJson = document.getElementById(`quote-charges-json-${quoteId}`)?.value || '';
      const note = document.getElementById(`quote-note-${quoteId}`)?.value || '';

      await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parseJsonField(itemsJson, []),
          charges: parseJsonField(chargesJson, []),
          wholesaler_note: note
        })
      });

      setFeedback('Cotización respondida.', 'success');
      await refreshData();
      await loadQuoteDetail(quoteId);
      return;
    }

    if (action === 'dispatch') {
      const tracking = document.getElementById(`quote-tracking-${quoteId}`)?.value || '';
      const carrier = document.getElementById(`quote-carrier-${quoteId}`)?.value || '';
      const note = document.getElementById(`quote-note-${quoteId}`)?.value || '';

      await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/delivery/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_code: tracking,
          carrier_name: carrier,
          dispatch_note: note
        })
      });

      setFeedback('Despacho/entrega registrada.', 'success');
      await refreshData();
      await loadQuoteDetail(quoteId);
      return;
    }

    if (action === 'review-approve' || action === 'review-reject') {
      const evidenceId = Number(document.getElementById(`quote-evidence-id-${quoteId}`)?.value || 0);
      const note = document.getElementById(`quote-note-${quoteId}`)?.value || '';

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
