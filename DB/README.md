# 🗄️ TuHerramienta.Online — Base de Datos

## 📁 Estructura de archivos

```
DB/
├── usuarios/
│   ├── users_tables.sql
│   └── users_SP.sql
├── productos/
│   ├── products_tables.sql
│   └── products_sp_manual.sql
└── README.md
```

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
| `Product` | Producto base → `Company` + `Subcategory` |
| `Product_Variant` | Variantes (talla, color, etc.) con SKU único |
| `Stock` | Inventario por variante |
| `Stock_History` | Historial: `PURCHASE`, `SALE`, `ADJUSTMENT`, `RETURN` |
| `Product_Image` | Imágenes por variante con `sort_order` |

#### Columnas clave — `Product`:
| Columna | Tipo | Notas |
|---|---|---|
| `id_company_fk` | INT FK | → `Company` |
| `id_subcategory_fk` | INT FK | → `Subcategory` |
| `is_active` | BOOLEAN | Activar / desactivar producto |
| `UNIQUE(name, id_company_fk)` | — | Sin duplicados por empresa |

#### Columnas clave — `Product_Variant`:
| Columna | Tipo | Notas |
|---|---|---|
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
| `idx_image_variant_order` | `Product_Image` | Orden de imágenes |
| `idx_product_active` | `Product` | Filtro activos |
| `idx_variant_active` | `Product_Variant` | Filtro activos |
| `idx_product_created` | `Product` | Orden por fecha |

---

### `products_sp_manual.sql`

#### Stored Procedures:
| SP | Parámetros clave | Descripción |
|---|---|---|
| `sp_admin_create_category` | `p_name` | Crear categoría, valida duplicado |
| `sp_admin_create_subcategory` | `p_name, p_id_category` | Crear subcategoría, valida categoría |
| `sp_create_product_full` | `p_id_company, p_id_subcategory, ...` | Producto completo en transacción |
| `sp_create_product_auto` | `p_categoria, p_subcategoria, p_id_company` | Producto básico por nombres |
| `sp_update_product` | `p_id_product, p_name, p_brand` | Update nombre/marca |
| `sp_update_variant` | `p_id_variant, p_price, p_attributes` | Update precio/atributos |
| `sp_add_variant` | `p_id_product, p_sku, ...` | Nueva variante a producto existente |
| `sp_toggle_product` | `p_id_product, p_is_active` | Activar / desactivar producto |
| `sp_toggle_variant` | `p_id_variant, p_is_active` | Activar / desactivar variante |
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
  └── Product
        └── Product_Variant
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