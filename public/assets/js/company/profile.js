const safeCompanyValue = (value) => value || null;

const companyProfileFeedback = document.getElementById('company-profile-feedback');
const companyImagePreview = document.getElementById('company-image-preview');
const companyImageInput = document.getElementById('company-image');
const companyVerificationStatus = document.getElementById('company-verification-status');
const companyVerificationNote = document.getElementById('company-verification-note');
const companyVerificationForm = document.getElementById('company-verification-form');
const companyVerificationDocumentType = document.getElementById('company-verification-document-type');
const companyVerificationDocumentsInput = document.getElementById('company-verification-documents');
const companyVerificationFeedback = document.getElementById('company-verification-feedback');
const companyVerificationDocumentsList = document.getElementById('company-verification-documents-list');
const companyVerificationHistoryList = document.getElementById('company-verification-history-list');
let companyVerificationHistoryPage = 1;
const COMPANY_VERIFICATION_HISTORY_PAGE_SIZE = 5;

const COMPANY_VERIFICATION_LABELS = {
  PENDING_REVIEW: 'Pendiente de revisión',
  CHANGES_REQUESTED: 'Correcciones solicitadas',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
};

const COMPANY_DOCUMENT_LABELS = {
  COMMERCIAL_REGISTER: 'Registro mercantil',
  LAST_SHAREHOLDERS_MEETING_MINUTES: 'Última acta de asamblea',
  COMPANY_RIF: 'RIF de la empresa',
  LEGAL_REPRESENTATIVE_ID: 'Cédula del representante legal',
  LEGAL_REPRESENTATIVE_RIF: 'RIF del representante legal',
  ECONOMIC_ACTIVITY_LICENSE: 'Licencia de actividad económica'
};

const setCompanyFeedback = (message, isError = false) => {
  if (!companyProfileFeedback) {
    return;
  }

  companyProfileFeedback.textContent = message || '';
  companyProfileFeedback.style.color = isError ? '#b00020' : '';
};

const setCompanyVerificationFeedback = (message, isError = false) => {
  if (!companyVerificationFeedback) {
    return;
  }

  companyVerificationFeedback.textContent = message || '';
  companyVerificationFeedback.style.color = isError ? '#b00020' : '';
};

const getCompanyVerificationLabel = (status) => COMPANY_VERIFICATION_LABELS[status] || status || 'Sin estado';

const getCompanyDocumentLabel = (documentType) => COMPANY_DOCUMENT_LABELS[documentType] || documentType || 'Documento';

const formatCompanyDateTime = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-VE');
};

const populateVerificationDocumentTypes = (documentTypes = []) => {
  if (!companyVerificationDocumentType) {
    return;
  }

  companyVerificationDocumentType.innerHTML = ['<option value="">Selecciona un recaudo</option>']
    .concat(documentTypes.map((documentType) => `
      <option value="${documentType}">${getCompanyDocumentLabel(documentType)}</option>
    `))
    .join('');
};

const renderVerificationDocuments = (documents = []) => {
  if (!companyVerificationDocumentsList) {
    return;
  }

  if (!documents.length) {
    companyVerificationDocumentsList.innerHTML = '<p>No has cargado recaudos todavía.</p>';
    return;
  }

  const documentsByType = documents.reduce((accumulator, document) => {
    const typeKey = String(document.document_type || 'DOCUMENT');

    if (!accumulator.has(typeKey)) {
      accumulator.set(typeKey, new Map());
    }

    const roundsMap = accumulator.get(typeKey);
    const roundKey = Number(document.submission_round || 0);

    if (!roundsMap.has(roundKey)) {
      roundsMap.set(roundKey, []);
    }

    roundsMap.get(roundKey).push(document);
    return accumulator;
  }, new Map());

  companyVerificationDocumentsList.innerHTML = Array.from(documentsByType.entries()).map(([documentType, roundsMap]) => {
    const rounds = Array.from(roundsMap.entries()).sort((left, right) => Number(right[0]) - Number(left[0]));

    return `
      <details style="border:1px solid #ccc; padding:12px; margin-bottom:12px;" open>
        <summary><b>${getCompanyDocumentLabel(documentType)}</b> (${rounds.reduce((total, [, files]) => total + files.length, 0)} archivos)</summary>
        <div style="margin-top:12px;">
          ${rounds.map(([round, files], index) => `
            <details style="border:1px solid #ddd; padding:12px; margin-bottom:12px;" ${index === 0 ? 'open' : ''}>
              <summary><b>Ronda ${round}</b> (${files.length} archivo${files.length === 1 ? '' : 's'})</summary>
              <div style="margin-top:12px;">
                ${files.map((document) => `
                  <article style="border:1px solid #eee; padding:12px; margin-bottom:12px;">
                    <p>Archivo: <a href="${document.file_url}" target="_blank" rel="noopener noreferrer">${document.original_name || 'Ver archivo'}</a></p>
                    <p>Formato: ${document.mime_type || 'No disponible'}</p>
                    <p>Subido: ${formatCompanyDateTime(document.uploaded_at)}</p>
                    <p>Nota admin: ${document.admin_note || 'Sin observaciones en este archivo.'}</p>
                  </article>
                `).join('')}
              </div>
            </details>
          `).join('')}
        </div>
      </details>
    `;
  }).join('');
};

const renderVerificationHistory = (history = []) => {
  if (!companyVerificationHistoryList) {
    return;
  }

  if (!history.length) {
    companyVerificationHistoryList.innerHTML = '<p>No hay eventos de revisión todavía.</p>';
    return;
  }

  const sortedHistory = [...history]
    .sort((left, right) => new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime());
  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / COMPANY_VERIFICATION_HISTORY_PAGE_SIZE));
  companyVerificationHistoryPage = Math.min(Math.max(companyVerificationHistoryPage, 1), totalPages);

  const startIndex = (companyVerificationHistoryPage - 1) * COMPANY_VERIFICATION_HISTORY_PAGE_SIZE;
  const visibleEntries = sortedHistory.slice(startIndex, startIndex + COMPANY_VERIFICATION_HISTORY_PAGE_SIZE);

  companyVerificationHistoryList.innerHTML = `
    <p>Mostrando <b>${visibleEntries.length}</b> registros. Página <b>${companyVerificationHistoryPage}</b> de <b>${totalPages}</b>.</p>
    ${visibleEntries.map((entry) => `
      <article style="border:1px solid #ccc; padding:12px; margin-bottom:12px;">
        <p><b>${getCompanyVerificationLabel(entry.status)}</b></p>
        <p>Fecha: ${formatCompanyDateTime(entry.created_at)}</p>
        <p>Nota: ${entry.note || 'Sin observaciones.'}</p>
      </article>
    `).join('')}
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
      <button type="button" onclick="changeCompanyVerificationHistoryPage(-1)" ${companyVerificationHistoryPage <= 1 ? 'disabled' : ''}>Anterior</button>
      <button type="button" onclick="changeCompanyVerificationHistoryPage(1)" ${companyVerificationHistoryPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
    </div>
  `;
};

const changeCompanyVerificationHistoryPage = (direction) => {
  companyVerificationHistoryPage += Number(direction) || 0;
  loadCompanyVerificationSummary().catch((error) => {
    setCompanyVerificationFeedback(error.message, true);
  });
};

const renderVerificationSummary = (company) => {
  if (companyVerificationStatus) {
    companyVerificationStatus.textContent = getCompanyVerificationLabel(company?.verification_status);
  }

  if (companyVerificationNote) {
    companyVerificationNote.textContent = company?.verification_note || 'Sin observaciones.';
  }
};

const loadCompanyVerificationSummary = async () => {
  const data = await requestCompanyJson(`${API_BASE_URL}/api/company-auth/verification`);

  renderVerificationSummary(data.company);
  populateVerificationDocumentTypes(data.allowed_document_types || []);
  renderVerificationDocuments(data.documents || []);
  renderVerificationHistory(data.history || []);

  return data;
};

const renderCompanyImage = (company) => {
  if (!companyImagePreview) {
    return;
  }

  if (!company?.img_profile) {
    const fallbackLetter = String(company?.name || company?.email || 'E').trim().charAt(0).toUpperCase() || 'E';

    companyImagePreview.innerHTML = `
      <div style="width:120px; height:120px; border-radius:50%; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:700; background:#f5f5f5;">
        ${fallbackLetter}
      </div>
    `;
    return;
  }

  companyImagePreview.innerHTML = `
    <img src="/uploads/profiles/companies/${company.img_profile}" alt="Imagen de empresa" style="width:120px; height:120px; object-fit:cover; border:1px solid #ccc;">
  `;
};

const requestCompanyJson = async (url, options = {}) => {
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
    throw new Error(data?.error || 'No se pudo completar la solicitud');
  }

  if (!data) {
    throw new Error('La respuesta del servidor no llegó en formato JSON');
  }

  return data;
};

if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

globalThis.onload = async () => {
  try {
    const data = await requestCompanyJson(getProfileEndpointByEntity('company'));

    const company = data.company;

    document.title = company.name || company.company_name || company.email || 'Empresa';
    document.getElementById('company_name').innerText = company.name || 'No disponible';
    document.getElementById('rif').innerText = company.rif || 'No disponible';
    document.getElementById('email').innerText = company.email || 'No disponible';
    document.getElementById('phone').value = company.cell_phone || '';
    document.getElementById('address').value = company.mail_address || '';
    renderCompanyImage(company);
    globalThis.refreshCompanyLayout?.(company);
    renderVerificationSummary(company);
    await loadCompanyVerificationSummary();
  } catch (error) {
    alert(error.message);
    clearSession();
    redirectToLogin();
  }
};

async function updateCompanyProfile() {
  try {
    const data = await requestCompanyJson(getProfileEndpointByEntity('company'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: safeCompanyValue(document.getElementById('phone').value),
        address: safeCompanyValue(document.getElementById('address').value),
        password: safeCompanyValue(document.getElementById('password').value)
      })
    });

    renderCompanyImage(data.company);
    globalThis.refreshCompanyLayout?.(data.company);
    document.getElementById('password').value = '';
    setCompanyFeedback(data.message || 'Perfil de empresa actualizado correctamente');
  } catch (error) {
    setCompanyFeedback(error.message, true);
  }
}

async function uploadCompanyProfileImage() {
  try {
    const imageFile = companyImageInput?.files?.[0];

    if (!imageFile) {
      throw new Error('Selecciona una imagen antes de continuar');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const data = await requestCompanyJson(`${API_BASE_URL}/api/company-auth/profile/image`, {
      method: 'PUT',
      body: formData
    });

    renderCompanyImage(data.company);
    globalThis.refreshCompanyLayout?.(data.company);
    companyImageInput.value = '';
    setCompanyFeedback(data.message || 'Imagen de empresa actualizada correctamente');
  } catch (error) {
    setCompanyFeedback(error.message, true);
  }
}

async function handleCompanyVerificationSubmit(event) {
  event.preventDefault();

  try {
    const documentType = companyVerificationDocumentType?.value;
    const files = Array.from(companyVerificationDocumentsInput?.files || []);

    if (!documentType) {
      throw new Error('Selecciona un tipo de recaudo');
    }

    if (!files.length) {
      throw new Error('Selecciona al menos un archivo');
    }

    setCompanyVerificationFeedback('Enviando recaudos...');

    const formData = new FormData();
    formData.set('document_type', documentType);
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const data = await requestCompanyJson(`${API_BASE_URL}/api/company-auth/verification/documents`, {
      method: 'POST',
      body: formData
    });

    companyVerificationForm.reset();
    setCompanyVerificationFeedback(data.message || 'Recaudos enviados correctamente');
    renderVerificationSummary(data.company);
    await loadCompanyVerificationSummary();
  } catch (error) {
    setCompanyVerificationFeedback(error.message, true);
  }
}

if (companyVerificationForm) {
  companyVerificationForm.addEventListener('submit', handleCompanyVerificationSubmit);
}

globalThis.updateCompanyProfile = updateCompanyProfile;
globalThis.uploadCompanyProfileImage = uploadCompanyProfileImage;
globalThis.changeCompanyVerificationHistoryPage = changeCompanyVerificationHistoryPage;
