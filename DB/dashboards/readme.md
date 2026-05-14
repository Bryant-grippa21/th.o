# Dashboards SQL

Esta carpeta concentra consultas y stored procedures pensados para dashboards administrativos.

Estado actual:

- `customer_admin_dashboard.sql`: modulo 1 del dashboard admin para customers.
- `company_admin_dashboard.sql`: modulo 2 del dashboard admin para empresas.

## customer_admin_dashboard.sql

Procedures incluidas:

- `sp_dashboard_admin_customer_summary()`
- `sp_dashboard_admin_customer_list()`

### `sp_dashboard_admin_customer_summary`

Devuelve una fila con indicadores base del modulo de customers:

- total de customers
- activos
- bloqueados
- customers `local`
- customers `google`
- customers `both`
- customers verificados

### `sp_dashboard_admin_customer_list`

Devuelve el listado de customers para el dashboard admin con:

- `id_customer`
- `name`
- `email`
- `auth_provider`
- `is_verified`
- `is_active`
- `attempts`
- `cell_phone`
- `mail_address`
- `created_at`
- `updated_at`

## Uso recomendado

1. Ejecutar primero `DB/usuarios/users_tables.sql`
2. Ejecutar luego `DB/usuarios/users_SP.sql`
3. Ejecutar después los archivos de `DB/dashboards`

## Relación con el backend actual

Para este primer modulo del dashboard admin se implementaron endpoints para:

- ver customers
- bloquear y desbloquear customers
- actualizar nombre y email

Rutas backend esperadas:

- `GET /api/auth/admin/customers`
- `PUT /api/auth/admin/customers/:customerId/status`
- `PUT /api/auth/admin/customers/:customerId/basic`
- `PUT /api/auth/admin/customers/:customerId/attempts/reset`
- `PUT /api/auth/admin/customers/:customerId/password`

## company_admin_dashboard.sql

Procedures incluidas:

- `sp_dashboard_admin_company_summary()`
- `sp_dashboard_admin_company_list()`

### `sp_dashboard_admin_company_summary`

Devuelve una fila con indicadores base del modulo de empresas:

- total de empresas
- activas
- inactivas
- empresas admin
- empresas con intentos acumulados

### `sp_dashboard_admin_company_list`

Devuelve el listado de empresas para el dashboard admin con:

- `id_company`
- `name`
- `rif`
- `email`
- `id_role_fk`
- `is_active`
- `attempts`
- `can_buy`
- `can_sell`
- `cell_phone`
- `mail_address`
- `created_at`
- `updated_at`

## Relación con el backend actual para empresas

Para este segundo modulo del dashboard admin se implementaron endpoints para:

- ver empresas
- actualizar nombre, correo y rif
- activar y desactivar empresas
- reiniciar intentos
- actualizar contraseña

Rutas backend esperadas:

- `GET /api/company-auth/admin/companies`
- `PUT /api/company-auth/admin/companies/:companyId/basic`
- `PUT /api/company-auth/admin/companies/:companyId/status`
- `PUT /api/company-auth/admin/companies/:companyId/attempts/reset`
- `PUT /api/company-auth/admin/companies/:companyId/password`

La autorización de estas rutas depende de un token de empresa con rol `ADMIN`.
