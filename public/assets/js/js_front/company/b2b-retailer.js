if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

const ROLE_RETAILER = 3;

const summaryElement = document.getElementById('b2b-retailer-summary');
const feedbackElement = document.getElementById('b2b-retailer-feedback');
const createDraftForm = document.getElementById('b2b-create-draft-form');
const draftsList = document.getElementById('b2b-retailer-drafts-list');
const quotesList = document.getElementById('b2b-retailer-quotes-list');
const params = new URLSearchParams(location.search);
const autoOpenDraftId = Number(params.get('draftId') || params.get('draft_id') || 0) || null;

const state = {
  session: null,
  drafts: [],
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

const formatDate = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const formatMoney = (value) => Number(value || 0).toFixed(2);

const setFeedback = (message, type = 'info') => {
  feedbackElement.textContent = message || '';
  feedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
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

const refreshSummary = () => {
  const company = state.session?.data?.company;
  summaryElement.innerHTML = `
    Empresa: <b>${company?.name || company?.email || 'Detalle'}</b> |
    Borradores: <b>${state.drafts.length}</b> |
    Cotizaciones enviadas: <b>${state.quotes.length}</b>
  `;
};

const renderDrafts = () => {
  if (!state.drafts.length) {
    draftsList.innerHTML = '<p>No tienes borradores.</p>';
    return;
  }

  draftsList.innerHTML = state.drafts.map((draft) => `
    <details style="border:1px solid #ccc; padding:12px; margin-bottom:12px;">
      <summary><b>Borrador #${draft.id_quote_draft}</b> | Mayorista ${draft.wholesaler_name || draft.id_wholesaler_fk} | ${draft.status}</summary>
      <p>Moneda: ${draft.currency_code}</p>
      <p>Items: ${Number(draft.items_count || 0)}</p>
      <p>Creado: ${formatDate(draft.created_at)}</p>
      <p>Nota: ${draft.notes || 'Sin nota'}</p>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
        <button type="button" data-draft-action="load" data-draft-id="${draft.id_quote_draft}">Ver detalle</button>
        ${draft.status === 'ACTIVE' ? `<button type="button" data-draft-action="submit" data-draft-id="${draft.id_quote_draft}">Enviar solicitud</button>` : ''}
      </div>
      ${draft.status === 'ACTIVE' ? `
      <form data-draft-item-form="${draft.id_quote_draft}">
        <label>ID producto <input name="id_product_fk" type="number" min="1" required></label>
        <label>Cantidad <input name="requested_quantity" type="number" min="1" required></label>
        <label>Nota <input name="notes" type="text"></label>
        <button type="submit">Agregar item</button>
      </form>
      ` : ''}
      <div id="draft-detail-${draft.id_quote_draft}"></div>
    </details>
  `).join('');
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

  container.innerHTML = `
    <details open>
      <summary>Detalle de cotizacion</summary>
      <p>Subtotal: USD ${formatMoney(detail.subtotal_usd)}</p>
      <p>Cargos: USD ${formatMoney(detail.additional_charges_usd)}</p>
      <p>Total: USD ${formatMoney(detail.total_usd)}</p>
      <p>Vence: ${formatDate(detail.payment_due_at)}</p>
      <p>Items:</p>
      <ul>${items.map((item) => `<li>${item.product_name_snapshot || item.id_product_fk} x ${item.quantity} | USD ${formatMoney(item.subtotal_usd)}</li>`).join('') || '<li>Sin items</li>'}</ul>
      <p>Evidencias:</p>
      <ul>${evidences.map((evidence) => `<li>${evidence.original_name || 'Archivo'} - ${evidence.review_status} - <a href="${evidence.file_url}" target="_blank" rel="noopener noreferrer">Ver</a></li>`).join('') || '<li>Sin evidencias</li>'}</ul>
    </details>
  `;
};

const quoteActionsHtml = (quote) => {
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

  if (quote.status === 'DELIVERED') {
    return `
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
        <button type="button" data-quote-action="confirm-delivery" data-quote-id="${quoteId}">Confirmar recepcion</button>
      </div>
      <input id="quote-note-${quoteId}" type="text" placeholder="Nota opcional" style="width:100%; max-width:480px; margin-top:8px;">
    `;
  }

  if (quote.status === 'PAYMENT_PENDING') {
    return `
      <div style="margin-top:8px;">
        <label>URL evidencia <input id="quote-file-url-${quoteId}" type="text" placeholder="https://..."></label>
        <label>Monto USD <input id="quote-amount-${quoteId}" type="number" step="0.01" min="0"></label>
        <label>Nombre archivo <input id="quote-file-name-${quoteId}" type="text"></label>
        <button type="button" data-quote-action="submit-evidence" data-quote-id="${quoteId}">Enviar evidencia</button>
      </div>
      <input id="quote-note-${quoteId}" type="text" placeholder="Nota opcional" style="width:100%; max-width:480px; margin-top:8px;">
    `;
  }

  return '';
};

const renderQuotes = () => {
  if (!state.quotes.length) {
    quotesList.innerHTML = '<p>No tienes cotizaciones enviadas.</p>';
    return;
  }

  quotesList.innerHTML = state.quotes.map((quote) => {
    const quoteId = Number(quote.id_b2b_quote);

    return `
      <details style="border:1px solid #ccc; padding:12px; margin-bottom:12px;">
        <summary><b>${quote.quote_code}</b> | ${quote.wholesaler_name || quote.id_wholesaler_fk} | ${quoteStatusLabel(quote.status)} | USD ${formatMoney(quote.total_usd)}</summary>
        <p>Estado: ${quoteStatusLabel(quote.status)}</p>
        <p>Actualizado: ${formatDate(quote.updated_at)}</p>
        <p>Nota: ${quote.retailer_note || 'Sin nota'}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
          <button type="button" data-quote-action="load" data-quote-id="${quoteId}">Ver detalle</button>
        </div>
        ${quoteActionsHtml(quote)}
        <div id="quote-detail-${quoteId}"></div>
      </details>
    `;
  }).join('');
};

const refreshData = async () => {
  const [draftsResponse, quotesResponse] = await Promise.all([
    requestJson(`${API_BASE_URL}/api/b2b-quotes/drafts/my`),
    requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/outgoing`)
  ]);

  state.drafts = Array.isArray(draftsResponse.drafts) ? draftsResponse.drafts : [];
  state.quotes = Array.isArray(quotesResponse.quotes) ? quotesResponse.quotes : [];

  refreshSummary();
  renderDrafts();
  renderQuotes();

  if (autoOpenDraftId) {
    await loadDraftDetail(autoOpenDraftId);
    setFeedback(`Borrador #${autoOpenDraftId} cargado.`, 'success');
  }
};

const loadDraftDetail = async (draftId) => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/drafts/${draftId}`);
  const detail = response.draft;
  const container = document.getElementById(`draft-detail-${draftId}`);

  if (!container) {
    return;
  }

  const items = Array.isArray(detail?.items) ? detail.items : [];

  container.innerHTML = `
    <details open>
      <summary>Items del borrador</summary>
      <ul>${items.map((item) => `<li>${item.product_name || item.id_product_fk} x ${item.requested_quantity} | USD ${formatMoney(item.line_subtotal_usd)}</li>`).join('') || '<li>Sin items</li>'}</ul>
    </details>
  `;
};

const loadQuoteDetail = async (quoteId) => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}`);
  state.quoteDetails.set(Number(quoteId), response.quote);
  renderQuoteDetailInto(quoteId, `quote-detail-${quoteId}`);
};

const handleDraftItemSubmit = async (form) => {
  const draftId = Number(form.dataset.draftItemForm);
  const payload = Object.fromEntries(new FormData(form).entries());

  setFeedback('Agregando item al borrador...');
  await requestJson(`${API_BASE_URL}/api/b2b-quotes/drafts/${draftId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  form.reset();
  setFeedback('Item agregado.', 'success');
  await refreshData();
  await loadDraftDetail(draftId);
};

const handleDraftAction = async (button) => {
  const action = button.dataset.draftAction;
  const draftId = Number(button.dataset.draftId);

  if (action === 'load') {
    setFeedback('Cargando detalle del borrador...');
    await loadDraftDetail(draftId);
    setFeedback('Detalle cargado.', 'success');
    return;
  }

  if (action === 'submit') {
    if (!confirm(`¿Enviar borrador #${draftId} como solicitud de cotizacion?`)) {
      return;
    }

    setFeedback('Enviando borrador...');
    await requestJson(`${API_BASE_URL}/api/b2b-quotes/drafts/${draftId}/submit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: null })
    });
    setFeedback('Solicitud enviada.', 'success');
    await refreshData();
  }
};

const handleQuoteAction = async (button) => {
  const action = button.dataset.quoteAction;
  const quoteId = Number(button.dataset.quoteId);
  const note = document.getElementById(`quote-note-${quoteId}`)?.value || '';

  if (action === 'load') {
    setFeedback('Cargando detalle de cotizacion...');
    await loadQuoteDetail(quoteId);
    setFeedback('Detalle cargado.', 'success');
    return;
  }

  if (action === 'accept' || action === 'reject') {
    const endpoint = action === 'accept' ? 'accept' : 'reject';
    const question = action === 'accept' ? '¿Aceptar cotizacion?' : '¿Rechazar cotizacion?';

    if (!confirm(question)) {
      return;
    }

    await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });

    setFeedback('Estado actualizado.', 'success');
    await refreshData();
    return;
  }

  if (action === 'confirm-delivery') {
    if (!confirm('¿Confirmar recepcion de la mercancia?')) {
      return;
    }

    await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/delivery/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });

    setFeedback('Recepcion confirmada.', 'success');
    await refreshData();
    return;
  }

  if (action === 'submit-evidence') {
    const fileUrl = document.getElementById(`quote-file-url-${quoteId}`)?.value || '';
    const amountValue = document.getElementById(`quote-amount-${quoteId}`)?.value || '';
    const originalName = document.getElementById(`quote-file-name-${quoteId}`)?.value || '';

    await requestJson(`${API_BASE_URL}/api/b2b-quotes/quotes/${quoteId}/payment-evidences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: fileUrl,
        amount_reported_usd: amountValue ? Number(amountValue) : null,
        original_name: originalName,
        review_note: note
      })
    });

    setFeedback('Evidencia enviada.', 'success');
    await refreshData();
    await loadQuoteDetail(quoteId);
  }
};

createDraftForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(createDraftForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    setFeedback('Creando borrador...');
    await requestJson(`${API_BASE_URL}/api/b2b-quotes/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    createDraftForm.reset();
    setFeedback('Borrador creado correctamente.', 'success');
    await refreshData();
  } catch (error) {
    setFeedback(error.message, 'error');
  }
});

draftsList.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-draft-item-form]');

  if (!form) {
    return;
  }

  event.preventDefault();

  try {
    await handleDraftItemSubmit(form);
  } catch (error) {
    setFeedback(error.message, 'error');
  }
});

draftsList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-draft-action]');

  if (!button) {
    return;
  }

  try {
    await handleDraftAction(button);
  } catch (error) {
    setFeedback(error.message, 'error');
  }
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
      throw new Error('Sesion no valida para empresa');
    }

    const company = session.data.company;
    const roleId = Number(company.id_role_fk || company.id_role);

    if (roleId !== ROLE_RETAILER) {
      throw new Error('Solo detallistas pueden usar este modulo');
    }

    if (company.verification_status !== 'APPROVED' || !company.can_buy) {
      throw new Error('Tu empresa no esta habilitada para cotizaciones B2B como detallista');
    }

    state.session = session;
    await refreshData();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
