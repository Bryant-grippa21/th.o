# 🔧 TUHERRAMIENTA.ONLINE

Plataforma e-commerce/marketplace orientada a la venta de herramientas, con soporte para clientes finales (B2C) y empresas detallistas/mayoristas (B2B). Incluye sistema de cashback, crédito empresarial, catálogo de productos con variantes y control de stock.

---

## 📌 Estado del Proyecto

> ⚠️ **En refactorización activa.**
> El backend fue construido inicialmente con una base de datos de prueba (`user_n`).
> Actualmente se está migrando a la arquitectura definitiva (`Customer`, `Company`).
> El frontend es responsabilidad de otro departamento y está desacoplado del backend.

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js v5 |
| **Base de datos** | MySQL (mysql2/promise) |
| **Autenticación** | JWT (jsonwebtoken) + bcrypt |
| **OAuth** | Google Identity Services (google-auth-library) |
| **Dev server** | Nodemon |
| **Variables de entorno** | dotenv *(configurado, pendiente de activar)* |

---

## 📁 Estructura del Proyecto

```
TUHERRAMIENTA.ONLINE/
├── package.json
├── package-lock.json
├── .env                          → Variables de entorno (NO subir al repo)
├── .env.example                  → Plantilla de variables (pendiente de crear)
│
├── src/                          → BACKEND
│   ├── app.js                    → Entry point, servidor Express (puerto 3000)
│   ├── config/
│   │   ├── db.js                 → Pool de conexiones MySQL2
│   │   └── google.js             → Cliente OAuth2 de Google
│   ├── controllers/
│   │   └── auth.controller.js    → Lógica de registro, login y perfil
│   ├── middlewares/
│   │   └── auth.middleware.js    → Verificación de token JWT
│   ├── routes/
│   │   └── auth.routes.js        → Definición de rutas de autenticación
│   ├── services/
│   │   └── auth.service.js       → Queries a DB y llamadas a Stored Procedures
│   └── utils/
│       ├── jwt.js                → Generación de tokens JWT
│       └── hash.js               → Hash de contraseñas con bcrypt
│
├── public/                       → FRONTEND (otro departamento)
│   ├── index.html
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── modules/
│   │   └── user_n/
│   │       ├── dashboard.html
│   │       └── profile.html
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── index.js
│           ├── utils/auth.js
│           ├── auth/{login,register,google}.js
│           └── user_n/{dashboard,profile}.js
│
└── DB/
    ├── usuarios/
    │   ├── users_tables.sql      → Tablas de usuarios, empresas, cashback, crédito
    │   └── users_SP.sql          → Stored Procedures de usuarios
    └── productos/
        ├── products_tables.sql   → Tablas de productos, variantes, stock
        └── products_sp_manual.sql→ Stored Procedures de productos
```

---

## 🗄️ Arquitectura de Base de Datos

### Módulo de Usuarios

```
Customer ──────────── Cashback ──── Cashback_History
    │
    └── (auth: local o google)

Company ────────────── Role
    │
    ├── Credit_Limit ── Credit_History
    └── Product ──────── Product_Variant ── Stock ── Stock_History
                                     └── Product_Image
```

| Tabla | Descripción |
|---|---|
| `Customer` | Usuario final. Soporta auth local y Google |
| `Cashback` | Saldo de cashback acumulado por cliente |
| `Cashback_History` | Historial de movimientos de cashback |
| `Company` | Empresa vendedora (detallista o mayorista) |
| `Role` | Roles del sistema (ADMIN, DETALLISTA, MAYORISTA) |
| `Credit_Limit` | Línea de crédito asignada a empresas B2B |
| `Credit_History` | Historial de movimientos de crédito empresarial |

### Módulo de Productos

| Tabla | Descripción |
|---|---|
| `Category` | Categoría principal del producto |
| `Subcategory` | Subcategoría vinculada a una categoría |
| `Product` | Producto base vinculado a una `Company` |
| `Product_Variant` | Variante del producto (atributos en JSON) |
| `Stock` | Stock actual por variante |
| `Stock_History` | Trazabilidad de movimientos de stock |
| `Product_Image` | Imágenes asociadas a una variante |

---

## 🔐 Sistema de Autenticación

### Flujo Local (Register)

```
Cliente → POST /api/auth/register
        → hashPassword (bcrypt, 10 rounds)
        → sp_register_customer_local(name, email, hash, DOB, phone, address)
        → 201 Created
```

### Flujo Local (Login)

```
Cliente → POST /api/auth/login
        → findUserByEmail()
        → Verificar is_active
        → Verificar auth_provider === 'local'
        → bcrypt.compare(password, hash)
        → Si falla: increaseLoginAttempts() → bloqueo tras N intentos
        → Si ok: resetLoginAttempts() → generateToken() → JWT 2h
```

### Flujo Google OAuth2

```
Cliente → Google Identity Services → ID Token
        → POST /api/auth/google { credential }
        → Verificar token con OAuth2Client
        → Si usuario existe: login → JWT
        → Si no existe: sp_register_customer_google() → JWT
```

### Payload del JWT

```json
{
  "id": "id_customer",
  "email": "usuario@email.com",
  "name": "Nombre",
  "DOB": "1990-01-01",
  "cell_phone": "...",
  "mail_address": "...",
  "img_profile": "...",
  "iat": 000000,
  "exp": 000000
}
```

---

## 🛣️ Endpoints Disponibles

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/register` | ❌ | Registro local con email y contraseña |
| `POST` | `/login` | ❌ | Login local |
| `POST` | `/google` | ❌ | Login / registro con Google |
| `GET` | `/me` | ✅ JWT | Retorna datos del usuario autenticado |
| `GET` | `/profile` | ✅ JWT | Obtiene perfil completo del usuario |
| `PUT` | `/profile` | ✅ JWT | Actualiza datos del perfil |

> Las rutas protegidas requieren header: `Authorization: Bearer <token>`

---

## 🧩 Stored Procedures Principales

### Usuarios

| SP | Descripción |
|---|---|
| `sp_register_customer_local` | Registra cliente con auth local |
| `sp_register_customer_google` | Registra/actualiza cliente con Google |
| `sp_update_customer` | Actualiza datos del perfil |
| `sp_update_cashback` | Actualiza saldo de cashback |

### Productos

| SP | Descripción |
|---|---|
| `sp_admin_create_category` | Crea una categoría (solo admin) |
| `sp_admin_create_subcategory` | Crea una subcategoría |
| `sp_create_product_full` | Crea producto con variante e imagen (transacción) |
| `sp_update_product` | Actualiza datos del producto |
| `sp_update_variant` | Actualiza atributos JSON de variante |
| `sp_toggle_product` | Activa/desactiva un producto |
| `sp_toggle_variant` | Activa/desactiva una variante |

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Bryant-grippa21/th.o.git
cd th.o
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tuherramientaonline
JWT_SECRET=tu_clave_secreta_aqui
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
```

### 4. Crear la base de datos

Ejecutar los scripts en este orden:

```bash
# 1. Tablas de usuarios
mysql -u root -p < DB/usuarios/users_tables.sql

# 2. Stored Procedures de usuarios
mysql -u root -p < DB/usuarios/users_SP.sql

# 3. Tablas de productos
mysql -u root -p tuherramientaonline < DB/productos/products_tables.sql

# 4. Stored Procedures de productos
mysql -u root -p tuherramientaonline < DB/productos/products_sp_manual.sql
```

### 5. Iniciar el servidor

```bash
# Desarrollo (con nodemon)
npx nodemon src/app.js

# Producción
node src/app.js
```

---

## 🗺️ Roadmap

### ✅ Completado
- [x] Registro local de Customer (bcrypt + SP)
- [x] Login local con bloqueo por intentos fallidos
- [x] Autenticación Google OAuth2
- [x] Middleware JWT de verificación
- [x] Endpoint `/me` para sesión activa
- [x] Arquitectura de DB: Customer, Company, Cashback, Crédito, Productos, Stock

### 🔄 En Progreso (Refactorización)
- [ ] Migrar backend de `user_n` → `Customer`
- [ ] Actualizar `auth.service.js` con nuevos nombres de tablas y SPs
- [ ] Activar `dotenv` en `app.js`
- [ ] Mover credenciales a variables de entorno
- [ ] Implementar `loginGoogle` en controller
- [ ] Implementar `getProfile` y `updateProfile` en controller

### 📋 Pendiente
- [ ] Auth y rutas para `Company` (registro empresa, login)
- [ ] Módulo de productos (CRUD con variantes y stock)
- [ ] Sistema de cashback
- [ ] Sistema de crédito B2B
- [ ] Roles y permisos (ADMIN, DETALLISTA, MAYORISTA)
- [ ] CORS configurado para producción
- [ ] Cron job para `sp_check_credit_status`
- [ ] Definir tabla `Transaction` (referenciada en `Cashback_History`)
- [ ] Crear `.env.example`
- [ ] Separar rutas de Customer y Company

---

## ⚠️ Notas de Seguridad

> Los siguientes puntos son deuda técnica conocida y están en proceso de corrección:

- `JWT_SECRET` actualmente hardcodeada como `'secret_key'` → mover a `.env`
- `GOOGLE_CLIENT_ID` expuesto en archivos de configuración → mover a `.env`
- Credenciales de DB en texto plano en `db.js` → mover a `.env`
- `dotenv` instalado pero pendiente de inicializar en `app.js`

---

## 👤 Autor

**Bryant Grippa**
- GitHub: [@Bryant-grippa21](https://github.com/Bryant-grippa21)
- Rama activa: `bryant_main`
- Repositorio: `th.o`

---

*Última actualización: Abril 2026*