const {
  getRetailerCart,
  setRetailerCartItem,
  removeRetailerCartItem,
  updateRetailerCartGroup,
  clearRetailerCart
} = require('../services/b2b.retailer.cart.service');

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

const requireRetailer = (req, res) => {
  if (!requireCompany(req, res)) {
    return false;
  }

  if (Number(req.user.id_role) !== 3) {
    res.status(403).json({ error: 'Acceso solo para detallista' });
    return false;
  }

  return true;
};

const getErrorStatus = (error) => {
  if (/requerid|invalido|inválido|no encontrado|no encontrada|no disponible|no permite|no puede|debe|acceso|bloquead/i.test(error.message)) {
    return 400;
  }

  return 500;
};

const getRetailerCartHandler = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const cart = await getRetailerCart(req.user.id);

    return res.status(200).json({ cart });
  } catch (error) {
    console.error('ERROR GET B2B RETAILER CART:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const setRetailerCartItemHandler = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const cart = await setRetailerCartItem(req.user.id, req.body?.id_product, req.body?.quantity);

    return res.status(200).json({
      message: 'Carrito B2B actualizado',
      cart
    });
  } catch (error) {
    console.error('ERROR SET B2B RETAILER CART ITEM:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const removeRetailerCartItemHandler = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const cart = await removeRetailerCartItem(req.user.id, req.params.productId);

    return res.status(200).json({
      message: 'Producto eliminado del carrito B2B',
      cart
    });
  } catch (error) {
    console.error('ERROR REMOVE B2B RETAILER CART ITEM:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const updateRetailerCartGroupHandler = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const cart = await updateRetailerCartGroup({
      retailerId: req.user.id,
      companyId: req.params.companyId,
      paymentMode: req.body?.payment_mode,
      note: req.body?.note
    });

    return res.status(200).json({
      message: 'Grupo B2B actualizado',
      cart
    });
  } catch (error) {
    console.error('ERROR UPDATE B2B RETAILER CART GROUP:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const clearRetailerCartHandler = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const cart = await clearRetailerCart(req.user.id);

    return res.status(200).json({
      message: 'Carrito B2B vaciado',
      cart
    });
  } catch (error) {
    console.error('ERROR CLEAR B2B RETAILER CART:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

module.exports = {
  getRetailerCartHandler,
  setRetailerCartItemHandler,
  removeRetailerCartItemHandler,
  updateRetailerCartGroupHandler,
  clearRetailerCartHandler
};