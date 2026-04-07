-- ========================================
-- ACTUALIZAR PRÉSTAMO POR FECHA LÍMITE
-- ========================================

DELIMITER $$

CREATE EVENT ev_check_credit
ON SCHEDULE EVERY 1 DAY
DO
BEGIN

    UPDATE Credit_Limit
    SET status = 'LATE'
    WHERE due_date < CURDATE()
    AND remaining_amount > 0;

    UPDATE User_J
    SET is_active = FALSE
    WHERE id_user_j IN (
        SELECT id_detallista_fk
        FROM Credit_Limit
        WHERE status = 'LATE'
    );

END$$

DELIMITER ;
