-- =========================================
-- 🧠 STORED PROCEDURES
-- =========================================

-- =========================================
-- 🟢 REGISTRO LOCAL
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_register_customer_local(
    IN p_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_DOB DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255)
)
BEGIN

    IF EXISTS (SELECT 1 FROM Customer WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El correo electrónico ya está registrado';
    END IF;

    IF p_password_hash IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La contraseña no puede ser nula';
    END IF;

    INSERT INTO Customer (
        name, email, password_hash, DOB,
        cell_phone, mail_address,
        auth_provider, is_new, is_verified
    )
    VALUES (
        p_name, p_email, p_password_hash, p_DOB,
        p_cell_phone, p_mail_address,
        'local', TRUE, FALSE
    );

    SET @new_customer_id = LAST_INSERT_ID();

    INSERT INTO Cashback (id_customer_fk, value)
    VALUES (@new_customer_id, 0);

END //

DELIMITER ;

-- =========================================
-- 🔵 REGISTRO GOOGLE
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_register_customer_google(
    IN p_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_provider_id VARCHAR(100),
    IN p_DOB DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255)
)
BEGIN

    IF EXISTS (SELECT 1 FROM Customer WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El correo electrónico ya está registrado';
    END IF;

    INSERT INTO Customer (
        name, email, auth_provider, provider_id, DOB,
        cell_phone, mail_address, is_new, is_verified
    )
    VALUES (
        p_name, p_email, 'google', p_provider_id, p_DOB,
        p_cell_phone, p_mail_address, FALSE, TRUE
    );

    SET @new_customer_id = LAST_INSERT_ID();

    INSERT INTO Cashback (id_customer_fk, value)
    VALUES (@new_customer_id, 0);

END //

DELIMITER ;

-- =========================================
-- ✏️ UPDATE CUSTOMER
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_update_customer (
    IN p_id_customer INT,
    IN p_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_DOB DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255),
    IN p_img_profile VARCHAR(255)
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM Customer WHERE id_customer = p_id_customer) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    UPDATE Customer
    SET
        name = COALESCE(p_name, name),
        email = COALESCE(p_email, email),
        password_hash = COALESCE(p_password_hash, password_hash),
        DOB = COALESCE(p_DOB, DOB),
        cell_phone = COALESCE(p_cell_phone, cell_phone),
        mail_address = COALESCE(p_mail_address, mail_address),
        img_profile = COALESCE(p_img_profile, img_profile),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_customer = p_id_customer;

END //

DELIMITER ;

-- =========================================
-- 💰 UPDATE CASHBACK
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_update_cashback (
    IN p_id_customer INT,
    IN p_value DECIMAL(10,2),
    IN p_transaction_type VARCHAR(20),
    IN p_id_transaction_fk INT
)
BEGIN

    DECLARE v_cashback_id INT;
    DECLARE v_current_cashback DECIMAL(10,2);

    IF NOT EXISTS (SELECT 1 FROM Customer WHERE id_customer = p_id_customer) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    SELECT id_cashback, value INTO v_cashback_id, v_current_cashback
    FROM Cashback WHERE id_customer_fk = p_id_customer;

    IF p_transaction_type = 'acumulate' THEN
        SET v_current_cashback = v_current_cashback + p_value;
    ELSEIF p_transaction_type = 'redemption' THEN
        IF v_current_cashback < p_value THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Saldo insuficiente para redención';
        END IF;
        SET v_current_cashback = v_current_cashback - p_value;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Tipo de transacción inválido';
    END IF;

    UPDATE Cashback
    SET value = v_current_cashback,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_customer_fk = p_id_customer;

    INSERT INTO Cashback_History (
        id_cashback_fk, value, transaction_type,
        created_at, id_transaction_fk
    )
    VALUES (
        v_cashback_id, p_value, p_transaction_type,
        CURRENT_TIMESTAMP, p_id_transaction_fk
    );

END //

DELIMITER ;

-- =========================================
-- 🔒 SEGURIDAD LOGIN CUSTOMER
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_update_login_failed (
    IN p_id_customer INT
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM Customer WHERE id_customer = p_id_customer) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    UPDATE Customer
    SET attempts = attempts + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_customer = p_id_customer;

END //

DELIMITER ;

-- =========================================
-- 🔄 RESET INTENTOS CUSTOMER
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_reset_login_failed (
    IN p_id_customer INT
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM Customer WHERE id_customer = p_id_customer) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    UPDATE Customer
    SET attempts = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_customer = p_id_customer;

END //

DELIMITER ;

-- =========================================
-- 🔒 BLOQUEAR / DESBLOQUEAR CUSTOMER
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_toggle_customer_status (
    IN p_id_customer INT,
    IN p_is_active BOOLEAN
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM Customer WHERE id_customer = p_id_customer) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    UPDATE Customer
    SET is_active = p_is_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_customer = p_id_customer;

END //

DELIMITER ;

-- ========================================
-- 🟢 REGISTRO COMPANY
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_register_company (
    IN p_name VARCHAR(255),
    IN p_rif VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_cell_phone VARCHAR(20),
    IN p_mail_address VARCHAR(255),
    IN p_id_role_fk INT
)
BEGIN

    IF EXISTS (SELECT 1 FROM Company WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Correo ya registrado';
    END IF;

    IF EXISTS (SELECT 1 FROM Company WHERE rif = p_rif) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RIF ya registrado';
    END IF;

    INSERT INTO Company (
        name, rif, email, password_hash,
        cell_phone, mail_address, id_role_fk
    )
    VALUES (
        p_name, p_rif, p_email, p_password_hash,
        p_cell_phone, p_mail_address, p_id_role_fk
    );


END //

DELIMITER ;

-- ========================================
-- ✏️ UPDATE COMPANY
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_update_company (
    IN p_id_company INT,
    IN p_name VARCHAR(255),
    IN p_rif VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_cell_phone VARCHAR(20),
    IN p_mail_address VARCHAR(255),
    IN p_id_role_fk INT
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_id_company) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empresa no existe';
    END IF;

    UPDATE Company
    SET
        name = COALESCE(p_name, name),
        rif = COALESCE(p_rif, rif),
        email = COALESCE(p_email, email),
        password_hash = COALESCE(p_password_hash, password_hash),
        cell_phone = COALESCE(p_cell_phone, cell_phone),
        mail_address = COALESCE(p_mail_address, mail_address),
        id_role_fk = COALESCE(p_id_role_fk, id_role_fk),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_company = p_id_company;

END //

DELIMITER ;

-- =========================================
-- 🔒 SEGURIDAD LOGIN COMPANY
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_update_login_failed_company (
    IN p_id_company INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_id_company) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La empresa no existe';
    END IF;

    UPDATE Company
    SET attempts = attempts + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_company = p_id_company;
END //

DELIMITER ;

-- =========================================
-- 🔄 RESET INTENTOS COMPANY
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_reset_login_failed_company (
    IN p_id_company INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_id_company) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La empresa no existe';
    END IF;

    UPDATE Company
    SET attempts = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_company = p_id_company;
END //

DELIMITER ;

-- ========================================
-- 🔒 BLOQUEAR / DESBLOQUEAR COMPANY
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_toggle_company_status (
    IN p_id_company INT,
    IN p_is_active BOOLEAN
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_id_company) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La empresa no existe';
    END IF;

    UPDATE Company
    SET is_active = p_is_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_company = p_id_company;
END //

DELIMITER ;

-- ========================================
-- 💳 ASIGNAR CRÉDITO
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_create_credit (
    IN p_retailer INT,
    IN p_wholesaler INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN

    DECLARE v_id_credit INT;

    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_retailer) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Detallista no existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM Company WHERE id_company = p_wholesaler) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mayorista no existe';
    END IF;

    INSERT INTO Credit_Limit (
        id_retailer_fk, id_wholesaler_fk,
        credit, remaining_amount,
        start_date, due_date
    )
    VALUES (
        p_retailer, p_wholesaler,
        p_amount, p_amount,
        CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    );

    SET v_id_credit = LAST_INSERT_ID();

    INSERT INTO Credit_History (
        id_credit_limit_fk, amount, type,
        previous_balance, new_balance
    )
    VALUES (
        v_id_credit, p_amount, 'ASSIGN', 0, p_amount
    );

END //

DELIMITER ;

-- ========================================
-- 💳 PAGAR CRÉDITO
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_pay_credit (
    IN p_credit_id INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN

    DECLARE v_remaining DECIMAL(10,2);

    IF NOT EXISTS (
        SELECT 1 FROM Credit_Limit WHERE id_credit_limit = p_credit_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Crédito no existe';
    END IF;

    SELECT remaining_amount INTO v_remaining
    FROM Credit_Limit WHERE id_credit_limit = p_credit_id;

    IF v_remaining < p_amount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Pago excede deuda';
    END IF;

    UPDATE Credit_Limit
    SET remaining_amount = remaining_amount - p_amount,
        status = IF(remaining_amount - p_amount < 0.01, 'PAID', 'ACTIVE'),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_credit_limit = p_credit_id;

    INSERT INTO Credit_History (
        id_credit_limit_fk, amount, type,
        previous_balance, new_balance
    )
    VALUES (
        p_credit_id, p_amount, 'PAYMENT',
        v_remaining, v_remaining - p_amount
    );

END //

DELIMITER ;

-- ========================================
-- 💳 CHECKEAR CRÉDITO POR FECHA LÍMITE
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_check_credit_status()
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

        UPDATE Credit_Limit
        SET status = 'LATE'
        WHERE due_date < CURDATE()
        AND remaining_amount > 0;

        UPDATE Company
        SET can_buy = FALSE,
            can_sell = FALSE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_company IN (
            SELECT id_retailer_fk
            FROM Credit_Limit
            WHERE status = 'LATE'
        );

    COMMIT;

END //

DELIMITER ;