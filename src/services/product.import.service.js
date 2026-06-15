const path = require('node:path');
const fs = require('node:fs');
const XLSX = require('xlsx');
const pool = require('../config/db');
const { listLineReferences, createProductFromReference } = require('./products.service');

const PRODUCT_UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads/products');
const DEFAULT_PRODUCT_IMAGE_PATH = 'default/producto_default.png';

const HEADER_ALIASES = {
  name: ['nombre del producto', 'nombre producto', 'product name', 'nombre'],
  brand: ['marca del producto', 'marca', 'brand'],
  price: ['precio en decimales', 'precio', 'price'],
  quantity: ['cantidad disponible', 'cantidad', 'stock', 'stock disponible'],
  min_stock: ['stock minimo', 'stock mínimo', 'min stock', 'stock minimo recomendado'],
  attributes: ['atributos', 'attributes'],
  description: ['descripcion', 'descripción', 'description'],
  source_code: ['source_code', 'codigo fuente', 'código fuente', 'codigo', 'sku externo', 'sku'],
  line_name: ['line_name', 'linea', 'línea', 'nombre linea', 'nombre línea'],
  main_image: ['main_image', 'imagen principal', 'imagen_principal'],
  secondary_images: ['secondary_images', 'imagenes secundarias', 'imágenes secundarias', 'imagenes_secundarias']
};

const normalizeForMatch = (value) => String(value ?? '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replaceAll('?', '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const normalizeHeaderKey = (value) => normalizeForMatch(value).replace(/\s+/g, ' ');

const toSnakeCaseSlug = (value) => normalizeForMatch(value).replace(/\s+/g, '_');

const buildDefaultSubcategoryImageName = (subcategoryName) => {
  const slug = toSnakeCaseSlug(subcategoryName);
  if (!slug) {
    return `/uploads/products/${DEFAULT_PRODUCT_IMAGE_PATH}`;
  }

  const subcategoryDefaultImageName = `${slug}_default.png`;
  const subcategoryDefaultImagePath = path.join(PRODUCT_UPLOADS_DIR, 'default', subcategoryDefaultImageName);

  if (fs.existsSync(subcategoryDefaultImagePath)) {
    return `/uploads/products/default/${subcategoryDefaultImageName}`;
  }

  return `/uploads/products/${DEFAULT_PRODUCT_IMAGE_PATH}`;
};

const parseSecondaryImagesInput = (value) => {
  if (value == null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((imageName) => String(imageName || '').trim())
      .filter(Boolean)
      .slice(0, 7);
  }

  return String(value)
    .split(/[;,|]/)
    .map((imageName) => imageName.trim())
    .filter(Boolean)
    .slice(0, 7);
};

const parseDecimal = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const normalizedValue = String(value).trim().replace(/\s+/g, '').replaceAll(',', '.');
  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
};

const parsePositiveInteger = (value, allowZero = true) => {
  if (value == null || value === '') {
    return null;
  }

  const parsedValue = Number(String(value).trim().split(',').join('.'));

  if (!Number.isInteger(parsedValue) || parsedValue < 0 || (!allowZero && parsedValue <= 0)) {
    return null;
  }

  return parsedValue;
};

const parseFlexibleAttributes = (attributesInput) => {
  if (attributesInput == null || attributesInput === '') {
    return { value: {}, warnings: [] };
  }

  if (typeof attributesInput === 'object' && !Array.isArray(attributesInput)) {
    return { value: attributesInput, warnings: [] };
  }

  const rawText = String(attributesInput).trim();

  if (!rawText) {
    return { value: {}, warnings: [] };
  }

  if (rawText.startsWith('{') || rawText.startsWith('[')) {
    try {
      const parsedJson = JSON.parse(rawText);

      if (!parsedJson || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        return {
          value: {},
          warnings: ['El campo de atributos debe ser un objeto JSON válido']
        };
      }

      return { value: parsedJson, warnings: [] };
    } catch (error) {
      if (error instanceof Error) {
        return {
          value: {},
          warnings: ['El campo de atributos debe ser un objeto JSON válido']
        };
      }

      return {
        value: {},
        warnings: ['El campo de atributos debe ser un objeto JSON válido']
      };
    }
  }

  const attributes = {};
  const warnings = [];
  const segments = rawText
    .split(/[;|]/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  segments.forEach((segment) => {
    const separatorRegex = /^([^:=]+)[:=](.+)$/;
    const separatorMatch = separatorRegex.exec(segment);

    if (!separatorMatch) {
      warnings.push(`Atributo ignorado: "${segment}"`);
      return;
    }

    const key = normalizeForMatch(separatorMatch[1]);
    const value = String(separatorMatch[2] ?? '').trim();

    if (!key || !value) {
      warnings.push(`Atributo incompleto: "${segment}"`);
      return;
    }

    attributes[key] = value;
  });

  if (!Object.keys(attributes).length) {
    warnings.push('No se pudieron extraer atributos con el formato key:value;key:value');
  }

  return { value: attributes, warnings };
};

const levenshteinDistance = (left, right) => {
  const source = String(left ?? '');
  const target = String(right ?? '');

  if (!source.length) {
    return target.length;
  }

  if (!target.length) {
    return source.length;
  }

  const matrix = Array.from({ length: target.length + 1 }, (_, rowIndex) => {
    if (rowIndex === 0) {
      return Array.from({ length: source.length + 1 }, (_value, columnIndex) => columnIndex);
    }

    return new Array(source.length + 1).fill(0);
  });

  for (let rowIndex = 1; rowIndex <= target.length; rowIndex += 1) {
    matrix[rowIndex][0] = rowIndex;

    for (let columnIndex = 1; columnIndex <= source.length; columnIndex += 1) {
      const substitutionCost = source[columnIndex - 1] === target[rowIndex - 1] ? 0 : 1;

      matrix[rowIndex][columnIndex] = Math.min(
        matrix[rowIndex][columnIndex - 1] + 1,
        matrix[rowIndex - 1][columnIndex] + 1,
        matrix[rowIndex - 1][columnIndex - 1] + substitutionCost
      );
    }
  }

  return matrix[target.length][source.length];
};

const similarityScore = (left, right) => {
  const source = normalizeForMatch(left);
  const target = normalizeForMatch(right);

  if (!source.length && !target.length) {
    return 100;
  }

  if (!source.length || !target.length) {
    return 0;
  }

  if (source === target) {
    return 100;
  }

  if (source.includes(target) || target.includes(source)) {
    return Math.max(95, Math.min(100, Math.round((Math.min(source.length, target.length) / Math.max(source.length, target.length)) * 100)));
  }

  const maxLength = Math.max(source.length, target.length);
  const distance = levenshteinDistance(source, target);

  return Math.max(0, Math.min(100, Math.round(((maxLength - distance) / maxLength) * 100)));
};

const resolveHeaderValue = (row, aliases) => {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    const normalizedKey = normalizeHeaderKey(key);

    if (aliases.some((alias) => normalizeHeaderKey(alias) === normalizedKey)) {
      return value;
    }
  }

  return '';
};

const toCanonicalRow = (row) => ({
  source_code: String(resolveHeaderValue(row, HEADER_ALIASES.source_code)).trim(),
  name: String(resolveHeaderValue(row, HEADER_ALIASES.name)).trim(),
  brand: String(resolveHeaderValue(row, HEADER_ALIASES.brand)).trim(),
  price: resolveHeaderValue(row, HEADER_ALIASES.price),
  quantity: resolveHeaderValue(row, HEADER_ALIASES.quantity),
  min_stock: resolveHeaderValue(row, HEADER_ALIASES.min_stock),
  attributes: resolveHeaderValue(row, HEADER_ALIASES.attributes),
  description: String(resolveHeaderValue(row, HEADER_ALIASES.description)).trim(),
  line_name: String(resolveHeaderValue(row, HEADER_ALIASES.line_name)).trim(),
  main_image: String(resolveHeaderValue(row, HEADER_ALIASES.main_image)).trim(),
  secondary_images: resolveHeaderValue(row, HEADER_ALIASES.secondary_images)
});

const buildLineCandidates = (lineReferences) => lineReferences.map((line) => {
  const searchText = [line.name, line.subcategory_name, line.category_name]
    .filter(Boolean)
    .join(' ');

  return {
    id_line: line.id_line,
    line_name: line.name,
    category_id: line.id_category,
    category_name: line.category_name,
    subcategory_id: line.id_subcategory_fk,
    subcategory_name: line.subcategory_name,
    search_text: searchText,
    normalized_search_text: normalizeForMatch(searchText)
  };
});

const findBestLineMatch = (inputName, lineReferences) => {
  const normalizedInput = normalizeForMatch(inputName);

  if (!normalizedInput) {
    return {
      bestMatch: null,
      alternatives: [],
      confidence: 0,
      status: 'pending_review'
    };
  }

  const scoredCandidates = buildLineCandidates(lineReferences)
    .map((candidate) => {
      const score = similarityScore(normalizedInput, candidate.normalized_search_text);
      let matchMethod = 'review_needed';

      if (score >= 100) {
        matchMethod = 'exact_match';
      } else if (score >= 90) {
        matchMethod = 'fuzzy_match';
      }

      return {
        ...candidate,
        confidence: score,
        match_method: matchMethod
      };
    })
    .sort((left, right) => right.confidence - left.confidence || left.line_name.localeCompare(right.line_name));

  const bestMatch = scoredCandidates[0] ?? null;
  const alternatives = scoredCandidates.slice(1, 4);

  if (!bestMatch) {
    return {
      bestMatch: null,
      alternatives,
      confidence: 0,
      status: 'pending_review'
    };
  }

  return {
    bestMatch,
    alternatives,
    confidence: bestMatch.confidence,
    status: bestMatch.confidence >= 90 ? 'auto_matched' : 'pending_review'
  };
};

const validateCompanyExists = async (companyId) => {
  const [rows] = await pool.query(
    'SELECT id_company, name FROM Company WHERE id_company = ? LIMIT 1',
    [companyId]
  );

  return rows[0] ?? null;
};

const createImportBatchFromSpreadsheet = async ({
  file,
  companyId,
  createdByCompanyId
}) => {
  if (!file) {
    throw new Error('Archivo requerido');
  }

  const company = await validateCompanyExists(companyId);

  if (!company) {
    throw new Error('Empresa no existe');
  }

  const workbook = XLSX.read(file.buffer, {
    type: 'buffer',
    cellDates: true
  });

  if (!workbook.SheetNames.length) {
    throw new Error('El archivo no contiene hojas válidas');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    blankrows: false,
    raw: false
  });

  if (!rawRows.length) {
    throw new Error('El archivo no contiene filas de productos');
  }

  const lineReferences = await listLineReferences();

  if (!lineReferences.length) {
    throw new Error('No existen líneas disponibles para clasificar los productos');
  }

  const processedRows = rawRows.map((row, index) => {
    const rowNumber = index + 2;
    const canonicalRow = toCanonicalRow(row);
    const attributeResult = parseFlexibleAttributes(canonicalRow.attributes);
    const normalizedName = canonicalRow.name ? canonicalRow.name.trim() : '';
    const normalizedBrand = canonicalRow.brand ? canonicalRow.brand.trim() : '';
    const price = parseDecimal(canonicalRow.price);
    const quantity = parsePositiveInteger(canonicalRow.quantity, true);
    const minStock = parsePositiveInteger(canonicalRow.min_stock, true) ?? 0;
    const lineSearchInput = canonicalRow.line_name || normalizedName;
    const lineMatch = findBestLineMatch(lineSearchInput, lineReferences);
    const defaultMainImage = buildDefaultSubcategoryImageName(lineMatch.bestMatch?.subcategory_name);
    const providedMainImage = String(canonicalRow.main_image || '').trim();
    const secondaryImages = parseSecondaryImagesInput(canonicalRow.secondary_images);
    const warnings = [...attributeResult.warnings];
    const errors = [];

    if (!normalizedName) {
      errors.push('Nombre del producto requerido');
    }

    if (price == null) {
      errors.push('Precio inválido');
    }

    if (quantity == null) {
      errors.push('Cantidad disponible inválida');
    }

    if (lineMatch.status === 'pending_review') {
      warnings.push('La línea detectada requiere revisión manual');
    }

    if (!providedMainImage && !lineMatch.bestMatch?.subcategory_name) {
      warnings.push('Se asignó imagen por defecto genérica por falta de subcategoría detectada');
    }

    const sourceCode = canonicalRow.source_code || `IMP-${Date.now()}-${String(rowNumber).padStart(3, '0')}`;
    const validationStatus = errors.length > 0 ? 'invalid' : lineMatch.status;
    const reviewRequired = validationStatus !== 'auto_matched' || warnings.length > 0;

    return {
      row_number: rowNumber,
      source_code: sourceCode,
      raw_data: {
        name: canonicalRow.name,
        brand: canonicalRow.brand,
        price: canonicalRow.price,
        quantity: canonicalRow.quantity,
        min_stock: canonicalRow.min_stock,
        attributes: canonicalRow.attributes,
        description: canonicalRow.description,
        line_name: canonicalRow.line_name,
        main_image: canonicalRow.main_image,
        secondary_images: canonicalRow.secondary_images
      },
      normalized: {
        name: normalizedName,
        brand: normalizedBrand,
        price,
        quantity,
        min_stock: minStock,
        description: canonicalRow.description || null,
        attributes: attributeResult.value
      },
      staging_images: {
        main_image: providedMainImage || defaultMainImage,
        main_image_source: providedMainImage ? 'provided' : 'subcategory_default',
        secondary_images: secondaryImages
      },
      classification: {
        line: lineMatch.bestMatch ? {
          id_line: lineMatch.bestMatch.id_line,
          name: lineMatch.bestMatch.line_name,
          subcategory_id: lineMatch.bestMatch.subcategory_id,
          subcategory_name: lineMatch.bestMatch.subcategory_name,
          category_id: lineMatch.bestMatch.category_id,
          category_name: lineMatch.bestMatch.category_name,
          confidence: lineMatch.bestMatch.confidence,
          match_method: lineMatch.bestMatch.match_method
        } : null,
        alternatives: lineMatch.alternatives.map((alternative) => ({
          id_line: alternative.id_line,
          name: alternative.line_name,
          subcategory_id: alternative.subcategory_id,
          subcategory_name: alternative.subcategory_name,
          category_id: alternative.category_id,
          category_name: alternative.category_name,
          confidence: alternative.confidence,
          match_method: alternative.match_method
        }))
      },
      validation: {
        status: validationStatus,
        review_required: reviewRequired,
        warnings,
        errors
      }
    };
  });

  const totalRows = processedRows.length;
  const invalidRows = processedRows.filter((row) => row.validation.status === 'invalid').length;
  const autoMatchedRows = processedRows.filter((row) => row.validation.status === 'auto_matched').length;
  const pendingReviewRows = processedRows.filter((row) => row.validation.status === 'pending_review').length;
  const validatedRows = totalRows - invalidRows;
  let batchStatus = 'approved';

  if (invalidRows > 0) {
    batchStatus = 'failed';
  } else if (pendingReviewRows > 0) {
    batchStatus = 'pending_review';
  }

  const batchPayload = {
    source: {
      file_name: file.originalname,
      sheet_name: firstSheetName,
      created_by_company_id: createdByCompanyId,
      target_company_id: companyId
    },
    summary: {
      total_rows: totalRows,
      validated_rows: validatedRows,
      auto_matched_rows: autoMatchedRows,
      pending_review_rows: pendingReviewRows,
      invalid_rows: invalidRows
    },
    rows: processedRows
  };

  const validationNotes = [
    `Archivo: ${file.originalname}`,
    `Filas: ${totalRows}`,
    `Auto coincidentes: ${autoMatchedRows}`,
    `Pendientes de revisión: ${pendingReviewRows}`,
    `Inválidas: ${invalidRows}`
  ].join(' | ');

  const [insertResult] = await pool.query(
    `INSERT INTO Import_Batch (
       id_company_fk,
       batch_name,
       import_data,
       status,
       total_rows,
       validated_rows,
       approved_rows,
       file_name,
       created_by_id_company,
       validation_notes
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      companyId,
      path.parse(file.originalname).name || `import-${Date.now()}`,
      JSON.stringify(batchPayload),
      batchStatus,
      totalRows,
      validatedRows,
      autoMatchedRows,
      file.originalname,
      createdByCompanyId,
      validationNotes
    ]
  );

  return {
    id_import_batch: insertResult.insertId,
    id_company_fk: companyId,
    batch_name: path.parse(file.originalname).name || `import-${Date.now()}`,
    status: batchStatus,
    total_rows: totalRows,
    validated_rows: validatedRows,
    approved_rows: autoMatchedRows,
    pending_review_rows: pendingReviewRows,
    invalid_rows: invalidRows,
    import_data: batchPayload,
    file_name: file.originalname,
    created_by_id_company: createdByCompanyId,
    validation_notes: validationNotes
  };
};

const getImportBatchById = async (batchId, companyId = null) => {
  const values = [batchId];
  let companyClause = '';

  if (Number.isInteger(companyId) && companyId > 0) {
    companyClause = ' AND id_company_fk = ?';
    values.push(companyId);
  }

  const [rows] = await pool.query(
    `SELECT
       id_import_batch,
       id_company_fk,
       batch_name,
       import_data,
       status,
       total_rows,
       validated_rows,
       approved_rows,
       file_name,
       created_by_id_company,
       validation_notes,
       created_at,
       updated_at
     FROM Import_Batch
     WHERE id_import_batch = ?${companyClause}
     LIMIT 1`,
    values
  );

  const batch = rows[0] ?? null;

  if (!batch) {
    return null;
  }

  return {
    ...batch,
    import_data: typeof batch.import_data === 'string'
      ? JSON.parse(batch.import_data)
      : batch.import_data
  };
};

const listImportBatches = async ({ companyId = null, status = null, limit = 20, offset = 0 } = {}) => {
  const conditions = [];
  const values = [];

  if (Number.isInteger(companyId) && companyId > 0) {
    conditions.push('id_company_fk = ?');
    values.push(companyId);
  }

  if (status) {
    conditions.push('status = ?');
    values.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
       id_import_batch,
       id_company_fk,
       batch_name,
       status,
       total_rows,
       validated_rows,
       approved_rows,
       file_name,
       validation_notes,
       created_by_id_company,
       created_at,
       updated_at
     FROM Import_Batch
     ${whereClause}
     ORDER BY created_at DESC, id_import_batch DESC
     LIMIT ? OFFSET ?`,
    [...values, Number(limit), Number(offset)]
  );

  return rows;
};

const mutateBatchPayload = (batchPayload, rowNumber, updater) => {
  const payload = typeof batchPayload === 'string' ? JSON.parse(batchPayload) : (batchPayload ?? {});
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const targetIndex = rows.findIndex((row) => Number(row.row_number) === Number(rowNumber));

  if (targetIndex === -1) {
    throw new Error('Fila no encontrada en el lote');
  }

  const nextRows = rows.map((row, index) => {
    if (index !== targetIndex) {
      return row;
    }

    return updater(row);
  });

  const invalidRows = nextRows.filter((row) => row?.validation?.status === 'invalid').length;
  const pendingReviewRows = nextRows.filter((row) => row?.validation?.status === 'pending_review').length;
  const approvedRows = nextRows.filter((row) => row?.validation?.status === 'approved' || row?.validation?.status === 'auto_matched').length;
  let nextStatus = 'approved';

  if (invalidRows > 0) {
    nextStatus = 'failed';
  } else if (pendingReviewRows > 0) {
    nextStatus = 'pending_review';
  }

  return {
    payload: {
      ...payload,
      summary: {
        ...((payload.summary ? payload.summary : {})),
        total_rows: nextRows.length,
        validated_rows: nextRows.length - invalidRows,
        auto_matched_rows: nextRows.filter((row) => row?.validation?.status === 'auto_matched').length,
        pending_review_rows: pendingReviewRows,
        invalid_rows: invalidRows
      },
      rows: nextRows
    },
    summary: {
      totalRows: nextRows.length,
      validatedRows: nextRows.length - invalidRows,
      approvedRows,
      invalidRows,
      pendingReviewRows,
      status: nextStatus
    }
  };
};

const applyManualLineSelection = (nextRow, nextClassification, lineId, lineReferences = []) => {
  if (lineId == null) {
    return;
  }

  let matchedAlternative = [nextClassification.line, ...(nextClassification.alternatives ?? [])].find(
    (candidate) => Number(candidate?.id_line) === Number(lineId)
  );

  if (!matchedAlternative) {
    const catalogLine = lineReferences.find((line) => Number(line?.id_line) === Number(lineId));

    if (catalogLine) {
      matchedAlternative = {
        id_line: catalogLine.id_line,
        name: catalogLine.name,
        subcategory_id: catalogLine.id_subcategory_fk,
        subcategory_name: catalogLine.subcategory_name,
        category_id: catalogLine.id_category,
        category_name: catalogLine.category_name,
        confidence: 100,
        match_method: 'manual_search'
      };
    }
  }

  if (!matchedAlternative) {
    throw new Error('La línea seleccionada no existe entre las opciones del lote');
  }

  nextClassification.line = {
    ...matchedAlternative,
    confidence: 100,
    match_method: 'manual_review'
  };

  const currentMainSource = String(nextRow?.staging_images?.main_image_source || '').trim();
  if (!nextRow.staging_images?.main_image || currentMainSource === 'subcategory_default') {
    const nextDefaultImage = buildDefaultSubcategoryImageName(matchedAlternative.subcategory_name);
    nextRow.staging_images = {
      ...(nextRow.staging_images ? nextRow.staging_images : {}),
      main_image: nextDefaultImage,
      main_image_source: 'subcategory_default',
      secondary_images: Array.isArray(nextRow?.staging_images?.secondary_images)
        ? nextRow.staging_images.secondary_images
        : []
    };
  }
};

const applyRowUpdatesToRow = (nextRow, nextValidation, rowUpdates) => {
  if (!rowUpdates || typeof rowUpdates !== 'object') {
    return;
  }

  const nextNormalized = nextRow.normalized ? { ...nextRow.normalized } : {};
  const nextRawData = nextRow.raw_data ? { ...nextRow.raw_data } : {};

  if (Object.hasOwn(rowUpdates, 'name')) {
    const nameValue = String(rowUpdates.name || '').trim();
    nextNormalized.name = nameValue;
    nextRawData.name = nameValue;
  }

  if (Object.hasOwn(rowUpdates, 'brand')) {
    const brandValue = String(rowUpdates.brand || '').trim();
    nextNormalized.brand = brandValue;
    nextRawData.brand = brandValue;
  }

  if (Object.hasOwn(rowUpdates, 'description')) {
    const descriptionValue = String(rowUpdates.description || '').trim();
    nextNormalized.description = descriptionValue || null;
    nextRawData.description = descriptionValue;
  }

  if (Object.hasOwn(rowUpdates, 'price')) {
    const parsedPrice = parseDecimal(rowUpdates.price);
    nextNormalized.price = parsedPrice;
    nextRawData.price = rowUpdates.price;
  }

  if (Object.hasOwn(rowUpdates, 'quantity')) {
    const parsedQuantity = parsePositiveInteger(rowUpdates.quantity, true);
    nextNormalized.quantity = parsedQuantity;
    nextRawData.quantity = rowUpdates.quantity;
  }

  if (Object.hasOwn(rowUpdates, 'min_stock')) {
    const parsedMinStock = parsePositiveInteger(rowUpdates.min_stock, true);
    nextNormalized.min_stock = parsedMinStock ?? 0;
    nextRawData.min_stock = rowUpdates.min_stock;
  }

  if (Object.hasOwn(rowUpdates, 'attributes')) {
    const parsedAttributes = parseFlexibleAttributes(rowUpdates.attributes);
    nextNormalized.attributes = parsedAttributes.value;
    nextRawData.attributes = rowUpdates.attributes;

    nextValidation.warnings = [
      ...(Array.isArray(nextValidation.warnings) ? nextValidation.warnings : []),
      ...parsedAttributes.warnings
    ];
  }

  nextRow.normalized = nextNormalized;
  nextRow.raw_data = nextRawData;
};

const applyStagingImagesUpdate = (nextRow, stagingImages) => {
  if (!stagingImages || typeof stagingImages !== 'object') {
    return;
  }

  const currentImages = nextRow.staging_images || {};
  const nextImages = {
    main_image: String(currentImages.main_image || '').trim(),
    main_image_source: String(currentImages.main_image_source || 'subcategory_default').trim(),
    secondary_images: Array.isArray(currentImages.secondary_images) ? currentImages.secondary_images : []
  };

  if (Object.hasOwn(stagingImages, 'main_image')) {
    const mainImageValue = String(stagingImages.main_image || '').trim();
    if (mainImageValue) {
      nextImages.main_image = mainImageValue;
      nextImages.main_image_source = 'manual';
    }
  }

  if (Object.hasOwn(stagingImages, 'secondary_images')) {
    nextImages.secondary_images = parseSecondaryImagesInput(stagingImages.secondary_images);
  }

  nextRow.staging_images = nextImages;
};

const applyDecisionToValidation = (nextValidation, decision) => {
  if (decision === 'approved') {
    nextValidation.status = 'approved';
    nextValidation.review_required = false;
    nextValidation.approved_by_admin = true;
    nextValidation.approved_at = new Date().toISOString();
    return;
  }

  if (decision === 'rejected') {
    nextValidation.status = 'rejected';
    nextValidation.review_required = false;
    nextValidation.rejected_by_admin = true;
    nextValidation.rejected_at = new Date().toISOString();
    return;
  }

  nextValidation.status = 'pending_review';
  nextValidation.review_required = true;
};

const applyReviewMetadata = (nextValidation, notes, reviewedByCompanyId) => {
  if (notes) {
    nextValidation.notes = String(notes).trim();
  }

  if (reviewedByCompanyId) {
    nextValidation.reviewed_by_company_id = reviewedByCompanyId;
    nextValidation.reviewed_at = new Date().toISOString();
  }
};

const updateImportBatchRowDecision = async ({
  batchId,
  rowNumber,
  companyId = null,
  decision,
  reviewedByCompanyId,
  lineId = null,
  notes = null,
  rowUpdates = null,
  stagingImages = null
}) => {
  const batch = await getImportBatchById(batchId, companyId);
  const lineReferences = await listLineReferences();

  if (!batch) {
    throw new Error('Lote no encontrado');
  }

  const result = mutateBatchPayload(batch.import_data, rowNumber, (row) => {
    const nextRow = { ...row };
    const nextValidation = nextRow.validation ? { ...nextRow.validation } : {};
    const nextClassification = nextRow.classification ? { ...nextRow.classification } : {};

    applyManualLineSelection(nextRow, nextClassification, lineId, lineReferences);
    applyRowUpdatesToRow(nextRow, nextValidation, rowUpdates);
    applyStagingImagesUpdate(nextRow, stagingImages);
    applyDecisionToValidation(nextValidation, decision);
    applyReviewMetadata(nextValidation, notes, reviewedByCompanyId);

    nextRow.classification = nextClassification;
    nextRow.validation = nextValidation;

    return nextRow;
  });

  await pool.query(
    `UPDATE Import_Batch
     SET import_data = ?,
         status = ?,
         total_rows = ?,
         validated_rows = ?,
         approved_rows = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id_import_batch = ?`,
    [
      JSON.stringify(result.payload),
      result.summary.status,
      result.summary.totalRows,
      result.summary.validatedRows,
      result.summary.approvedRows,
      batchId
    ]
  );

  return await getImportBatchById(batchId, companyId);
};

const approveImportBatch = async ({ batchId, companyId = null, approvedByCompanyId = null }) => {
  const batch = await getImportBatchById(batchId, companyId);

  if (!batch) {
    throw new Error('Lote no encontrado');
  }

  const payload = typeof batch.import_data === 'string' ? JSON.parse(batch.import_data) : batch.import_data;
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const approvedRows = rows.filter((row) => {
    const validationStatus = String(row?.validation?.status ?? '').toLowerCase();
    return validationStatus === 'approved' || validationStatus === 'auto_matched';
  }).length;

  const unresolvedRows = rows.filter((row) => {
    const validationStatus = String(row?.validation?.status ?? '').toLowerCase();
    return validationStatus === 'pending_review' || validationStatus === 'invalid';
  });

  if (unresolvedRows.length) {
    throw new Error('El lote todavía tiene filas pendientes o inválidas');
  }

  const approvedPayload = {
    ...payload,
    rows: rows.map((row) => ({
      ...row,
      validation: {
        ...(row.validation ? row.validation : {}),
        status: 'approved',
        review_required: false,
        approved_by_admin: true,
        approved_at: new Date().toISOString(),
        reviewed_by_company_id: approvedByCompanyId ?? row?.validation?.reviewed_by_company_id ?? null
      },
      staging_images: {
        main_image: row?.staging_images?.main_image
          || buildDefaultSubcategoryImageName(row?.classification?.line?.subcategory_name),
        main_image_source: row?.staging_images?.main_image_source || 'subcategory_default',
        secondary_images: Array.isArray(row?.staging_images?.secondary_images)
          ? row.staging_images.secondary_images
          : []
      }
    })),
    summary: {
      ...(payload.summary ? payload.summary : {}),
      total_rows: rows.length,
      validated_rows: rows.length,
      approved_rows: approvedRows,
      pending_review_rows: 0,
      invalid_rows: 0
    }
  };

  await pool.query(
    `UPDATE Import_Batch
     SET import_data = ?,
         status = 'approved',
         total_rows = ?,
         validated_rows = ?,
         approved_rows = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id_import_batch = ?`,
    [JSON.stringify(approvedPayload), rows.length, rows.length, approvedRows, batchId]
  );

  return await getImportBatchById(batchId, companyId);
};

const getRowValidationStatus = (row) => String(row?.validation?.status ?? '').toLowerCase();

const isRowPendingForPublish = (row) => {
  const validationStatus = getRowValidationStatus(row);
  return validationStatus === 'pending_review' || validationStatus === 'invalid' || validationStatus === 'rejected';
};

const isRowApprovedForPublish = (row) => {
  const validationStatus = getRowValidationStatus(row);
  return validationStatus === 'approved' || validationStatus === 'auto_matched';
};

const buildPublishRowProductPayload = (row, companyId) => {
  const lineId = Number(row?.classification?.line?.id_line || 0);

  if (!lineId) {
    throw new Error('La fila no tiene línea válida');
  }

  const name = String(row?.normalized?.name || row?.raw_data?.name || '').trim();
  const price = Number(row?.normalized?.price);
  const quantity = Number(row?.normalized?.quantity);
  const minStock = Number(row?.normalized?.min_stock ?? 0);

  if (!name) {
    throw new Error('Nombre de producto inválido');
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Precio inválido');
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('Cantidad inválida');
  }

  return {
    reference_line_id: lineId,
    id_company: companyId,
    name,
    brand: String(row?.normalized?.brand || '').trim() || null,
    description: String(row?.normalized?.description || '').trim() || null,
    price,
    attributes: JSON.stringify(
      row?.normalized?.attributes && typeof row.normalized.attributes === 'object'
        ? row.normalized.attributes
        : {}
    ),
    quantity,
    min_stock: Number.isInteger(minStock) && minStock >= 0 ? minStock : 0,
    image_url: String(row?.staging_images?.main_image || '').trim() || null,
    secondary_images: Array.isArray(row?.staging_images?.secondary_images)
      ? row.staging_images.secondary_images.map((imageName) => String(imageName || '').trim()).filter(Boolean).slice(0, 7)
      : []
  };
};

const buildPublishNextPayload = ({ payload, rows, publishableRows, createdProducts, publishErrors, publishedByCompanyId }) => ({
  ...payload,
  summary: {
    ...(payload.summary ? payload.summary : {}),
    total_rows: rows.length,
    validated_rows: rows.length,
    approved_rows: publishableRows.length,
    published_rows: createdProducts.length,
    failed_publish_rows: publishErrors.length
  },
  publication: {
    published_at: new Date().toISOString(),
    published_by_company_id: publishedByCompanyId,
    created_products: createdProducts,
    errors: publishErrors
  }
});

const publishSingleImportRow = async ({ row, companyId }) => {
  const productPayload = buildPublishRowProductPayload(row, companyId);
  const product = await createProductFromReference(productPayload);

  return {
    row_number: Number(row?.row_number || 0),
    id_product: product?.id_product ?? null,
    name: productPayload.name
  };
};

const publishImportRows = async ({ rows, companyId }) => {
  const createdProducts = [];
  const publishErrors = [];

  for (const row of rows) {
    try {
      const createdProduct = await publishSingleImportRow({ row, companyId });
      createdProducts.push(createdProduct);
    } catch (error) {
      publishErrors.push({
        row_number: Number(row?.row_number || 0),
        error: error instanceof Error ? error.message : 'Error desconocido al publicar fila'
      });
    }
  }

  return { createdProducts, publishErrors };
};

const publishImportBatch = async ({ batchId, companyId = null, publishedByCompanyId = null }) => {
  const batch = await getImportBatchById(batchId, companyId);

  if (!batch) {
    throw new Error('Lote no encontrado');
  }

  const payload = typeof batch.import_data === 'string' ? JSON.parse(batch.import_data) : batch.import_data;
  const previouslyPublishedProducts = Array.isArray(payload?.publication?.created_products)
    ? payload.publication.created_products
    : [];

  if (previouslyPublishedProducts.length > 0 || String(batch.status || '').toLowerCase() === 'completed') {
    throw new Error('Este lote ya fue publicado previamente');
  }

  const rows = Array.isArray(payload?.rows) ? payload.rows : [];

  if (!rows.length) {
    throw new Error('El lote no tiene filas para publicar');
  }

  const unresolvedRows = rows.filter(isRowPendingForPublish);

  if (unresolvedRows.length) {
    throw new Error('El lote todavía tiene filas pendientes, inválidas o rechazadas');
  }

  const publishableRows = rows.filter(isRowApprovedForPublish);

  if (!publishableRows.length) {
    throw new Error('El lote no tiene filas aprobadas para publicar');
  }

  const { createdProducts, publishErrors } = await publishImportRows({
    rows: publishableRows,
    companyId: batch.id_company_fk
  });

  const nextStatus = publishErrors.length ? 'failed' : 'completed';
  const nextPayload = buildPublishNextPayload({
    payload,
    rows,
    publishableRows,
    createdProducts,
    publishErrors,
    publishedByCompanyId
  });

  await pool.query(
    `UPDATE Import_Batch
     SET import_data = ?,
         status = ?,
         approved_rows = ?,
         updated_at = CURRENT_TIMESTAMP,
         validation_notes = ?
     WHERE id_import_batch = ?`,
    [
      JSON.stringify(nextPayload),
      nextStatus,
      publishableRows.length,
      publishErrors.length ? `Publicación con errores en ${publishErrors.length} fila(s)` : 'Publicación completada',
      batchId
    ]
  );

  return {
    batch: await getImportBatchById(batchId, companyId),
    created_products: createdProducts,
    errors: publishErrors
  };
};

const deleteImportBatchById = async ({ batchId, companyId = null }) => {
  const values = [batchId];
  let companyClause = '';

  if (Number.isInteger(companyId) && companyId > 0) {
    companyClause = ' AND id_company_fk = ?';
    values.push(companyId);
  }

  const [result] = await pool.query(
    `DELETE FROM Import_Batch
     WHERE id_import_batch = ?${companyClause}`,
    values
  );

  return Number(result?.affectedRows || 0) > 0;
};

const updateImportBatchRowImages = async ({
  batchId,
  rowNumber,
  companyId = null,
  mainImage = null,
  secondaryImages = null,
  reviewedByCompanyId = null
}) => {
  const batch = await getImportBatchById(batchId, companyId);

  if (!batch) {
    throw new Error('Lote no encontrado');
  }

  const result = mutateBatchPayload(batch.import_data, rowNumber, (row) => {
    const nextRow = { ...row };
    const nextValidation = nextRow.validation ? { ...nextRow.validation } : {};
    const existingImages = nextRow.staging_images || {};

    const nextImages = {
      main_image: String(existingImages.main_image || '').trim(),
      main_image_source: String(existingImages.main_image_source || 'subcategory_default').trim(),
      secondary_images: Array.isArray(existingImages.secondary_images)
        ? existingImages.secondary_images
        : []
    };

    if (mainImage) {
      nextImages.main_image = String(mainImage).trim();
      nextImages.main_image_source = 'uploaded';
    }

    if (Array.isArray(secondaryImages) && secondaryImages.length) {
      nextImages.secondary_images = secondaryImages
        .map((imageName) => String(imageName || '').trim())
        .filter(Boolean)
        .slice(0, 7);
    }

    if (!nextImages.main_image) {
      nextImages.main_image = buildDefaultSubcategoryImageName(row?.classification?.line?.subcategory_name);
      nextImages.main_image_source = 'subcategory_default';
    }

    if (reviewedByCompanyId) {
      nextValidation.reviewed_by_company_id = reviewedByCompanyId;
      nextValidation.reviewed_at = new Date().toISOString();
    }

    nextRow.staging_images = nextImages;
    nextRow.validation = nextValidation;

    return nextRow;
  });

  await pool.query(
    `UPDATE Import_Batch
     SET import_data = ?,
         status = ?,
         total_rows = ?,
         validated_rows = ?,
         approved_rows = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id_import_batch = ?`,
    [
      JSON.stringify(result.payload),
      result.summary.status,
      result.summary.totalRows,
      result.summary.validatedRows,
      result.summary.approvedRows,
      batchId
    ]
  );

  return await getImportBatchById(batchId, companyId);
};

module.exports = {
  createImportBatchFromSpreadsheet,
  getImportBatchById,
  listImportBatches,
  updateImportBatchRowDecision,
  updateImportBatchRowImages,
  approveImportBatch,
  publishImportBatch,
  deleteImportBatchById,
  parseFlexibleAttributes,
  findBestLineMatch,
  normalizeForMatch
};
