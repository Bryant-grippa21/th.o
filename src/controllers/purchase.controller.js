const {
  createCheckoutFromCart,
  listCustomerCheckouts,
  listCompanyGroups,
  listCompanyPaymentMethods,
  createCompanyPaymentMethod,
  submitPurchaseEvidence,
  approvePurchaseGroup,
  rejectPurchaseGroup,
  expirePurchaseGroup
} = require('../services/purchase.service');

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
    if (!requireCompany(req, res)) {
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

const getCompanyMethods = async (req, res) => {
  try {
    if (!requireCompany(req, res)) {
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
    if (!requireCompany(req, res)) {
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

const approveCompanyPurchaseGroup = async (req, res) => {
  try {
    if (!requireCompany(req, res)) {
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
    if (!requireCompany(req, res)) {
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
    if (!requireCompany(req, res)) {
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

module.exports = {
  createCustomerCheckout,
  getCustomerCheckouts,
  createCustomerPurchaseEvidence,
  getCompanyPurchaseGroups,
  getCompanyMethods,
  createCompanyMethod,
  approveCompanyPurchaseGroup,
  rejectCompanyPurchaseGroup,
  expireCompanyPurchaseGroup
};