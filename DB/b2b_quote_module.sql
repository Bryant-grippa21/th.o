-- Esquema SQL para modulo B2B de cotizaciones (MySQL/MariaDB)
-- Requiere tablas existentes: Company, Product

CREATE TABLE Quote_Draft (
    id_quote_draft INT AUTO_INCREMENT PRIMARY KEY,
    id_retailer_fk INT NOT NULL,
    id_wholesaler_fk INT NOT NULL,
    status ENUM('ACTIVE', 'SUBMITTED', 'ABANDONED') NOT NULL DEFAULT 'ACTIVE',
    currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
    notes TEXT,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_retailer_fk) REFERENCES Company(id_company),
    FOREIGN KEY (id_wholesaler_fk) REFERENCES Company(id_company)
);

CREATE TABLE Quote_Draft_Item (
    id_quote_draft_item INT AUTO_INCREMENT PRIMARY KEY,
    id_quote_draft_fk INT NOT NULL,
    id_product_fk INT NOT NULL,
    requested_quantity INT NOT NULL,
    unit_price_snapshot_usd DECIMAL(12,2),
    line_subtotal_usd DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_quote_draft_fk) REFERENCES Quote_Draft(id_quote_draft),
    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE B2B_Quote (
    id_b2b_quote INT AUTO_INCREMENT PRIMARY KEY,
    quote_code VARCHAR(32) NOT NULL UNIQUE,
    id_retailer_fk INT NOT NULL,
    id_wholesaler_fk INT NOT NULL,
    source_draft_id INT NULL,
    status ENUM(
        'REQUESTED',
        'QUOTED',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'DELIVERED',
        'PAYMENT_PENDING',
        'PAYMENT_SUBMITTED',
        'PAID',
        'OVERDUE'
    ) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    accepted_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    delivery_confirmed_at TIMESTAMP NULL,
    payment_due_at TIMESTAMP NULL,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
    subtotal_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    additional_charges_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    retailer_note TEXT,
    wholesaler_note TEXT,
    created_by_company_id INT NULL,
    updated_by_company_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_retailer_fk) REFERENCES Company(id_company),
    FOREIGN KEY (id_wholesaler_fk) REFERENCES Company(id_company),
    FOREIGN KEY (source_draft_id) REFERENCES Quote_Draft(id_quote_draft),
    FOREIGN KEY (created_by_company_id) REFERENCES Company(id_company),
    FOREIGN KEY (updated_by_company_id) REFERENCES Company(id_company)
);

CREATE TABLE B2B_Quote_Item (
    id_b2b_quote_item INT AUTO_INCREMENT PRIMARY KEY,
    id_b2b_quote_fk INT NOT NULL,
    id_product_fk INT NOT NULL,
    product_name_snapshot VARCHAR(255),
    sku_snapshot VARCHAR(64),
    unit_price_usd DECIMAL(12,2),
    quantity INT NOT NULL,
    subtotal_usd DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_b2b_quote_fk) REFERENCES B2B_Quote(id_b2b_quote),
    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE B2B_Quote_Charge (
    id_b2b_quote_charge INT AUTO_INCREMENT PRIMARY KEY,
    id_b2b_quote_fk INT NOT NULL,
    charge_type ENUM('SHIPPING', 'HANDLING', 'INSURANCE', 'ADJUSTMENT') NOT NULL,
    label VARCHAR(64),
    amount_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_b2b_quote_fk) REFERENCES B2B_Quote(id_b2b_quote)
);

CREATE TABLE B2B_Quote_Status_History (
    id_b2b_quote_status_history INT AUTO_INCREMENT PRIMARY KEY,
    id_b2b_quote_fk INT NOT NULL,
    from_status ENUM(
        'REQUESTED',
        'QUOTED',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'DELIVERED',
        'PAYMENT_PENDING',
        'PAYMENT_SUBMITTED',
        'PAID',
        'OVERDUE'
    ) NULL,
    to_status ENUM(
        'REQUESTED',
        'QUOTED',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'DELIVERED',
        'PAYMENT_PENDING',
        'PAYMENT_SUBMITTED',
        'PAID',
        'OVERDUE'
    ) NOT NULL,
    note TEXT,
    performed_by_company_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_b2b_quote_fk) REFERENCES B2B_Quote(id_b2b_quote),
    FOREIGN KEY (performed_by_company_id) REFERENCES Company(id_company)
);

CREATE TABLE B2B_Quote_Payment_Evidence (
    id_b2b_quote_payment_evidence INT AUTO_INCREMENT PRIMARY KEY,
    id_b2b_quote_fk INT NOT NULL,
    file_url VARCHAR(255),
    original_name VARCHAR(255),
    mime_type VARCHAR(64),
    amount_reported_usd DECIMAL(12,2),
    submitted_by_company_id INT,
    review_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    review_note TEXT,
    reviewed_by_company_id INT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (id_b2b_quote_fk) REFERENCES B2B_Quote(id_b2b_quote),
    FOREIGN KEY (submitted_by_company_id) REFERENCES Company(id_company),
    FOREIGN KEY (reviewed_by_company_id) REFERENCES Company(id_company)
);

CREATE TABLE B2B_Quote_Delivery (
    id_b2b_quote_delivery INT AUTO_INCREMENT PRIMARY KEY,
    id_b2b_quote_fk INT NOT NULL,
    delivery_status ENUM('PENDING', 'DISPATCHED', 'DELIVERED', 'CONFIRMED') NOT NULL DEFAULT 'PENDING',
    tracking_code VARCHAR(64),
    carrier_name VARCHAR(64),
    dispatch_note TEXT,
    dispatched_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    confirmed_by_retailer_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_b2b_quote_fk) REFERENCES B2B_Quote(id_b2b_quote)
);

CREATE TABLE Company_Commercial_Relationship (
    id_company_commercial_relationship INT AUTO_INCREMENT PRIMARY KEY,
    id_wholesaler_fk INT NOT NULL,
    id_retailer_fk INT NOT NULL,
    relationship_type ENUM('OPEN', 'AFFILIATED', 'OWN_NETWORK') NOT NULL DEFAULT 'OPEN',
    status ENUM('ACTIVE', 'SUSPENDED', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    is_preferred BOOLEAN DEFAULT FALSE,
    credit_days INT DEFAULT 30,
    allows_private_catalog BOOLEAN DEFAULT FALSE,
    allows_quote_requests BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_company_relationship_pair (id_wholesaler_fk, id_retailer_fk),
    FOREIGN KEY (id_wholesaler_fk) REFERENCES Company(id_company),
    FOREIGN KEY (id_retailer_fk) REFERENCES Company(id_company)
);
