DELIMITER //

DROP PROCEDURE IF EXISTS sp_seed_master_categories //
CREATE PROCEDURE sp_seed_master_categories()
BEGIN

	INSERT INTO Category (name)
	SELECT src.canonical_name
	FROM (
		SELECT
			MIN(raw_categories.raw_name) AS canonical_name,
			LOWER(TRIM(raw_categories.raw_name)) AS normalized_name
		FROM (
			SELECT 'Accesorios Herramientas Eléctricas' AS raw_name
			UNION ALL SELECT 'Accesorios para Herramientas'
			UNION ALL SELECT 'Accesorios para herramientas eléctricas'
			UNION ALL SELECT 'Adhesivos y Selladores'
			UNION ALL SELECT 'Almacenamiento y Estanterías'
			UNION ALL SELECT 'Automotriz'
			UNION ALL SELECT 'Baños y Sanitarios'
			UNION ALL SELECT 'Bombas y Sistemas Hidráulicos'
			UNION ALL SELECT 'Cocina'
			UNION ALL SELECT 'Construcción y Albañilería'
			UNION ALL SELECT 'Electricidad'
			UNION ALL SELECT 'Equipos De Taller Y Automotriz'
			UNION ALL SELECT 'Equipos de taller y automotriz'
			UNION ALL SELECT 'Ferretería General'
			UNION ALL SELECT 'Gas'
			UNION ALL SELECT 'Generadores Eléctricos y Herramientas a Motor'
			UNION ALL SELECT 'Herrajes y Accesorios'
			UNION ALL SELECT 'Herramientas de Medición y Diagnóstico'
			UNION ALL SELECT 'Herramientas Eléctricas'
			UNION ALL SELECT 'Herramientas Especializadas y Técnicas'
			UNION ALL SELECT 'Herramientas Inalámbricas'
			UNION ALL SELECT 'Herramientas Manuales'
			UNION ALL SELECT 'Herramientas Neumáticas'
			UNION ALL SELECT 'Hierro Y Acero'
			UNION ALL SELECT 'Hierros y Perfiles'
			UNION ALL SELECT 'Hogar, Camping y Decoración'
			UNION ALL SELECT 'HVAC (Refrigeración y Aire Acondicionado)'
			UNION ALL SELECT 'Iluminación'
			UNION ALL SELECT 'Impermeabilización'
			UNION ALL SELECT 'Jardín y Agrícola'
			UNION ALL SELECT 'Limpieza y Aseo'
			UNION ALL SELECT 'Lubricantes y Grasas'
			UNION ALL SELECT 'Madera y Derivados'
			UNION ALL SELECT 'Madera Y Derivados'
			UNION ALL SELECT 'Materiales de Construcción'
			UNION ALL SELECT 'Pintura Y Acabados'
			UNION ALL SELECT 'Pinturas y Complementos'
			UNION ALL SELECT 'Plomería'
			UNION ALL SELECT 'Productos Químicos y Limpieza'
			UNION ALL SELECT 'Seguridad Industrial (EPP)'
			UNION ALL SELECT 'Seguridad y Señalización'
			UNION ALL SELECT 'Soldadura'
			UNION ALL SELECT 'Techos y Cobertizos'
			UNION ALL SELECT 'Tornillería y Fijaciones'
			UNION ALL SELECT 'Tuberías y Conexiones'
			UNION ALL SELECT 'Varios'
		) AS raw_categories
		GROUP BY LOWER(TRIM(raw_categories.raw_name))
	) AS src
	LEFT JOIN Category c
		ON LOWER(TRIM(c.name)) = src.normalized_name
	WHERE c.id_category IS NULL;

END //

DELIMITER ;

-- Ejecutar con:
-- CALL sp_seed_master_categories();
