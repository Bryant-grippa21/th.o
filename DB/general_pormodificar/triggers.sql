DELIMITER $$

DROP TRIGGER IF EXISTS trg_block_user_n$$
CREATE TRIGGER trg_block_user_n
BEFORE UPDATE ON User_N
FOR EACH ROW
BEGIN
    IF NEW.attempts >= 5 THEN
        SET NEW.is_active = FALSE;
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_block_user_j$$
CREATE TRIGGER trg_block_user_j
BEFORE UPDATE ON User_J
FOR EACH ROW
BEGIN
    IF NEW.attempts >= 5 THEN
        SET NEW.is_active = FALSE;
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_prevent_negative_stock$$
CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE ON Product
FOR EACH ROW
BEGIN
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock negativo';
    END IF;
END $$

DELIMITER ;