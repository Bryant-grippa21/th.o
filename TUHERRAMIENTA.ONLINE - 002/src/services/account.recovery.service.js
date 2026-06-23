const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const { findUserByEmail, findUserById } = require('./auth.customer.service');

const storageRootDir = path.resolve(__dirname, '../storage/customers/account-recovery');

const ensureStorageDir = async () => {
  await fs.mkdir(storageRootDir, { recursive: true });
};

const getRecoveryFilePath = (customerId) => {
  const normalizedCustomerId = Number(customerId);

  if (!Number.isInteger(normalizedCustomerId) || normalizedCustomerId <= 0) {
    throw new Error('customerId inválido');
  }

  return path.join(storageRootDir, `${normalizedCustomerId}.json`);
};

const createDefaultRecoveryState = (customerId) => ({
  id_customer: Number(customerId),
  requests: [],
  updated_at: new Date().toISOString()
});

const readJsonFile = async (filePath, fallbackValue) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallbackValue;
    }

    throw error;
  }
};

const writeJsonFile = async (filePath, value) => {
  const tempFilePath = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tempFilePath, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(tempFilePath, filePath);
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const normalizeRequest = (request) => ({
  id_recovery_request: String(request?.id_recovery_request || randomUUID()),
  email: String(request?.email || '').trim(),
  phone: String(request?.phone || '').trim(),
  normalized_phone: normalizePhone(request?.normalized_phone || request?.phone),
  status: ['PENDING', 'RESOLVED', 'REJECTED'].includes(String(request?.status || '').trim().toUpperCase())
    ? String(request.status).trim().toUpperCase()
    : 'PENDING',
  requested_at: request?.requested_at || new Date().toISOString(),
  reviewed_at: request?.reviewed_at || null,
  reviewed_by_company_id: Number.isInteger(Number(request?.reviewed_by_company_id)) ? Number(request.reviewed_by_company_id) : null,
  review_note: String(request?.review_note || '').trim() || null
});

const normalizeRecoveryState = (customerId, payload) => ({
  id_customer: Number(customerId),
  requests: Array.isArray(payload?.requests)
    ? payload.requests.map(normalizeRequest).sort((left, right) => new Date(right.requested_at).getTime() - new Date(left.requested_at).getTime())
    : [],
  updated_at: payload?.updated_at || new Date().toISOString()
});

const getRecoveryState = async (customerId) => {
  await ensureStorageDir();
  const filePath = getRecoveryFilePath(customerId);
  const payload = await readJsonFile(filePath, createDefaultRecoveryState(customerId));
  return normalizeRecoveryState(customerId, payload);
};

const saveRecoveryState = async (customerId, state) => {
  await ensureStorageDir();
  const filePath = getRecoveryFilePath(customerId);
  const normalizedState = normalizeRecoveryState(customerId, {
    ...state,
    updated_at: new Date().toISOString()
  });
  await writeJsonFile(filePath, normalizedState);
  return normalizedState;
};

const getLatestRecoveryRequest = async (customerId) => {
  const state = await getRecoveryState(customerId);
  return state.requests[0] || null;
};

const submitRecoveryRequest = async ({ email, phone }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedEmail || !normalizedPhone) {
    throw new Error('Debes indicar email y número telefónico');
  }

  const customer = await findUserByEmail(normalizedEmail);

  if (!customer) {
    throw new Error('No se encontró un usuario con esos datos');
  }

  if (customer.is_active) {
    throw new Error('La recuperación solo está disponible para clientes bloqueados');
  }

  const customerPhone = normalizePhone(customer.cell_phone);

  if (!customerPhone || customerPhone !== normalizedPhone) {
    throw new Error('Los datos no coinciden con el usuario registrado');
  }

  const state = await getRecoveryState(customer.id_customer);
  const existingPendingRequest = state.requests.find((request) => request.status === 'PENDING');
  const now = new Date().toISOString();

  if (existingPendingRequest) {
    existingPendingRequest.requested_at = now;
    existingPendingRequest.email = customer.email;
    existingPendingRequest.phone = customer.cell_phone || phone;
    existingPendingRequest.normalized_phone = normalizedPhone;
    await saveRecoveryState(customer.id_customer, state);

    return {
      customer,
      request: normalizeRequest(existingPendingRequest)
    };
  }

  const request = normalizeRequest({
    id_recovery_request: randomUUID(),
    email: customer.email,
    phone: customer.cell_phone || phone,
    normalized_phone: normalizedPhone,
    status: 'PENDING',
    requested_at: now,
    review_note: null
  });

  state.requests.unshift(request);
  await saveRecoveryState(customer.id_customer, state);

  return {
    customer,
    request
  };
};

const reviewRecoveryRequest = async ({ customerId, status, reviewNote, reviewedByCompanyId }) => {
  const normalizedStatus = String(status || '').trim().toUpperCase();

  if (!['RESOLVED', 'REJECTED'].includes(normalizedStatus)) {
    throw new Error('status inválido');
  }

  const customer = await findUserById(customerId);

  if (!customer) {
    throw new Error('Cliente no encontrado');
  }

  const state = await getRecoveryState(customerId);
  const pendingRequest = state.requests.find((request) => request.status === 'PENDING');

  if (!pendingRequest) {
    throw new Error('No hay una solicitud de recuperación pendiente');
  }

  pendingRequest.status = normalizedStatus;
  pendingRequest.review_note = String(reviewNote || '').trim() || null;
  pendingRequest.reviewed_at = new Date().toISOString();
  pendingRequest.reviewed_by_company_id = Number(reviewedByCompanyId);

  await saveRecoveryState(customerId, state);

  return {
    customer,
    request: normalizeRequest(pendingRequest)
  };
};

const listPendingRecoveryRequests = async () => {
  await ensureStorageDir();
  const entries = await fs.readdir(storageRootDir, { withFileTypes: true });
  const pendingRequests = [];

  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.json') {
      continue;
    }

    const customerId = Number(path.basename(entry.name, '.json'));

    if (!Number.isInteger(customerId) || customerId <= 0) {
      continue;
    }

    const state = await getRecoveryState(customerId);
    const pendingRequest = state.requests.find((request) => request.status === 'PENDING');

    if (!pendingRequest) {
      continue;
    }

    const customer = await findUserById(customerId);

    if (!customer) {
      continue;
    }

    pendingRequests.push({
      customer: {
        id_customer: customer.id_customer,
        name: customer.name,
        email: customer.email,
        cell_phone: customer.cell_phone,
        mail_address: customer.mail_address
      },
      request: normalizeRequest(pendingRequest)
    });
  }

  return pendingRequests.sort((left, right) => new Date(right.request.requested_at).getTime() - new Date(left.request.requested_at).getTime());
};

module.exports = {
  getLatestRecoveryRequest,
  submitRecoveryRequest,
  reviewRecoveryRequest,
  listPendingRecoveryRequests
};