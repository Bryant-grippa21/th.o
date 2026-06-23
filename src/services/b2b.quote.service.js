const path = require('node:path');
const pool = require('../config/db');
const {
  getRetailerCart,
  clearRetailerCart,
  PAYMENT_MODE: CART_PAYMENT_MODE
} = require('./b2b.retailer.cart.service');

const COMPANY_ROLE = {
  ADMIN: 1,
  WHOLESALER: 2,
  RETAILER: 3
};

const QUOTE_STATUSES = new Set([
  'REQUESTED',
  'QUOTED',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
  'DELIVERED',
  'PAYMENT_PENDING',
  'PAYMENT_SUBMITTED',
  'PAID',
  'OVERDUE'
]);

const PAYMENT_MODES = new Set(['ONE_TIME', 'INSTALLMENTS']);

const normalizeText = (value, maxLength = 255) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
};

const normalizeMoney = (value, fieldName) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${fieldName} invalido`);
  }

  return Math.round(amount * 100) / 100;
};

const normalizePositiveInt = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} invalido`);
  }

  return parsed;
};

const normalizeQuoteStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  if (!QUOTE_STATUSES.has(normalized)) {
    throw new Error('status invalido');
  }

  return normalized;
};

const normalizePaymentMode = (value) => {
  const normalized = String(value || '').trim().toUpperCase();

  if (!normalized) {
    return CART_PAYMENT_MODE.ONE_TIME;
  }

  if (!PAYMENT_MODES.has(normalized)) {
    throw new Error('payment_mode invalido');
  }

  return normalized;
};

const buildQuoteCode = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `BQ-${yyyy}${mm}${dd}-${random}`;
};

const mapQuoteRow = (row) => ({
  ...row,
  subtotal_usd: Number(row.subtotal_usd || 0),
  additional_charges_usd: Number(row.additional_charges_usd || 0),
  total_usd: Number(row.total_usd || 0),
  retailer_payload_json: (() => {
    if (!row?.retailer_payload_json) {
      return null;
    }

    if (typeof row.retailer_payload_json !== 'string') {
      return row.retailer_payload_json;
    }

    try {
      return JSON.parse(row.retailer_payload_json);
    } catch {
      return row.retailer_payload_json;
    }
  })()
});

const ensureCompanyExists = async (connection, companyId) => {
  const [rows] = await connection.query(
    `SELECT id_company, id_role_fk, verification_status, can_buy, can_sell
     FROM Company
     WHERE id_company = ?
     LIMIT 1`,
    [Number(companyId)]
  );

  if (!rows.length) {
    throw new Error('Empresa no encontrada');
  }

  return rows[0];
};

const ensureNoOverdueQuotesForRetailer = async (connection, retailerId) => {
  const [rows] = await connection.query(
    `SELECT 1
     FROM B2B_Quote
     WHERE id_retailer_fk = ?
       AND status = 'OVERDUE'
     LIMIT 1`,
    [Number(retailerId)]
  );

  if (rows.length) {
    throw new Error('Tienes cotizaciones vencidas (OVERDUE). No puedes crear nuevas solicitudes');
  }
};

const getDraftById = async (connection, draftId) => {
  const [rows] = await connection.query(
    `SELECT *
     FROM Quote_Draft
     WHERE id_quote_draft = ?
     LIMIT 1`,
    [Number(draftId)]
  );

  return rows[0] || null;
};

const listDraftItems = async (connection, draftId) => {
  const [rows] = await connection.query(
    `SELECT qdi.id_quote_draft_item,
            qdi.id_quote_draft_fk,
            qdi.id_product_fk,
            qdi.requested_quantity,
            qdi.unit_price_snapshot_usd,
            qdi.line_subtotal_usd,
            qdi.notes,
            qdi.created_at,
            p.name AS product_name,
            p.sku
     FROM Quote_Draft_Item qdi
     LEFT JOIN Product p ON p.id_product = qdi.id_product_fk
     WHERE qdi.id_quote_draft_fk = ?
     ORDER BY qdi.id_quote_draft_item ASC`,
    [Number(draftId)]
  );

  return rows.map((row) => ({
    ...row,
    requested_quantity: Number(row.requested_quantity || 0),
    unit_price_snapshot_usd: Number(row.unit_price_snapshot_usd || 0),
    line_subtotal_usd: Number(row.line_subtotal_usd || 0)
  }));
};

const listQuoteItems = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT id_b2b_quote_item,
            id_b2b_quote_fk,
            id_product_fk,
            product_name_snapshot,
            sku_snapshot,
            unit_price_usd,
            quantity,
            subtotal_usd,
            created_at
     FROM B2B_Quote_Item
     WHERE id_b2b_quote_fk = ?
     ORDER BY id_b2b_quote_item ASC`,
    [Number(quoteId)]
  );

  return rows.map((row) => ({
    ...row,
    unit_price_usd: Number(row.unit_price_usd || 0),
    quantity: Number(row.quantity || 0),
    subtotal_usd: Number(row.subtotal_usd || 0)
  }));
};

const listQuoteCharges = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT id_b2b_quote_charge,
            id_b2b_quote_fk,
            charge_type,
            label,
            amount_usd,
            is_optional,
            created_at
     FROM B2B_Quote_Charge
     WHERE id_b2b_quote_fk = ?
     ORDER BY id_b2b_quote_charge ASC`,
    [Number(quoteId)]
  );

  return rows.map((row) => ({
    ...row,
    amount_usd: Number(row.amount_usd || 0),
    is_optional: Boolean(row.is_optional)
  }));
};

const listQuoteEvidences = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT id_b2b_quote_payment_evidence,
            id_b2b_quote_fk,
            file_url,
            original_name,
            mime_type,
            amount_reported_usd,
            submitted_by_company_id,
            review_status,
            review_note,
            reviewed_by_company_id,
            submitted_at,
            reviewed_at
     FROM B2B_Quote_Payment_Evidence
     WHERE id_b2b_quote_fk = ?
     ORDER BY submitted_at DESC, id_b2b_quote_payment_evidence DESC`,
    [Number(quoteId)]
  );

  return rows.map((row) => ({
    ...row,
    amount_reported_usd: Number(row.amount_reported_usd || 0)
  }));
};

const listQuoteHistory = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT id_b2b_quote_status_history,
            id_b2b_quote_fk,
            from_status,
            to_status,
            note,
            performed_by_company_id,
            created_at
     FROM B2B_Quote_Status_History
     WHERE id_b2b_quote_fk = ?
     ORDER BY created_at ASC, id_b2b_quote_status_history ASC`,
    [Number(quoteId)]
  );

  return rows;
};

const getQuoteDelivery = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT id_b2b_quote_delivery,
            id_b2b_quote_fk,
            delivery_status,
            tracking_code,
            carrier_name,
            dispatch_note,
            dispatched_at,
            delivered_at,
            confirmed_by_retailer_at,
            created_at,
            updated_at
     FROM B2B_Quote_Delivery
     WHERE id_b2b_quote_fk = ?
     LIMIT 1`,
    [Number(quoteId)]
  );

  return rows[0] || null;
};

const roundAmount = (value) => Math.round(Number(value) * 100) / 100;

const getSubmittedEvidenceTotal = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT COALESCE(SUM(amount_reported_usd), 0) AS total_reported
     FROM B2B_Quote_Payment_Evidence
     WHERE id_b2b_quote_fk = ?
       AND review_status != 'REJECTED'`,
    [Number(quoteId)]
  );

  return Number(rows[0]?.total_reported || 0);
};

const getApprovedEvidenceTotal = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT COALESCE(SUM(amount_reported_usd), 0) AS total_approved
     FROM B2B_Quote_Payment_Evidence
     WHERE id_b2b_quote_fk = ?
       AND review_status = 'APPROVED'`,
    [Number(quoteId)]
  );

  return Number(rows[0]?.total_approved || 0);
};

const listCompanyPaymentMethods = async (connection, companyId) => {
  const [rows] = await connection.query(
    `SELECT id_payment_method,
            method_type,
            label,
            account_holder,
            account_number,
            bank_name,
            instructions,
            is_active,
            created_at,
            updated_at
     FROM Company_Payment_Method
     WHERE id_company_fk = ?
       AND is_active = TRUE
     ORDER BY label ASC, id_payment_method DESC`,
    [Number(companyId)]
  );

  return rows.map((row) => ({
    ...row,
    is_active: Boolean(row.is_active)
  }));
};

const appendQuoteHistory = async (connection, { quoteId, fromStatus, toStatus, note, performedBy }) => {
  await connection.query(
    `INSERT INTO B2B_Quote_Status_History (
       id_b2b_quote_fk,
       from_status,
       to_status,
       note,
       performed_by_company_id
     )
     VALUES (?, ?, ?, ?, ?)`,
    [
      Number(quoteId),
      normalizeText(fromStatus, 30),
      normalizeText(toStatus, 30),
      normalizeText(note, 1000),
      Number(performedBy)
    ]
  );
};

const getQuoteById = async (connection, quoteId) => {
  const [rows] = await connection.query(
    `SELECT *
     FROM B2B_Quote
     WHERE id_b2b_quote = ?
     LIMIT 1`,
    [Number(quoteId)]
  );

  return rows[0] || null;
};

const assertQuoteCompanyAccess = (quote, companyId) => {
  if (Number(quote.id_retailer_fk) !== Number(companyId)
    && Number(quote.id_wholesaler_fk) !== Number(companyId)) {
    throw new Error('No tienes acceso a esta cotizacion');
  }
};

const createDraft = async ({ retailerId, wholesalerId, currencyCode, notes, expiresAt }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');
    const safeWholesalerId = normalizePositiveInt(wholesalerId, 'wholesalerId');

    if (safeRetailerId === safeWholesalerId) {
      throw new Error('No puedes cotizar con tu propia empresa');
    }

    const retailer = await ensureCompanyExists(connection, safeRetailerId);
    const wholesaler = await ensureCompanyExists(connection, safeWholesalerId);

    if (Number(retailer.id_role_fk) !== COMPANY_ROLE.RETAILER) {
      throw new Error('Solo una empresa detallista puede crear borradores');
    }

    if (Number(wholesaler.id_role_fk) !== COMPANY_ROLE.WHOLESALER) {
      throw new Error('La empresa destino debe ser mayorista');
    }

    if (!retailer.can_buy) {
      throw new Error('Tu empresa no tiene permiso comercial para cotizar');
    }

    if (retailer.verification_status !== 'APPROVED') {
      throw new Error('Tu empresa debe estar jurídicamente aprobada para cotizar');
    }

    await ensureNoOverdueQuotesForRetailer(connection, safeRetailerId);

    const safeCurrency = normalizeText(currencyCode, 10) || 'USD';
    const safeNotes = normalizeText(notes, 1000);
    const safeExpiresAt = expiresAt ? new Date(expiresAt) : null;

    if (safeExpiresAt && Number.isNaN(safeExpiresAt.getTime())) {
      throw new Error('expires_at invalida');
    }

    const [result] = await connection.query(
      `INSERT INTO Quote_Draft (
         id_retailer_fk,
         id_wholesaler_fk,
         status,
         currency_code,
         notes,
         expires_at
       )
       VALUES (?, ?, 'ACTIVE', ?, ?, ?)`,
      [safeRetailerId, safeWholesalerId, safeCurrency, safeNotes, safeExpiresAt]
    );

    const draft = await getDraftById(connection, result.insertId);

    await connection.commit();
    return draft;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const createQuotesFromRetailerCart = async ({ retailerId }) => {
  const normalizedRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const cart = await getRetailerCart(normalizedRetailerId);

  if (String(cart.status) === 'LOCKED') {
    throw new Error('El carrito B2B ya fue enviado');
  }

  const groups = Array.isArray(cart.groups) ? cart.groups.filter((group) => Array.isArray(group.items) && group.items.length > 0) : [];

  if (!groups.length) {
    throw new Error('El carrito B2B no tiene grupos para cotizar');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const createdQuotes = [];

    for (const group of groups) {
      const safeCompanyId = normalizePositiveInt(group.company_id, 'company_id');
      const company = await ensureCompanyExists(connection, safeCompanyId);

      if (Number(company.id_role_fk) !== COMPANY_ROLE.WHOLESALER) {
        throw new Error('Cada grupo del carrito debe pertenecer a un mayorista');
      }

      if (!company.can_sell) {
        throw new Error('La empresa del grupo no tiene permiso de venta');
      }

      const groupItems = Array.isArray(group.items) ? group.items : [];
      let subtotal = 0;

      const [quoteResult] = await connection.query(
        `INSERT INTO B2B_Quote (
           quote_code,
           id_retailer_fk,
           id_wholesaler_fk,
           source_draft_id,
           status,
           requested_at,
           currency_code,
           retailer_note,
           created_by_company_id,
           updated_by_company_id,
           payment_mode,
           retailer_payload_json
         )
         VALUES (?, ?, ?, NULL, 'REQUESTED', CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)`,
        [
          buildQuoteCode(),
          normalizedRetailerId,
          safeCompanyId,
          'USD',
          normalizeText(group.note, 1000),
          normalizedRetailerId,
          normalizedRetailerId,
          normalizePaymentMode(group.payment_mode),
          JSON.stringify({
            company_id: safeCompanyId,
            company_name: normalizeText(group.company_name, 255),
            company_email: normalizeText(group.company_email, 255),
            company_phone: normalizeText(group.company_phone, 30),
            company_image_url: normalizeText(group.company_image_url, 255),
            payment_mode: normalizePaymentMode(group.payment_mode),
            note: normalizeText(group.note, 1000),
            items: groupItems.map((item) => ({
              id_product: Number(item.id_product),
              quantity: Number(item.quantity),
              product_name: normalizeText(item.product_name, 255),
              sku: normalizeText(item.sku, 64),
              unit_price_usd: Number(item.unit_price_usd || 0),
              company_id: safeCompanyId,
              company_name: normalizeText(group.company_name, 255),
              company_email: normalizeText(group.company_email, 255),
              company_phone: normalizeText(group.company_phone, 30),
              company_image_url: normalizeText(group.company_image_url, 255),
              main_image_url: normalizeText(item.main_image_url, 255),
              created_at: item.created_at,
              updated_at: item.updated_at
            }))
          })
        ]
      );

      const quoteId = Number(quoteResult.insertId);

      for (const item of groupItems) {
        const quantity = normalizePositiveInt(item.quantity, 'quantity');
        const unitPrice = normalizeMoney(item.unit_price_usd, 'unit_price_usd');
        const itemSubtotal = normalizeMoney(quantity * unitPrice, 'subtotal_usd');

        subtotal += itemSubtotal;

        await connection.query(
          `INSERT INTO B2B_Quote_Item (
             id_b2b_quote_fk,
             id_product_fk,
             product_name_snapshot,
             sku_snapshot,
             unit_price_usd,
             quantity,
             subtotal_usd
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            quoteId,
            normalizePositiveInt(item.id_product, 'id_product'),
            normalizeText(item.product_name, 255),
            normalizeText(item.sku, 64),
            unitPrice,
            quantity,
            itemSubtotal
          ]
        );
      }

      subtotal = normalizeMoney(subtotal, 'subtotal_usd');

      await connection.query(
        `UPDATE B2B_Quote
         SET subtotal_usd = ?,
             additional_charges_usd = 0,
             total_usd = ?,
             updated_by_company_id = ?
         WHERE id_b2b_quote = ?`,
        [subtotal, subtotal, normalizedRetailerId, quoteId]
      );

      await appendQuoteHistory(connection, {
        quoteId,
        fromStatus: null,
        toStatus: 'REQUESTED',
        note: normalizeText(group.note, 1000) || 'Solicitud enviada desde carrito B2B',
        performedBy: normalizedRetailerId
      });

      const quote = await getQuoteById(connection, quoteId);
      createdQuotes.push(mapQuoteRow(quote));
    }

    await connection.commit();

    await clearRetailerCart(normalizedRetailerId);

    return createdQuotes;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listRetailerDrafts = async ({ retailerId, status }) => {
  const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const safeStatus = String(status || '').trim().toUpperCase();

  const params = [safeRetailerId];
  let statusSql = '';

  if (safeStatus) {
    if (!new Set(['ACTIVE', 'SUBMITTED', 'ABANDONED']).has(safeStatus)) {
      throw new Error('status invalido');
    }

    statusSql = ' AND d.status = ?';
    params.push(safeStatus);
  }

  const [rows] = await pool.query(
    `SELECT d.*,
            c.name AS wholesaler_name,
            (SELECT COUNT(1) FROM Quote_Draft_Item i WHERE i.id_quote_draft_fk = d.id_quote_draft) AS items_count
     FROM Quote_Draft d
     INNER JOIN Company c ON c.id_company = d.id_wholesaler_fk
     WHERE d.id_retailer_fk = ?
     ${statusSql}
     ORDER BY d.created_at DESC, d.id_quote_draft DESC`,
    params
  );

  return rows.map((row) => ({ ...row, items_count: Number(row.items_count || 0) }));
};

const getRetailerDraftDetail = async ({ draftId, retailerId }) => {
  const connection = await pool.getConnection();

  try {
    const safeDraftId = normalizePositiveInt(draftId, 'draftId');
    const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');

    const draft = await getDraftById(connection, safeDraftId);

    if (!draft || Number(draft.id_retailer_fk) !== safeRetailerId) {
      throw new Error('Borrador no encontrado');
    }

    const items = await listDraftItems(connection, safeDraftId);

    return { ...draft, items };
  } finally {
    connection.release();
  }
};

const addDraftItem = async ({ draftId, retailerId, productId, requestedQuantity, notes }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeDraftId = normalizePositiveInt(draftId, 'draftId');
    const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');
    const safeProductId = normalizePositiveInt(productId, 'product_id');
    const safeRequestedQuantity = normalizePositiveInt(requestedQuantity, 'requested_quantity');

    const draft = await getDraftById(connection, safeDraftId);

    if (!draft || Number(draft.id_retailer_fk) !== safeRetailerId) {
      throw new Error('Borrador no encontrado');
    }

    if (draft.status !== 'ACTIVE') {
      throw new Error('Solo puedes agregar items a borradores ACTIVE');
    }

    const [productRows] = await connection.query(
      `SELECT id_product, id_company_fk, name, sku, price, is_active
       FROM Product
       WHERE id_product = ?
       LIMIT 1`,
      [safeProductId]
    );

    const product = productRows[0];

    if (!product?.is_active) {
      throw new Error('Producto no disponible para cotizar');
    }

    if (Number(product.id_company_fk) !== Number(draft.id_wholesaler_fk)) {
      throw new Error('El producto no pertenece al mayorista del borrador');
    }

    const unitPrice = normalizeMoney(product.price, 'price');
    const lineSubtotal = normalizeMoney(unitPrice * safeRequestedQuantity, 'line_subtotal');

    await connection.query(
      `INSERT INTO Quote_Draft_Item (
         id_quote_draft_fk,
         id_product_fk,
         requested_quantity,
         unit_price_snapshot_usd,
         line_subtotal_usd,
         notes
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        safeDraftId,
        safeProductId,
        safeRequestedQuantity,
        unitPrice,
        lineSubtotal,
        normalizeText(notes, 1000)
      ]
    );

    const items = await listDraftItems(connection, safeDraftId);

    await connection.commit();

    return {
      draft_id: safeDraftId,
      items
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const submitDraftAndCreateQuote = async ({ draftId, retailerId, note }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeDraftId = normalizePositiveInt(draftId, 'draftId');
    const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');

    const draft = await getDraftById(connection, safeDraftId);

    if (!draft || Number(draft.id_retailer_fk) !== safeRetailerId) {
      throw new Error('Borrador no encontrado');
    }

    if (draft.status !== 'ACTIVE') {
      throw new Error('Solo puedes enviar borradores ACTIVE');
    }

    const draftItems = await listDraftItems(connection, safeDraftId);

    if (!draftItems.length) {
      throw new Error('El borrador no tiene items');
    }

    const [quoteResult] = await connection.query(
      `INSERT INTO B2B_Quote (
         quote_code,
         id_retailer_fk,
         id_wholesaler_fk,
         source_draft_id,
         status,
         requested_at,
         currency_code,
         retailer_note,
         created_by_company_id,
         updated_by_company_id
       )
       VALUES (?, ?, ?, ?, 'REQUESTED', CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
      [
        buildQuoteCode(),
        Number(draft.id_retailer_fk),
        Number(draft.id_wholesaler_fk),
        safeDraftId,
        draft.currency_code || 'USD',
        normalizeText(note, 1000) || normalizeText(draft.notes, 1000),
        safeRetailerId,
        safeRetailerId
      ]
    );

    const quoteId = Number(quoteResult.insertId);

    let subtotal = 0;

    for (const item of draftItems) {
      const unitPrice = normalizeMoney(item.unit_price_snapshot_usd || 0, 'unit_price_usd');
      const quantity = normalizePositiveInt(item.requested_quantity, 'requested_quantity');
      const itemSubtotal = normalizeMoney(unitPrice * quantity, 'subtotal_usd');

      subtotal += itemSubtotal;

      await connection.query(
        `INSERT INTO B2B_Quote_Item (
           id_b2b_quote_fk,
           id_product_fk,
           product_name_snapshot,
           sku_snapshot,
           unit_price_usd,
           quantity,
           subtotal_usd
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          quoteId,
          Number(item.id_product_fk),
          normalizeText(item.product_name, 255),
          normalizeText(item.sku, 64),
          unitPrice,
          quantity,
          itemSubtotal
        ]
      );
    }

    subtotal = normalizeMoney(subtotal, 'subtotal_usd');

    await connection.query(
      `UPDATE B2B_Quote
       SET subtotal_usd = ?,
           additional_charges_usd = 0,
           total_usd = ?,
           updated_by_company_id = ?
       WHERE id_b2b_quote = ?`,
      [subtotal, subtotal, safeRetailerId, quoteId]
    );

    await appendQuoteHistory(connection, {
      quoteId,
      fromStatus: null,
      toStatus: 'REQUESTED',
      note: normalizeText(note, 1000) || 'Solicitud enviada desde borrador',
      performedBy: safeRetailerId
    });

    await connection.query(
      `UPDATE Quote_Draft
       SET status = 'SUBMITTED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id_quote_draft = ?`,
      [safeDraftId]
    );

    const quote = await getQuoteById(connection, quoteId);

    await connection.commit();

    return mapQuoteRow(quote);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listIncomingQuotesForWholesaler = async ({ wholesalerId, status }) => {
  const safeWholesalerId = normalizePositiveInt(wholesalerId, 'wholesalerId');
  const safeStatus = normalizeQuoteStatus(status);

  const params = [safeWholesalerId];
  let statusSql = '';

  if (safeStatus) {
    statusSql = ' AND q.status = ?';
    params.push(safeStatus);
  }

  const [rows] = await pool.query(
    `SELECT q.*,
            c.name AS retailer_name
     FROM B2B_Quote q
     INNER JOIN Company c ON c.id_company = q.id_retailer_fk
     WHERE q.id_wholesaler_fk = ?
     ${statusSql}
     ORDER BY q.created_at DESC, q.id_b2b_quote DESC`,
    params
  );

  return rows.map(mapQuoteRow);
};

const listOutgoingQuotesForRetailer = async ({ retailerId, status }) => {
  const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');
  const safeStatus = normalizeQuoteStatus(status);

  const params = [safeRetailerId];
  let statusSql = '';

  if (safeStatus) {
    statusSql = ' AND q.status = ?';
    params.push(safeStatus);
  }

  const [rows] = await pool.query(
    `SELECT q.*,
            c.name AS wholesaler_name
     FROM B2B_Quote q
     INNER JOIN Company c ON c.id_company = q.id_wholesaler_fk
     WHERE q.id_retailer_fk = ?
     ${statusSql}
     ORDER BY q.created_at DESC, q.id_b2b_quote DESC`,
    params
  );

  return rows.map(mapQuoteRow);
};

const getQuoteDetail = async ({ quoteId, companyId }) => {
  const connection = await pool.getConnection();

  try {
    const safeQuoteId = normalizePositiveInt(quoteId, 'quoteId');
    const safeCompanyId = normalizePositiveInt(companyId, 'companyId');

    const quote = await getQuoteById(connection, safeQuoteId);

    if (!quote) {
      throw new Error('Cotizacion no encontrada');
    }

    assertQuoteCompanyAccess(quote, safeCompanyId);

    const [items, charges, evidences, history, delivery, paymentMethods] = await Promise.all([
      listQuoteItems(connection, safeQuoteId),
      listQuoteCharges(connection, safeQuoteId),
      listQuoteEvidences(connection, safeQuoteId),
      listQuoteHistory(connection, safeQuoteId),
      getQuoteDelivery(connection, safeQuoteId),
      listCompanyPaymentMethods(connection, quote.id_wholesaler_fk)
    ]);

    const approvedPaymentsUsd = await getApprovedEvidenceTotal(connection, safeQuoteId);
    const remainingBalanceUsd = Math.max(roundAmount(quote.total_usd - approvedPaymentsUsd), 0);

    return {
      ...mapQuoteRow(quote),
      items,
      charges,
      evidences,
      history,
      delivery,
      payment_methods: paymentMethods,
      approved_payments_usd: approvedPaymentsUsd,
      remaining_balance_usd: remainingBalanceUsd
    };
  } finally {
    connection.release();
  }
};

const rejectQuoteAsWholesaler = async ({ connection, quote, safeQuoteId, safeWholesalerId, wholesalerNote }) => {
  if (!String(wholesalerNote || '').trim()) {
    throw new Error('Nota es requerida para rechazar la cotizacion');
  }

  await connection.query(
    `UPDATE B2B_Quote
     SET status = 'REJECTED',
         rejected_at = CURRENT_TIMESTAMP,
         wholesaler_note = ?,
         updated_by_company_id = ?
     WHERE id_b2b_quote = ?`,
    [normalizeText(wholesalerNote, 1000), safeWholesalerId, safeQuoteId]
  );

  await appendQuoteHistory(connection, {
    quoteId: safeQuoteId,
    fromStatus: quote.status,
    toStatus: 'REJECTED',
    note: normalizeText(wholesalerNote, 1000),
    performedBy: safeWholesalerId
  });

  const updatedQuote = await getQuoteById(connection, safeQuoteId);
  return mapQuoteRow(updatedQuote);
};

const respondQuoteAsWholesaler = async ({ quoteId, wholesalerId, items, charges, wholesalerNote, decision }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeQuoteId = normalizePositiveInt(quoteId, 'quoteId');
    const safeWholesalerId = normalizePositiveInt(wholesalerId, 'wholesalerId');
    const safeDecision = String(decision || 'QUOTE').trim().toUpperCase();

    const quote = await getQuoteById(connection, safeQuoteId);

    if (!quote || Number(quote.id_wholesaler_fk) !== safeWholesalerId) {
      throw new Error('Cotizacion no encontrada');
    }

    if (!['REQUESTED', 'QUOTED'].includes(String(quote.status))) {
      throw new Error('La cotizacion no permite ser actualizada por el mayorista');
    }

    if (safeDecision === 'REJECTED') {
      const result = await rejectQuoteAsWholesaler({
        connection,
        quote,
        safeQuoteId,
        safeWholesalerId,
        wholesalerNote
      });

      await connection.commit();
      return result;
    }

    if (!Array.isArray(items) || !items.length) {
      throw new Error('items es requerido');
    }

    await connection.query('DELETE FROM B2B_Quote_Item WHERE id_b2b_quote_fk = ?', [safeQuoteId]);
    await connection.query('DELETE FROM B2B_Quote_Charge WHERE id_b2b_quote_fk = ?', [safeQuoteId]);

    let subtotal = 0;

    for (const item of items) {
      const productId = normalizePositiveInt(item.id_product_fk, 'id_product_fk');
      const quantity = normalizePositiveInt(item.quantity, 'quantity');
      const unitPrice = normalizeMoney(item.unit_price_usd, 'unit_price_usd');
      const itemSubtotal = normalizeMoney(quantity * unitPrice, 'subtotal_usd');

      const [productRows] = await connection.query(
        `SELECT id_product, id_company_fk, name, sku
         FROM Product
         WHERE id_product = ?
         LIMIT 1`,
        [productId]
      );

      const product = productRows[0];

      if (!product || Number(product.id_company_fk) !== safeWholesalerId) {
        throw new Error(`Producto ${productId} no pertenece al mayorista`);
      }

      subtotal += itemSubtotal;

      await connection.query(
        `INSERT INTO B2B_Quote_Item (
           id_b2b_quote_fk,
           id_product_fk,
           product_name_snapshot,
           sku_snapshot,
           unit_price_usd,
           quantity,
           subtotal_usd
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          safeQuoteId,
          productId,
          normalizeText(item.product_name_snapshot || product.name, 255),
          normalizeText(item.sku_snapshot || product.sku, 64),
          unitPrice,
          quantity,
          itemSubtotal
        ]
      );
    }

    let additionalCharges = 0;

    if (Array.isArray(charges)) {
      for (const charge of charges) {
        const chargeType = normalizeText(charge.charge_type, 30);
        const label = normalizeText(charge.label, 64);
        const amount = normalizeMoney(charge.amount_usd, 'amount_usd');
        const isOptional = Boolean(charge.is_optional);

        if (!new Set(['SHIPPING', 'HANDLING', 'INSURANCE', 'ADJUSTMENT']).has(chargeType)) {
          throw new Error('charge_type invalido');
        }

        additionalCharges += amount;

        await connection.query(
          `INSERT INTO B2B_Quote_Charge (
             id_b2b_quote_fk,
             charge_type,
             label,
             amount_usd,
             is_optional
           ) VALUES (?, ?, ?, ?, ?)`,
          [safeQuoteId, chargeType, label, amount, isOptional]
        );
      }
    }

    subtotal = normalizeMoney(subtotal, 'subtotal_usd');
    additionalCharges = normalizeMoney(additionalCharges, 'additional_charges_usd');
    const total = normalizeMoney(subtotal + additionalCharges, 'total_usd');

    await connection.query(
      `UPDATE B2B_Quote
       SET status = 'QUOTED',
           responded_at = CURRENT_TIMESTAMP,
           subtotal_usd = ?,
           additional_charges_usd = ?,
           total_usd = ?,
           wholesaler_note = ?,
           updated_by_company_id = ?
       WHERE id_b2b_quote = ?`,
      [
        subtotal,
        additionalCharges,
        total,
        normalizeText(wholesalerNote, 1000),
        safeWholesalerId,
        safeQuoteId
      ]
    );

    await appendQuoteHistory(connection, {
      quoteId: safeQuoteId,
      fromStatus: quote.status,
      toStatus: 'QUOTED',
      note: normalizeText(wholesalerNote, 1000) || 'Cotizacion respondida por mayorista',
      performedBy: safeWholesalerId
    });

    const updated = await getQuoteById(connection, safeQuoteId);

    await connection.commit();

    return mapQuoteRow(updated);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateQuoteStatusByRetailer = async ({ quoteId, retailerId, nextStatus, note }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeQuoteId = normalizePositiveInt(quoteId, 'quoteId');
    const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');

    if (!new Set(['ACCEPTED', 'REJECTED', 'CANCELLED']).has(nextStatus)) {
      throw new Error('Estado no permitido');
    }

    const quote = await getQuoteById(connection, safeQuoteId);

    if (!quote || Number(quote.id_retailer_fk) !== safeRetailerId) {
      throw new Error('Cotizacion no encontrada');
    }

    if (String(quote.status) !== 'QUOTED') {
      throw new Error('La cotizacion no puede cambiar a ese estado');
    }

    const updateColumns = [];

    if (nextStatus === 'ACCEPTED') {
      updateColumns.push('accepted_at = CURRENT_TIMESTAMP');
      updateColumns.push('payment_due_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY)');
    }

    if (nextStatus === 'REJECTED') {
      updateColumns.push('rejected_at = CURRENT_TIMESTAMP');
    }

    if (nextStatus === 'CANCELLED') {
      updateColumns.push('cancelled_at = CURRENT_TIMESTAMP');
    }

    await connection.query(
      `UPDATE B2B_Quote
       SET status = ?,
           retailer_note = ?,
           updated_by_company_id = ?,
           ${updateColumns.join(', ') || 'updated_at = CURRENT_TIMESTAMP'}
       WHERE id_b2b_quote = ?`,
      [
        nextStatus,
        normalizeText(note, 1000),
        safeRetailerId,
        safeQuoteId
      ]
    );

    await appendQuoteHistory(connection, {
      quoteId: safeQuoteId,
      fromStatus: quote.status,
      toStatus: nextStatus,
      note: normalizeText(note, 1000),
      performedBy: safeRetailerId
    });

    const updated = await getQuoteById(connection, safeQuoteId);

    await connection.commit();

    return mapQuoteRow(updated);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const dispatchQuoteByWholesaler = async ({ quoteId, wholesalerId, trackingCode, carrierName, dispatchNote }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeQuoteId = normalizePositiveInt(quoteId, 'quoteId');
    const safeWholesalerId = normalizePositiveInt(wholesalerId, 'wholesalerId');

    const quote = await getQuoteById(connection, safeQuoteId);

    if (!quote || Number(quote.id_wholesaler_fk) !== safeWholesalerId) {
      throw new Error('Cotizacion no encontrada');
    }

    if (!['ACCEPTED', 'DELIVERED', 'PAYMENT_PENDING'].includes(String(quote.status))) {
      throw new Error('La cotizacion no esta en estado valido para despacho');
    }

    const currentDelivery = await getQuoteDelivery(connection, safeQuoteId);

    if (currentDelivery == null) {
      await connection.query(
        `INSERT INTO B2B_Quote_Delivery (
           id_b2b_quote_fk,
           delivery_status,
           tracking_code,
           carrier_name,
           dispatch_note,
           dispatched_at,
           delivered_at
         ) VALUES (?, 'DISPATCHED', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          safeQuoteId,
          normalizeText(trackingCode, 64),
          normalizeText(carrierName, 64),
          normalizeText(dispatchNote, 1000)
        ]
      );
    } else {
      await connection.query(
        `UPDATE B2B_Quote_Delivery
         SET delivery_status = 'DELIVERED',
             tracking_code = COALESCE(?, tracking_code),
             carrier_name = COALESCE(?, carrier_name),
             dispatch_note = COALESCE(?, dispatch_note),
             dispatched_at = COALESCE(dispatched_at, CURRENT_TIMESTAMP),
             delivered_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_b2b_quote_fk = ?`,
        [
          normalizeText(trackingCode, 64),
          normalizeText(carrierName, 64),
          normalizeText(dispatchNote, 1000),
          safeQuoteId
        ]
      );
    }

    await connection.query(
      `UPDATE B2B_Quote
       SET status = 'DELIVERED',
           updated_by_company_id = ?
       WHERE id_b2b_quote = ?`,
      [safeWholesalerId, safeQuoteId]
    );

    await appendQuoteHistory(connection, {
      quoteId: safeQuoteId,
      fromStatus: quote.status,
      toStatus: 'DELIVERED',
      note: normalizeText(dispatchNote, 1000) || 'Despacho/entrega registrada por mayorista',
      performedBy: safeWholesalerId
    });

    const updated = await getQuoteById(connection, safeQuoteId);

    await connection.commit();

    return mapQuoteRow(updated);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const confirmDeliveryByRetailer = async ({ quoteId, retailerId, note }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeQuoteId = normalizePositiveInt(quoteId, 'quoteId');
    const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');

    const quote = await getQuoteById(connection, safeQuoteId);

    if (!quote || Number(quote.id_retailer_fk) !== safeRetailerId) {
      throw new Error('Cotizacion no encontrada');
    }

    if (String(quote.status) !== 'DELIVERED') {
      throw new Error('La cotizacion debe estar en DELIVERED para confirmar recepcion');
    }

    const now = new Date();
    const dueAt = new Date(now);
    dueAt.setDate(dueAt.getDate() + 30);

    const currentDelivery = await getQuoteDelivery(connection, safeQuoteId);

    if (currentDelivery == null) {
      await connection.query(
        `INSERT INTO B2B_Quote_Delivery (
           id_b2b_quote_fk,
           delivery_status,
           delivered_at,
           confirmed_by_retailer_at
         ) VALUES (?, 'CONFIRMED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [safeQuoteId]
      );
    } else {
      await connection.query(
        `UPDATE B2B_Quote_Delivery
         SET delivery_status = 'CONFIRMED',
             delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP),
             confirmed_by_retailer_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_b2b_quote_fk = ?`,
        [safeQuoteId]
      );
    }

    await connection.query(
      `UPDATE B2B_Quote
       SET status = 'PAYMENT_PENDING',
           delivery_confirmed_at = CURRENT_TIMESTAMP,
           payment_due_at = ?,
           updated_by_company_id = ?
       WHERE id_b2b_quote = ?`,
      [dueAt, safeRetailerId, safeQuoteId]
    );

    await appendQuoteHistory(connection, {
      quoteId: safeQuoteId,
      fromStatus: quote.status,
      toStatus: 'PAYMENT_PENDING',
      note: normalizeText(note, 1000) || 'Recepcion confirmada por detallista',
      performedBy: safeRetailerId
    });

    const updated = await getQuoteById(connection, safeQuoteId);

    await connection.commit();

    return mapQuoteRow(updated);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const submitPaymentEvidenceByRetailer = async ({ quoteId, retailerId, filePath, fileUrl, originalName, mimeType, amountReportedUsd, note }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeQuoteId = normalizePositiveInt(quoteId, 'quoteId');
    const safeRetailerId = normalizePositiveInt(retailerId, 'retailerId');

    const quote = await getQuoteById(connection, safeQuoteId);

    if (!quote || Number(quote.id_retailer_fk) !== safeRetailerId) {
      throw new Error('Cotizacion no encontrada');
    }

    if (!['ACCEPTED', 'PAYMENT_PENDING', 'PAYMENT_SUBMITTED'].includes(String(quote.status))) {
      throw new Error('La cotizacion no permite cargar evidencia de pago');
    }

    const safeFilePath = normalizeText(filePath || fileUrl, 255);

    if (!safeFilePath) {
      throw new Error('Archivo de evidencia es requerido');
    }

    const rawAmount = amountReportedUsd == null || amountReportedUsd === ''
      ? null
      : Number(amountReportedUsd);
    let safeAmount = rawAmount == null ? null : normalizeMoney(rawAmount, 'amount_reported_usd');

    const submittedTotalUsd = await getSubmittedEvidenceTotal(connection, safeQuoteId);
    const remainingBalanceUsd = roundAmount(quote.total_usd - submittedTotalUsd);

    if (remainingBalanceUsd <= 0) {
      throw new Error('La cotizacion ya está completamente pagada');
    }

    if (String(quote.payment_mode).toUpperCase() === 'ONE_TIME') {
      if (safeAmount == null) {
        safeAmount = remainingBalanceUsd;
      }

      if (safeAmount !== remainingBalanceUsd) {
        throw new Error(`Para pago único, el monto reportado debe ser USD ${remainingBalanceUsd.toFixed(2)}`);
      }
    } else {
      if (safeAmount == null || safeAmount <= 0) {
        throw new Error('amount_reported_usd invalido');
      }

      if (safeAmount > remainingBalanceUsd) {
        throw new Error(`El monto reportado no puede exceder el saldo pendiente de USD ${remainingBalanceUsd.toFixed(2)}`);
      }
    }

    const safeOriginalName = normalizeText(originalName || path.basename(safeFilePath), 255);
    const [result] = await connection.query(
      `INSERT INTO B2B_Quote_Payment_Evidence (
         id_b2b_quote_fk,
         file_url,
         original_name,
         mime_type,
         amount_reported_usd,
         submitted_by_company_id,
         review_status,
         review_note
       )
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [
        safeQuoteId,
        safeFilePath,
        safeOriginalName,
        normalizeText(mimeType, 64),
        safeAmount,
        safeRetailerId,
        normalizeText(note, 1000)
      ]
    );

    await connection.query(
      `UPDATE B2B_Quote
       SET status = 'PAYMENT_SUBMITTED',
           updated_by_company_id = ?
       WHERE id_b2b_quote = ?`,
      [safeRetailerId, safeQuoteId]
    );

    await appendQuoteHistory(connection, {
      quoteId: safeQuoteId,
      fromStatus: quote.status,
      toStatus: 'PAYMENT_SUBMITTED',
      note: normalizeText(note, 1000) || 'Evidencia de pago cargada por detallista',
      performedBy: safeRetailerId
    });

    const [rows] = await connection.query(
      `SELECT *
       FROM B2B_Quote_Payment_Evidence
       WHERE id_b2b_quote_payment_evidence = ?
       LIMIT 1`,
      [Number(result.insertId)]
    );

    await connection.commit();

    return rows[0] || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const reviewPaymentEvidenceByWholesaler = async ({ quoteId, evidenceId, wholesalerId, reviewStatus, reviewNote }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const safeQuoteId = normalizePositiveInt(quoteId, 'quoteId');
    const safeEvidenceId = normalizePositiveInt(evidenceId, 'evidenceId');
    const safeWholesalerId = normalizePositiveInt(wholesalerId, 'wholesalerId');

    const safeReviewStatus = String(reviewStatus || '').trim().toUpperCase();

    if (!new Set(['APPROVED', 'REJECTED']).has(safeReviewStatus)) {
      throw new Error('review_status invalido');
    }

    const quote = await getQuoteById(connection, safeQuoteId);

    if (!quote || Number(quote.id_wholesaler_fk) !== safeWholesalerId) {
      throw new Error('Cotizacion no encontrada');
    }

    const [evidenceRows] = await connection.query(
      `SELECT *
       FROM B2B_Quote_Payment_Evidence
       WHERE id_b2b_quote_payment_evidence = ?
         AND id_b2b_quote_fk = ?
       LIMIT 1`,
      [safeEvidenceId, safeQuoteId]
    );

    const evidence = evidenceRows[0];

    if (!evidence) {
      throw new Error('Evidencia no encontrada');
    }

    if (String(evidence.review_status) !== 'PENDING') {
      throw new Error('La evidencia ya fue revisada');
    }

    const approvedTotalUsdBefore = await getApprovedEvidenceTotal(connection, safeQuoteId);
    const evidenceAmountUsd = Number(evidence.amount_reported_usd || 0);
    const approvedTotalUsdAfter = safeReviewStatus === 'APPROVED'
      ? roundAmount(approvedTotalUsdBefore + evidenceAmountUsd)
      : approvedTotalUsdBefore;

    await connection.query(
      `UPDATE B2B_Quote_Payment_Evidence
       SET review_status = ?,
           review_note = ?,
           reviewed_by_company_id = ?,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id_b2b_quote_payment_evidence = ?`,
      [safeReviewStatus, normalizeText(reviewNote, 1000), safeWholesalerId, safeEvidenceId]
    );

    const nextStatus = approvedTotalUsdAfter >= roundAmount(quote.total_usd)
      ? 'PAID'
      : 'PAYMENT_PENDING';

    await connection.query(
      `UPDATE B2B_Quote
       SET status = ?,
           updated_by_company_id = ?
       WHERE id_b2b_quote = ?`,
      [nextStatus, safeWholesalerId, safeQuoteId]
    );

    await appendQuoteHistory(connection, {
      quoteId: safeQuoteId,
      fromStatus: quote.status,
      toStatus: nextStatus,
      note: normalizeText(reviewNote, 1000) || `Evidencia ${safeReviewStatus.toLowerCase()} por mayorista`,
      performedBy: safeWholesalerId
    });

    const updated = await getQuoteById(connection, safeQuoteId);

    await connection.commit();

    return mapQuoteRow(updated);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
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
};
