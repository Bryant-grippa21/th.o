-- Creamos un nuevo usuario natural
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_create_user_n$$
CREATE PROCEDURE sp_create_user_n(
    IN p_name VARCHAR(50), 
    IN p_email VARCHAR(100), 
    IN p_password VARCHAR(255), 
    IN p_dob DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255),
    IN p_img_profile VARCHAR(255)
    )
BEGIN
    INSERT INTO User_N (
        name,
        email, 
        password, 
        DOB,
        cell_phone,
        mail_address,
        img_profile
        )
    VALUES (
        p_name, 
        p_email, 
        p_password, 
        p_dob,
        p_cell_phone,
        p_mail_address,
        p_img_profile
    );
END $$

-- Obtenemos todos los usuarios naturales
DROP PROCEDURE IF EXISTS sp_get_users_n$$
CREATE PROCEDURE sp_get_users_n()
BEGIN
    SELECT * FROM User_N;
END $$

-- Obtenemos un usuario natural por su ID
DROP PROCEDURE IF EXISTS sp_get_user_n_by_id$$
CREATE PROCEDURE sp_get_user_n_by_id(
    IN p_id INT
    )
BEGIN
    SELECT * FROM User_N WHERE id_user_n = p_id;
END $$

-- Actualizamos un usuario natural
DROP PROCEDURE IF EXISTS sp_update_user_n$$
CREATE PROCEDURE sp_update_user_n(
    IN p_id INT, 
    IN p_name VARCHAR(50), 
    IN p_email VARCHAR(100),
    IN p_DOB DATE,
    IN p_cell_phone VARCHAR(15),
    IN p_mail_address VARCHAR(255),
    IN p_img_profile VARCHAR(255)
    )
BEGIN
    UPDATE User_N 
    SET 
        name=p_name, 
        email=p_email,
        DOB=p_DOB,
        cell_phone=p_cell_phone,
        mail_address=p_mail_address,
        img_profile=p_img_profile
    WHERE id_user_n=p_id;
END $$

DELIMITER ;

-- bloquear/desbloquear un usuario natural
DROP PROCEDURE IF EXISTS sp_toggle_user_n_status$$
DELIMITER $$
CREATE PROCEDURE sp_toggle_user_n_status(
    IN p_id INT
    )
BEGIN
    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no encontrado';
    END IF;

    UPDATE User_N
    SET is_active = NOT is_active
    WHERE id_user_n = p_id;
END $$

DELIMITER ;

-- actualizar contraseña de un usuario natural y resetear intentos
DROP PROCEDURE IF EXISTS sp_update_user_n_password$$
DELIMITER $$
CREATE PROCEDURE sp_update_user_n_password(
    IN p_id INT, 
    IN p_new_password VARCHAR(255)
    )
BEGIN
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM User_N WHERE id_user_n = p_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no encontrado';
    END IF;

    UPDATE User_N
    SET password = p_new_password,
        attempts = 0,
        is_active = TRUE,
        is_new = TRUE
    WHERE id_user_n = p_id;
END $$

DELIMITER ;