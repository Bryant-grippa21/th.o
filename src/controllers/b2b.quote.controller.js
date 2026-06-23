const {
  COMPANY_ROLE,
  createDraft,
  createQuotesFromRetailerCart,
  listRetailerDrafts,
  getRetailerDraftDetail,
  addDraftItem,
  submitDraftAndCreateQuote,
  listIncomingQuotesForWholesaler,
  listOutgoingQuotesForRetailer,
  getQuoteDetail,
  respondQuoteAsWholesaler,
  updateQuoteStatusByRetailer,
  dispatchQuoteByWholesaler,
  confirmDeliveryByRetailer,
  submitPaymentEvidenceByRetailer,
  reviewPaymentEvidenceByWholesaler
} = require('../services/b2b.quote.service');

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

  const roleId = Number(req.user.id_role);

  if (roleId !== COMPANY_ROLE.RETAILER) {
    res.status(403).json({ error: 'Acceso solo para detallista' });
    return false;
  }

  return true;
};

const requireWholesaler = (req, res) => {
  if (!requireCompany(req, res)) {
    return false;
  }

  const roleId = Number(req.user.id_role);

  if (roleId !== COMPANY_ROLE.WHOLESALER) {
    res.status(403).json({ error: 'Acceso solo para mayorista' });
    return false;
  }

  return true;
};

const getErrorStatus = (error) => {
  if (/requerid|invalido|inválido|no encontrado|no encontrada|no disponible|no permite|no puede|debe|acceso|overdue|vencid/i.test(error.message)) {
    return 400;
  }

  return 500;
};

const createRetailerDraft = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const draft = await createDraft({
      retailerId: req.user.id,
      wholesalerId: req.body?.id_wholesaler_fk,
      currencyCode: req.body?.currency_code,
      notes: req.body?.notes,
      expiresAt: req.body?.expires_at
    });

    return res.status(201).json({
      message: 'Borrador creado correctamente',
      draft
    });
  } catch (error) {
    console.error('ERROR CREATE RETAILER DRAFT:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const submitRetailerCart = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const quotes = await createQuotesFromRetailerCart({
      retailerId: req.user.id
    });

    return res.status(201).json({
      message: 'Carrito B2B enviado correctamente',
      quotes
    });
  } catch (error) {
    console.error('ERROR SUBMIT RETAILER CART:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const getRetailerDrafts = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const drafts = await listRetailerDrafts({
      retailerId: req.user.id,
      status: req.query?.status
    });

    return res.status(200).json({ drafts });
  } catch (error) {
    console.error('ERROR GET RETAILER DRAFTS:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const getRetailerDraft = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const draft = await getRetailerDraftDetail({
      draftId: req.params.draftId,
      retailerId: req.user.id
    });

    return res.status(200).json({ draft });
  } catch (error) {
    console.error('ERROR GET RETAILER DRAFT:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const addRetailerDraftItem = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const result = await addDraftItem({
      draftId: req.params.draftId,
      retailerId: req.user.id,
      productId: req.body?.id_product_fk,
      requestedQuantity: req.body?.requested_quantity,
      notes: req.body?.notes
    });

    return res.status(201).json({
      message: 'Item agregado al borrador',
      draft: result
    });
  } catch (error) {
    console.error('ERROR ADD RETAILER DRAFT ITEM:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const submitRetailerDraft = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const quote = await submitDraftAndCreateQuote({
      draftId: req.params.draftId,
      retailerId: req.user.id,
      note: req.body?.note
    });

    return res.status(201).json({
      message: 'Solicitud de cotizacion enviada correctamente',
      quote
    });
  } catch (error) {
    console.error('ERROR SUBMIT RETAILER DRAFT:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const getIncomingWholesalerQuotes = async (req, res) => {
  try {
    if (!requireWholesaler(req, res)) {
      return;
    }

    const quotes = await listIncomingQuotesForWholesaler({
      wholesalerId: req.user.id,
      status: req.query?.status
    });

    return res.status(200).json({ quotes });
  } catch (error) {
    console.error('ERROR GET INCOMING WHOLESALER QUOTES:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const getOutgoingRetailerQuotes = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const quotes = await listOutgoingQuotesForRetailer({
      retailerId: req.user.id,
      status: req.query?.status
    });

    return res.status(200).json({ quotes });
  } catch (error) {
    console.error('ERROR GET OUTGOING RETAILER QUOTES:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const getCompanyQuoteDetail = async (req, res) => {
  try {
    if (!requireCompany(req, res)) {
      return;
    }

    const quote = await getQuoteDetail({
      quoteId: req.params.quoteId,
      companyId: req.user.id
    });

    return res.status(200).json({ quote });
  } catch (error) {
    console.error('ERROR GET COMPANY QUOTE DETAIL:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const respondWholesalerQuote = async (req, res) => {
  try {
    if (!requireWholesaler(req, res)) {
      return;
    }

    const quote = await respondQuoteAsWholesaler({
      quoteId: req.params.quoteId,
      wholesalerId: req.user.id,
      items: req.body?.items,
      charges: req.body?.charges,
      wholesalerNote: req.body?.wholesaler_note,
      decision: req.body?.decision
    });

    return res.status(200).json({
      message: 'Cotizacion actualizada por mayorista',
      quote
    });
  } catch (error) {
    console.error('ERROR RESPOND WHOLESALER QUOTE:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const acceptRetailerQuote = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const quote = await updateQuoteStatusByRetailer({
      quoteId: req.params.quoteId,
      retailerId: req.user.id,
      nextStatus: 'ACCEPTED',
      note: req.body?.note
    });

    return res.status(200).json({ message: 'Cotizacion aceptada', quote });
  } catch (error) {
    console.error('ERROR ACCEPT RETAILER QUOTE:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const rejectRetailerQuote = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const quote = await updateQuoteStatusByRetailer({
      quoteId: req.params.quoteId,
      retailerId: req.user.id,
      nextStatus: 'REJECTED',
      note: req.body?.note
    });

    return res.status(200).json({ message: 'Cotizacion rechazada', quote });
  } catch (error) {
    console.error('ERROR REJECT RETAILER QUOTE:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const dispatchWholesalerQuote = async (req, res) => {
  try {
    if (!requireWholesaler(req, res)) {
      return;
    }

    const quote = await dispatchQuoteByWholesaler({
      quoteId: req.params.quoteId,
      wholesalerId: req.user.id,
      trackingCode: req.body?.tracking_code,
      carrierName: req.body?.carrier_name,
      dispatchNote: req.body?.dispatch_note
    });

    return res.status(200).json({ message: 'Despacho/entrega registrada', quote });
  } catch (error) {
    console.error('ERROR DISPATCH WHOLESALER QUOTE:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const confirmRetailerQuoteDelivery = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    const quote = await confirmDeliveryByRetailer({
      quoteId: req.params.quoteId,
      retailerId: req.user.id,
      note: req.body?.note
    });

    return res.status(200).json({ message: 'Recepcion confirmada', quote });
  } catch (error) {
    console.error('ERROR CONFIRM RETAILER QUOTE DELIVERY:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const submitRetailerPaymentEvidence = async (req, res) => {
  try {
    if (!requireRetailer(req, res)) {
      return;
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo de evidencia es requerido' });
    }

    const fileUrl = `/b2b-evidencias/${req.file.filename}`;
    const evidence = await submitPaymentEvidenceByRetailer({
      quoteId: req.params.quoteId,
      retailerId: req.user.id,
      fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      amountReportedUsd: req.body?.amount_reported_usd,
      note: req.body?.review_note
    });

    return res.status(201).json({
      message: 'Evidencia de pago registrada',
      evidence
    });
  } catch (error) {
    console.error('ERROR SUBMIT RETAILER PAYMENT EVIDENCE:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

const reviewWholesalerPaymentEvidence = async (req, res) => {
  try {
    if (!requireWholesaler(req, res)) {
      return;
    }

    const quote = await reviewPaymentEvidenceByWholesaler({
      quoteId: req.params.quoteId,
      evidenceId: req.params.evidenceId,
      wholesalerId: req.user.id,
      reviewStatus: req.body?.review_status,
      reviewNote: req.body?.review_note
    });

    return res.status(200).json({
      message: 'Evidencia revisada correctamente',
      quote
    });
  } catch (error) {
    console.error('ERROR REVIEW WHOLESALER PAYMENT EVIDENCE:', error);
    return res.status(getErrorStatus(error)).json({ error: error.message });
  }
};

module.exports = {
  createRetailerDraft,
  getRetailerDrafts,
  submitRetailerCart,
  getRetailerDraft,
  addRetailerDraftItem,
  submitRetailerDraft,
  getIncomingWholesalerQuotes,
  getOutgoingRetailerQuotes,
  getCompanyQuoteDetail,
  respondWholesalerQuote,
  acceptRetailerQuote,
  rejectRetailerQuote,
  dispatchWholesalerQuote,
  confirmRetailerQuoteDelivery,
  submitRetailerPaymentEvidence,
  reviewWholesalerPaymentEvidence
};
