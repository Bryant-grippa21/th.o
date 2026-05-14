DELIMITER //

DROP PROCEDURE IF EXISTS sp_dashboard_admin_company_summary //
CREATE PROCEDURE sp_dashboard_admin_company_summary()
BEGIN
  SELECT
    COUNT(*) AS total_companies,
    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_companies,
    SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS inactive_companies,
    SUM(CASE WHEN id_role_fk = 1 THEN 1 ELSE 0 END) AS admin_companies,
    SUM(CASE WHEN attempts > 0 THEN 1 ELSE 0 END) AS companies_with_attempts
  FROM Company;
END //

DROP PROCEDURE IF EXISTS sp_dashboard_admin_company_list //
CREATE PROCEDURE sp_dashboard_admin_company_list()
BEGIN
  SELECT
    id_company,
    name,
    rif,
    email,
    id_role_fk,
    is_active,
    attempts,
    can_buy,
    can_sell,
    cell_phone,
    mail_address,
    created_at,
    updated_at
  FROM Company
  ORDER BY created_at DESC, id_company DESC;
END //

DELIMITER ;

-- Ejecutar con:
-- CALL sp_dashboard_admin_company_summary();
-- CALL sp_dashboard_admin_company_list();