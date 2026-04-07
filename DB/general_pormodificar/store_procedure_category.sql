DELIMITER $$
DROP PROCEDURE IF EXISTS sp_list_category$$
CREATE PROCEDURE sp_list_category()
BEGIN
    SELECT * FROM Category;
END$$
 
DROP PROCEDURE IF EXISTS sp_get_category_by_id$$
CREATE PROCEDURE sp_get_category_by_id(
    IN p_id INT
)
BEGIN
    SELECT * FROM Category WHERE id_category = p_id;
END$$
 
DROP PROCEDURE IF EXISTS sp_update_category$$
CREATE PROCEDURE sp_update_category(
    IN p_id INT,
    IN p_name VARCHAR(100),
    IN p_description VARCHAR(255)
)
BEGIN
    UPDATE Category
    SET name = p_name,
        description = p_description
    WHERE id_category = p_id;
END$$
 
DROP PROCEDURE IF EXISTS sp_toggle_category$$
CREATE PROCEDURE sp_toggle_category(
    IN p_id INT
)
BEGIN
    UPDATE Category
    SET is_active = NOT is_active
    WHERE id_category = p_id;
END$$

DELIMITER ;