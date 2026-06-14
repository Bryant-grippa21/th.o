const {
  createCheckoutFromCart,
  listCustomerCheckouts,
  listAdminCheckouts,
  listCompanyGroups,
  listCompanyPaymentMethods,
  createCompanyPaymentMethod,
  updateCompanyPaymentMethod,
  deleteCompanyPaymentMethod,
  submitPurchaseEvidence,
  approvePurchaseGroup,
  rejectPurchaseGroup,
  expirePurchaseGroup,
  updatePurchaseGroupDelivery
} = require('../services/purchase.service');
const { findCompanyById } = require('../services/auth.company.service');

const requireCustomer = (req, res) => {
  if (req.user?.entity && req.user.entity !== 'customer') {
    res.status(403).json({ error: 'Token no valido para customer' });
    return false;
  }

  if (!Number.isInteger(Number(req.user?.id)) || Number(req.user.id) <= 0) {
    res.status(401).json({ error: 'Token invalido' });
    return false;
  }

  return true;
};

const requireCompany = (req, res) => {
  if (req.user?.entity !== 'company') {
    res.status(403).json({ error: 'Token no valido para empresa' });
    return false;
  }

  if (!Number.isInteger(Number(req.user?.id)) || Number(req.user.id) <= 0) {
    res.status(401).json({ error: 'Token invalido' });
    return false;
  }

  return true;
};

const requireCompanySellAccess = async (req, res, actionLabel = 'usar este módulo') => {
  if (!requireCompany(req, res)) {
    return false;
  }

  if (Number(req.user.id_role) === 1) {
    return true;
  }

  const company = await findCompanyById(Number(req.user.id));

  if (!company) {
    res.status(404).json({ error: 'Empresa no encontrada' });
    return false;
  }

  if (company.verification_status !== 'APPROVED') {
    res.status(403).json({ error: `Tu empresa debe estar jurídicamente aprobada para ${actionLabel}` });
    return false;
  }

  if (!company.can_sell) {
    res.status(403).json({ error: `Tu empresa no tiene permiso comercial para ${actionLabel}` });
    return false;
  }

  return true;
};

const getErrorStatus = (error) => {
  if (/requerid|vacio|invalido|insuficiente|permite|puede|no encontrado|no hay|no disponible|inactivo|sin stock/i.test(error.message)) {
    return 400;
  }

  return 500;
};

const parseBooleanLike = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalizedValue = String(value || '').trim().toLowerCase();
  return ['1', 'true', 'si', 'sí', 'on', 'yes'].includes(normalizedValue);
};

const createCustomerCheckout = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const useCashback = parseBooleanLike(req.body?.use_cashback)
      || parseBooleanLike(req.headers['x-use-cashback'])
      || parseBooleanLike(req.query?.use_cashback);

    const checkout = await createCheckoutFromCart(req.user.id, {
      useCashback
    });

    return res.status(201).json({
      message: 'Checkout creado correctamente',
      checkout
    });
  } catch (error) {
    console.error('ERROR CREATE CUSTOMER CHECKOUT:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const getCustomerCheckouts = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const checkouts = await listCustomerCheckouts(req.user.id);

    return res.status(200).json({ checkouts });
  } catch (error) {
    console.error('ERROR GET CUSTOMER CHECKOUTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createCustomerPurchaseEvidence = async (req, res) => {
  try {
    if (!requireCustomer(req, res)) {
      return;
    }

    const purchase_group = await submitPurchaseEvidence({
      customerId: req.user.id,
      groupId: req.params.groupId,
      file: req.file,
      note: req.body?.note
    });

    return res.status(201).json({
      message: 'Evidencia registrada correctamente',
      purchase_group
    });
  } catch (error) {
    console.error('ERROR CREATE PURCHASE EVIDENCE:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const getCompanyPurchaseGroups = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'gestionar grupos de compra')) {
      return;
    }

    const purchase_groups = await listCompanyGroups({
      companyId: req.user.id,
      isAdmin: req.user.id_role === 1
    });

    return res.status(200).json({ purchase_groups });
  } catch (error) {
    console.error('ERROR GET COMPANY PURCHASE GROUPS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminCheckouts = async (req, res) => {
  try {
    if (!requireCompany(req, res)) {
      return;
    }

    if (Number(req.user.id_role) !== 1) {
      return res.status(403).json({ error: 'Acceso solo para admin' });
    }

    const checkouts = await listAdminCheckouts();

    return res.status(200).json({ checkouts });
  } catch (error) {
    console.error('ERROR GET ADMIN CHECKOUTS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getCompanyMethods = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'gestionar métodos de pago')) {
      return;
    }

    const payment_methods = await listCompanyPaymentMethods(req.user.id);
    return res.status(200).json({ payment_methods });
  } catch (error) {
    console.error('ERROR GET COMPANY PAYMENT METHODS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createCompanyMethod = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'crear métodos de pago')) {
      return;
    }

    const payment_method = await createCompanyPaymentMethod(req.user.id, req.body);
    return res.status(201).json({
      message: 'Metodo de pago creado correctamente',
      payment_method
    });
  } catch (error) {
    console.error('ERROR CREATE COMPANY PAYMENT METHOD:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const updateCompanyMethod = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'actualizar métodos de pago')) {
      return;
    }

    const paymentMethodId = Number(req.params.paymentMethodId);

    if (!Number.isInteger(paymentMethodId) || paymentMethodId <= 0) {
      return res.status(400).json({ error: 'paymentMethodId inválido' });
    }

    const payment_method = await updateCompanyPaymentMethod(req.user.id, paymentMethodId, req.body);
    return res.status(200).json({
      message: 'Método de pago actualizado correctamente',
      payment_method
    });
  } catch (error) {
    console.error('ERROR UPDATE COMPANY PAYMENT METHOD:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const deleteCompanyMethod = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'eliminar métodos de pago')) {
      return;
    }

    const paymentMethodId = Number(req.params.paymentMethodId);

    if (!Number.isInteger(paymentMethodId) || paymentMethodId <= 0) {
      return res.status(400).json({ error: 'paymentMethodId inválido' });
    }

    const result = await deleteCompanyPaymentMethod(req.user.id, paymentMethodId);
    return res.status(200).json({
      message: 'Método de pago eliminado correctamente',
      result
    });
  } catch (error) {
    console.error('ERROR DELETE COMPANY PAYMENT METHOD:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const approveCompanyPurchaseGroup = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'aprobar grupos de compra')) {
      return;
    }

    const purchase_group = await approvePurchaseGroup({
      companyId: req.user.id,
      groupId: req.params.groupId,
      reviewNote: req.body?.review_note,
      isAdmin: req.user.id_role === 1
    });

    return res.status(200).json({
      message: 'Grupo aprobado correctamente',
      purchase_group
    });
  } catch (error) {
    console.error('ERROR APPROVE PURCHASE GROUP:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const rejectCompanyPurchaseGroup = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'rechazar grupos de compra')) {
      return;
    }

    const purchase_group = await rejectPurchaseGroup({
      companyId: req.user.id,
      groupId: req.params.groupId,
      reviewNote: req.body?.review_note,
      isAdmin: req.user.id_role === 1
    });

    return res.status(200).json({
      message: 'Grupo rechazado correctamente',
      purchase_group
    });
  } catch (error) {
    console.error('ERROR REJECT PURCHASE GROUP:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const expireCompanyPurchaseGroup = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'expirar grupos de compra')) {
      return;
    }

    const purchase_group = await expirePurchaseGroup({
      companyId: req.user.id,
      groupId: req.params.groupId,
      isAdmin: req.user.id_role === 1
    });

    return res.status(200).json({
      message: 'Grupo expirado correctamente',
      purchase_group
    });
  } catch (error) {
    console.error('ERROR EXPIRE PURCHASE GROUP:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const updateCompanyPurchaseGroupDelivery = async (req, res) => {
  try {
    if (!await requireCompanySellAccess(req, res, 'actualizar entregas')) {
      return;
    }

    const purchase_group = await updatePurchaseGroupDelivery({
      companyId: req.user.id,
      groupId: req.params.groupId,
      deliveryStatus: req.body?.delivery_status,
      carrierName: req.body?.carrier_name,
      trackingCode: req.body?.tracking_code,
      estimatedDeliveryAt: req.body?.estimated_delivery_at,
      shippedAt: req.body?.shipped_at,
      deliveredAt: req.body?.delivered_at,
      note: req.body?.note,
      isAdmin: req.user.id_role === 1
    });

    return res.status(200).json({
      message: 'Seguimiento logístico actualizado correctamente',
      purchase_group
    });
  } catch (error) {
    console.error('ERROR UPDATE PURCHASE GROUP DELIVERY:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

module.exports = {
  createCustomerCheckout,
  getCustomerCheckouts,
  getAdminCheckouts,
  createCustomerPurchaseEvidence,
  getCompanyPurchaseGroups,
  getCompanyMethods,
  createCompanyMethod,
  updateCompanyMethod,
  deleteCompanyMethod,
  approveCompanyPurchaseGroup,
  rejectCompanyPurchaseGroup,
  expireCompanyPurchaseGroup,
  updateCompanyPurchaseGroupDelivery
};