const {
  createImportBatchFromSpreadsheet,
  getImportBatchById,
  listImportBatches,
  updateImportBatchRowDecision,
  updateImportBatchRowImages,
  approveImportBatch,
  publishImportBatch,
  deleteImportBatchById
} = require('../services/product.import.service');
const xlsx = require('xlsx');

const requireCompanyToken = (req, res) => {
  if (req.user?.entity !== 'company') {
    res.status(403).json({ error: 'Token no válido para importación de productos' });
    return false;
  }

  return true;
};

const resolveTargetCompanyId = (req) => {
  if (Number(req.user?.id_role) === 1) {
    const selectedCompanyId = Number(req.body?.id_company);

    if (Number.isInteger(selectedCompanyId) && selectedCompanyId > 0) {
      return selectedCompanyId;
    }
  }

  return Number(req.user?.id);
};

const uploadProductImportBatch = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    if (!req.file) {
      return res.status(400).json({ error: 'file es requerido' });
    }

    const companyId = resolveTargetCompanyId(req);
    const createdByCompanyId = Number(req.user?.id);

    const batch = await createImportBatchFromSpreadsheet({
      file: req.file,
      companyId,
      createdByCompanyId
    });

    return res.status(201).json({
      message: batch.status === 'pending_review'
        ? 'Archivo importado y listo para revisión'
        : 'Archivo importado correctamente',
      batch
    });
  } catch (error) {
    console.error('❌ ERROR UPLOAD PRODUCT IMPORT BATCH:', error);
    const statusCode = [
      'Archivo requerido',
      'Empresa no existe',
      'El archivo no contiene hojas válidas',
      'El archivo no contiene filas de productos',
      'No existen líneas disponibles para clasificar los productos'
    ].includes(error.message) ? 400 : 500;

    return res.status(statusCode).json({ error: error.message });
  }
};

const getProductImportBatchDetail = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const batchId = Number(req.params.batchId);

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ error: 'batchId inválido' });
    }

    const companyId = Number(req.user?.id_role) === 1 ? null : Number(req.user?.id);
    const batch = await getImportBatchById(batchId, companyId);

    if (!batch) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    return res.status(200).json({ batch });
  } catch (error) {
    console.error('❌ ERROR GET PRODUCT IMPORT BATCH DETAIL:', error);
    return res.status(500).json({ error: error.message });
  }
};

const listProductImportBatches = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const status = String(req.query.status ?? '').trim() || null;

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ error: 'page inválido' });
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ error: 'limit inválido' });
    }

    const companyId = Number(req.user?.id_role) === 1 ? null : Number(req.user?.id);
    const batches = await listImportBatches({
      companyId,
      status,
      limit,
      offset: (page - 1) * limit
    });

    return res.status(200).json({ batches, page, limit });
  } catch (error) {
    console.error('❌ ERROR LIST PRODUCT IMPORT BATCHES:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateProductImportBatchRow = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const batchId = Number(req.params.batchId);
    const rowNumber = Number(req.params.rowNumber);
    const decision = String(req.body?.decision ?? 'pending_review').trim().toLowerCase();
    const lineId = req.body?.line_id == null || req.body?.line_id === '' ? null : Number(req.body.line_id);
    const notes = req.body?.notes ?? null;
    const rowUpdates = req.body?.row_updates && typeof req.body.row_updates === 'object'
      ? req.body.row_updates
      : null;
    const stagingImages = req.body?.staging_images && typeof req.body.staging_images === 'object'
      ? req.body.staging_images
      : null;

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ error: 'batchId inválido' });
    }

    if (!Number.isInteger(rowNumber) || rowNumber <= 0) {
      return res.status(400).json({ error: 'rowNumber inválido' });
    }

    if (!['approved', 'rejected', 'pending_review'].includes(decision)) {
      return res.status(400).json({ error: 'decision inválida' });
    }

    if (lineId != null && (!Number.isInteger(lineId) || lineId <= 0)) {
      return res.status(400).json({ error: 'line_id inválido' });
    }

    const companyId = Number(req.user?.id_role) === 1 ? null : Number(req.user?.id);
    const batch = await updateImportBatchRowDecision({
      batchId,
      rowNumber,
      companyId,
      decision,
      reviewedByCompanyId: Number(req.user?.id),
      lineId,
      notes,
      rowUpdates,
      stagingImages
    });

    return res.status(200).json({
      message: 'Fila actualizada correctamente',
      batch
    });
  } catch (error) {
    console.error('❌ ERROR UPDATE PRODUCT IMPORT BATCH ROW:', error);
    const statusCode = [
      'Lote no encontrado',
      'Fila no encontrada en el lote',
      'La línea seleccionada no existe entre las opciones del lote'
    ].includes(error.message) ? 404 : 400;

    return res.status(statusCode).json({ error: error.message });
  }
};

const approveProductImportBatch = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const batchId = Number(req.params.batchId);

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ error: 'batchId inválido' });
    }

    const companyId = Number(req.user?.id_role) === 1 ? null : Number(req.user?.id);
    const batch = await approveImportBatch({
      batchId,
      companyId,
      approvedByCompanyId: Number(req.user?.id)
    });

    return res.status(200).json({
      message: 'Lote aprobado correctamente',
      batch
    });
  } catch (error) {
    console.error('❌ ERROR APPROVE PRODUCT IMPORT BATCH:', error);
    const statusCode = error.message === 'El lote todavía tiene filas pendientes o inválidas' ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const deleteProductImportBatch = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const batchId = Number(req.params.batchId);

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ error: 'batchId inválido' });
    }

    const companyId = Number(req.user?.id_role) === 1 ? null : Number(req.user?.id);
    const deleted = await deleteImportBatchById({
      batchId,
      companyId
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    return res.status(200).json({ message: 'Lote eliminado correctamente' });
  } catch (error) {
    console.error('❌ ERROR DELETE PRODUCT IMPORT BATCH:', error);
    return res.status(500).json({ error: error.message });
  }
};

const publishProductImportBatch = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const batchId = Number(req.params.batchId);

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ error: 'batchId inválido' });
    }

    const companyId = Number(req.user?.id_role) === 1 ? null : Number(req.user?.id);
    const result = await publishImportBatch({
      batchId,
      companyId,
      publishedByCompanyId: Number(req.user?.id)
    });

    return res.status(200).json({
      message: result.errors.length
        ? `Lote publicado con ${result.errors.length} fila(s) con error`
        : 'Lote publicado correctamente',
      batch: result.batch,
      created_products: result.created_products,
      errors: result.errors
    });
  } catch (error) {
    console.error('❌ ERROR PUBLISH PRODUCT IMPORT BATCH:', error);
    const statusCode = [
      'Lote no encontrado',
      'El lote no tiene filas para publicar',
      'El lote no tiene filas aprobadas para publicar',
      'El lote todavía tiene filas pendientes, inválidas o rechazadas',
      'Este lote ya fue publicado previamente'
    ].includes(error.message) ? 400 : 500;

    return res.status(statusCode).json({ error: error.message });
  }
};

const uploadProductImportBatchRowImages = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const batchId = Number(req.params.batchId);
    const rowNumber = Number(req.params.rowNumber);

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ error: 'batchId inválido' });
    }

    if (!Number.isInteger(rowNumber) || rowNumber <= 0) {
      return res.status(400).json({ error: 'rowNumber inválido' });
    }

    const mainImage = req.files?.main_image?.[0]?.filename || null;
    const secondaryImages = Array.isArray(req.files?.secondary_images)
      ? req.files.secondary_images.map((file) => file.filename)
      : [];

    if (!mainImage && !secondaryImages.length) {
      return res.status(400).json({ error: 'Debes subir al menos una imagen principal o secundaria' });
    }

    const companyId = Number(req.user?.id_role) === 1 ? null : Number(req.user?.id);
    const batch = await updateImportBatchRowImages({
      batchId,
      rowNumber,
      companyId,
      mainImage,
      secondaryImages,
      reviewedByCompanyId: Number(req.user?.id)
    });

    return res.status(200).json({
      message: 'Imágenes de la fila actualizadas correctamente',
      batch,
      uploaded_images: {
        main_image: mainImage,
        secondary_images: secondaryImages
      }
    });
  } catch (error) {
    console.error('❌ ERROR UPLOAD PRODUCT IMPORT BATCH ROW IMAGES:', error);
    const statusCode = ['Lote no encontrado', 'Fila no encontrada en el lote'].includes(error.message) ? 404 : 400;
    return res.status(statusCode).json({ error: error.message });
  }
};

const downloadProductImportTemplate = async (req, res) => {
  try {
    if (!requireCompanyToken(req, res)) {
      return;
    }

    const workbook = xlsx.utils.book_new();
    const templateSheet = xlsx.utils.aoa_to_sheet([[
      'Nombre del producto',
      'Marca del producto',
      'Precio en decimales',
      'Cantidad disponible',
      'Stock mínimo',
      'Atributos',
      'Descripción'
    ]]);

    const instructionsRows = [
      {
        columna: 'Nombre del producto',
        requerida: 'si',
        descripcion: 'Nombre comercial del producto.'
      },
      {
        columna: 'Marca del producto',
        requerida: 'no',
        descripcion: 'Marca del producto.'
      },
      {
        columna: 'Precio en decimales',
        requerida: 'si',
        descripcion: 'Precio en USD usando punto decimal. Ejemplo: 19.99'
      },
      {
        columna: 'Cantidad disponible',
        requerida: 'si',
        descripcion: 'Stock inicial en número entero.'
      },
      {
        columna: 'Stock mínimo',
        requerida: 'no',
        descripcion: 'Si se deja vacío, el sistema usa 0.'
      },
      {
        columna: 'Atributos',
        requerida: 'no',
        descripcion: 'Formato recomendado: color:rojo;material:acero;medida:10mm'
      },
      {
        columna: 'Descripción',
        requerida: 'no',
        descripcion: 'Descripción comercial o técnica.'
      },
      {
        columna: 'Imágenes',
        requerida: 'no',
        descripcion: 'No van en el Excel. La imagen principal por defecto se asigna en staging según la subcategoría detectada y luego puedes editarla.'
      }
    ];

    const instructionsSheet = xlsx.utils.json_to_sheet(instructionsRows);

    xlsx.utils.book_append_sheet(workbook, templateSheet, 'Plantilla');
    xlsx.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');

    const fileBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const filename = `plantilla-importacion-productos-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error('❌ ERROR DOWNLOAD PRODUCT IMPORT TEMPLATE:', error);
    return res.status(500).json({ error: 'No se pudo generar la plantilla de importacion' });
  }
};

module.exports = {
  uploadProductImportBatch,
  getProductImportBatchDetail,
  listProductImportBatches,
  updateProductImportBatchRow,
  uploadProductImportBatchRowImages,
  approveProductImportBatch,
  publishProductImportBatch,
  deleteProductImportBatch,
  downloadProductImportTemplate
};
