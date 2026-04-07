-- =========================================
-- 🧠 STORED PROCEDURES
-- =========================================

-- =========================================
-- 🟢 REGISTRO LOCAL
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_register_user_n_local(
    IN p_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_DOB DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255)
)
BEGIN

    -- 🔍 validar email
    IF EXISTS (SELECT 1 FROM User_N WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El correo electrónico ya está registrado';
    END IF;

    -- 🔐 validar password
    IF p_password_hash IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La contraseña no puede ser nula';
    END IF;

    -- 🧑 insertar usuario
    INSERT INTO User_N (
        name,
        email,
        password_hash,
        DOB,
        cell_phone,
        mail_address,
        auth_provider,
        is_new,
        is_verified
    )
    VALUES (
        p_name,
        p_email,
        p_password_hash,
        p_DOB,
        p_cell_phone,
        p_mail_address,
        'local',
        TRUE,
        FALSE
    );

    SET @new_user_id = LAST_INSERT_ID();

    -- 💰 cashback inicial
    INSERT INTO Cashback (id_user_n_fk, value)
    VALUES (@new_user_id, 0);

END //

DELIMITER ;

-- =========================================
-- 🔵 REGISTRO GOOGLE
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_register_user_n_google(
    IN p_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_provider_id VARCHAR(100),
    IN p_DOB DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255)
)
BEGIN

    IF EXISTS (SELECT 1 FROM User_N WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El correo electrónico ya está registrado';
    END IF;

    INSERT INTO User_N (
        name,
        email,
        auth_provider,
        provider_id,
        DOB,
        cell_phone,
        mail_address,
        is_new,
        is_verified
    )
    VALUES (
        p_name,
        p_email,
        'google',
        p_provider_id,
        p_DOB,
        p_cell_phone,
        p_mail_address,
        FALSE,
        TRUE
    );

    SET @new_user_id = LAST_INSERT_ID();

    INSERT INTO Cashback (id_user_n_fk, value)
    VALUES (@new_user_id, 0);

END //

DELIMITER ;

-- =========================================
-- ✏️ UPDATE USUARIO
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_update_user_n (
    IN p_id_user_n INT,
    IN p_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_DOB DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255),
    IN p_img_profile VARCHAR(255)
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    IF p_password_hash IS NULL THEN
        SET p_password_hash = (
            SELECT password_hash FROM User_N WHERE id_user_n = p_id_user_n
        );
    END IF;

    UPDATE User_N
    SET
        name = COALESCE(p_name, name),
        email = COALESCE(p_email, email),
        password_hash = COALESCE(p_password_hash, password_hash),
        DOB = COALESCE(p_DOB, DOB),
        cell_phone = COALESCE(p_cell_phone, cell_phone),
        mail_address = COALESCE(p_mail_address, mail_address),
        img_profile = COALESCE(p_img_profile, img_profile),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n = p_id_user_n;

END //

DELIMITER ;

-- =========================================
-- 💰 UPDATE CASHBACK
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_update_cashback (
    IN p_id_user_n INT,
    IN p_value DECIMAL(10,2),
    IN p_transaction_type VARCHAR(20),
    IN p_id_transaction_fk INT
)
BEGIN

    DECLARE v_cashback_id INT;
    DECLARE v_current_cashback DECIMAL(10,2);

    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    SELECT id_cashback INTO v_cashback_id
    FROM Cashback WHERE id_user_n_fk = p_id_user_n;

    SELECT value INTO v_current_cashback
    FROM Cashback WHERE id_user_n_fk = p_id_user_n;

    IF p_transaction_type = 'acumulate' THEN
        SET v_current_cashback = v_current_cashback + p_value;
    ELSEIF p_transaction_type = 'redemption' THEN
        IF v_current_cashback < p_value THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Saldo insuficiente para redención';
    END IF;

    SET v_current_cashback = v_current_cashback - p_value;    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Tipo de transacción inválido';
    END IF;

    UPDATE Cashback
    SET value = v_current_cashback,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n_fk = p_id_user_n;

    INSERT INTO Cashback_History (
        id_cashback_fk,
        value,
        transaction_type,
        created_at,
        id_transaction_fk
    )
    VALUES (
        v_cashback_id,
        p_value,
        p_transaction_type,
        CURRENT_TIMESTAMP,
        p_id_transaction_fk
    );

END //

DELIMITER ;

-- =========================================
-- 🔒 SEGURIDAD LOGIN
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_update_login_failed (
    IN p_id_user_n INT
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    UPDATE User_N
    SET attempts = attempts + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n = p_id_user_n;

END //

DELIMITER ;

-- =========================================
-- 🔄 RESET INTENTOS
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_reset_login_failed (
    IN p_id_user_n INT
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    UPDATE User_N
    SET attempts = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n = p_id_user_n;

END //

DELIMITER ;

-- =========================================
-- 🔒 BLOQUEAR / DESBLOQUEAR
-- =========================================

DELIMITER //

CREATE PROCEDURE sp_toggle_user_active (
    IN p_id_user_n INT,
    IN p_is_active BOOLEAN
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    UPDATE User_N
    SET is_active = p_is_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n = p_id_user_n;

END //

DELIMITER ;

-- ========================================
-- 🟢 REGISTRO JURÍDICO
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_register_user_j (
    IN p_name VARCHAR(255),
    IN p_rif VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_cell_phone VARCHAR(20),
    IN p_mail_address VARCHAR(255),
    IN p_id_role_fk INT,
    OUT p_id_user_j INT
)
BEGIN

    IF EXISTS (SELECT 1 FROM User_J WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Correo ya registrado';
    END IF;

    IF EXISTS (SELECT 1 FROM User_J WHERE rif = p_rif) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RIF ya registrado';
    END IF;

    INSERT INTO User_J (
        name, rif, email, password_hash,
        cell_phone, mail_address, id_role_fk
    )
    VALUES (
        p_name, p_rif, p_email, p_password_hash,
        p_cell_phone, p_mail_address, p_id_role_fk
    );

    SET p_id_user_j = LAST_INSERT_ID();

END //

DELIMITER ;

-- ========================================
-- ✏️ UPDATE USUARIO JURÍDICO
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_update_user_j (
    IN p_id_user_j INT,
    IN p_name VARCHAR(255),
    IN p_rif VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_cell_phone VARCHAR(20),
    IN p_mail_address VARCHAR(255),
    IN p_id_role_fk INT
)
BEGIN

    IF NOT EXISTS (SELECT 1 FROM User_J WHERE id_user_j = p_id_user_j) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no existe';
    END IF;

    UPDATE User_J
    SET
        name = COALESCE(p_name, name),
        rif = COALESCE(p_rif, rif),
        email = COALESCE(p_email, email),
        password_hash = COALESCE(p_password_hash, password_hash),
        cell_phone = COALESCE(p_cell_phone, cell_phone),
        mail_address = COALESCE(p_mail_address, mail_address),
        id_role_fk = COALESCE(p_id_role_fk, id_role_fk)
    WHERE id_user_j = p_id_user_j;

END //

DELIMITER ;

-- =========================================
-- 🔒 SEGURIDAD LOGIN JURÍDICO
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_update_login_failed_j (
    IN p_id_user_j INT
)
BEGIN
    UPDATE User_J
    SET attempts = attempts + 1
    WHERE id_user_j = p_id_user_j;
END //

DELIMITER ;

-- =========================================
-- 🔄 RESET INTENTOS JURÍDICO
-- =========================================
DELIMITER //

CREATE PROCEDURE sp_reset_login_failed_j (
    IN p_id_user_j INT
)
BEGIN
    UPDATE User_J
    SET attempts = 0
    WHERE id_user_j = p_id_user_j;
END //

DELIMITER ;

-- ========================================
-- 🔒 BLOQUEAR / DESBLOQUEAR JURÍDICO
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_toggle_user_j_status (
    IN p_id_user_j INT,
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE User_J
    SET is_active = p_is_active
    WHERE id_user_j = p_id_user_j;
END //

DELIMITER ;

-- ========================================
-- 💳 ASIGNAR CRÉDITO
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_create_credit (
    IN p_detallista INT,
    IN p_mayorista INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN

    -- ❌ validar crédito activo
    IF EXISTS (
        SELECT 1 FROM Credit_Limit
        WHERE id_detallista_fk = p_detallista
        AND status = 'ACTIVE'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ya tiene un crédito activo';
    END IF;

    -- crear crédito
    INSERT INTO Credit_Limit (
        id_detallista_fk,
        id_mayorista_fk,
        credit,
        remaining_amount,
        start_date,
        due_date
    )
    VALUES (
        p_detallista,
        p_mayorista,
        p_amount,
        p_amount,
        CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    );

    SET @id_credit = LAST_INSERT_ID();

    -- historial
    INSERT INTO Credit_History (
        id_credit_limit_fk,
        amount,
        type,
        previous_balance,
        new_balance
    )
    VALUES (
        @id_credit,
        p_amount,
        'ASSIGN',
        0,
        p_amount
    );

END //

DELIMITER ;

-- ========================================
-- 💳 ACTUALIZAR CRÉDITO
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_pay_credit (
    IN p_credit_id INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN

    DECLARE v_remaining DECIMAL(10,2);

    -- validar existencia
    IF NOT EXISTS (
        SELECT 1 FROM Credit_Limit WHERE id_credit_limit = p_credit_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Crédito no existe';
    END IF;

    SELECT remaining_amount INTO v_remaining
    FROM Credit_Limit
    WHERE id_credit_limit = p_credit_id;

    IF v_remaining < p_amount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Pago excede deuda';
    END IF;

    -- actualizar saldo
    UPDATE Credit_Limit
    SET remaining_amount = remaining_amount - p_amount,
        status = IF(remaining_amount - p_amount < 0.01, 'PAID', 'ACTIVE')
    WHERE id_credit_limit = p_credit_id;

    -- historial
    INSERT INTO Credit_History (
        id_credit_limit_fk,
        amount,
        type,
        previous_balance,
        new_balance
    )
    VALUES (
        p_credit_id,
        p_amount,
        'PAYMENT',
        v_remaining,
        v_remaining - p_amount
    );

END //

DELIMITER ;

-- ========================================
-- 💳 CHECKEAR CRÉDITO POR FECHA LÍMITE
-- ========================================
DELIMITER //

CREATE PROCEDURE sp_check_credit_status()
BEGIN

    -- marcar como LATE
    UPDATE Credit_Limit
    SET status = 'LATE'
    WHERE due_date < CURDATE()
    AND remaining_amount > 0;

    -- bloquear usuarios
    UPDATE User_J
    SET is_active = FALSE
    WHERE id_user_j IN (
        SELECT id_detallista_fk
        FROM Credit_Limit
        WHERE status = 'LATE'
    );

END //

DELIMITER ;