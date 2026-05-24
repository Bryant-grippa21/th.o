# Base de datos

## Estado actual

El punto de partida recomendado para reconstruir la base desde cero es `DB/databasefor0test.sql`.

Ese archivo consolidado ya integra los dominios principales del sistema:

- usuarios, empresas y roles
- cashback e historial
- taxonomia, productos, imagenes y stock
- reseñas de producto y sus indices
- tasa de cambio
- compras, grupos, evidencias y metodos de pago

Las carpetas modulares dentro de `DB/` siguen sirviendo como referencia o trabajo incremental, pero hoy el bootstrap principal para pruebas completas es el archivo consolidado.

---

## Estructura de archivos

## 📁 Estructura de archivos

```
DB/
├── databasefor0test.sql
├── compras/
│   ├── purchase_tables.sql
│   └── purchase_sp.sql
├── exchange/
│   ├── exchange_rate_tables.sql
│   └── exchange_rate_sp.sql
├── usuarios/
│   ├── users_tables.sql
│   └── users_SP.sql
├── productos/
│   ├── products_tables.sql
│   └── products_sp_manual.sql
└── README.md
```

---

## Tablas adicionales del estado actual

Ademas de lo documentado por modulo, el esquema consolidado incluye `Product_Review` para soportar reseñas publicas.

### `Product_Review`

Uso actual:

- una reseña editable por producto y entidad autenticada
- soporte para customer o company como autor
- promedio y conteo para landing, detalle y recomendados

Indices importantes en el script consolidado:

- indices por producto y fecha para listar reseñas
- indices unicos por `product + customer` y `product + company` para evitar duplicados

---

## 💱 Módulo de Tasa de Cambio

### `exchange_rate_tables.sql`

#### Tablas:
| Tabla | Descripción |
|---|---|
| `Exchange_Rate` | Historial manual de tasa Bs/USD registrada por admin |

#### Columnas clave — `Exchange_Rate`:
| Columna | Tipo | Notas |
|---|---|---|
| `id_exchange_rate` | INT PK | Auto increment |
| `rate_bs_per_usd` | DECIMAL(12,4) | Tasa registrada manualmente |
| `created_at` | TIMESTAMP | Fecha de registro |

#### Reglas:
- La tasa vigente es siempre la última registrada
- No se requiere fuente ni `is_active`
- La tasa debe ser mayor a 0

---

### `exchange_rate_sp.sql`

#### Stored Procedures:
| SP | Parámetros clave | Descripción |
|---|---|---|
| `sp_create_exchange_rate` | `p_rate_bs_per_usd` | Inserta una nueva tasa manual |
| `sp_get_latest_exchange_rate` | _(sin params)_ | Devuelve la última tasa registrada |
| `sp_list_exchange_rates` | _(sin params)_ | Lista el historial de tasas |

#### Comportamientos importantes:
- `sp_create_exchange_rate` valida que la tasa sea mayor a 0
- `sp_get_latest_exchange_rate` siempre toma la última por `created_at` e `id_exchange_rate`
- `sp_list_exchange_rates` ordena del registro más reciente al más antiguo

---

## 🛒 Módulo de Compras

### `purchase_tables.sql`

#### Tablas:
| Tabla | Descripción |
|---|---|
| `Company_Payment_Method` | Métodos de pago manuales por empresa |
| `Purchase_Checkout` | Cabecera global de compra por cliente |
| `Purchase_Group` | Grupo de compra dividido por proveedor |
| `Purchase_Item` | Items congelados por grupo |
| `Purchase_Evidence` | Evidencias de pago subidas por el cliente |

#### Ajustes adicionales:
- Amplía `Stock_History.movement_type` con `RESERVATION` y `RESERVATION_RELEASE`
- Las compras se persisten con snapshot de tasa, precio USD y precio Bs

### `purchase_sp.sql`

#### Stored Procedures:
| SP | Parámetros clave | Descripción |
|---|---|---|
| `sp_create_company_payment_method` | `p_id_company, p_method_type, p_label` | Crea método de pago por empresa |
| `sp_create_purchase_checkout` | `p_id_customer, p_id_exchange_rate, p_total_usd, p_total_bs` | Crea cabecera de checkout |
| `sp_create_purchase_group` | `p_id_checkout, p_id_company, p_subtotal_usd, p_subtotal_bs` | Crea grupo por proveedor |
| `sp_create_purchase_item` | `p_id_purchase_group, p_id_product, p_quantity` | Inserta item congelado |
| `sp_submit_purchase_evidence` | `p_id_purchase_group, p_file_url` | Registra evidencia y pasa a `PAYMENT_SUBMITTED` |
| `sp_approve_purchase_group` | `p_id_purchase_group` | Pasa grupo a `APPROVED` |
| `sp_reject_purchase_group` | `p_id_purchase_group` | Pasa grupo a `REJECTED` |
| `sp_expire_purchase_group` | `p_id_purchase_group` | Pasa grupo a `EXPIRED` |

#### Comportamientos importantes:
- Los grupos son la unidad real de pago por proveedor
- Las evidencias se suben por grupo, no por checkout global
- Las reservas y liberaciones de stock deben registrarse en `Stock_History`

---

## 👤 Módulo de Usuarios

### `users_tables.sql`

#### Tablas:
| Tabla | Descripción |
|---|---|
| `Customer` | Usuarios naturales (clientes) con auth local y Google |
| `Company` | Empresas (mayoristas / detallistas) |
| `Role` | Roles del sistema: `ADMIN`, `MAYORISTA`, `DETALLISTA` |
| `Cashback` | Saldo de cashback por customer |
| `Cashback_History` | Historial de movimientos de cashback |
| `Credit_Limit` | Límite de crédito entre mayorista y detallista |
| `Credit_History` | Historial de pagos y asignaciones de crédito |

#### Columnas clave — `Customer`:
| Columna | Tipo | Notas |
|---|---|---|
| `id_customer` | INT PK | Auto increment |
| `email` | VARCHAR(100) | UNIQUE |
| `auth_provider` | ENUM | `local` / `google` |
| `provider_id` | VARCHAR(100) | Solo Google |
| `password_hash` | VARCHAR(255) | Solo local |
| `attempts` | INT | Intentos fallidos login |
| `is_active` | BOOLEAN | Bloqueo de cuenta |
| `is_new` | BOOLEAN | Primera sesión |

#### Columnas clave — `Company`:
| Columna | Tipo | Notas |
|---|---|---|
| `id_company` | INT PK | Auto increment |
| `rif` | VARCHAR(20) | UNIQUE |
| `email` | VARCHAR(255) | UNIQUE |
| `id_role_fk` | INT FK | → `Role` |
| `attempts` | INT | Intentos fallidos login |
| `is_active` | BOOLEAN | Bloqueo de cuenta |

#### Columnas clave — `Credit_Limit`:
| Columna | Tipo | Notas |
|---|---|---|
| `id_retailer_fk` | INT FK | → `Company` (detallista) |
| `id_wholesaler_fk` | INT FK | → `Company` (mayorista) |
| `status` | ENUM | `ACTIVE` / `PAID` / `LATE` |
| `due_date` | DATE | Fecha límite de pago |

#### Notas importantes:
- `Customer` soporta autenticación **local** y **Google OAuth**
- `Company` maneja roles mediante FK a tabla `Role`
- `Credit_Limit` solo permite **1 crédito ACTIVE** por detallista
- Todos los movimientos financieros tienen historial

---

### `users_SP.sql`

#### Stored Procedures — Customer:
| SP | Parámetros clave | Descripción |
|---|---|---|
| `sp_register_customer_local` | `p_email, p_password_hash, p_DOB` | Registro local + cashback inicial |
| `sp_register_customer_google` | `p_email, p_provider_id, p_DOB` | Registro Google + cashback inicial |
| `sp_update_customer` | `p_id_customer, ...campos` | Update perfil con COALESCE |
| `sp_update_cashback` | `p_id_customer, p_value, p_transaction_type` | Acumular o redimir cashback |
| `sp_update_login_failed` | `p_id_customer` | +1 intento fallido |
| `sp_reset_login_failed` | `p_id_customer` | Reset intentos a 0 |
| `sp_toggle_customer_status` | `p_id_customer, p_is_active` | Bloquear / desbloquear |

#### Stored Procedures — Company:
| SP | Parámetros clave | Descripción |
|---|---|---|
| `sp_register_company` | `p_rif, p_email, p_id_role_fk` | Registro empresa + validación RIF/email |
| `sp_update_company` | `p_id_company, ...campos` | Update empresa con COALESCE |
| `sp_update_login_failed_company` | `p_id_company` | +1 intento fallido |
| `sp_reset_login_failed_company` | `p_id_company` | Reset intentos a 0 |
| `sp_toggle_company_status` | `p_id_company, p_is_active` | Bloquear / desbloquear |

#### Stored Procedures — Crédito:
| SP | Parámetros clave | Descripción |
|---|---|---|
| `sp_create_credit` | `p_retailer, p_wholesaler, p_amount` | Asignar crédito + historial |
| `sp_pay_credit` | `p_credit_id, p_amount` | Pago parcial o total + historial |
| `sp_check_credit_status` | _(sin params)_ | Marca LATE + bloquea detallistas |

#### Comportamientos importantes:
- `sp_update_cashback` valida `acumulate` / `redemption` y registra en `Cashback_History`
- `sp_check_credit_status` usa `START TRANSACTION` + `ROLLBACK` handler
- `sp_register_company` retorna `OUT p_id_company`
- Todos los SP validan existencia antes de operar con `SIGNAL SQLSTATE '45000'`

---

## 📦 Módulo de Productos

### `products_tables.sql`

#### Tablas:
| Tabla | Descripción |
|---|---|
| `Category` | Categorías principales |
| `Subcategory` | Subcategorías → `Category` |
| `Line` | Línea base → `Company` + `Subcategory` |
| `Product` | Productos de la línea con SKU único |
| `Stock` | Inventario por variante |
| `Stock_History` | Historial: `PURCHASE`, `SALE`, `ADJUSTMENT`, `RETURN` |
| `Product_Image` | Imágenes por variante con `sort_order` |

#### Columnas clave — `Line`:
| Columna | Tipo | Notas |
|---|---|---|
| `id_subcategory_fk` | INT FK | → `Subcategory` |
| `is_active` | BOOLEAN | Activar / desactivar línea |
| `UNIQUE(name, id_subcategory_fk)` | — | Sin duplicados dentro de la subcategoría |

#### Columnas clave — `Product`:
| Columna | Tipo | Notas |
|---|---|---|
| `id_company_fk` | INT FK | → `Company` |
| `sku` | VARCHAR(50) | UNIQUE global |
| `attributes` | JSON | Talla, color, etc. |
| `price` | DECIMAL(10,2) | Precio venta |

#### Columnas clave — `Stock`:
| Columna | Tipo | Notas |
|---|---|---|
| `quantity` | INT | CHECK >= 0 |
| `min_stock` | INT | CHECK >= 0, alerta mínima |
| `created_at` | TIMESTAMP | Auditoría completa |

#### Índices definidos:
| Índice | Tabla | Uso |
|---|---|---|
| `idx_stock_history_stock` | `Stock_History` | Búsqueda por stock |
| `idx_stock_history_type` | `Stock_History` | Filtro por tipo |
| `idx_stock_history_created` | `Stock_History` | Filtro por fecha |
| `idx_image_product_order` | `Product_Image` | Orden de imágenes |
| `idx_line_active` | `Line` | Filtro activos |
| `idx_product_active` | `Product` | Filtro activos |
| `idx_line_created` | `Line` | Orden por fecha |

---

### `products_sp_manual.sql`

#### Stored Procedures:
| SP | Parámetros clave | Descripción |
|---|---|---|
| `sp_admin_create_category` | `p_name` | Crear categoría, valida duplicado |
| `sp_admin_create_subcategory` | `p_name, p_id_category` | Crear subcategoría, valida categoría |
| `sp_create_product_full` | `p_id_company, p_id_subcategory, ...` | Producto completo en transacción |
| `sp_create_product_auto` | `p_categoria, p_subcategoria, p_id_company` | Producto básico por nombres |
| `sp_update_product` | `p_id_product, p_name, p_brand` | Update nombre de la línea y marca de sus productos |
| `sp_update_variant` | `p_id_variant, p_price, p_attributes` | Update precio/atributos del producto |
| `sp_add_variant` | `p_id_product, p_sku, ...` | Nuevo producto a línea existente |
| `sp_toggle_product` | `p_id_product, p_is_active` | Activar / desactivar línea |
| `sp_toggle_variant` | `p_id_variant, p_is_active` | Activar / desactivar producto |
| `sp_update_stock` | `p_id_variant, p_quantity, p_movement_type, p_notes` | Reemplazar stock + historial |
| `sp_add_stock` | `p_id_variant, p_amount, p_movement_type, p_notes` | Sumar stock + historial |
| `sp_remove_stock` | `p_id_variant, p_amount, p_movement_type, p_notes` | Restar stock + historial |
| `sp_internal_create_variant` | _(interno)_ | SP reutilizable para variantes |

#### Comportamientos importantes:
- `sp_create_product_full` usa `START TRANSACTION` + `ROLLBACK` handler
- `sp_add_stock` y `sp_remove_stock` usan `SELECT ... FOR UPDATE` (evita race conditions)
- Los 3 SP de stock registran en `Stock_History` automáticamente
- Todos los SP validan existencia antes de operar

---

## 🏗️ Arquitectura general

```
Customer ──── Cashback ──── Cashback_History
                                  │
                            Transaction (pendiente)

Company ──── Role
  │
  ├── Credit_Limit ──── Credit_History
  │
  └── Line
        └── Product
              ├── Stock ──── Stock_History
              └── Product_Image
```

---

## ⚠️ Pendientes conocidos

| Item | Prioridad | Detalle |
|---|---|---|
| Tabla `Transaction` | 🔴 Alta | Referenciada en `Cashback_History` pero no existe |
| `sp_create_credit` | 🟡 Media | `30 DAY` hardcodeado — considerar parámetro |
| Password admin expuesto | 🔴 Alta | Mover a seeds o variables de entorno antes de producción |

---

## 🔐 Convenciones de nombres

| Concepto | Convención |
|---|---|
| Tablas | `PascalCase` |
| Columnas | `snake_case` |
| FK | `id_[tabla]_fk` |
| SP | `sp_[accion]_[entidad]` |
| Índices | `idx_[tabla]_[campo]` |
| Roles empresa | Inglés: `MAYORISTA`, `DETALLISTA`, `ADMIN` |
| Tipos de movimiento stock | Inglés: `PURCHASE`, `SALE`, `ADJUSTMENT`, `RETURN` |

---

*Última actualización: 13 de abril 2026*