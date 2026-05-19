-- =========================================
-- 🗄️ BASE DE DATOS
-- =========================================

DROP DATABASE IF EXISTS tuherramientaonline;
CREATE DATABASE tuherramientaonline;
USE tuherramientaonline;

CREATE TABLE Customer (

    -- 🔑 datos personales
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,

    -- 🔐 autenticación
    auth_provider ENUM('local', 'google','both') DEFAULT 'local',
    provider_id VARCHAR(100) DEFAULT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,

    -- 📞 contacto
    cell_phone VARCHAR(15),
    mail_address VARCHAR(255),

    -- 👤 estado / perfil
    is_active BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT TRUE,
    img_profile VARCHAR(255) NOT NULL DEFAULT 'default_profile.png',

    -- 🔒 seguridad
    attempts INT DEFAULT 0,

    -- 🕒 auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- 💰 CASHBACK
-- =========================================

CREATE TABLE Cashback (
    id_cashback INT AUTO_INCREMENT PRIMARY KEY,
    id_customer_fk INT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- 📜 HISTORIAL CASHBACK
-- =========================================

CREATE TABLE Cashback_History (

    id_cashback_history INT AUTO_INCREMENT PRIMARY KEY,

    -- 🔗 relaciones
    id_cashback_fk INT,
    id_transaction_fk INT NOT NULL,

    -- 💵 datos
    value DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('acumulate', 'redemption') NOT NULL,

    -- 🕒 auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 👑 ROLES
-- =========================================

CREATE TABLE Role (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- =========================================
-- 🏢 EMPRESAS
-- =========================================

CREATE TABLE Company (

    -- 🔑 identificación
    id_company INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rif VARCHAR(20) NOT NULL UNIQUE,

    -- 🔐 autenticación
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- 📞 contacto
    cell_phone VARCHAR(20),
    mail_address VARCHAR(255),
    img_profile VARCHAR(255) DEFAULT 'default_company.png',

    -- 👑 rol
    id_role_fk INT NOT NULL,

    -- 🔒 seguridad
    attempts INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    can_buy BOOLEAN DEFAULT TRUE,
    can_sell BOOLEAN DEFAULT TRUE,

    -- 🕒 auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- 💳 LÍMITE DE CRÉDITO
-- (un detallista puede tener múltiples créditos)
-- =========================================

CREATE TABLE Credit_Limit (

    id_credit_limit INT AUTO_INCREMENT PRIMARY KEY,

    id_retailer_fk INT NOT NULL,
    id_wholesaler_fk INT NOT NULL,

    credit DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,

    start_date DATE NOT NULL,
    due_date DATE NOT NULL,

    status ENUM('ACTIVE', 'PAID', 'LATE') DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- 📜 HISTORIAL DE CRÉDITO
-- =========================================

CREATE TABLE Credit_History (

    id_credit_history INT AUTO_INCREMENT PRIMARY KEY,

    id_credit_limit_fk INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,
    type ENUM('ASSIGN', 'PAYMENT') NOT NULL,

    previous_balance DECIMAL(10,2),
    new_balance DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 🔗 FOREIGN KEYS
-- =========================================

ALTER TABLE Company
ADD CONSTRAINT fk_company_role
FOREIGN KEY (id_role_fk) REFERENCES Role(id_role);

ALTER TABLE Credit_Limit
ADD CONSTRAINT fk_credit_limit_retailer
FOREIGN KEY (id_retailer_fk) REFERENCES Company(id_company);

ALTER TABLE Credit_Limit
ADD CONSTRAINT fk_credit_limit_wholesaler
FOREIGN KEY (id_wholesaler_fk) REFERENCES Company(id_company);

ALTER TABLE Credit_History
ADD CONSTRAINT fk_credit_history_credit_limit
FOREIGN KEY (id_credit_limit_fk) REFERENCES Credit_Limit(id_credit_limit);

ALTER TABLE Cashback
ADD CONSTRAINT fk_cashback_customer
FOREIGN KEY (id_customer_fk) REFERENCES Customer(id_customer);

ALTER TABLE Cashback_History
ADD CONSTRAINT fk_cashback_history_cashback
FOREIGN KEY (id_cashback_fk) REFERENCES Cashback(id_cashback);

-- =========================================
-- 👑 ADMIN Y ROLES POR DEFECTO
-- =========================================
INSERT INTO Role (name) VALUES
('ADMIN'),
('MAYORISTA'),
('DETALLISTA');

INSERT INTO Company (
    name,
    rif,
    email,
    password_hash,
    cell_phone,
    mail_address,
    id_role_fk
) VALUES (
    'Admin',
    'J-00000000-0',
    'tho@mail.com',
    '$2b$10$daXc069JWmMgW42CmSuUOuZDdxrdTWoy2n44o0eRq6fxMBV3ooXxW',
    '000-000-0000',
    'Caracas Venezuela',
    1
);