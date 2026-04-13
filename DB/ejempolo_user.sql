SET @id = 0;

-- Mayorista
CALL sp_register_user_j(
    'Proveedor Test',
    'J-99999999',
    'proveedor@test.com',
    '$2b$10$hash...',
    '3000000000',
    'Zona industrial',
    2, -- MAYORISTA
    @id
);

-- Detallista
CALL sp_register_user_j(
    'Tienda Test',
    'J-88888888',
    'tienda@test.com',
    '$2b$10$hash...',
    '3111111111',
    'Centro',
    3, -- DETALLISTA
    @id
);