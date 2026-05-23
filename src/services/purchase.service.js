const pool = require('../config/db');
const { getCart, clearCart } = require('./customer.collections.service');

const PURCHASE_GROUP_FINAL_STATUSES = new Set(['APPROVED', 'REJECTED', 'EXPIRED']);
const PURCHASE_CASHBACK_RATE = 0.0225;
const CASHBACK_GROUP_REF_OFFSET = 1000000000;
const CASHBACK_CHECKOUT_REF_OFFSET = 2000000000;

const roundAmount = (value, decimals = 2) => {
  const numericValue = Number(value || 0);
  const factor = 10 ** decimals;
  return Math.round(numericValue * factor) / factor;
};

const formatDateCompact = (value) => {
  const dateValue = new Date(value);
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const buildOrderCode = (checkoutId, createdAt) => `THO-${String(checkoutId).padStart(6, '0')}-${formatDateCompact(createdAt)}`;

const encodeGroupCashbackRef = (groupId) => CASHBACK_GROUP_REF_OFFSET + Number(groupId);
const encodeCheckoutCashbackRef = (checkoutId) => CASHBACK_CHECKOUT_REF_OFFSET + Number(checkoutId);
const decodeCheckoutCashbackRef = (value) => Number(value) - CASHBACK_CHECKOUT_REF_OFFSET;
const decodeGroupCashbackRef = (value) => Number(value) - CASHBACK_GROUP_REF_OFFSET;

const distributeAmountAcrossEntries = (entries, totalAmount, valueSelector) => {
  if (!Array.isArray(entries) || !entries.length) {
    return new Map();
  }

  const normalizedTotalAmount = roundAmount(totalAmount, 2);

  if (normalizedTotalAmount <= 0) {
    return new Map(entries.map((entry) => [entry.id, 0]));
  }

  const baseTotal = entries.reduce((sum, entry) => sum + Number(valueSelector(entry) || 0), 0);

  if (baseTotal <= 0) {
    return new Map(entries.map((entry) => [entry.id, 0]));
  }

  const amountsByEntryId = new Map();
  let remainingAmount = normalizedTotalAmount;

  entries.forEach((entry, index) => {
    if (index === entries.length - 1) {
      amountsByEntryId.set(entry.id, roundAmount(remainingAmount, 2));
      return;
    }

    const proportionalAmount = roundAmount((Number(valueSelector(entry) || 0) / baseTotal) * normalizedTotalAmount, 2);
    const safeAmount = Math.min(proportionalAmount, remainingAmount);
    amountsByEntryId.set(entry.id, safeAmount);
    remainingAmount = roundAmount(remainingAmount - safeAmount, 2);
  });

  return amountsByEntryId;
};

const buildInClause = (values) => values.map(() => '?').join(', ');

const createGroupPaymentDueAt = (baseDate = new Date()) => {
  const dueAt = new Date(baseDate);
  dueAt.setHours(dueAt.getHours() + 24);
  return dueAt;
};

const getLatestExchangeRateForConnection = async (connection) => {
  const [rows] = await connection.query(
    `SELECT id_exchange_rate, rate_bs_per_usd, created_at
     FROM Exchange_Rate
     ORDER BY created_at DESC, id_exchange_rate DESC
     LIMIT 1`
  );

  if (!rows.length) {
    throw new Error('No hay una tasa de cambio registrada');
  }

  return {
    id_exchange_rate: rows[0].id_exchange_rate,
    rate_bs_per_usd: Number(rows[0].rate_bs_per_usd),
    created_at: rows[0].created_at
  };
};

const getProductsForCheckout = async (connection, productIds) => {
  const placeholders = buildInClause(productIds);
  const [rows] = await connection.query(
    `SELECT p.id_product,
            p.id_company_fk,
            p.name,
            p.price,
            p.is_active,
            c.name AS company_name,
            s.id_stock,
            s.quantity AS stock_quantity
     FROM Product p
     INNER JOIN Company c ON c.id_company = p.id_company_fk
     LEFT JOIN Stock s ON s.id_product_fk = p.id_product
     WHERE p.id_product IN (${placeholders})
     FOR UPDATE`,
    productIds
  );

  return rows.map((row) => ({
    ...row,
    price: Number(row.price),
    stock_quantity: Number(row.stock_quantity || 0),
    is_active: Boolean(row.is_active)
  }));
};

const getGroupRows = async (connection, whereSql, params = []) => {
  const [rows] = await connection.query(
    `SELECT pg.id_purchase_group,
            pg.id_checkout_fk,
            pg.id_company_fk,
            pg.subtotal_usd,
            pg.subtotal_bs,
            pg.status,
            pg.payment_due_at,
            pg.reviewed_at,
            pg.review_note,
            pg.created_at,
            pg.updated_at,
            pc.id_customer_fk,
            pc.id_exchange_rate_fk,
            pc.exchange_rate_snapshot,
            pc.total_usd,
            pc.total_bs,
            pc.status AS checkout_status,
            pc.created_at AS checkout_created_at,
            pc.updated_at AS checkout_updated_at,
            co.name AS company_name,
            cu.name AS customer_name,
            cu.email AS customer_email
     FROM Purchase_Group pg
     INNER JOIN Purchase_Checkout pc ON pc.id_checkout = pg.id_checkout_fk
     INNER JOIN Company co ON co.id_company = pg.id_company_fk
     INNER JOIN Customer cu ON cu.id_customer = pc.id_customer_fk
     ${whereSql}
     ORDER BY pg.created_at DESC, pg.id_purchase_group DESC`,
    params
  );

  return rows.map((row) => ({
    ...row,
    subtotal_usd: Number(row.subtotal_usd),
    subtotal_bs: Number(row.subtotal_bs),
    exchange_rate_snapshot: Number(row.exchange_rate_snapshot),
    total_usd: Number(row.total_usd),
    total_bs: Number(row.total_bs)
  }));
};

const getItemsByGroupIds = async (connection, groupIds) => {
  if (!groupIds.length) {
    return [];
  }

  const placeholders = buildInClause(groupIds);
  const [rows] = await connection.query(
    `SELECT pi.id_purchase_item,
            pi.id_purchase_group_fk,
            pi.id_product_fk,
            pi.quantity,
            pi.unit_price_usd_snapshot,
            pi.unit_price_bs_snapshot,
            pi.subtotal_usd,
            pi.subtotal_bs,
            pi.created_at,
            p.name AS product_name,
            p.sku,
            p.brand
     FROM Purchase_Item pi
     INNER JOIN Product p ON p.id_product = pi.id_product_fk
     WHERE pi.id_purchase_group_fk IN (${placeholders})
     ORDER BY pi.id_purchase_item ASC`,
    groupIds
  );

  return rows.map((row) => ({
    ...row,
    quantity: Number(row.quantity),
    unit_price_usd_snapshot: Number(row.unit_price_usd_snapshot),
    unit_price_bs_snapshot: Number(row.unit_price_bs_snapshot),
    subtotal_usd: Number(row.subtotal_usd),
    subtotal_bs: Number(row.subtotal_bs)
  }));
};

const getEvidenceByGroupIds = async (connection, groupIds) => {
  if (!groupIds.length) {
    return [];
  }

  const placeholders = buildInClause(groupIds);
  const [rows] = await connection.query(
    `SELECT id_purchase_evidence,
            id_purchase_group_fk,
            file_url,
            original_name,
            mime_type,
            note,
            review_status,
            uploaded_at,
            reviewed_at
     FROM Purchase_Evidence
     WHERE id_purchase_group_fk IN (${placeholders})
     ORDER BY uploaded_at DESC, id_purchase_evidence DESC`,
    groupIds
  );

  return rows;
};

const getPaymentMethodsByCompanyIds = async (connection, companyIds) => {
  if (!companyIds.length) {
    return [];
  }

  const placeholders = buildInClause(companyIds);
  const [rows] = await connection.query(
    `SELECT id_payment_method,
            id_company_fk,
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
     WHERE id_company_fk IN (${placeholders})
       AND is_active = TRUE
     ORDER BY label ASC, id_payment_method ASC`,
    companyIds
  );

  return rows.map((row) => ({
    ...row,
    is_active: Boolean(row.is_active)
  }));
};

const getCheckoutCashbackRedemptionMap = async (connection, checkoutIds) => {
  if (!Array.isArray(checkoutIds) || !checkoutIds.length) {
    return new Map();
  }

  const encodedRefs = checkoutIds.map((checkoutId) => encodeCheckoutCashbackRef(checkoutId));
  const placeholders = buildInClause(encodedRefs);
  const [rows] = await connection.query(
    `SELECT id_transaction_fk, SUM(value) AS redeemed_value
     FROM Cashback_History
     WHERE transaction_type = 'redemption'
       AND id_transaction_fk IN (${placeholders})
     GROUP BY id_transaction_fk`,
    encodedRefs
  );

  return new Map(
    rows.map((row) => [decodeCheckoutCashbackRef(row.id_transaction_fk), roundAmount(Number(row.redeemed_value || 0), 2)])
  );
};

const getGroupCashbackRestoreMap = async (connection, groupIds) => {
  if (!Array.isArray(groupIds) || !groupIds.length) {
    return new Map();
  }

  const encodedRefs = groupIds.map((groupId) => encodeGroupCashbackRef(groupId));
  const placeholders = buildInClause(encodedRefs);
  const [rows] = await connection.query(
    `SELECT id_transaction_fk, SUM(value) AS restored_value
     FROM Cashback_History
     WHERE transaction_type = 'acumulate'
       AND id_transaction_fk IN (${placeholders})
     GROUP BY id_transaction_fk`,
    encodedRefs
  );

  return new Map(
    rows.map((row) => [decodeGroupCashbackRef(row.id_transaction_fk), roundAmount(Number(row.restored_value || 0), 2)])
  );
};

const enrichPurchaseGroupsWithDerivedCheckoutData = (groups, checkoutCashbackRedemptionMap, groupCashbackRestoreMap) => {
  if (!Array.isArray(groups) || !groups.length) {
    return [];
  }

  const groupsByCheckoutId = new Map();

  for (const group of groups) {
    const currentGroups = groupsByCheckoutId.get(group.id_checkout) || [];
    currentGroups.push(group);
    groupsByCheckoutId.set(group.id_checkout, currentGroups);
  }

  return groups.map((group) => {
    const checkoutGroups = groupsByCheckoutId.get(group.id_checkout) || [];
    const checkoutRedemptionUsd = roundAmount(checkoutCashbackRedemptionMap.get(group.id_checkout) || 0, 2);
    const redemptionDistribution = distributeAmountAcrossEntries(
      checkoutGroups.map((checkoutGroup) => ({ id: checkoutGroup.id_purchase_group, subtotal_usd: checkoutGroup.subtotal_usd })),
      checkoutRedemptionUsd,
      (entry) => entry.subtotal_usd
    );
    const baseGroupRedemptionUsd = roundAmount(redemptionDistribution.get(group.id_purchase_group) || 0, 2);
    const restoredGroupRedemptionUsd = roundAmount(groupCashbackRestoreMap.get(group.id_purchase_group) || 0, 2);
    const currentGroupRedemptionUsd = roundAmount(Math.max(baseGroupRedemptionUsd - restoredGroupRedemptionUsd, 0), 2);
    const currentGroupRedemptionBs = roundAmount(currentGroupRedemptionUsd * Number(group.checkout.exchange_rate_snapshot || 0), 2);
    const totalPayableUsd = roundAmount(group.subtotal_usd - currentGroupRedemptionUsd, 2);
    const totalPayableBs = roundAmount(group.subtotal_bs - currentGroupRedemptionBs, 2);
    const currentCheckoutRedemptionUsd = roundAmount(
      checkoutGroups.reduce((sum, checkoutGroup) => {
        const baseShare = roundAmount(redemptionDistribution.get(checkoutGroup.id_purchase_group) || 0, 2);
        const restoredShare = roundAmount(groupCashbackRestoreMap.get(checkoutGroup.id_purchase_group) || 0, 2);
        return roundAmount(sum + Math.max(baseShare - restoredShare, 0), 2);
      }, 0),
      2
    );
    const currentCheckoutRedemptionBs = roundAmount(currentCheckoutRedemptionUsd * Number(group.checkout.exchange_rate_snapshot || 0), 2);

    return {
      ...group,
      cashback_redeemed_usd: currentGroupRedemptionUsd,
      cashback_redeemed_bs: currentGroupRedemptionBs,
      total_payable_usd: totalPayableUsd,
      total_payable_bs: totalPayableBs,
      checkout: {
        ...group.checkout,
        order_code: buildOrderCode(group.checkout.id_checkout, group.checkout.created_at),
        cashback_redeemed_usd: currentCheckoutRedemptionUsd,
        cashback_redeemed_bs: currentCheckoutRedemptionBs,
        total_payable_usd: roundAmount(group.checkout.total_usd - currentCheckoutRedemptionUsd, 2),
        total_payable_bs: roundAmount(group.checkout.total_bs - currentCheckoutRedemptionBs, 2)
      }
    };
  });
};

const hydrateGroupCollection = async (connection, groupRows) => {
  if (!groupRows.length) {
    return [];
  }

  const groupIds = groupRows.map((group) => group.id_purchase_group);
  const companyIds = [...new Set(groupRows.map((group) => group.id_company_fk))];
  const [items, evidences, paymentMethods] = await Promise.all([
    getItemsByGroupIds(connection, groupIds),
    getEvidenceByGroupIds(connection, groupIds),
    getPaymentMethodsByCompanyIds(connection, companyIds)
  ]);

  const itemsByGroupId = new Map();
  const evidencesByGroupId = new Map();
  const methodsByCompanyId = new Map();

  for (const item of items) {
    const currentItems = itemsByGroupId.get(item.id_purchase_group_fk) || [];
    currentItems.push({
      id_purchase_item: item.id_purchase_item,
      id_product: item.id_product_fk,
      quantity: item.quantity,
      unit_price_usd_snapshot: item.unit_price_usd_snapshot,
      unit_price_bs_snapshot: item.unit_price_bs_snapshot,
      subtotal_usd: item.subtotal_usd,
      subtotal_bs: item.subtotal_bs,
      cashback_generated: roundAmount(item.subtotal_usd * PURCHASE_CASHBACK_RATE, 2),
      created_at: item.created_at,
      product: {
        id_product: item.id_product_fk,
        name: item.product_name,
        sku: item.sku,
        brand: item.brand
      }
    });
    itemsByGroupId.set(item.id_purchase_group_fk, currentItems);
  }

  for (const evidence of evidences) {
    const currentEvidences = evidencesByGroupId.get(evidence.id_purchase_group_fk) || [];
    currentEvidences.push({
      id_purchase_evidence: evidence.id_purchase_evidence,
      file_url: evidence.file_url,
      original_name: evidence.original_name,
      mime_type: evidence.mime_type,
      note: evidence.note,
      review_status: evidence.review_status,
      uploaded_at: evidence.uploaded_at,
      reviewed_at: evidence.reviewed_at
    });
    evidencesByGroupId.set(evidence.id_purchase_group_fk, currentEvidences);
  }

  for (const paymentMethod of paymentMethods) {
    const currentMethods = methodsByCompanyId.get(paymentMethod.id_company_fk) || [];
    currentMethods.push({
      id_payment_method: paymentMethod.id_payment_method,
      method_type: paymentMethod.method_type,
      label: paymentMethod.label,
      account_holder: paymentMethod.account_holder,
      account_number: paymentMethod.account_number,
      bank_name: paymentMethod.bank_name,
      instructions: paymentMethod.instructions,
      is_active: paymentMethod.is_active,
      created_at: paymentMethod.created_at,
      updated_at: paymentMethod.updated_at
    });
    methodsByCompanyId.set(paymentMethod.id_company_fk, currentMethods);
  }

  return groupRows.map((group) => ({
    id_purchase_group: group.id_purchase_group,
    id_checkout: group.id_checkout_fk,
    subtotal_usd: group.subtotal_usd,
    subtotal_bs: group.subtotal_bs,
    status: group.status,
    payment_due_at: group.payment_due_at,
    reviewed_at: group.reviewed_at,
    review_note: group.review_note,
    created_at: group.created_at,
    updated_at: group.updated_at,
    company: {
      id_company: group.id_company_fk,
      name: group.company_name,
      payment_methods: methodsByCompanyId.get(group.id_company_fk) || []
    },
    customer: {
      id_customer: group.id_customer_fk,
      name: group.customer_name,
      email: group.customer_email
    },
    checkout: {
      id_checkout: group.id_checkout_fk,
      id_exchange_rate: group.id_exchange_rate_fk,
      exchange_rate_snapshot: group.exchange_rate_snapshot,
      total_usd: group.total_usd,
      total_bs: group.total_bs,
      status: group.checkout_status,
      created_at: group.checkout_created_at,
      updated_at: group.checkout_updated_at
    },
    items: itemsByGroupId.get(group.id_purchase_group) || [],
    evidences: evidencesByGroupId.get(group.id_purchase_group) || []
  }));
};

const listCustomerCheckouts = async (customerId) => {
  const normalizedCustomerId = Number(customerId);
  const connection = await pool.getConnection();

  try {
    const [checkoutRows] = await connection.query(
      `SELECT id_checkout,
              id_exchange_rate_fk,
              exchange_rate_snapshot,
              total_usd,
              total_bs,
              status,
              created_at,
              updated_at
       FROM Purchase_Checkout
       WHERE id_customer_fk = ?
       ORDER BY created_at DESC, id_checkout DESC`,
      [normalizedCustomerId]
    );

    if (!checkoutRows.length) {
      return [];
    }

    const checkoutIds = checkoutRows.map((row) => row.id_checkout);
    const placeholders = buildInClause(checkoutIds);
    const groupRows = await getGroupRows(connection, `WHERE pg.id_checkout_fk IN (${placeholders})`, checkoutIds);
    const [checkoutCashbackRedemptionMap, groupCashbackRestoreMap, hydratedBaseGroups] = await Promise.all([
      getCheckoutCashbackRedemptionMap(connection, checkoutIds),
      getGroupCashbackRestoreMap(connection, groupRows.map((group) => group.id_purchase_group)),
      hydrateGroupCollection(connection, groupRows)
    ]);
    const hydratedGroups = enrichPurchaseGroupsWithDerivedCheckoutData(
      hydratedBaseGroups,
      checkoutCashbackRedemptionMap,
      groupCashbackRestoreMap
    );
    const groupsByCheckoutId = new Map();

    for (const group of hydratedGroups) {
      const currentGroups = groupsByCheckoutId.get(group.id_checkout) || [];
      currentGroups.push(group);
      groupsByCheckoutId.set(group.id_checkout, currentGroups);
    }

    return checkoutRows.map((row) => ({
      id_checkout: row.id_checkout,
      order_code: buildOrderCode(row.id_checkout, row.created_at),
      id_exchange_rate: row.id_exchange_rate_fk,
      exchange_rate_snapshot: Number(row.exchange_rate_snapshot),
      total_usd: Number(row.total_usd),
      total_bs: Number(row.total_bs),
      cashback_redeemed_usd: roundAmount(checkoutCashbackRedemptionMap.get(row.id_checkout) || 0, 2),
      cashback_redeemed_bs: roundAmount((checkoutCashbackRedemptionMap.get(row.id_checkout) || 0) * Number(row.exchange_rate_snapshot || 0), 2),
      total_payable_usd: roundAmount(Number(row.total_usd || 0) - Number(checkoutCashbackRedemptionMap.get(row.id_checkout) || 0), 2),
      total_payable_bs: roundAmount(Number(row.total_bs || 0) - ((checkoutCashbackRedemptionMap.get(row.id_checkout) || 0) * Number(row.exchange_rate_snapshot || 0)), 2),
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      groups: groupsByCheckoutId.get(row.id_checkout) || []
    }));
  } finally {
    connection.release();
  }
};

const listCompanyGroups = async ({ companyId, isAdmin = false }) => {
  const normalizedCompanyId = Number(companyId);
  const connection = await pool.getConnection();

  try {
    const groupRows = await getGroupRows(
      connection,
      isAdmin ? 'WHERE 1 = 1' : 'WHERE pg.id_company_fk = ?',
      isAdmin ? [] : [normalizedCompanyId]
    );

    const [checkoutCashbackRedemptionMap, groupCashbackRestoreMap, hydratedBaseGroups] = await Promise.all([
      getCheckoutCashbackRedemptionMap(connection, [...new Set(groupRows.map((group) => group.id_checkout_fk))]),
      getGroupCashbackRestoreMap(connection, groupRows.map((group) => group.id_purchase_group)),
      hydrateGroupCollection(connection, groupRows)
    ]);

    return enrichPurchaseGroupsWithDerivedCheckoutData(
      hydratedBaseGroups,
      checkoutCashbackRedemptionMap,
      groupCashbackRestoreMap
    );
  } finally {
    connection.release();
  }
};

const getCustomerCashbackBalanceForUpdate = async (connection, customerId) => {
  const normalizedCustomerId = Number(customerId);
  const [rows] = await connection.query(
    `SELECT id_cashback, value
     FROM Cashback
     WHERE id_customer_fk = ?
     LIMIT 1
     FOR UPDATE`,
    [normalizedCustomerId]
  );

  if (rows[0]) {
    return {
      id_cashback: rows[0].id_cashback,
      value: Number(rows[0].value || 0)
    };
  }

  const [insertResult] = await connection.query(
    'INSERT INTO Cashback (id_customer_fk, value) VALUES (?, 0)',
    [normalizedCustomerId]
  );

  return {
    id_cashback: insertResult.insertId,
    value: 0
  };
};

const redeemCashbackForCheckout = async (connection, { customerId, checkoutId, amountUsd }) => {
  const normalizedAmountUsd = roundAmount(amountUsd, 2);

  if (normalizedAmountUsd <= 0) {
    return 0;
  }

  const cashback = await getCustomerCashbackBalanceForUpdate(connection, customerId);
  const amountToRedeemUsd = roundAmount(Math.min(cashback.value, normalizedAmountUsd), 2);

  if (amountToRedeemUsd <= 0) {
    return 0;
  }

  await connection.query(
    `UPDATE Cashback
     SET value = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id_cashback = ?`,
    [roundAmount(cashback.value - amountToRedeemUsd, 2), cashback.id_cashback]
  );

  await connection.query(
    `INSERT INTO Cashback_History (
       id_cashback_fk,
       id_transaction_fk,
       value,
       transaction_type,
       created_at
     )
     VALUES (?, ?, ?, 'redemption', CURRENT_TIMESTAMP)`,
    [cashback.id_cashback, encodeCheckoutCashbackRef(checkoutId), amountToRedeemUsd]
  );

  return amountToRedeemUsd;
};

const restoreRedeemedCashbackForGroup = async (connection, group, reason) => {
  const checkoutRedemptionMap = await getCheckoutCashbackRedemptionMap(connection, [group.id_checkout_fk]);
  const checkoutRedemptionUsd = roundAmount(checkoutRedemptionMap.get(group.id_checkout_fk) || 0, 2);

  if (checkoutRedemptionUsd <= 0) {
    return 0;
  }

  const [checkoutGroupRows] = await connection.query(
    `SELECT id_purchase_group, subtotal_usd
     FROM Purchase_Group
     WHERE id_checkout_fk = ?
     ORDER BY id_purchase_group ASC`,
    [group.id_checkout_fk]
  );

  const distributedRedemption = distributeAmountAcrossEntries(
    checkoutGroupRows.map((row) => ({ id: row.id_purchase_group, subtotal_usd: Number(row.subtotal_usd || 0) })),
    checkoutRedemptionUsd,
    (entry) => entry.subtotal_usd
  );
  const groupRedemptionUsd = roundAmount(distributedRedemption.get(group.id_purchase_group) || 0, 2);

  if (groupRedemptionUsd <= 0) {
    return 0;
  }

  const restoredMap = await getGroupCashbackRestoreMap(connection, [group.id_purchase_group]);
  const alreadyRestoredUsd = roundAmount(restoredMap.get(group.id_purchase_group) || 0, 2);
  const restorableUsd = roundAmount(Math.max(groupRedemptionUsd - alreadyRestoredUsd, 0), 2);

  if (restorableUsd <= 0) {
    return 0;
  }

  const cashback = await getCustomerCashbackBalanceForUpdate(connection, group.id_customer_fk);

  await connection.query(
    `UPDATE Cashback
     SET value = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id_cashback = ?`,
    [roundAmount(cashback.value + restorableUsd, 2), cashback.id_cashback]
  );

  await connection.query(
    `INSERT INTO Cashback_History (
       id_cashback_fk,
       id_transaction_fk,
       value,
       transaction_type,
       created_at
     )
     VALUES (?, ?, ?, 'acumulate', CURRENT_TIMESTAMP)`,
    [cashback.id_cashback, encodeGroupCashbackRef(group.id_purchase_group), restorableUsd]
  );

  return restorableUsd;
};

const listCompanyPaymentMethods = async (companyId) => {
  const normalizedCompanyId = Number(companyId);
  const [rows] = await pool.query(
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
     ORDER BY is_active DESC, label ASC, id_payment_method DESC`,
    [normalizedCompanyId]
  );

  return rows.map((row) => ({
    ...row,
    is_active: Boolean(row.is_active)
  }));
};

const createCompanyPaymentMethod = async (companyId, payload) => {
  const normalizedCompanyId = Number(companyId);
  const methodType = String(payload?.method_type || '').trim();
  const label = String(payload?.label || '').trim();

  if (!methodType) {
    throw new Error('method_type es requerido');
  }

  if (!label) {
    throw new Error('label es requerido');
  }

  const [result] = await pool.query(
    `INSERT INTO Company_Payment_Method (
       id_company_fk,
       method_type,
       label,
       account_holder,
       account_number,
       bank_name,
       instructions
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      normalizedCompanyId,
      methodType,
      label,
      String(payload?.account_holder || '').trim() || null,
      String(payload?.account_number || '').trim() || null,
      String(payload?.bank_name || '').trim() || null,
      String(payload?.instructions || '').trim() || null
    ]
  );

  const [rows] = await pool.query(
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
     WHERE id_payment_method = ?
     LIMIT 1`,
    [result.insertId]
  );

  return rows[0]
    ? { ...rows[0], is_active: Boolean(rows[0].is_active) }
    : null;
};

const reserveStockForItem = async (connection, item, groupId) => {
  const previousQuantity = Number(item.stock_quantity);
  const newQuantity = previousQuantity - item.quantity;

  await connection.query(
    'UPDATE Stock SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id_stock = ?',
    [newQuantity, item.id_stock]
  );

  await connection.query(
    `INSERT INTO Stock_History (
       id_stock_fk,
       quantity_change,
       previous_quantity,
       new_quantity,
       movement_type,
       notes
     )
     VALUES (?, ?, ?, ?, 'RESERVATION', ?)`,
    [
      item.id_stock,
      -item.quantity,
      previousQuantity,
      newQuantity,
      `Reserva por grupo de compra #${groupId}`
    ]
  );
};

const releaseReservedStockForGroup = async (connection, groupId, reason) => {
  const [rows] = await connection.query(
    `SELECT pi.quantity,
            pi.id_product_fk,
            p.name AS product_name,
            s.id_stock,
            s.quantity AS stock_quantity
     FROM Purchase_Item pi
     INNER JOIN Stock s ON s.id_product_fk = pi.id_product_fk
     INNER JOIN Product p ON p.id_product = pi.id_product_fk
     WHERE pi.id_purchase_group_fk = ?
     FOR UPDATE`,
    [groupId]
  );

  for (const row of rows) {
    const previousQuantity = Number(row.stock_quantity || 0);
    const quantityToRelease = Number(row.quantity || 0);
    const newQuantity = previousQuantity + quantityToRelease;

    await connection.query(
      'UPDATE Stock SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id_stock = ?',
      [newQuantity, row.id_stock]
    );

    await connection.query(
      `INSERT INTO Stock_History (
         id_stock_fk,
         quantity_change,
         previous_quantity,
         new_quantity,
         movement_type,
         notes
       )
       VALUES (?, ?, ?, ?, 'RESERVATION_RELEASE', ?)`,
      [
        row.id_stock,
        quantityToRelease,
        previousQuantity,
        newQuantity,
        `${reason} del grupo de compra #${groupId}`
      ]
    );
  }
};

const applyCashbackForApprovedGroup = async (connection, group) => {
  const customerId = Number(group.id_customer_fk);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new Error('Grupo sin customer valido para cashback');
  }

  const [itemRows] = await connection.query(
    `SELECT id_purchase_item, subtotal_usd
     FROM Purchase_Item
     WHERE id_purchase_group_fk = ?
     ORDER BY id_purchase_item ASC`,
    [group.id_purchase_group]
  );

  if (!itemRows.length) {
    return;
  }

  const cashbackItems = itemRows
    .map((item) => ({
      id_purchase_item: item.id_purchase_item,
      cashback_value: roundAmount(Number(item.subtotal_usd || 0) * PURCHASE_CASHBACK_RATE, 2)
    }))
    .filter((item) => item.cashback_value > 0);

  if (!cashbackItems.length) {
    return;
  }

  const [cashbackRows] = await connection.query(
    `SELECT id_cashback, value
     FROM Cashback
     WHERE id_customer_fk = ?
     LIMIT 1
     FOR UPDATE`,
    [customerId]
  );

  let cashbackId = cashbackRows[0]?.id_cashback || null;
  let currentCashbackValue = Number(cashbackRows[0]?.value || 0);

  if (!cashbackId) {
    const [insertResult] = await connection.query(
      'INSERT INTO Cashback (id_customer_fk, value) VALUES (?, 0)',
      [customerId]
    );

    cashbackId = insertResult.insertId;
    currentCashbackValue = 0;
  }

  const cashbackTotal = cashbackItems.reduce(
    (total, item) => roundAmount(total + item.cashback_value, 2),
    0
  );

  await connection.query(
    `UPDATE Cashback
     SET value = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id_cashback = ?`,
    [roundAmount(currentCashbackValue + cashbackTotal, 2), cashbackId]
  );

  for (const cashbackItem of cashbackItems) {
    await connection.query(
      `INSERT INTO Cashback_History (
         id_cashback_fk,
         id_transaction_fk,
         value,
         transaction_type,
         created_at
       )
       VALUES (?, ?, ?, 'acumulate', CURRENT_TIMESTAMP)`,
      [cashbackId, cashbackItem.id_purchase_item, cashbackItem.cashback_value]
    );
  }
};

const syncCheckoutStatus = async (connection, checkoutId) => {
  const [rows] = await connection.query(
    'SELECT status FROM Purchase_Group WHERE id_checkout_fk = ?',
    [checkoutId]
  );

  if (!rows.length) {
    return null;
  }

  const statuses = rows.map((row) => row.status);
  let nextStatus = 'OPEN';

  if (statuses.every((status) => status === 'APPROVED')) {
    nextStatus = 'COMPLETED';
  } else if (statuses.every((status) => PURCHASE_GROUP_FINAL_STATUSES.has(status))) {
    nextStatus = 'COMPLETED_WITH_INCIDENTS';
  } else if (statuses.includes('APPROVED')) {
    nextStatus = 'PARTIAL_APPROVED';
  } else if (statuses.includes('PAYMENT_SUBMITTED')) {
    nextStatus = 'PARTIAL_SUBMITTED';
  }

  await connection.query(
    'UPDATE Purchase_Checkout SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id_checkout = ?',
    [nextStatus, checkoutId]
  );

  return nextStatus;
};

const getGroupForActor = async (connection, { groupId, companyId = null, isAdmin = false, customerId = null }) => {
  const params = [groupId];
  const whereClauses = ['pg.id_purchase_group = ?'];

  if (!isAdmin && Number.isInteger(Number(companyId)) && Number(companyId) > 0) {
    whereClauses.push('pg.id_company_fk = ?');
    params.push(Number(companyId));
  }

  if (Number.isInteger(Number(customerId)) && Number(customerId) > 0) {
    whereClauses.push('pc.id_customer_fk = ?');
    params.push(Number(customerId));
  }

  const rows = await getGroupRows(connection, `WHERE ${whereClauses.join(' AND ')}`, params);
  return rows[0] || null;
};

const getHydratedGroupById = async (connection, groupId, actorFilter = {}) => {
  const groupRow = await getGroupForActor(connection, { groupId, ...actorFilter });

  if (!groupRow) {
    return null;
  }

  const hydratedGroups = await hydrateGroupCollection(connection, [groupRow]);
  return hydratedGroups[0] || null;
};

const createCheckoutFromCart = async (customerId, options = {}) => {
  const normalizedCustomerId = Number(customerId);
  const useCashbackRequested = Boolean(options?.useCashback);
  const cart = await getCart(normalizedCustomerId);

  if (!Array.isArray(cart.items) || !cart.items.length) {
    throw new Error('El carrito esta vacio');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const exchangeRate = await getLatestExchangeRateForConnection(connection);
    const cartItems = cart.items.map((item) => ({
      id_product: Number(item.id_product),
      quantity: Number(item.quantity)
    }));
    const cartQuantityByProductId = new Map(cartItems.map((item) => [item.id_product, item.quantity]));
    const productIds = cartItems.map((item) => item.id_product);
    const productRows = await getProductsForCheckout(connection, productIds);
    const productById = new Map(productRows.map((product) => [product.id_product, product]));

    const normalizedItems = cartItems.map((item) => {
      const product = productById.get(item.id_product);

      if (!product) {
        throw new Error(`Producto no disponible: ${item.id_product}`);
      }

      if (!product.is_active) {
        throw new Error(`Producto inactivo: ${product.name}`);
      }

      if (!product.id_stock) {
        throw new Error(`Producto sin stock configurado: ${product.name}`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const unitPriceUsd = roundAmount(product.price, 2);
      const unitPriceBs = roundAmount(unitPriceUsd * exchangeRate.rate_bs_per_usd, 2);
      const subtotalUsd = roundAmount(unitPriceUsd * item.quantity, 2);
      const subtotalBs = roundAmount(unitPriceBs * item.quantity, 2);

      return {
        id_product: item.id_product,
        quantity: cartQuantityByProductId.get(item.id_product),
        id_company_fk: product.id_company_fk,
        company_name: product.company_name,
        name: product.name,
        id_stock: product.id_stock,
        stock_quantity: product.stock_quantity,
        unit_price_usd_snapshot: unitPriceUsd,
        unit_price_bs_snapshot: unitPriceBs,
        subtotal_usd: subtotalUsd,
        subtotal_bs: subtotalBs
      };
    });

    const totals = normalizedItems.reduce(
      (accumulator, item) => ({
        total_usd: roundAmount(accumulator.total_usd + item.subtotal_usd, 2),
        total_bs: roundAmount(accumulator.total_bs + item.subtotal_bs, 2)
      }),
      { total_usd: 0, total_bs: 0 }
    );

    let useCashback = useCashbackRequested;

    if (!useCashback) {
      const cashbackBalance = await getCustomerCashbackBalanceForUpdate(connection, normalizedCustomerId);
      useCashback = roundAmount(cashbackBalance.value, 2) >= roundAmount(totals.total_usd, 2);
    }

    const checkoutCreatedAt = new Date();
    const paymentDueAt = createGroupPaymentDueAt(checkoutCreatedAt);

    const [checkoutResult] = await connection.query(
      `INSERT INTO Purchase_Checkout (
         id_customer_fk,
         id_exchange_rate_fk,
         exchange_rate_snapshot,
         total_usd,
         total_bs,
         status
       )
       VALUES (?, ?, ?, ?, ?, 'OPEN')`,
      [
        normalizedCustomerId,
        exchangeRate.id_exchange_rate,
        exchangeRate.rate_bs_per_usd,
        totals.total_usd,
        totals.total_bs
      ]
    );

    const checkoutId = checkoutResult.insertId;
    const orderCode = buildOrderCode(checkoutId, checkoutCreatedAt);
    const cashbackRedeemedUsd = useCashback
      ? await redeemCashbackForCheckout(connection, {
          customerId: normalizedCustomerId,
          checkoutId,
          amountUsd: totals.total_usd
        })
      : 0;
    const cashbackRedeemedBs = roundAmount(cashbackRedeemedUsd * exchangeRate.rate_bs_per_usd, 2);
    const groupedItems = new Map();

    for (const item of normalizedItems) {
      const currentGroupItems = groupedItems.get(item.id_company_fk) || [];
      currentGroupItems.push(item);
      groupedItems.set(item.id_company_fk, currentGroupItems);
    }

    const groupedCheckoutEntries = [...groupedItems.entries()].map(([companyId, items]) => {
      const subtotal_usd = roundAmount(
        items.reduce((sum, item) => sum + Number(item.subtotal_usd || 0), 0),
        2
      );

      return {
        id: Number(companyId),
        companyId: Number(companyId),
        items,
        subtotal_usd
      };
    });
    const cashbackByCompanyId = distributeAmountAcrossEntries(
      groupedCheckoutEntries,
      cashbackRedeemedUsd,
      (entry) => entry.subtotal_usd
    );

    const createdGroupIds = [];

    for (const [companyId, items] of groupedItems.entries()) {
      const groupTotals = items.reduce(
        (accumulator, item) => ({
          subtotal_usd: roundAmount(accumulator.subtotal_usd + item.subtotal_usd, 2),
          subtotal_bs: roundAmount(accumulator.subtotal_bs + item.subtotal_bs, 2)
        }),
        { subtotal_usd: 0, subtotal_bs: 0 }
      );

      const [groupResult] = await connection.query(
        `INSERT INTO Purchase_Group (
           id_checkout_fk,
           id_company_fk,
           subtotal_usd,
           subtotal_bs,
           status,
           payment_due_at
         )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          checkoutId,
          companyId,
          groupTotals.subtotal_usd,
          groupTotals.subtotal_bs,
          roundAmount(groupTotals.subtotal_usd - Number(cashbackByCompanyId.get(Number(companyId)) || 0), 2) <= 0
            ? 'APPROVED'
            : 'PENDING_PAYMENT',
          paymentDueAt
        ]
      );

      const groupId = groupResult.insertId;
      createdGroupIds.push(groupId);

      for (const item of items) {
        await connection.query(
          `INSERT INTO Purchase_Item (
             id_purchase_group_fk,
             id_product_fk,
             quantity,
             unit_price_usd_snapshot,
             unit_price_bs_snapshot,
             subtotal_usd,
             subtotal_bs
           )
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            groupId,
            item.id_product,
            item.quantity,
            item.unit_price_usd_snapshot,
            item.unit_price_bs_snapshot,
            item.subtotal_usd,
            item.subtotal_bs
          ]
        );

        await reserveStockForItem(connection, item, groupId);
      }

      const groupCashbackRedeemedUsd = roundAmount(cashbackByCompanyId.get(Number(companyId)) || 0, 2);
      const groupPayableUsd = roundAmount(groupTotals.subtotal_usd - groupCashbackRedeemedUsd, 2);

      if (groupPayableUsd <= 0) {
        await connection.query(
          `UPDATE Purchase_Group
           SET reviewed_at = CURRENT_TIMESTAMP,
               review_note = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id_purchase_group = ?`,
          ['Pago cubierto completamente con cashback', groupId]
        );

        await applyCashbackForApprovedGroup(connection, {
          id_purchase_group: groupId,
          id_customer_fk: normalizedCustomerId
        });
      }
    }

    await syncCheckoutStatus(connection, checkoutId);
    await connection.commit();
    await clearCart(normalizedCustomerId);

    const readConnection = await pool.getConnection();

    try {
      const [checkoutRows] = await readConnection.query(
        `SELECT id_checkout,
                id_exchange_rate_fk,
                exchange_rate_snapshot,
                total_usd,
                total_bs,
                status,
                created_at,
                updated_at
         FROM Purchase_Checkout
         WHERE id_checkout = ?
         LIMIT 1`,
        [checkoutId]
      );

      const groupRows = await getGroupRows(
        readConnection,
        `WHERE pg.id_purchase_group IN (${buildInClause(createdGroupIds)})`,
        createdGroupIds
      );
      const hydratedGroups = await hydrateGroupCollection(readConnection, groupRows);
      const enrichedGroups = enrichPurchaseGroupsWithDerivedCheckoutData(
        hydratedGroups,
        new Map([[checkoutId, cashbackRedeemedUsd]]),
        new Map()
      );
      const checkoutRow = checkoutRows[0];

      return {
        id_checkout: checkoutRow.id_checkout,
        order_code: orderCode,
        id_exchange_rate: checkoutRow.id_exchange_rate_fk,
        exchange_rate_snapshot: Number(checkoutRow.exchange_rate_snapshot),
        total_usd: Number(checkoutRow.total_usd),
        total_bs: Number(checkoutRow.total_bs),
        cashback_redeemed_usd: cashbackRedeemedUsd,
        cashback_redeemed_bs: cashbackRedeemedBs,
        total_payable_usd: roundAmount(Number(checkoutRow.total_usd || 0) - cashbackRedeemedUsd, 2),
        total_payable_bs: roundAmount(Number(checkoutRow.total_bs || 0) - cashbackRedeemedBs, 2),
        status: checkoutRow.status,
        created_at: checkoutRow.created_at,
        updated_at: checkoutRow.updated_at,
        groups: enrichedGroups
      };
    } finally {
      readConnection.release();
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const submitPurchaseEvidence = async ({ customerId, groupId, file, note }) => {
  const normalizedCustomerId = Number(customerId);
  const normalizedGroupId = Number(groupId);

  if (!file) {
    throw new Error('La evidencia es requerida');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const group = await getGroupForActor(connection, {
      groupId: normalizedGroupId,
      customerId: normalizedCustomerId
    });

    if (!group) {
      throw new Error('Grupo de compra no encontrado');
    }

    if (group.status !== 'PENDING_PAYMENT') {
      throw new Error('El grupo no permite cargar evidencia');
    }

    const fileUrl = `/uploads/purchases/evidences/${file.filename}`;

    await connection.query(
      `INSERT INTO Purchase_Evidence (
         id_purchase_group_fk,
         file_url,
         original_name,
         mime_type,
         note,
         review_status
       )
       VALUES (?, ?, ?, ?, ?, 'SUBMITTED')`,
      [
        normalizedGroupId,
        fileUrl,
        file.originalname || null,
        file.mimetype || null,
        String(note || '').trim() || null
      ]
    );

    await connection.query(
      `UPDATE Purchase_Group
       SET status = 'PAYMENT_SUBMITTED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id_purchase_group = ?`,
      [normalizedGroupId]
    );

    await syncCheckoutStatus(connection, group.id_checkout_fk);
    await connection.commit();

    return getHydratedGroupById(connection, normalizedGroupId, { customerId: normalizedCustomerId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const approvePurchaseGroup = async ({ companyId, groupId, reviewNote, isAdmin = false }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const group = await getGroupForActor(connection, {
      groupId,
      companyId,
      isAdmin
    });

    if (!group) {
      throw new Error('Grupo de compra no encontrado');
    }

    if (group.status !== 'PAYMENT_SUBMITTED') {
      throw new Error('El grupo no puede aprobarse');
    }

    await applyCashbackForApprovedGroup(connection, group);

    await connection.query(
      `UPDATE Purchase_Group
       SET status = 'APPROVED',
           reviewed_at = CURRENT_TIMESTAMP,
           review_note = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_purchase_group = ?`,
      [String(reviewNote || '').trim() || null, group.id_purchase_group]
    );

    await connection.query(
      `UPDATE Purchase_Evidence
       SET review_status = 'APPROVED',
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id_purchase_group_fk = ?
         AND review_status = 'SUBMITTED'`,
      [group.id_purchase_group]
    );

    await syncCheckoutStatus(connection, group.id_checkout_fk);
    await connection.commit();

    return getHydratedGroupById(connection, group.id_purchase_group, { companyId, isAdmin });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const rejectPurchaseGroup = async ({ companyId, groupId, reviewNote, isAdmin = false }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const group = await getGroupForActor(connection, {
      groupId,
      companyId,
      isAdmin
    });

    if (!group) {
      throw new Error('Grupo de compra no encontrado');
    }

    if (group.status !== 'PAYMENT_SUBMITTED') {
      throw new Error('El grupo no puede rechazarse');
    }

    await releaseReservedStockForGroup(connection, group.id_purchase_group, 'Liberacion por rechazo');
    await restoreRedeemedCashbackForGroup(connection, group, 'Reintegro por rechazo');

    await connection.query(
      `UPDATE Purchase_Group
       SET status = 'REJECTED',
           reviewed_at = CURRENT_TIMESTAMP,
           review_note = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_purchase_group = ?`,
      [String(reviewNote || '').trim() || null, group.id_purchase_group]
    );

    await connection.query(
      `UPDATE Purchase_Evidence
       SET review_status = 'REJECTED',
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id_purchase_group_fk = ?
         AND review_status = 'SUBMITTED'`,
      [group.id_purchase_group]
    );

    await syncCheckoutStatus(connection, group.id_checkout_fk);
    await connection.commit();

    return getHydratedGroupById(connection, group.id_purchase_group, { companyId, isAdmin });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const expirePurchaseGroup = async ({ companyId, groupId, isAdmin = false }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const group = await getGroupForActor(connection, {
      groupId,
      companyId,
      isAdmin
    });

    if (!group) {
      throw new Error('Grupo de compra no encontrado');
    }

    if (group.status !== 'PENDING_PAYMENT') {
      throw new Error('El grupo no puede expirar');
    }

    await releaseReservedStockForGroup(connection, group.id_purchase_group, 'Liberacion por expiracion');
    await restoreRedeemedCashbackForGroup(connection, group, 'Reintegro por expiracion');

    await connection.query(
      `UPDATE Purchase_Group
       SET status = 'EXPIRED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id_purchase_group = ?`,
      [group.id_purchase_group]
    );

    await syncCheckoutStatus(connection, group.id_checkout_fk);
    await connection.commit();

    return getHydratedGroupById(connection, group.id_purchase_group, { companyId, isAdmin });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createCheckoutFromCart,
  listCustomerCheckouts,
  listCompanyGroups,
  listCompanyPaymentMethods,
  createCompanyPaymentMethod,
  submitPurchaseEvidence,
  approvePurchaseGroup,
  rejectPurchaseGroup,
  expirePurchaseGroup
};