const fs = require('node:fs/promises');
const path = require('node:path');

const { findUserById } = require('./auth.customer.service');
const { findCompanyById, listCompaniesForAdmin } = require('./auth.company.service');
const { getCart } = require('./customer.collections.service');
const { getLatestExchangeRate } = require('./exchange.service');
const { listCustomerCheckouts, listCompanyGroups } = require('./purchase.service');
const { listPendingRecoveryRequests } = require('./account.recovery.service');

const storageRootDir = path.resolve(__dirname, '../storage/notifications');
const customerNotificationsDir = path.join(storageRootDir, 'customers');
const companyNotificationsDir = path.join(storageRootDir, 'companies');
const adminNotificationsDir = path.join(storageRootDir, 'admins');

const ensureStorageDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const resolveNotificationOwner = (user) => {
  if (user?.entity === 'company') {
    if (Number(user.id_role) === 1) {
      return {
        ownerEntity: 'admin',
        ownerId: Number(user.id),
        dirPath: adminNotificationsDir
      };
    }

    return {
      ownerEntity: 'company',
      ownerId: Number(user.id),
      dirPath: companyNotificationsDir
    };
  }

  return {
    ownerEntity: 'customer',
    ownerId: Number(user.id),
    dirPath: customerNotificationsDir
  };
};

const getNotificationStateFilePath = ({ ownerId, dirPath }) => {
  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    throw new Error('ownerId inválido');
  }

  return path.join(dirPath, `${ownerId}.json`);
};

const createDefaultNotificationState = (ownerEntity, ownerId) => ({
  owner_entity: ownerEntity,
  owner_id: ownerId,
  items: [],
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

const normalizeNotificationState = (ownerEntity, ownerId, payload) => {
  const items = Array.isArray(payload?.items)
    ? payload.items
        .map((item) => ({
          event_key: String(item?.event_key || '').trim(),
          read_at: item?.read_at || null,
          created_at: item?.created_at || new Date().toISOString(),
          updated_at: item?.updated_at || item?.read_at || new Date().toISOString()
        }))
        .filter((item, index, values) => item.event_key && values.findIndex((candidate) => candidate.event_key === item.event_key) === index)
    : [];

  return {
    owner_entity: ownerEntity,
    owner_id: ownerId,
    items,
    updated_at: payload?.updated_at || new Date().toISOString()
  };
};

const getNotificationState = async (owner) => {
  await ensureStorageDir(owner.dirPath);
  const filePath = getNotificationStateFilePath(owner);

  return normalizeNotificationState(
    owner.ownerEntity,
    owner.ownerId,
    await readJsonFile(filePath, createDefaultNotificationState(owner.ownerEntity, owner.ownerId))
  );
};

const saveNotificationState = async (owner, state) => {
  await ensureStorageDir(owner.dirPath);
  const filePath = getNotificationStateFilePath(owner);
  const normalizedState = normalizeNotificationState(owner.ownerEntity, owner.ownerId, {
    ...state,
    updated_at: new Date().toISOString()
  });
  await writeJsonFile(filePath, normalizedState);
  return normalizedState;
};

const sortNotificationsByDateDesc = (items) => [...items].sort((left, right) => {
  const leftTime = new Date(left.created_at || 0).getTime();
  const rightTime = new Date(right.created_at || 0).getTime();
  return rightTime - leftTime;
});

const createNotification = ({ eventKey, title, message, type = 'info', createdAt, actionPath, entity }) => ({
  id: eventKey,
  event_key: eventKey,
  title,
  message,
  type,
  created_at: createdAt || new Date().toISOString(),
  action_path: actionPath || null,
  entity
});

const getGroupReferenceDate = (group) => {
  const history = Array.isArray(group?.status_history) ? group.status_history : [];
  const latestHistory = history[history.length - 1];
  return latestHistory?.created_at || group?.reviewed_at || group?.updated_at || group?.created_at || group?.checkout?.updated_at || group?.checkout?.created_at || new Date().toISOString();
};

const buildCustomerProfileNotification = (customerId, customer) => {
  if (String(customer.cell_phone || '').trim() && String(customer.mail_address || '').trim()) {
    return null;
  }

  return createNotification({
    eventKey: `customer:${customerId}:profile:missing-contact`,
    title: 'Perfil incompleto',
    message: 'Tu teléfono o dirección siguen incompletos. Actualiza tu perfil para evitar retrasos en futuras compras.',
    type: 'warning',
    createdAt: customer.updated_at || customer.created_at,
    actionPath: '/modules/customer/profile.html',
    entity: 'customer'
  });
};

const buildCustomerExchangeRateNotification = (customerId, cart, latestExchangeRate) => {
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];

  if (!cartItems.length || !latestExchangeRate?.id_exchange_rate) {
    return null;
  }

  const exchangeCreatedAt = new Date(latestExchangeRate.created_at || 0).getTime();
  const cartUpdatedAt = new Date(cart.updated_at || 0).getTime();

  if (exchangeCreatedAt <= cartUpdatedAt) {
    return null;
  }

  return createNotification({
    eventKey: `customer:${customerId}:exchange-rate:${latestExchangeRate.id_exchange_rate}`,
    title: 'Tasa actualizada',
    message: 'Se ha actualizado la tasa actual. Verifica el precio de los productos de tu carrito.',
    type: 'warning',
    createdAt: latestExchangeRate.created_at,
    actionPath: '/modules/customer/cart.html',
    entity: 'customer'
  });
};

const createCustomerGroupNotification = ({ customerId, checkout, group }) => {
  const companyName = group.company?.name || 'Una empresa';
  const orderCode = checkout.order_code || `THO-${checkout.id_checkout}`;
  const createdAt = getGroupReferenceDate(group);

  if (group.delivery?.status === 'SHIPPED') {
    return createNotification({
      eventKey: `customer:${customerId}:group:${group.id_purchase_group}:delivery:shipped`,
      title: 'Compra enviada',
      message: `${companyName} ha enviado tu compra ${orderCode}. Verifica los detalles y el seguimiento.`,
      type: 'info',
      createdAt,
      actionPath: '/modules/customer/purchases.html',
      entity: 'customer'
    });
  }

  if (group.delivery?.status === 'DELIVERED') {
    return createNotification({
      eventKey: `customer:${customerId}:group:${group.id_purchase_group}:delivery:delivered`,
      title: 'Compra entregada',
      message: `${companyName} marcó tu compra ${orderCode} como entregada. Revisa los detalles.`,
      type: 'success',
      createdAt,
      actionPath: '/modules/customer/purchases.html',
      entity: 'customer'
    });
  }

  if (group.status === 'PAYMENT_SUBMITTED' || group.status === 'PARTIAL_SUBMITTED') {
    return createNotification({
      eventKey: `customer:${customerId}:group:${group.id_purchase_group}:status:${group.status}`,
      title: 'Compra enviada',
      message: `La compra ${orderCode} fue enviada y está esperando aprobación de ${companyName}.`,
      type: 'info',
      createdAt,
      actionPath: '/modules/customer/purchases.html',
      entity: 'customer'
    });
  }

  if (group.status === 'APPROVED') {
    return createNotification({
      eventKey: `customer:${customerId}:group:${group.id_purchase_group}:status:APPROVED`,
      title: 'Compra aprobada',
      message: `${companyName} aprobó tu compra ${orderCode}. Verifica los detalles.`,
      type: 'success',
      createdAt,
      actionPath: '/modules/customer/purchases.html',
      entity: 'customer'
    });
  }

  if (group.status === 'PARTIAL_APPROVED') {
    return createNotification({
      eventKey: `customer:${customerId}:group:${group.id_purchase_group}:status:PARTIAL_APPROVED`,
      title: 'Pago parcialmente aprobado',
      message: `${companyName} aprobó parcialmente tu compra ${orderCode}. Revisa el saldo o los detalles pendientes.`,
      type: 'warning',
      createdAt,
      actionPath: '/modules/customer/purchases.html',
      entity: 'customer'
    });
  }

  if (group.status === 'REJECTED') {
    return createNotification({
      eventKey: `customer:${customerId}:group:${group.id_purchase_group}:status:REJECTED`,
      title: 'Compra rechazada',
      message: `${companyName} rechazó tu compra ${orderCode}. Verifica los detalles.`,
      type: 'error',
      createdAt,
      actionPath: '/modules/customer/purchases.html',
      entity: 'customer'
    });
  }

  if (group.status === 'EXPIRED') {
    return createNotification({
      eventKey: `customer:${customerId}:group:${group.id_purchase_group}:status:EXPIRED`,
      title: 'Compra expirada',
      message: `La compra ${orderCode} expiró. Verifica los detalles para volver a intentar.`,
      type: 'warning',
      createdAt,
      actionPath: '/modules/customer/purchases.html',
      entity: 'customer'
    });
  }

  return null;
};

const buildCustomerPurchaseNotifications = (customerId, checkouts) => {
  const notifications = [];

  for (const checkout of checkouts) {
    const groups = Array.isArray(checkout.groups) ? checkout.groups : [];

    for (const group of groups) {
      const notification = createCustomerGroupNotification({ customerId, checkout, group });

      if (notification) {
        notifications.push(notification);
      }
    }
  }

  return notifications;
};

const buildCustomerNotifications = async (customerId) => {
  const customer = await findUserById(customerId);

  if (!customer) {
    throw new Error('Cliente no encontrado');
  }

  const [cart, latestExchangeRate, checkouts] = await Promise.all([
    getCart(customerId),
    getLatestExchangeRate(),
    listCustomerCheckouts(customerId)
  ]);

  const notifications = [];
  const profileNotification = buildCustomerProfileNotification(customerId, customer);
  const exchangeNotification = buildCustomerExchangeRateNotification(customerId, cart, latestExchangeRate);

  if (profileNotification) {
    notifications.push(profileNotification);
  }

  if (exchangeNotification) {
    notifications.push(exchangeNotification);
  }

  notifications.push(...buildCustomerPurchaseNotifications(customerId, checkouts));

  return sortNotificationsByDateDesc(notifications);
};

const buildCompanyNotifications = async (companyId) => {
  const company = await findCompanyById(companyId);

  if (!company) {
    throw new Error('Empresa no encontrada');
  }

  const notifications = [];

  if (company.verification_status === 'PENDING_REVIEW') {
    notifications.push(createNotification({
      eventKey: `company:${companyId}:verification:PENDING_REVIEW`,
      title: 'Solicitud jurídica pendiente',
      message: 'Tu expediente jurídico está pendiente de revisión. Puedes seguir cargando recaudos si necesitas actualizar algo.',
      type: 'warning',
      createdAt: company.updated_at || company.created_at,
      actionPath: '/modules/company/profile.html',
      entity: 'company'
    }));
  }

  if (company.verification_status === 'CHANGES_REQUESTED') {
    notifications.push(createNotification({
      eventKey: `company:${companyId}:verification:CHANGES_REQUESTED`,
      title: 'Correcciones solicitadas',
      message: company.verification_note || 'Tienes observaciones en tu expediente jurídico. Revisa y vuelve a cargar los recaudos.',
      type: 'warning',
      createdAt: company.updated_at || company.created_at,
      actionPath: '/modules/company/profile.html',
      entity: 'company'
    }));
  }

  if (company.verification_status === 'REJECTED') {
    notifications.push(createNotification({
      eventKey: `company:${companyId}:verification:REJECTED`,
      title: 'Solicitud jurídica rechazada',
      message: company.verification_note || 'Tu expediente jurídico fue rechazado. Revisa los recaudos y vuelve a intentarlo desde tu perfil.',
      type: 'error',
      createdAt: company.updated_at || company.created_at,
      actionPath: '/modules/company/profile.html',
      entity: 'company'
    }));
  }

  if (company.verification_status === 'APPROVED') {
    notifications.push(createNotification({
      eventKey: `company:${companyId}:verification:APPROVED`,
      title: 'Expediente jurídico aprobado',
      message: 'Tu expediente jurídico fue aprobado. Revisa tus permisos operativos y continúa con tu gestión comercial.',
      type: 'success',
      createdAt: company.verified_at || company.updated_at || company.created_at,
      actionPath: '/modules/company/profile.html',
      entity: 'company'
    }));
  }

  const groups = await listCompanyGroups({ companyId, isAdmin: false });

  for (const group of groups) {
    const orderCode = `THO-${String(group.id_checkout).padStart(6, '0')}`;
    const customerName = group.customer?.name || 'Un cliente';
    const createdAt = getGroupReferenceDate(group);

    if (group.status === 'PAYMENT_SUBMITTED' || group.status === 'PARTIAL_SUBMITTED') {
      notifications.push(createNotification({
        eventKey: `company:${companyId}:group:${group.id_purchase_group}:status:${group.status}`,
        title: 'Solicitud de compra recibida',
        message: `${customerName} envió evidencias para la compra ${orderCode}. Revisa y decide el siguiente paso.`,
        type: 'info',
        createdAt,
        actionPath: '/modules/company/purchases.html',
        entity: 'company'
      }));
      continue;
    }

    if (group.status === 'APPROVED' && group.delivery?.status === 'ORDER_CONFIRMED') {
      notifications.push(createNotification({
        eventKey: `company:${companyId}:group:${group.id_purchase_group}:delivery:ORDER_CONFIRMED`,
        title: 'Compra lista para preparar',
        message: `La compra ${orderCode} está aprobada y lista para preparación o despacho.`,
        type: 'success',
        createdAt,
        actionPath: '/modules/company/purchases.html',
        entity: 'company'
      }));
      continue;
    }

    if (group.delivery?.status === 'INCIDENT') {
      notifications.push(createNotification({
        eventKey: `company:${companyId}:group:${group.id_purchase_group}:delivery:INCIDENT`,
        title: 'Incidencia en compra',
        message: `La compra ${orderCode} presenta una incidencia logística. Revisa el detalle.`,
        type: 'warning',
        createdAt,
        actionPath: '/modules/company/purchases.html',
        entity: 'company'
      }));
    }
  }

  return sortNotificationsByDateDesc(notifications);
};

const buildAdminNotifications = async (adminCompanyId) => {
  const admin = await findCompanyById(adminCompanyId);

  if (!admin || Number(admin.id_role_fk) !== 1) {
    throw new Error('Admin no encontrado');
  }

  const companies = await listCompaniesForAdmin();
  const recoveryRequests = await listPendingRecoveryRequests();
  const notifications = companies
    .filter((company) => Number(company.id_role_fk) !== 1 && company.verification_status === 'PENDING_REVIEW')
    .map((company) => createNotification({
      eventKey: `admin:${adminCompanyId}:company-verification:${company.id_company}:PENDING_REVIEW`,
      title: 'Nuevo jurídico por revisar',
      message: `${company.name || 'Empresa'} tiene una nueva solicitud jurídica pendiente de revisión.`,
      type: 'warning',
      createdAt: company.updated_at || company.created_at,
      actionPath: '/modules/admin/dashboard.html',
      entity: 'admin'
    }));

  for (const recoveryRequest of recoveryRequests) {
    notifications.push(createNotification({
      eventKey: `admin:${adminCompanyId}:account-recovery:${recoveryRequest.customer.id_customer}:PENDING`,
      title: 'Recuperación de cuenta solicitada',
      message: `${recoveryRequest.customer.name || 'Un usuario'} está solicitando recuperación de cuenta. Verifica email, teléfono y decide el siguiente paso.`,
      type: 'warning',
      createdAt: recoveryRequest.request.requested_at,
      actionPath: '/modules/admin/dashboard.html',
      entity: 'admin'
    }));
  }

  return sortNotificationsByDateDesc(notifications);
};

const buildDerivedNotifications = async (user) => {
  const owner = resolveNotificationOwner(user);

  if (owner.ownerEntity === 'customer') {
    return buildCustomerNotifications(owner.ownerId);
  }

  if (owner.ownerEntity === 'company') {
    return buildCompanyNotifications(owner.ownerId);
  }

  return buildAdminNotifications(owner.ownerId);
};

const mergeNotificationsWithState = (notifications, state) => {
  const stateByEventKey = new Map((state.items || []).map((item) => [item.event_key, item]));

  return sortNotificationsByDateDesc(notifications).map((notification) => {
    const storedItem = stateByEventKey.get(notification.event_key);
    return {
      ...notification,
      read_at: storedItem?.read_at || null,
      is_read: Boolean(storedItem?.read_at)
    };
  });
};

const listNotificationsForUser = async (user) => {
  const owner = resolveNotificationOwner(user);
  const [state, notifications] = await Promise.all([
    getNotificationState(owner),
    buildDerivedNotifications(user)
  ]);

  const mergedItems = mergeNotificationsWithState(notifications, state);

  return {
    owner_entity: owner.ownerEntity,
    owner_id: owner.ownerId,
    unread_count: mergedItems.filter((item) => !item.is_read).length,
    items: mergedItems
  };
};

const markNotificationAsRead = async (user, eventKey) => {
  const owner = resolveNotificationOwner(user);
  const notifications = await buildDerivedNotifications(user);
  const notificationExists = notifications.some((item) => item.event_key === eventKey);

  if (!notificationExists) {
    throw new Error('Notificación no encontrada');
  }

  const state = await getNotificationState(owner);
  const currentItemIndex = state.items.findIndex((item) => item.event_key === eventKey);
  const now = new Date().toISOString();

  if (currentItemIndex >= 0) {
    state.items[currentItemIndex] = {
      ...state.items[currentItemIndex],
      read_at: state.items[currentItemIndex].read_at || now,
      updated_at: now
    };
  } else {
    state.items.push({
      event_key: eventKey,
      read_at: now,
      created_at: now,
      updated_at: now
    });
  }

  await saveNotificationState(owner, state);
  return listNotificationsForUser(user);
};

const markAllNotificationsAsRead = async (user) => {
  const owner = resolveNotificationOwner(user);
  const notifications = await buildDerivedNotifications(user);
  const now = new Date().toISOString();
  const nextState = {
    owner_entity: owner.ownerEntity,
    owner_id: owner.ownerId,
    items: notifications.map((notification) => ({
      event_key: notification.event_key,
      read_at: now,
      created_at: notification.created_at || now,
      updated_at: now
    }))
  };

  await saveNotificationState(owner, nextState);
  return listNotificationsForUser(user);
};

module.exports = {
  listNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
};