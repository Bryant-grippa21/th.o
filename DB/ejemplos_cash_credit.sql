🧪 🟢 1. CREAR USUARIOS NATURALES
CALL sp_register_user_n_local(
    'Cliente 1',
    'cliente1@test.com',
    '$2b$10$hash...',
    '2000-01-01',
    '3000000000',
    'Bogotá'
);

CALL sp_register_user_n_local(
    'Cliente 2',
    'cliente2@test.com',
    '$2b$10$hash...',
    '1998-05-10',
    '3111111111',
    'Medellín'
);
🧪 🏢 2. CREAR USUARIOS JURÍDICOS
SET @id = 0;

-- Mayorista
CALL sp_register_user_j(
    'Proveedor A',
    'J-11111111',
    'proveedor@test.com',
    '$2b$10$hash...',
    '3001234567',
    'Zona industrial',
    2,
    @id
);

-- Detallista
CALL sp_register_user_j(
    'Tienda B',
    'J-22222222',
    'tienda@test.com',
    '$2b$10$hash...',
    '3119876543',
    'Centro',
    3,
    @id
);
💰 🧪 3. SIMULACIÓN REAL — CASHBACK

👉 basado en tu SP:

🟢 Compras
-- compra 1
CALL sp_update_cashback(1, 100, 'acumulate', 1001);

-- compra 2
CALL sp_update_cashback(1, 50, 'acumulate', 1002);

-- compra 3
CALL sp_update_cashback(1, 25, 'acumulate', 1003);
🟢 Redención
CALL sp_update_cashback(1, 175, 'redemption', 1004);
🔍 Verifica
SELECT * FROM Cashback;
SELECT * FROM Cashback_History;
💳 🧪 4. SIMULACIÓN — CRÉDITO

👉 basado en tu SP:

🟢 Crear crédito
CALL sp_create_credit(
    3,  -- detallista (Tienda B)
    2,  -- mayorista (Proveedor A)
    1000
);
🔍 Verificar
SELECT * FROM Credit_Limit;
SELECT * FROM Credit_History;

👉 deberías ver:

💰 🧪 5. PAGOS (SIMULACIÓN REAL)
🟢 Pago 1
CALL sp_pay_credit(1, 300);
🟢 Pago 2
CALL sp_pay_credit(1, 200);
🟢 Pago final
CALL sp_pay_credit(1, 500);
🔍 Verificar
SELECT * FROM Credit_Limit;
SELECT * FROM Credit_History;


CALL sp_create_credit(2, 1, 500);

👉 debe fallar (ya tiene uno activo)

❌ pago mayor
CALL sp_pay_credit(1, 2000);

👉 debe fallar

❌ cashback negativo
CALL sp_update_cashback(1, 9999, 'redemption', 9999);

👉 debe fallar

🧪 💀 7. SIMULACIÓN DE MORA
🟢 forzar vencimiento
UPDATE Credit_Limit
SET due_date = '2020-01-01'
WHERE id_credit_limit = 1;
🟢 ejecutar evento

👉 basado en:

SHOW EVENTS;

(o espera ejecución automática)

🔍 verificar
SELECT * FROM Credit_Limit;
SELECT * FROM User_J;
🎯 resultado esperado
status = LATE
usuario bloqueado