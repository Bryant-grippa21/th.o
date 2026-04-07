DROP DATABASE IF EXISTS tuherramientaonline;
CREATE DATABASE tuherramientaonline;
USE tuherramientaonline;

-- Tablas Generales
CREATE TABLE Role (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO Role (name) VALUES
('ADMIN'),
('MAYORISTA'),
('DETALLISTA');

CREATE TABLE User_N (
    id_user_n INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    DOB DATE NOT NULL,
    cell_phone VARCHAR(15),
    mail_address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT TRUE,
    img_profile VARCHAR(255) NOT NULL DEFAULT 'default_profile.png',
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE User_J (
    id_user_j INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rif VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    cell_phone VARCHAR(15) NOT NULL,
    mail_address VARCHAR(255) NOT NULL,
    is_new BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    img_profile VARCHAR(255) NOT NULL DEFAULT 'default_profile.png',
    attempts INT DEFAULT 0,
    credit_limit DECIMAL(10,2) DEFAULT 0,
    id_role_fk INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_role_fk) REFERENCES Role(id_role)
);

CREATE TABLE Category (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    img_category VARCHAR(255) NOT NULL DEFAULT 'default_category.png',
    id_user_j_fk INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(name, id_user_j_fk),
    FOREIGN KEY (id_user_j_fk) REFERENCES User_J(id_user_j) ON DELETE CASCADE
);

CREATE TABLE Subcategory (
    id_subcategory INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    img_subcategory VARCHAR(255) NOT NULL DEFAULT 'default_subcategory.png',
    id_category_fk INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(name, id_category_fk),
    FOREIGN KEY (id_category_fk) REFERENCES Category(id_category) ON DELETE CASCADE
);

CREATE TABLE Product (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    img_product VARCHAR(255) NOT NULL DEFAULT 'default_product.png',
    id_subcategory_fk INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(name, id_subcategory_fk),
    FOREIGN KEY (id_subcategory_fk) REFERENCES Subcategory(id_subcategory) ON DELETE CASCADE
);

CREATE TABLE attribute (
    id_attribute INT AUTO_INCREMENT PRIMARY KEY,
    id_product_fk INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    img_1 VARCHAR(255) NULL,
    img_2 VARCHAR(255) NULL,
    img_3 VARCHAR(255) NULL,
    img_4 VARCHAR(255) NULL,
    details TEXT,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(name, id_product_fk),
    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product) ON DELETE CASCADE
);



CREATE TABLE Exchange_Rate (
    id_exchange_rate INT AUTO_INCREMENT PRIMARY KEY,
    rate DECIMAL(10,2) NOT NULL,
    rate_date DATE NOT NULL UNIQUE
);

CREATE TABLE Cart_N (
    id_cart INT AUTO_INCREMENT PRIMARY KEY,
    id_user_n_fk INT NOT NULL,
    FOREIGN KEY (id_user_n_fk) REFERENCES User_N(id_user_n) ON DELETE CASCADE
);

CREATE TABLE Cart_N_Detail (
    id_cart_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_cart_fk INT NOT NULL,
    id_product_fk INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (id_cart_fk) REFERENCES Cart_N(id_cart) ON DELETE CASCADE,
    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE Purchase_N (
    id_purchase_n INT AUTO_INCREMENT PRIMARY KEY,
    id_user_n_fk INT NOT NULL,
    total_dollars DECIMAL(10,2) NOT NULL,
    total_bolivares DECIMAL(10,2) NOT NULL,
    cashback_dollars DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_n_fk) REFERENCES User_N(id_user_n)
);

CREATE TABLE Purchase_N_Detail (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_purchase_n_fk INT NOT NULL,
    id_product_fk INT NOT NULL,
    quantity INT NOT NULL,
    price_dollars DECIMAL(10,2) NOT NULL,
    price_bolivares DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_purchase_n_fk) REFERENCES Purchase_N(id_purchase_n) ON DELETE CASCADE,
    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE Purchase_J (
    id_purchase_j INT AUTO_INCREMENT PRIMARY KEY,
    id_user_j_fk INT NOT NULL,
    total_dollars DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_j_fk) REFERENCES User_J(id_user_j)
);

CREATE TABLE Purchase_J_Detail (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_purchase_j_fk INT NOT NULL,
    id_product_fk INT NOT NULL,
    quantity INT NOT NULL,
    price_dollars DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_purchase_j_fk) REFERENCES Purchase_J(id_purchase_j) ON DELETE CASCADE,
    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE Sell_J (
    id_sell_j INT AUTO_INCREMENT PRIMARY KEY,
    id_user_j_fk INT NOT NULL,
    total_dollars DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_j_fk) REFERENCES User_J(id_user_j)
);

CREATE TABLE Sell_J_Detail (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_sell_j_fk INT NOT NULL,
    id_product_fk INT NOT NULL,
    quantity INT NOT NULL,
    price_dollars DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_sell_j_fk) REFERENCES Sell_J(id_sell_j) ON DELETE CASCADE,
    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE Credit_J (
    id_credit_j INT AUTO_INCREMENT PRIMARY KEY,
    id_user_j_fk INT NOT NULL,
    amount_dollars DECIMAL(10,2) NOT NULL,
    time_limit DATE NOT NULL,
    status ENUM('VIGENTE','VENCIDO','PAGADO') DEFAULT 'VIGENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_j_fk) REFERENCES User_J(id_user_j)
);

CREATE TABLE Payment_J (
    id_payment_j INT AUTO_INCREMENT PRIMARY KEY,
    id_credit_j_fk INT NOT NULL,
    amount_dollars DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_credit_j_fk) REFERENCES Credit_J(id_credit_j) ON DELETE CASCADE
);

CREATE TABLE Cashback_Transaction (
    id_cashback INT AUTO_INCREMENT PRIMARY KEY,
    id_user_n_fk INT NOT NULL,
    amount_dollars DECIMAL(10,2) NOT NULL,
    source_purchase INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_n_fk) REFERENCES User_N(id_user_n),
    FOREIGN KEY (source_purchase) REFERENCES Purchase_N(id_purchase_n)
);

-- Índices
CREATE INDEX idx_user_n_email ON User_N(email);
CREATE INDEX idx_user_j_email ON User_J(email);
CREATE INDEX idx_product_line ON Product(id_line_fk);
CREATE INDEX idx_cart_user ON Cart_N(id_user_n_fk);