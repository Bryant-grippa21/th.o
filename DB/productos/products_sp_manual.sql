DELIMITER //

CREATE PROCEDURE sp_admin_create_category (
    IN p_name VARCHAR(100)
)
BEGIN

    IF EXISTS (
        SELECT 1 FROM Category WHERE name = p_name
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Categoría ya existe';
    END IF;

    INSERT INTO Category (name)
    VALUES (p_name);

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_update_category (
    IN p_id_category INT,
    IN p_name VARCHAR(100)
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Category WHERE id_category = p_id_category
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Categoría no existe';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM Category
        WHERE name = p_name AND id_category <> p_id_category
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Categoría ya existe';
    END IF;

    UPDATE Category
    SET name = COALESCE(NULLIF(p_name, ''), name)
    WHERE id_category = p_id_category;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_toggle_category (
    IN p_id_category INT,
    IN p_is_active BOOLEAN
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Category WHERE id_category = p_id_category
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Categoría no existe';
    END IF;

    UPDATE Category
    SET is_active = p_is_active
    WHERE id_category = p_id_category;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_admin_create_subcategory (
    IN p_name VARCHAR(100),
    IN p_id_category INT
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Category WHERE id_category = p_id_category
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Categoría no existe';
    END IF;

    IF EXISTS (
        SELECT 1 FROM Subcategory 
        WHERE name = p_name AND id_category_fk = p_id_category
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subcategoría ya existe';
    END IF;

    INSERT INTO Subcategory (name, id_category_fk)
    VALUES (p_name, p_id_category);

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_update_subcategory (
    IN p_id_subcategory INT,
    IN p_name VARCHAR(100),
    IN p_id_category INT
)
BEGIN

    DECLARE v_category_id INT;

    IF NOT EXISTS (
        SELECT 1 FROM Subcategory WHERE id_subcategory = p_id_subcategory
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subcategoría no existe';
    END IF;

    SET v_category_id = p_id_category;

    IF v_category_id IS NULL THEN
        SELECT id_category_fk INTO v_category_id
        FROM Subcategory
        WHERE id_subcategory = p_id_subcategory
        LIMIT 1;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM Category WHERE id_category = v_category_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Categoría no existe';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM Subcategory
        WHERE name = COALESCE(NULLIF(p_name, ''), name)
          AND id_category_fk = v_category_id
          AND id_subcategory <> p_id_subcategory
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subcategoría ya existe';
    END IF;

    UPDATE Subcategory
    SET
        name = COALESCE(NULLIF(p_name, ''), name),
        id_category_fk = v_category_id
    WHERE id_subcategory = p_id_subcategory;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_toggle_subcategory (
    IN p_id_subcategory INT,
    IN p_is_active BOOLEAN
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Subcategory WHERE id_subcategory = p_id_subcategory
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subcategoría no existe';
    END IF;

    UPDATE Subcategory
    SET is_active = p_is_active
    WHERE id_subcategory = p_id_subcategory;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_create_product_full(
    IN p_name VARCHAR(150),
    IN p_id_subcategory INT,
    IN p_id_company INT,                    -- ✅ p_id_user → p_id_company
    IN p_brand VARCHAR(100),

    IN p_sku VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_price DECIMAL(10,2),
    IN p_attributes JSON,

    IN p_quantity INT,
    IN p_min_stock INT,

    IN p_image_url VARCHAR(255)
)
BEGIN

    DECLARE v_line_id INT;
    DECLARE v_product_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error creando producto (rollback ejecutado)';
    END;

    START TRANSACTION;

    -- ✅ User_J → Company
    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_id_company) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empresa no existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM Subcategory WHERE id_subcategory = p_id_subcategory) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Subcategoría no existe';
    END IF;

    -- ✅ id_user_j_fk → id_company_fk
    INSERT INTO Line (name, id_subcategory_fk, id_company_fk)
    VALUES (p_name, p_id_subcategory, p_id_company);

    SET v_line_id = LAST_INSERT_ID();

    SET p_sku = IFNULL(p_sku, CONCAT('SKU-', v_line_id));

    INSERT INTO Product (
        id_line_fk, sku, brand, description, price, attributes
    )
    VALUES (
        v_line_id, p_sku, p_brand, p_description, p_price, p_attributes
    );

    SET v_product_id = LAST_INSERT_ID();

    INSERT INTO Stock (id_product_fk, quantity, min_stock)
    VALUES (v_product_id, p_quantity, p_min_stock);

    IF p_image_url IS NOT NULL THEN
        INSERT INTO Product_Image (id_product_fk, image_url, is_main)
        VALUES (v_product_id, p_image_url, TRUE);
    END IF;

    COMMIT;

END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE sp_update_product (
    IN p_id_product INT,
    IN p_name VARCHAR(150),
    IN p_brand VARCHAR(100)
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Line WHERE id_line = p_id_product
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Línea no existe';
    END IF;

    UPDATE Line
    SET
        name = COALESCE(p_name, name),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_line = p_id_product;

    UPDATE Product
    SET
        brand = COALESCE(p_brand, brand),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_line_fk = p_id_product;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_update_variant (
    IN p_id_variant INT,
    IN p_price DECIMAL(10,2),
    IN p_attributes JSON
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Product WHERE id_product = p_id_variant
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto no existe';
    END IF;

    UPDATE Product
    SET
        price = COALESCE(p_price, price),
        attributes = COALESCE(p_attributes, attributes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_product = p_id_variant;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_toggle_product (
    IN p_id_product INT,
    IN p_is_active BOOLEAN
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Line WHERE id_line = p_id_product
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Línea no existe';
    END IF;

    UPDATE Line
    SET is_active = p_is_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_line = p_id_product;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_toggle_variant (
    IN p_id_variant INT,
    IN p_is_active BOOLEAN
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Product WHERE id_product = p_id_variant
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto no existe';
    END IF;

    UPDATE Product
    SET is_active = p_is_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_product = p_id_variant;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_create_product_auto (
    IN p_categoria VARCHAR(100),
    IN p_subcategoria VARCHAR(100),
    IN p_producto VARCHAR(150),
    IN p_id_company INT                     -- ✅ p_id_user → p_id_company
)
BEGIN

    DECLARE v_category_id INT;
    DECLARE v_subcategory_id INT;
    DECLARE v_line_id INT;
    DECLARE v_product_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- ✅ User_J → Company
    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_id_company) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no existe';
    END IF;

    SELECT id_category INTO v_category_id
    FROM Category WHERE name = p_categoria LIMIT 1;

    IF v_category_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Categoría no existe';
    END IF;

    SELECT id_subcategory INTO v_subcategory_id
    FROM Subcategory 
    WHERE name = p_subcategoria 
    AND id_category_fk = v_category_id
    LIMIT 1;

    IF v_subcategory_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subcategoría no existe';
    END IF;

    -- ✅ id_user_j_fk → id_company_fk
    INSERT INTO Line (
        name,
        id_subcategory_fk,
        id_company_fk
    )
    VALUES (
        p_producto,
        v_subcategory_id,
        p_id_company
    );

    SET v_line_id = LAST_INSERT_ID();

    INSERT INTO Product (
        id_line_fk,
        sku,
        price,
        attributes
    )
    VALUES (
        v_line_id,
        CONCAT('AUTO-', v_line_id),
        0,
        JSON_OBJECT('default', 'auto')
    );

    SET v_product_id = LAST_INSERT_ID();

    INSERT INTO Stock (
        id_product_fk,
        quantity
    )
    VALUES (
        v_product_id,
        0
    );

    COMMIT;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_add_variant (
    IN p_id_product INT,

    IN p_sku VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_price DECIMAL(10,2),
    IN p_attributes JSON,

    IN p_quantity INT,
    IN p_min_stock INT,

    IN p_image_url VARCHAR(255)
)
BEGIN

    DECLARE v_product_id INT;

    -- validar linea
    IF NOT EXISTS (
        SELECT 1 FROM Line WHERE id_line = p_id_product
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Línea no existe';
    END IF;

    -- validar SKU único
    IF EXISTS (
        SELECT 1 FROM Product WHERE sku = p_sku
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SKU ya existe';
    END IF;

    -- crear producto dentro de la linea
    INSERT INTO Product (
        id_line_fk,
        sku,
        description,
        price,
        attributes
    )
    VALUES (
        p_id_product,
        p_sku,
        p_description,
        p_price,
        p_attributes
    );

    SET v_product_id = LAST_INSERT_ID();

    -- stock
    INSERT INTO Stock (
        id_product_fk,
        quantity,
        min_stock
    )
    VALUES (
        v_product_id,
        p_quantity,
        p_min_stock
    );

    -- imagen
    IF p_image_url IS NOT NULL THEN
        INSERT INTO Product_Image (
            id_product_fk,
            image_url,
            is_main
        )
        VALUES (
            v_product_id,
            p_image_url,
            TRUE
        );
    END IF;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_update_stock (
    IN p_id_variant INT,
    IN p_quantity INT,
    IN p_movement_type ENUM('PURCHASE','SALE','ADJUSTMENT','RETURN'),
    IN p_notes VARCHAR(255)
)
BEGIN

    DECLARE v_previous_quantity INT;

    IF NOT EXISTS (
        SELECT 1 FROM Stock WHERE id_product_fk = p_id_variant
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock no existe';
    END IF;

    SELECT quantity INTO v_previous_quantity
    FROM Stock WHERE id_product_fk = p_id_variant;

    UPDATE Stock
    SET quantity = p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_product_fk = p_id_variant;

    INSERT INTO Stock_History (
        id_stock_fk,
        quantity_change,
        previous_quantity,
        new_quantity,
        movement_type,
        notes
    )
    SELECT
        id_stock,
        p_quantity - v_previous_quantity,
        v_previous_quantity,
        p_quantity,
        p_movement_type,
        p_notes
    FROM Stock WHERE id_product_fk = p_id_variant;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_add_stock (
    IN p_id_variant INT,
    IN p_amount INT,
    IN p_movement_type ENUM('PURCHASE','SALE','ADJUSTMENT','RETURN'),
    IN p_notes VARCHAR(255)
)
BEGIN

    DECLARE v_stock_id INT;
    DECLARE v_previous_quantity INT;

    START TRANSACTION;

    SELECT id_stock, quantity INTO v_stock_id, v_previous_quantity
    FROM Stock
    WHERE id_product_fk = p_id_variant
    FOR UPDATE;

    IF v_stock_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock no existe';
    END IF;

    UPDATE Stock
    SET quantity = quantity + p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_product_fk = p_id_variant;

    INSERT INTO Stock_History (
        id_stock_fk,
        quantity_change,
        previous_quantity,
        new_quantity,
        movement_type,
        notes
    )
    VALUES (
        v_stock_id,
        p_amount,
        v_previous_quantity,
        v_previous_quantity + p_amount,
        p_movement_type,
        p_notes
    );

    COMMIT;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_remove_stock (
    IN p_id_variant INT,
    IN p_amount INT,
    IN p_movement_type ENUM('PURCHASE','SALE','ADJUSTMENT','RETURN'),
    IN p_notes VARCHAR(255)
)
BEGIN

    DECLARE v_stock_id INT;
    DECLARE v_stock INT;

    START TRANSACTION;

    SELECT id_stock, quantity INTO v_stock_id, v_stock
    FROM Stock
    WHERE id_product_fk = p_id_variant
    FOR UPDATE;

    IF v_stock IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock no existe';
    END IF;

    IF v_stock < p_amount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;

    UPDATE Stock
    SET quantity = quantity - p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_product_fk = p_id_variant;

    INSERT INTO Stock_History (
        id_stock_fk,
        quantity_change,
        previous_quantity,
        new_quantity,
        movement_type,
        notes
    )
    VALUES (
        v_stock_id,
        -p_amount,
        v_stock,
        v_stock - p_amount,
        p_movement_type,
        p_notes
    );

    COMMIT;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_internal_create_variant (
    IN p_id_product INT,
    IN p_sku VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_price DECIMAL(10,2),
    IN p_attributes JSON,
    OUT p_product_id INT
)
BEGIN

    INSERT INTO Product (
        id_line_fk, sku, description, price, attributes
    )
    VALUES (
        p_id_product, p_sku, p_description, p_price, p_attributes
    );

    SET p_product_id = LAST_INSERT_ID();

END //

DELIMITER ;