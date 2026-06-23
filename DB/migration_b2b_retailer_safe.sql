-- =========================================
-- Migracion incremental segura para el flujo B2B del detallista
-- Objetivo: conservar los datos existentes y solo agregar lo nuevo
-- No elimina tablas, no renombra tablas, no destruye datos historicos
-- =========================================

USE tuherramientaonline;

-- -------------------------------------------------
-- B2B_Quote: nuevos campos necesarios para el flujo
-- -------------------------------------------------
-- payment_mode: modo de pago por grupo de empresa
-- retailer_payload_json: snapshot JSON del carrito enviado por el detallista

ALTER TABLE B2B_Quote
    ADD COLUMN payment_mode ENUM('ONE_TIME', 'INSTALLMENTS') NOT NULL DEFAULT 'ONE_TIME' AFTER currency_code,
    ADD COLUMN retailer_payload_json LONGTEXT NULL AFTER wholesaler_note;

-- -------------------------------------------------
-- Indices utiles para historial y consultas frecuentes
-- -------------------------------------------------

ALTER TABLE B2B_Quote
    ADD INDEX idx_b2b_quote_retailer_status_created (id_retailer_fk, status, created_at),
    ADD INDEX idx_b2b_quote_wholesaler_status_created (id_wholesaler_fk, status, created_at),
    ADD INDEX idx_b2b_quote_source_draft (source_draft_id);

-- -------------------------------------------------
-- Notas de compatibilidad
-- -------------------------------------------------
-- Se conservan Quote_Draft y Quote_Draft_Item porque el codigo actual
-- todavia los usa en partes del flujo y para no perder historial previo.
-- Si mas adelante se decide retirarlos, eso debe hacerse con una migracion
-- nueva y un plan de respaldo/traslado de datos.
