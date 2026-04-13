CREATE TABLE Category (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(name)
);

CREATE TABLE Subcategory (
    id_subcategory INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,

    id_category_fk INT NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(name, id_category_fk),

    FOREIGN KEY (id_category_fk) REFERENCES Category(id_category)
);

CREATE TABLE Product (
    id_product INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    id_subcategory_fk INT NOT NULL,
    id_user_j_fk INT NOT NULL,

    brand VARCHAR(100),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE(name, id_user_j_fk),

    FOREIGN KEY (id_subcategory_fk) REFERENCES Subcategory(id_subcategory),
    FOREIGN KEY (id_user_j_fk) REFERENCES User_J(id_user_j)
);

CREATE TABLE Product_Variant (
    id_variant INT AUTO_INCREMENT PRIMARY KEY,

    id_product_fk INT NOT NULL,

    sku VARCHAR(50) UNIQUE, -- identificador público

    description VARCHAR(255),

    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),

    attributes JSON,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE Stock (
    id_stock INT AUTO_INCREMENT PRIMARY KEY,

    id_variant_fk INT NOT NULL,

    quantity INT NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_variant_fk) REFERENCES Product_Variant(id_variant)
);

CREATE TABLE Product_Image (
    id_image INT AUTO_INCREMENT PRIMARY KEY,

    id_variant_fk INT NOT NULL,

    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_variant_fk) REFERENCES Product_Variant(id_variant)
);

CREATE INDEX idx_product_subcategory ON Product(id_subcategory_fk);
CREATE INDEX idx_product_user ON Product(id_user_j_fk);

CREATE INDEX idx_variant_product ON Product_Variant(id_product_fk);
CREATE INDEX idx_variant_sku ON Product_Variant(sku);

CREATE INDEX idx_stock_variant ON Stock(id_variant_fk);

-- búsquedas reales ecommerce
CREATE INDEX idx_product_active ON Product(is_active);
CREATE INDEX idx_variant_active ON Product_Variant(is_active);

-- filtros típicos
CREATE INDEX idx_variant_price ON Product_Variant(price);

-- ordenamientos
CREATE INDEX idx_product_created ON Product(created_at);