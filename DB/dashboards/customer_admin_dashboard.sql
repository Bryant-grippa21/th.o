-- =========================================
-- 📊 DASHBOARD ADMIN: CUSTOMERS
-- =========================================

DROP PROCEDURE IF EXISTS sp_dashboard_admin_customer_summary;
DROP PROCEDURE IF EXISTS sp_dashboard_admin_customer_list;

DELIMITER //

CREATE PROCEDURE sp_dashboard_admin_customer_summary ()
BEGIN
    SELECT
        COUNT(*) AS total_customers,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_customers,
        SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS blocked_customers,
        SUM(CASE WHEN auth_provider = 'local' THEN 1 ELSE 0 END) AS local_customers,
        SUM(CASE WHEN auth_provider = 'google' THEN 1 ELSE 0 END) AS google_customers,
        SUM(CASE WHEN auth_provider = 'both' THEN 1 ELSE 0 END) AS both_customers,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) AS verified_customers
    FROM Customer;
END //

CREATE PROCEDURE sp_dashboard_admin_customer_list ()
BEGIN
    SELECT
        id_customer,
        name,
        email,
        auth_provider,
        is_verified,
        is_active,
        attempts,
        cell_phone,
        mail_address,
        created_at,
        updated_at
    FROM Customer
    ORDER BY created_at DESC, id_customer DESC;
END //

DELIMITER ;
