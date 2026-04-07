-- creación de la base de datos y tablas para usuarios naturales y cashback junto con procedimientos almacenados para registro, actualización de usuarios y manejo de cashback.
DROP DATABASE IF EXISTS tuherramientaonline;
CREATE DATABASE tuherramientaonline;
USE tuherramientaonline;

-- Usuarios naturales
CREATE TABLE User_N (

-- datos personales unicos
    id_user_n INT AUTO_INCREMENT PRIMARY KEY, -- ID de usuario natural
    name VARCHAR(50) NOT NULL, -- Nombre del usuario
    email VARCHAR(100) NOT NULL UNIQUE, -- Correo electrónico del usuario, debe ser único
    DOB DATE NOT NULL, -- Fecha de nacimiento del usuario

-- datos de autenticación
    auth_provider ENUM('local', 'google') DEFAULT 'local', -- Proveedor de autenticación
    provider_id VARCHAR(100) DEFAULT NULL, -- ID del proveedor de autenticación, NULL si es local
    password_hash VARCHAR(255) DEFAULT NULL, -- Hash de la contraseña, NULL permitido para usuarios autenticados por terceros
    is_verified BOOLEAN DEFAULT FALSE, -- Indica si el correo electrónico del usuario ha sido verificado

-- datos de contacto y perfil
    cell_phone VARCHAR(15), -- Número de teléfono del usuario
    mail_address VARCHAR(255), -- Dirección de correspondencia del usuario

-- datos de estado y perfil
    is_active BOOLEAN DEFAULT TRUE, -- Indica si el usuario está activo
    is_new BOOLEAN DEFAULT TRUE, -- Indica si el usuario es nuevo y como validador para que el usuario cambie su contraseña en su primer inicio de sesión o cuando se registre por primera vez como local, o si se registró con google, se omite esta validación y se establece como falso.
    img_profile VARCHAR(255) NOT NULL DEFAULT 'default_profile.png', -- Imagen de perfil del usuario

-- datos de auditoría
    attempts INT DEFAULT 0, -- Número de intentos fallidos de inicio de sesión
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Cashback (
    id_cashback INT AUTO_INCREMENT PRIMARY KEY, -- ID del cashback
    id_user_n_fk INT NOT NULL, -- ID del usuario natural asociado al cashback
    value DECIMAL(10,2) NOT NULL, -- Valor actual del cashback
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de creación del cashback
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Fecha y hora de la última actualización del cashback
);

CREATE TABLE Cashback_History (

-- llave primaria y foranea
    id_cashback_history INT AUTO_INCREMENT PRIMARY KEY,
    id_cashback_fk INT, -- ID del historial de cashback
    id_transaction_fk INT NOT NULL, -- ID de la transacción asociada al cashback

-- datos de la transacción
    value DECIMAL(10,2) NOT NULL, -- Valor del cashback en el momento de la transacción
    transaction_type ENUM('acumulate', 'redemption') NOT NULL, -- Tipo de transacción: acumulación o redención
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha y hora de la transacción
);

-- llaves foraneas
ALTER TABLE Cashback
ADD CONSTRAINT fk_cashback_user_n FOREIGN KEY (id_user_n_fk) REFERENCES User_N(id_user_n);

ALTER TABLE Cashback_History
ADD CONSTRAINT fk_cashback_history_cashback FOREIGN KEY (id_cashback_fk) REFERENCES Cashback(id_cashback);
-- se agregara futura llave foranea a la tabla de transacciones cuando esta sea creada para relacionar el historial de cashback con las transacciones correspondientes.


-- procedimientos almacenados SP

-- procedimiento almacenado para registrar un nuevo usuario local, validando que el correo no exista y que la contraseña no sea nula, además de crear un registro inicial de cashback en 0.
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
    -- 🔍 Validar si el correo ya existe en la base de datos
    IF EXISTS (SELECT 1 FROM User_N WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El correo electrónico ya está registrado';
    END IF;

    -- 🔐 Validar que la contraseña no sea nula (solo aplica para registro local)
    IF p_password_hash IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: La contraseña no puede ser nula';
    END IF;

    -- 🧑 Crear usuario local
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
        TRUE,          -- usuario debe cambiar contraseña
        FALSE          -- requiere verificación por correo
    );

    -- 🆔 Obtener el ID del usuario recién creado
    SET @new_user_id = LAST_INSERT_ID();

    -- 💰 Crear registro inicial de cashback en 0
    INSERT INTO Cashback (
        id_user_n_fk, 
        value
    )
    VALUES (
        @new_user_id, 
        0
    );

END //

DELIMITER ;

-- procedimiento almacenado para registrar un nuevo usuario autenticado por Google, validando que el correo no exista y omitiendo la validación de contraseña, además de crear un registro inicial de cashback en 0.
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
    -- 🔍 Validar si el correo ya existe
    IF EXISTS (SELECT 1 FROM User_N WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El correo electrónico ya está registrado';
    END IF;

    -- 🟢 Crear usuario autenticado con Google
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
        FALSE,     -- no necesita cambio de contraseña
        TRUE       -- ya viene verificado desde Google
    );

    -- 🆔 Obtener ID del nuevo usuario
    SET @new_user_id = LAST_INSERT_ID();

    -- 💰 Crear cashback inicial
    INSERT INTO Cashback (
        id_user_n_fk, 
        value
    )
    VALUES (
        @new_user_id, 
        0
    );

END //

DELIMITER ;

-- procedimiento almacenado para actualizar los datos de un usuario, validando que el usuario exista y permitiendo actualizar solo los campos enviados (si no se envía un campo, se mantiene su valor actual), además de permitir actualizar la contraseña solo si se envía un nuevo hash de contraseña.
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
    -- 🔍 Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    -- 🔐 Si no envían contraseña, mantener la actual
    IF p_password_hash IS NULL THEN
        SET p_password_hash = (
            SELECT password_hash 
            FROM User_N 
            WHERE id_user_n = p_id_user_n
        );
    END IF;

    -- ✏️ Actualizar datos del usuario (solo los enviados)
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

-- procedimiento almacenado para actualizar el cashback de un usuario, validando que el usuario exista, obteniendo el valor actual del cashback, calculando el nuevo valor según el tipo de transacción (acumulación o redención) y actualizando el cashback, además de insertar un registro en el historial de cashback con los detalles de la transacción (valor, tipo, fecha y hora).
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

    -- 🔍 Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    -- 🔎 Obtener ID del cashback del usuario
    SELECT id_cashback 
    INTO v_cashback_id 
    FROM Cashback 
    WHERE id_user_n_fk = p_id_user_n;

    -- 💰 Obtener valor actual del cashback
    SELECT value 
    INTO v_current_cashback 
    FROM Cashback 
    WHERE id_user_n_fk = p_id_user_n;

    -- ➕➖ Calcular nuevo valor según tipo de transacción
    IF p_transaction_type = 'acumulate' THEN
        SET v_current_cashback = v_current_cashback + p_value;

    ELSEIF p_transaction_type = 'redemption' THEN
        SET v_current_cashback = v_current_cashback - p_value;

    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: Tipo de transacción inválido';
    END IF;

    -- 🔄 Actualizar cashback actual
    UPDATE Cashback 
    SET 
        value = v_current_cashback,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n_fk = p_id_user_n;

    -- 🧾 Insertar en historial (LOG INMUTABLE 🔥)
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

-- procedimiento almacenado para actualizar el numero de intentos fallidos de inicio de sesión de un usuario, validando que el usuario exista y actualizando el campo de intentos con el nuevo valor enviado.
DELIMITER //

CREATE PROCEDURE sp_update_login_failed (
    IN p_id_user_n INT
)
BEGIN
    -- 🔍 Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    -- 🔄 Actualizar intentos de inicio de sesión sumando 1 a cada intento
    UPDATE User_N 
    SET 
        attempts = attempts + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n = p_id_user_n;

END //

DELIMITER ;

-- procedimiento almacenado para restablecer el número de intentos fallidos de inicio de sesión de un usuario a 0, validando que el usuario exista y actualizando el campo de intentos a 0.
DELIMITER //

CREATE PROCEDURE sp_reset_login_failed (
    IN p_id_user_n INT
)
BEGIN
    -- 🔍 Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    -- 🔄 Restablecer intentos de inicio de sesión a 0
    UPDATE User_N 
    SET 
        attempts = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n = p_id_user_n;

END //

DELIMITER ;

-- procedimiento almacenado para bloquear o desbloquear un usuario, validando que el usuario exista y actualizando el campo de estado activo según el valor enviado (true para desbloquear, false para bloquear).
DELIMITER //
CREATE PROCEDURE sp_toggle_user_active (
    IN p_id_user_n INT,
    IN p_is_active BOOLEAN
)
BEGIN
    -- 🔍 Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id_user_n) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: El usuario no existe';
    END IF;

    -- 🔄 Actualizar estado activo del usuario
    UPDATE User_N 
    SET 
        is_active = p_is_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_user_n = p_id_user_n;

END //

DELIMITER ;

