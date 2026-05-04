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
    id_company_fk INT NOT NULL,             -- ✅ User_J → Company

    brand VARCHAR(100),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE(name, id_company_fk),            -- ✅ User_J → Company

    FOREIGN KEY (id_subcategory_fk) REFERENCES Subcategory(id_subcategory),
    FOREIGN KEY (id_company_fk) REFERENCES Company(id_company)  -- ✅ User_J → Company
);

CREATE TABLE Product_Variant (
    id_variant INT AUTO_INCREMENT PRIMARY KEY,

    id_product_fk INT NOT NULL,

    sku VARCHAR(50) UNIQUE, -- identificador público

    description VARCHAR(255),

    price DECIMAL(10,2) NOT NULL,

    attributes JSON,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_product_fk) REFERENCES Product(id_product)
);

CREATE TABLE Stock (
    id_stock INT AUTO_INCREMENT PRIMARY KEY,

    id_variant_fk INT NOT NULL,

    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),      -- ✅ FIX
    min_stock INT DEFAULT 0 CHECK (min_stock >= 0),             -- ✅ FIX

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- ✅ FIX agregado
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_variant_fk) REFERENCES Product_Variant(id_variant)
);

-- ✅ FIX: Tabla de historial de stock agregada
CREATE TABLE Stock_History (
    id_stock_history INT AUTO_INCREMENT PRIMARY KEY,

    id_stock_fk INT NOT NULL,

    -- 📦 movimiento
    quantity_change INT NOT NULL,           -- positivo = entrada, negativo = salida
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,

    movement_type ENUM(
        'PURCHASE',     -- compra/reposición
        'SALE',         -- venta
        'ADJUSTMENT',   -- ajuste manual
        'RETURN'        -- devolución
    ) NOT NULL,

    notes VARCHAR(255),

    -- 🕒 auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_stock_fk) REFERENCES Stock(id_stock)
);

CREATE TABLE Product_Image (
    id_image INT AUTO_INCREMENT PRIMARY KEY,

    id_variant_fk INT NOT NULL,

    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,                                   -- ✅ FIX agregado

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_variant_fk) REFERENCES Product_Variant(id_variant)
);

-- ✅ FIX: Índice para historial de stock
CREATE INDEX idx_stock_history_stock ON Stock_History(id_stock_fk);
CREATE INDEX idx_stock_history_type ON Stock_History(movement_type);
CREATE INDEX idx_stock_history_created ON Stock_History(created_at);

-- ✅ FIX: Índice para ordenar imágenes
CREATE INDEX idx_image_variant_order ON Product_Image(id_variant_fk, sort_order);

-- búsquedas reales ecommerce
CREATE INDEX idx_product_active ON Product(is_active);
CREATE INDEX idx_variant_active ON Product_Variant(is_active);

-- filtros típicos
CREATE INDEX idx_variant_price ON Product_Variant(price);

-- ordenamientos
CREATE INDEX idx_product_created ON Product(created_at);