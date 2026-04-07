-- creación de la base de datos y tablas para usuarios naturales y cashback junto con procedimientos almacenados para registro, actualización de usuarios y manejo de cashback.
DROP DATABASE IF EXISTS tuherramientaonline;
CREATE DATABASE tuherramientaonline;
USE tuherramientaonline;

-- el admin se creara por default con un script de inserción directa, ya que es el primer usuario que se necesita para administrar la plataforma, y no se requiere un procedimiento almacenado para su creación. pero los demas usuarios juridicos se crearan a través de un procedimiento almacenado que valide los datos y asigne el rol correspondiente, además de crear un registro inicial de crédito en 0 para usuarios detallistas. y todo se creara desde el modulo de administración, donde el admin podrá crear usuarios juridicos y asignarles roles y limites de crédito según corresponda.
-- usuarios juridicos, administativos y proveedores.
CREATE TABLE User_J (

-- datos personales
    id_user_j INT AUTO_INCREMENT PRIMARY KEY, -- ID del usuario jurídico, se establece como clave primaria y auto incremental para garantizar la unicidad y facilitar la gestión de los registros.
    name VARCHAR(255) NOT NULL, -- el nombre de la empresa o persona jurídica, se establece como no nulo para asegurar que siempre haya un nombre asociado al usuario jurídico.
    rif VARCHAR(20) NOT NULL UNIQUE, -- el RIF es un identificador único para personas jurídicas en Venezuela, por lo que se establece como único y no nulo para asegurar la integridad de los datos y evitar duplicados.
    
-- datos de autenticación
    email VARCHAR(255) NOT NULL UNIQUE, -- el correo electrónico se usará como identificador único para el inicio de sesión y la comunicación, por lo que debe ser único y no nulo.
    password_hash VARCHAR(255) NOT NULL, -- se almacenará el hash de la contraseña para garantizar la seguridad, y no se permitirá que sea nulo para asegurar que el usuario tenga una contraseña válida.

-- datos de contacto
    cell_phone VARCHAR(20) NULL, -- el número de teléfono celular es un dato de contacto importante, pero se establece como nulo para permitir que algunos usuarios puedan no tenerlo o no deseen proporcionarlo.
    mail_address VARCHAR(255) NULL, -- la dirección de correo físico es un dato de contacto adicional, pero se establece como nulo para permitir que algunos usuarios puedan no tenerlo o no deseen proporcionarlo.
    img_profile VARCHAR(255) NOT NULL DEFAULT 'default_profile.png', -- se establece una imagen de perfil por defecto para los usuarios que no suban una imagen personalizada, y se establece como no nulo para asegurar que siempre haya una imagen asociada al usuario jurídico.

-- datos de rol y crédito
    id_role_fk INT NOT NULL, -- ID del rol del usuario (ADMIN, MAYORISTA, DETALLISTA) y por defecto se asignará el rol de DETALLISTA, pero se podrá actualizar posteriormente para asignar roles de MAYORISTA según corresponda.
    id_credit_fk DECIMAL(10,2) DEFAULT 0, -- Límite de crédito para usuarios detallistas

-- datos de estado y control
    attempts INT DEFAULT 0,
    is_new BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_role_fk) REFERENCES Role(id_role)
);

-- tabla de roles para usuarios juridicos
CREATE TABLE Role (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO Role (name) VALUES
('ADMIN'),
('MAYORISTA'),
('DETALLISTA');

-- tabla de limites de crédito para usuarios detallistas
CREATE TABLE Credit_Limit (
    id_credit_limit INT AUTO_INCREMENT PRIMARY KEY, -- ID del límite de crédito
    id_user_j_fk INT NOT NULL, -- ID del usuario juridico al que se le asigna el límite de crédito
    load_user_j_fk INT NOT NULL DEFAULT 1, -- ID del usuario juridico que asigna el límite de crédito, se establece como no nulo para asegurar que siempre haya un usuario mayorista asociado al límite de crédito. el defecto se 1 para asignar el crédito inicial por parte del admin al crear un nuevo usuario detallista. pero en registro siempre que el valor sea 1 significara que el usuario no tiene un credito asignado por un mayorista y en la vista no se mostrara el nombre del mayorista, pero si el valor es diferente de 1 se mostrara el nombre del mayorista que asigno el crédito. 
    credit DECIMAL(10,2) NOT NULL DEFAULT 0, -- Valor del límite de crédito reciente
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de creación del límite de crédito
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Fecha y hora de la última actualización del límite de crédito
    active BOOLEAN DEFAULT TRUE, -- Indica si el límite de crédito está activo o no (en caso de que se desactive por alguna razón, como incumplimiento de pago)
    FOREIGN KEY (id_user_j_fk) REFERENCES User_J(id_user_j),
    FOREIGN KEY (load_user_j_fk) REFERENCES User_J(id_user_j)
);

-- tabla de historial de credito para usuarios detallistas
CREATE TABLE Credit_History (
    id_credit_history INT AUTO_INCREMENT PRIMARY KEY, -- ID del historial de crédito
    id_credit_limit_fk INT NOT NULL, -- ID del límite de crédito al que se le asigna el historial de crédito
    credit DECIMAL(10,2) NOT NULL, -- Valor del nuevo límite de crédito después del cambio
    id_load_fk INT NOT NULL, -- ID del usuario mayorista que proporciona el crédito al usuario detallista, se establece como no nulo para asegurar que siempre haya un usuario mayorista asociado al historial de crédito.
    change_reason VARCHAR(255) NOT NULL, -- Razón del cambio en el límite de crédito (ejemplo: "Pago realizado", "Nuevo crédito asignado", "Crédito reducido por incumplimiento", etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de creación del historial de crédito
    FOREIGN KEY (id_credit_limit_fk) REFERENCES Credit_Limit(id_credit_limit),
    FOREIGN KEY (id_load_fk) REFERENCES User_J(id_user_j)
);


-- insertar el usuario admin por defecto
INSERT INTO User_J (name, rif, email, password_hash, cell_phone, mail_address, id_role_fk, id_credit_fk) VALUES
('Admin', 'J-00000000-0', 'admin@example.com', '12345', '000-000-0000', 'admin@example.com', 1, NULL);

-- procedimientos almacenados SP
-- todos los procedimientos almacenados referentes a crear, actualizar y gestionar usuarios juridicos se gestionaran desde el modulo de administracion, donde solo el admin podra realizar estas funciones. las demas funciones de prestamos, pagos y gestion de creditos se realizaran despues de haber finalizado con las funciones de productos.

-- procedimiento almacenado para registrar un nuevo usuario juridico, validando que el correo y el RIF no existan, que la contraseña no sea nula, asignando el rol correspondiente (por defecto DETALLISTA) y creando un registro inicial de crédito en 0 para usuarios detallistas.
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
    -- Validar que el correo no exista
    IF EXISTS (SELECT 1 FROM User_J WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo ya está registrado.';
    END IF;

    -- Validar que el RIF no exista
    IF EXISTS (SELECT 1 FROM User_J WHERE rif = p_rif) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El RIF ya está registrado.';
    END IF;

    -- Validar que la contraseña no sea nula
    IF p_password_hash IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La contraseña no puede ser nula.';
    END IF;

    -- Insertar el nuevo usuario jurídico
    INSERT INTO User_J (name, rif, email, password_hash, cell_phone, mail_address, id_role_fk)
    VALUES (p_name, p_rif, p_email, p_password_hash, p_cell_phone, p_mail_address, 3); -- por defecto se asigna el rol de DETALLISTA 

    -- Obtener el ID del nuevo usuario jurídico
    SET p_id_user_j = LAST_INSERT_ID();

    -- Se crear un registro inicial de crédito en 0
    INSERT INTO Credit_Limit (id_user_j_fk, load_user_j_fk, credit) VALUES (p_id_user_j, 1, 0); -- el crédito inicial se asigna por el admin (ID 1) y se establece en 0

END //
DELIMITER ;

-- procedimiento almacenado para actualizar los datos de un usuario jurídico, validando que el usuario exista y permitiendo actualizar solo los campos enviados (si no se envía un campo, se mantiene su valor actual), además de permitir actualizar la contraseña solo si se envía un nuevo hash de contraseña.
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


    -- Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_J WHERE id_user_j = p_id_user_j) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe.';
    END IF;

    -- Actualizar los campos enviados
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

-- procedimiento almacenado para actualizar el límite de crédito de un usuario detallista, validando que el usuario exista, obteniendo el valor actual del crédito, calculando el nuevo valor según el tipo de cambio (aumento o reducción) y actualizando el crédito, además de insertar un registro en el historial de crédito con los detalles del cambio (nuevo valor, razón del cambio, fecha y hora).
DELIMITER //
CREATE PROCEDURE sp_update_credit_limit (
    IN p_id_user_j INT,
    IN p_credit_change DECIMAL(10,2),
    IN p_change_reason VARCHAR(255),
    IN p_id_load_user_j INT
)
BEGIN

    -- Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_J WHERE id_user_j = p_id_user_j) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe.';
    END IF;

    -- Obtener el ID del límite de crédito asociado al usuario detallista
    DECLARE v_id_credit_limit INT;
    SELECT id_credit_limit INTO v_id_credit_limit FROM Credit_Limit WHERE id_user_j_fk = p_id_user_j AND active = TRUE;

    -- Validar que el límite de crédito exista
    IF v_id_credit_limit IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El límite de crédito no existe para este usuario.';
    END IF;

    -- Obtener el valor actual del crédito
    DECLARE v_current_credit DECIMAL(10,2);
    SELECT credit INTO v_current_credit FROM Credit_Limit WHERE id_credit_limit = v_id_credit_limit;

    -- Calcular el nuevo valor del crédito según el tipo de cambio (aumento o reducción)
    DECLARE v_new_credit DECIMAL(10,2);
    SET v_new_credit = v_current_credit + p_credit_change; -- si p_credit_change es positivo, se aumenta el crédito; si es negativo, se reduce el crédito

    -- Validar que el nuevo valor del crédito no sea negativo
    IF v_new_credit < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nuevo límite de crédito no puede ser negativo.';
    END IF;

    -- Actualizar el crédito en la tabla Credit_Limit
    UPDATE Credit_Limit SET credit = v_new_credit, load_user_j_fk = p_id_load_user_j, updated_at = CURRENT_TIMESTAMP WHERE id_credit_limit = v_id_credit_limit;

    -- Insertar un registro en el historial de crédito con los detalles del cambio (nuevo valor, razón del cambio, fecha y hora)
    INSERT INTO Credit_History (id_credit_limit_fk, credit, id_load_fk, change_reason) VALUES (v_id_credit_limit, v_new_credit, p_id_load_user_j, p_change_reason);

END //

-- procedimiento almacenado para desactivar o activar un usuario jurídico, validando que el usuario exista y actualizando su estado de activo según el valor enviado (TRUE para activar, FALSE para desactivar).
DELIMITER //
CREATE PROCEDURE sp_toggle_user_j_status (
    IN p_id_user_j INT,
    IN p_is_active BOOLEAN
)
BEGIN

    -- Validar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM User_J WHERE id_user_j = p_id_user_j) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe.';
    END IF;

    -- Actualizar el estado de activo del usuario jurídico
    UPDATE User_J SET is_active = p_is_active, updated_at = CURRENT_TIMESTAMP WHERE id_user_j = p_id_user_j;

END //
DELIMITER ;
