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

CREATE PROCEDURE sp_create_product_full(
    IN p_name VARCHAR(150),
    IN p_id_subcategory INT,
    IN p_id_user INT,
    IN p_brand VARCHAR(100),

    IN p_sku VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_price DECIMAL(10,2),
    IN p_cost DECIMAL(10,2),
    IN p_attributes JSON,

    IN p_quantity INT,
    IN p_min_stock INT,

    IN p_image_url VARCHAR(255)
)
BEGIN

    DECLARE v_product_id INT;
    DECLARE v_variant_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error creando producto (rollback ejecutado)';
    END;

    START TRANSACTION;

    -- VALIDACIONES
    IF NOT EXISTS (SELECT 1 FROM User_J WHERE id_user_j = p_id_user) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM Subcategory WHERE id_subcategory = p_id_subcategory) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Subcategoría no existe';
    END IF;

    -- PRODUCTO
    INSERT INTO Product (name, id_subcategory_fk, id_user_j_fk, brand)
    VALUES (p_name, p_id_subcategory, p_id_user, p_brand);

    SET v_product_id = LAST_INSERT_ID();

    -- SKU AUTO
    SET p_sku = IFNULL(p_sku, CONCAT('SKU-', v_product_id));

    -- VARIANTE
    INSERT INTO Product_Variant (
        id_product_fk, sku, description, price, cost, attributes
    )
    VALUES (
        v_product_id, p_sku, p_description, p_price, p_cost, p_attributes
    );

    SET v_variant_id = LAST_INSERT_ID();

    -- STOCK
    INSERT INTO Stock (id_variant_fk, quantity, min_stock)
    VALUES (v_variant_id, p_quantity, p_min_stock);

    -- IMAGEN
    IF p_image_url IS NOT NULL THEN
        INSERT INTO Product_Image (id_variant_fk, image_url, is_main)
        VALUES (v_variant_id, p_image_url, TRUE);
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
        SELECT 1 FROM Product WHERE id_product = p_id_product
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto no existe';
    END IF;

    UPDATE Product
    SET
        name = COALESCE(p_name, name),
        brand = COALESCE(p_brand, brand),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_product = p_id_product;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_update_variant (
    IN p_id_variant INT,
    IN p_price DECIMAL(10,2),
    IN p_cost DECIMAL(10,2),
    IN p_attributes JSON
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Product_Variant WHERE id_variant = p_id_variant
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Variante no existe';
    END IF;

    UPDATE Product_Variant
    SET
        price = COALESCE(p_price, price),
        cost = COALESCE(p_cost, cost),
        attributes = COALESCE(p_attributes, attributes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_variant = p_id_variant;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_toggle_product (
    IN p_id_product INT,
    IN p_is_active BOOLEAN
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Product WHERE id_product = p_id_product
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto no existe';
    END IF;

    UPDATE Product
    SET is_active = p_is_active
    WHERE id_product = p_id_product;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_toggle_variant (
    IN p_id_variant INT,
    IN p_is_active BOOLEAN
)
BEGIN

    UPDATE Product_Variant
    SET is_active = p_is_active
    WHERE id_variant = p_id_variant;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_create_product_auto (
    IN p_categoria VARCHAR(100),
    IN p_subcategoria VARCHAR(100),
    IN p_producto VARCHAR(150),
    IN p_id_user INT
)
BEGIN

    DECLARE v_category_id INT;
    DECLARE v_subcategory_id INT;
    DECLARE v_product_id INT;
    DECLARE v_variant_id INT;

    -- categoría
    SELECT id_category INTO v_category_id
    FROM Category WHERE name = p_categoria LIMIT 1;

    -- subcategoría
    SELECT id_subcategory INTO v_subcategory_id
    FROM Subcategory 
    WHERE name = p_subcategoria 
    AND id_category_fk = v_category_id
    LIMIT 1;

    IF v_subcategory_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subcategoría no existe';
    END IF;

    -- producto
    INSERT INTO Product (
        name,
        id_subcategory_fk,
        id_user_j_fk
    )
    VALUES (
        p_producto,
        v_subcategory_id,
        p_id_user
    );

    SET v_product_id = LAST_INSERT_ID();

    -- variante básica
    INSERT INTO Product_Variant (
        id_product_fk,
        sku,
        price,
        attributes
    )
    VALUES (
        v_product_id,
        CONCAT('AUTO-', v_product_id),
        0,
        JSON_OBJECT('default', 'auto')
    );

    SET v_variant_id = LAST_INSERT_ID();

    -- stock
    INSERT INTO Stock (
        id_variant_fk,
        quantity
    )
    VALUES (
        v_variant_id,
        0
    );

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_add_variant (
    IN p_id_product INT,

    IN p_sku VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_price DECIMAL(10,2),
    IN p_cost DECIMAL(10,2),
    IN p_attributes JSON,

    IN p_quantity INT,
    IN p_min_stock INT,

    IN p_image_url VARCHAR(255)
)
BEGIN

    DECLARE v_variant_id INT;

    -- validar producto
    IF NOT EXISTS (
        SELECT 1 FROM Product WHERE id_product = p_id_product
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto no existe';
    END IF;

    -- validar SKU único
    IF EXISTS (
        SELECT 1 FROM Product_Variant WHERE sku = p_sku
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SKU ya existe';
    END IF;

    -- crear variante
    INSERT INTO Product_Variant (
        id_product_fk,
        sku,
        description,
        price,
        cost,
        attributes
    )
    VALUES (
        p_id_product,
        p_sku,
        p_description,
        p_price,
        p_cost,
        p_attributes
    );

    SET v_variant_id = LAST_INSERT_ID();

    -- stock
    INSERT INTO Stock (
        id_variant_fk,
        quantity,
        min_stock
    )
    VALUES (
        v_variant_id,
        p_quantity,
        p_min_stock
    );

    -- imagen
    IF p_image_url IS NOT NULL THEN
        INSERT INTO Product_Image (
            id_variant_fk,
            image_url,
            is_main
        )
        VALUES (
            v_variant_id,
            p_image_url,
            TRUE
        );
    END IF;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_update_stock (
    IN p_id_variant INT,
    IN p_quantity INT
)
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM Stock WHERE id_variant_fk = p_id_variant
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock no existe';
    END IF;

    UPDATE Stock
    SET quantity = p_quantity
    WHERE id_variant_fk = p_id_variant;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_add_stock (
    IN p_id_variant INT,
    IN p_amount INT
)
BEGIN

    UPDATE Stock
    SET quantity = quantity + p_amount
    WHERE id_variant_fk = p_id_variant;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_remove_stock (
    IN p_id_variant INT,
    IN p_amount INT
)
BEGIN

    DECLARE v_stock INT;

    START TRANSACTION;

    SELECT quantity INTO v_stock
    FROM Stock
    WHERE id_variant_fk = p_id_variant
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
    SET quantity = quantity - p_amount
    WHERE id_variant_fk = p_id_variant;

    COMMIT;

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_internal_create_variant (
    IN p_id_product INT,
    IN p_sku VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_price DECIMAL(10,2),
    IN p_cost DECIMAL(10,2),
    IN p_attributes JSON,
    OUT p_variant_id INT
)
BEGIN

    INSERT INTO Product_Variant (
        id_product_fk, sku, description, price, cost, attributes
    )
    VALUES (
        p_id_product, p_sku, p_description, p_price, p_cost, p_attributes
    );

    SET p_variant_id = LAST_INSERT_ID();

END //

DELIMITER ;