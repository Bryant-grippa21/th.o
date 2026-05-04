DELIMITER //

CREATE PROCEDURE sp_seed_demo_categories()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Category WHERE name = 'Herramientas manuales'
    ) THEN
        INSERT INTO Category (name) VALUES ('Herramientas manuales');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM Category WHERE name = 'Pintura y acabados'
    ) THEN
        INSERT INTO Category (name) VALUES ('Pintura y acabados');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM Category WHERE name = 'Electricidad'
    ) THEN
        INSERT INTO Category (name) VALUES ('Electricidad');
    END IF;

    INSERT INTO Subcategory (name, id_category_fk)
    SELECT 'Alicates', c.id_category
    FROM Category c
    WHERE c.name = 'Herramientas manuales'
      AND NOT EXISTS (
          SELECT 1
          FROM Subcategory s
          WHERE s.name = 'Alicates'
            AND s.id_category_fk = c.id_category
      );

    INSERT INTO Subcategory (name, id_category_fk)
    SELECT 'Destornilladores', c.id_category
    FROM Category c
    WHERE c.name = 'Herramientas manuales'
      AND NOT EXISTS (
          SELECT 1
          FROM Subcategory s
          WHERE s.name = 'Destornilladores'
            AND s.id_category_fk = c.id_category
      );

    INSERT INTO Subcategory (name, id_category_fk)
    SELECT 'Brochas', c.id_category
    FROM Category c
    WHERE c.name = 'Pintura y acabados'
      AND NOT EXISTS (
          SELECT 1
          FROM Subcategory s
          WHERE s.name = 'Brochas'
            AND s.id_category_fk = c.id_category
      );

    INSERT INTO Subcategory (name, id_category_fk)
    SELECT 'Rodillos', c.id_category
    FROM Category c
    WHERE c.name = 'Pintura y acabados'
      AND NOT EXISTS (
          SELECT 1
          FROM Subcategory s
          WHERE s.name = 'Rodillos'
            AND s.id_category_fk = c.id_category
      );

    INSERT INTO Subcategory (name, id_category_fk)
    SELECT 'Extensiones', c.id_category
    FROM Category c
    WHERE c.name = 'Electricidad'
      AND NOT EXISTS (
          SELECT 1
          FROM Subcategory s
          WHERE s.name = 'Extensiones'
            AND s.id_category_fk = c.id_category
      );
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_seed_demo_products(
    IN p_company_id INT
)
BEGIN
    DECLARE v_subcategory_brochas INT;
    DECLARE v_subcategory_alicates INT;
    DECLARE v_subcategory_extensiones INT;
    DECLARE v_product_id INT;

    IF NOT EXISTS (
        SELECT 1 FROM Company WHERE id_company = p_company_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no existe';
    END IF;

    CALL sp_seed_demo_categories();

    SELECT id_subcategory INTO v_subcategory_brochas
    FROM Subcategory
    WHERE name = 'Brochas'
    LIMIT 1;

    SELECT id_subcategory INTO v_subcategory_alicates
    FROM Subcategory
    WHERE name = 'Alicates'
    LIMIT 1;

    SELECT id_subcategory INTO v_subcategory_extensiones
    FROM Subcategory
    WHERE name = 'Extensiones'
    LIMIT 1;

    IF NOT EXISTS (
        SELECT 1
        FROM Product
        WHERE name = 'Brocha profesional 2 pulgadas'
          AND id_company_fk = p_company_id
    ) THEN
        CALL sp_create_product_full(
            'Brocha profesional 2 pulgadas',
            v_subcategory_brochas,
            p_company_id,
            'GenTools',
            'DEMO-BROCHA-2IN',
            'Brocha para pintura base agua y esmalte',
            6.50,
            JSON_OBJECT('medida', '2in', 'tipo', 'acabado'),
            24,
            6,
            NULL
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM Product
        WHERE name = 'Alicate universal 8 pulgadas'
          AND id_company_fk = p_company_id
    ) THEN
        CALL sp_create_product_full(
            'Alicate universal 8 pulgadas',
            v_subcategory_alicates,
            p_company_id,
            'Pretul',
            'DEMO-ALICATE-8IN',
            'Alicate multiuso para taller y uso general',
            11.90,
            JSON_OBJECT('medida', '8in', 'material', 'acero'),
            18,
            4,
            NULL
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM Product
        WHERE name = 'Extension electrica reforzada 10m'
          AND id_company_fk = p_company_id
    ) THEN
        CALL sp_create_product_full(
            'Extension electrica reforzada 10m',
            v_subcategory_extensiones,
            p_company_id,
            'Voltmax',
            'DEMO-EXT-10M',
            'Extension con protector para uso domestico y ferretero',
            14.75,
            JSON_OBJECT('longitud', '10m', 'amperaje', '10A'),
            10,
            3,
            NULL
        );
    END IF;

    SELECT id_product INTO v_product_id
    FROM Product
    WHERE name = 'Brocha profesional 2 pulgadas'
      AND id_company_fk = p_company_id
    LIMIT 1;

    IF v_product_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM Product_Variant WHERE sku = 'DEMO-BROCHA-3IN'
    ) THEN
        CALL sp_add_variant(
            v_product_id,
            'DEMO-BROCHA-3IN',
            'Version de 3 pulgadas para cobertura amplia',
            7.80,
            JSON_OBJECT('medida', '3in', 'tipo', 'acabado'),
            12,
            4,
            NULL
        );
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_seed_demo_catalog_for_admin()
BEGIN
    CALL sp_seed_demo_products(1);
END //

DELIMITER ;
