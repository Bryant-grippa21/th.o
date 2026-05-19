DELIMITER //

DROP PROCEDURE IF EXISTS sp_seed_test_products_by_subcategory //

CREATE PROCEDURE sp_seed_test_products_by_subcategory()
BEGIN
	DECLARE done INT DEFAULT 0;
	DECLARE v_subcategory_id INT;
	DECLARE v_subcategory_name VARCHAR(100);
	DECLARE v_line_id INT;
	DECLARE v_line_name VARCHAR(150);
	DECLARE v_product_id INT;
	DECLARE v_sku VARCHAR(50);
	DECLARE v_base_price DECIMAL(10,2);

	DECLARE cur_subcategories CURSOR FOR
		SELECT
			s.id_subcategory,
			s.name,
			l.id_line,
			l.name
		FROM Subcategory s
		JOIN (
			SELECT
				l1.id_subcategory_fk,
				MIN(l1.id_line) AS id_line
			FROM Line l1
			WHERE l1.is_active = TRUE
			GROUP BY l1.id_subcategory_fk
		) chosen_line
			ON chosen_line.id_subcategory_fk = s.id_subcategory
		JOIN Line l
			ON l.id_line = chosen_line.id_line
		WHERE s.is_active = TRUE
		ORDER BY s.id_subcategory;

	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

	OPEN cur_subcategories;

	seed_loop: LOOP
		FETCH cur_subcategories INTO v_subcategory_id, v_subcategory_name, v_line_id, v_line_name;

		IF done = 1 THEN
			LEAVE seed_loop;
		END IF;

		SET v_base_price = 19.90 + (v_subcategory_id * 1.75);

		SET v_sku = CONCAT('TEST-', LPAD(v_subcategory_id, 4, '0'), '-01');

		INSERT INTO Product (
			id_line_fk,
			id_company_fk,
			sku,
			name,
			description,
			price,
			attributes
		)
		VALUES (
			v_line_id,
			1,
			v_sku,
			CONCAT(v_line_name, ' A'),
			CONCAT('Producto de prueba A para subcategoría ', v_subcategory_name, ' asociado a la línea ', v_line_name),
			v_base_price,
			JSON_OBJECT(
				'seed_type', 'test_subcategory',
				'seed_batch', 'prod.sql',
				'subcategory_id', v_subcategory_id,
				'subcategory_name', v_subcategory_name,
				'line_id', v_line_id,
				'line_name', v_line_name,
				'variant', 'A'
			)
		)
		ON DUPLICATE KEY UPDATE
			id_product = LAST_INSERT_ID(id_product),
			id_line_fk = VALUES(id_line_fk),
			id_company_fk = VALUES(id_company_fk),
			name = VALUES(name),
			description = VALUES(description),
			price = VALUES(price),
			attributes = VALUES(attributes),
			updated_at = CURRENT_TIMESTAMP;

		SET v_product_id = LAST_INSERT_ID();

		UPDATE Stock
		SET
			quantity = 15 + MOD(v_subcategory_id, 10),
			min_stock = 3,
			updated_at = CURRENT_TIMESTAMP
		WHERE id_product_fk = v_product_id;

		IF ROW_COUNT() = 0 THEN
			INSERT INTO Stock (
				id_product_fk,
				quantity,
				min_stock
			)
			VALUES (
				v_product_id,
				15 + MOD(v_subcategory_id, 10),
				3
			);
		END IF;

		INSERT INTO Product_Image (
			id_product_fk,
			image_url,
			is_main,
			sort_order
		)
		SELECT
			v_product_id,
			CONCAT('/uploads/products/', LOWER(REPLACE(v_sku, ' ', '-')), '.jpg'),
			TRUE,
			0
		FROM DUAL
		WHERE NOT EXISTS (
			SELECT 1
			FROM Product_Image pi
			WHERE pi.id_product_fk = v_product_id
			  AND pi.sort_order = 0
		);

		SET v_sku = CONCAT('TEST-', LPAD(v_subcategory_id, 4, '0'), '-02');

		INSERT INTO Product (
			id_line_fk,
			id_company_fk,
			sku,
			name,
			description,
			price,
			attributes
		)
		VALUES (
			v_line_id,
			1,
			v_sku,
			CONCAT(v_line_name, ' B'),
			CONCAT('Producto de prueba B para subcategoría ', v_subcategory_name, ' asociado a la línea ', v_line_name),
			v_base_price + 8.50,
			JSON_OBJECT(
				'seed_type', 'test_subcategory',
				'seed_batch', 'prod.sql',
				'subcategory_id', v_subcategory_id,
				'subcategory_name', v_subcategory_name,
				'line_id', v_line_id,
				'line_name', v_line_name,
				'variant', 'B'
			)
		)
		ON DUPLICATE KEY UPDATE
			id_product = LAST_INSERT_ID(id_product),
			id_line_fk = VALUES(id_line_fk),
			id_company_fk = VALUES(id_company_fk),
			name = VALUES(name),
			description = VALUES(description),
			price = VALUES(price),
			attributes = VALUES(attributes),
			updated_at = CURRENT_TIMESTAMP;

		SET v_product_id = LAST_INSERT_ID();

		UPDATE Stock
		SET
			quantity = 25 + MOD(v_subcategory_id, 12),
			min_stock = 5,
			updated_at = CURRENT_TIMESTAMP
		WHERE id_product_fk = v_product_id;

		IF ROW_COUNT() = 0 THEN
			INSERT INTO Stock (
				id_product_fk,
				quantity,
				min_stock
			)
			VALUES (
				v_product_id,
				25 + MOD(v_subcategory_id, 12),
				5
			);
		END IF;

		INSERT INTO Product_Image (
			id_product_fk,
			image_url,
			is_main,
			sort_order
		)
		SELECT
			v_product_id,
			CONCAT('/uploads/products/', LOWER(REPLACE(v_sku, ' ', '-')), '.jpg'),
			TRUE,
			0
		FROM DUAL
		WHERE NOT EXISTS (
			SELECT 1
			FROM Product_Image pi
			WHERE pi.id_product_fk = v_product_id
			  AND pi.sort_order = 0
		);
	END LOOP;

	CLOSE cur_subcategories;
END //

DELIMITER ;

CALL sp_seed_test_products_by_subcategory();
