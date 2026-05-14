-- =========================================
-- LIMPIEZA POST-CATEGORIZACION
-- =========================================
-- Objetivo:
-- 1. Consolidar categorias duplicadas semanticamente.
-- 2. Reasignar subcategorias y lineas sin perder relaciones.
-- 3. Corregir texto roto por encoding (mojibake) en lineas y descripciones.
--
-- Recomendacion:
-- ejecutar sobre una copia de la base o despues de un backup.

START TRANSACTION;

-- =========================================
-- 0. MIGRAR BRAND DE LINE A PRODUCT
-- =========================================
-- Aplica cuando la base vieja tenia brand en Line y la nueva lo mueve a Product.
-- Copia la marca historica a todos los productos de la linea solo si el producto
-- todavia no tiene una marca definida.
-- Si `Line.brand` ya no existe, este bloque se omite automaticamente.

SET @has_line_brand := (
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'Line'
            AND COLUMN_NAME = 'brand'
);

SET @has_product_brand := (
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'Product'
            AND COLUMN_NAME = 'brand'
);

SET @brand_migration_sql := IF(
        @has_line_brand > 0 AND @has_product_brand > 0,
        'UPDATE Product p INNER JOIN Line l ON l.id_line = p.id_line_fk SET p.brand = l.brand WHERE (p.brand IS NULL OR TRIM(p.brand) = '''') AND l.brand IS NOT NULL AND TRIM(l.brand) <> ''''',
        'SELECT 1'
);

PREPARE stmt_brand_migration FROM @brand_migration_sql;
EXECUTE stmt_brand_migration;
DEALLOCATE PREPARE stmt_brand_migration;

-- =========================================
-- 1. MAPEO DE CATEGORIAS A CONSOLIDAR
-- =========================================
DROP TEMPORARY TABLE IF EXISTS tmp_category_merge_map;
CREATE TEMPORARY TABLE tmp_category_merge_map (
    source_name VARCHAR(100) NOT NULL,
    target_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (source_name)
);

INSERT INTO tmp_category_merge_map (source_name, target_name)
VALUES
    ('Accesorios para herramientas eléctricas', 'Accesorios Herramientas Eléctricas'),
    ('Hierros y Perfiles', 'Hierro Y Acero'),
    ('Pinturas y Complementos', 'Pintura Y Acabados');

-- Reasignar subcategorias a la categoria canonica.
UPDATE Subcategory sc
INNER JOIN Category source_category
    ON source_category.id_category = sc.id_category_fk
INNER JOIN tmp_category_merge_map map
    ON map.source_name = source_category.name
INNER JOIN Category target_category
    ON target_category.name = map.target_name
SET sc.id_category_fk = target_category.id_category;

-- =========================================
-- 2. CONSOLIDAR SUBCATEGORIAS DUPLICADAS
-- =========================================
DROP TEMPORARY TABLE IF EXISTS tmp_subcategory_merge_map;
CREATE TEMPORARY TABLE tmp_subcategory_merge_map (
    source_subcategory_id INT NOT NULL,
    target_subcategory_id INT NOT NULL,
    PRIMARY KEY (source_subcategory_id)
);

INSERT INTO tmp_subcategory_merge_map (source_subcategory_id, target_subcategory_id)
SELECT
    duplicate_sc.id_subcategory AS source_subcategory_id,
    kept_sc.id_subcategory AS target_subcategory_id
FROM Subcategory duplicate_sc
INNER JOIN Subcategory kept_sc
    ON kept_sc.id_category_fk = duplicate_sc.id_category_fk
   AND LOWER(TRIM(kept_sc.name)) = LOWER(TRIM(duplicate_sc.name))
   AND kept_sc.id_subcategory < duplicate_sc.id_subcategory;

-- Reasignar lineas que quedaron colgando en subcategorias duplicadas.
UPDATE Line l
INNER JOIN tmp_subcategory_merge_map map
    ON map.source_subcategory_id = l.id_subcategory_fk
SET l.id_subcategory_fk = map.target_subcategory_id;

-- Eliminar subcategorias duplicadas luego de mover sus lineas.
DELETE sc
FROM Subcategory sc
INNER JOIN tmp_subcategory_merge_map map
    ON map.source_subcategory_id = sc.id_subcategory;

-- Eliminar categorias fuente ya vacias.
DELETE c
FROM Category c
INNER JOIN tmp_category_merge_map map
    ON map.source_name = c.name;

-- =========================================
-- 3. CORREGIR MOJIBAKE EN TEXTO
-- =========================================
-- Esta conversion arregla casos clasicos como:
-- magnÃ©tico -> magnético
-- aspiraciÃ³n -> aspiración
-- pequeÃ±o -> pequeño
-- rÃ¡pido -> rápido

UPDATE Line
SET name = CONVERT(BINARY CONVERT(name USING latin1) USING utf8mb4)
WHERE name LIKE '%Ã%'
   OR name LIKE '%Â%';

UPDATE Product
SET description = CONVERT(BINARY CONVERT(description USING latin1) USING utf8mb4)
WHERE description LIKE '%Ã%'
   OR description LIKE '%Â%';

UPDATE Product
SET brand = CONVERT(BINARY CONVERT(brand USING latin1) USING utf8mb4)
WHERE brand LIKE '%Ã%'
    OR brand LIKE '%Â%';

-- Si los atributos JSON fueron sembrados desde texto dañado,
-- en MariaDB normalmente se puede corregir igual porque JSON es alias de LONGTEXT.
UPDATE Product
SET attributes = CONVERT(BINARY CONVERT(attributes USING latin1) USING utf8mb4)
WHERE attributes LIKE '%Ã%'
   OR attributes LIKE '%Â%';

COMMIT;

-- =========================================
-- CONSULTAS DE VERIFICACION
-- =========================================
-- Categorias finales
-- SELECT id_category, name FROM Category ORDER BY name;
--
-- Subcategorias duplicadas restantes
-- SELECT id_category_fk, LOWER(TRIM(name)) AS normalized_name, COUNT(*) AS total
-- FROM Subcategory
-- GROUP BY id_category_fk, LOWER(TRIM(name))
-- HAVING COUNT(*) > 1;
--
-- Lineas con mojibake restante
-- SELECT id_line, name
-- FROM Line
-- WHERE name LIKE '%Ã%' OR name LIKE '%Â%';
--
-- Descripciones de producto con mojibake restante
-- SELECT id_product, sku, description
-- FROM Product
-- WHERE description LIKE '%Ã%' OR description LIKE '%Â%';
--
-- Marcas de producto con mojibake restante
-- SELECT id_product, sku, brand
-- FROM Product
-- WHERE brand LIKE '%Ã%' OR brand LIKE '%Â%';
