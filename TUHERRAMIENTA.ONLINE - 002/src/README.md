# Backend `src/`

## Objetivo

La carpeta `src/` concentra el backend operativo de TUHERRAMIENTA.ONLINE. Aqui viven la API Express, la conexion a MySQL/MariaDB, la logica de negocio y los apoyos de almacenamiento local usados por el prototipo.

Su funcion actual es exponer los contratos que consume `public/` y sostener los flujos de autenticacion, catalogo, compras, pagos, tasa de cambio y cashback.

---

## Punto de entrada

Archivo principal:

- `app.js`

Responsabilidades de `app.js`:

- cargar variables de entorno desde `.env`
- crear la app Express
- habilitar `express.json()`
- montar las familias de rutas de la API
- servir `public/index.html` en `/` cuando existe
- exponer archivos estaticos de `public/`
- exponer `/uploads` para imagenes y evidencias
- levantar el servidor en `PORT` o `3000`

Rutas base montadas actualmente:

- `/api/auth`
- `/api/company-auth`
- `/api/exchange-rate`
- `/api/purchases`
- `/api/products`

---

## Estructura de capas

```text
src/
├── app.js
├── config/
├── controllers/
├── middlewares/
├── routes/
├── services/
├── storage/
└── utils/
```

### `config/`

Configuracion tecnica compartida.

- `db.js`: pool de conexion con `mysql2/promise`

Variables esperadas:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### `routes/`

Define la superficie HTTP y conecta middlewares con controladores.

Archivos principales:

- `auth.customer.routes.js`
- `auth.company.routes.js`
- `exchange.routes.js`
- `products.routes.js`
- `purchase.routes.js`

### `controllers/`

Reciben `req` y `res`, validan parametros basicos, traducen inputs HTTP y delegan el trabajo real a servicios.

Controladores actuales:

- `auth.customer.controller.js`
- `auth.company.controller.js`
- `exchange.controller.js`
- `products.controller.js`
- `purchase.controller.js`

### `services/`

Capa principal de negocio y acceso a datos. Aqui se concentra la logica real del sistema.

Servicios actuales:

- `auth.customer.service.js`
- `auth.company.service.js`
- `customer.collections.service.js`
- `exchange.service.js`
- `products.service.js`
- `purchase.service.js`

### `middlewares/`

Cruzan preocupaciones comunes de seguridad y archivos.

- `auth.middleware.js`: validacion de JWT y resolucion de usuario en sesion
- `upload.middleware.js`: configuracion `multer` para perfiles, productos y evidencias

### `storage/`

Persistencia auxiliar local del prototipo.

Hoy se usa principalmente para customer:

- `storage/customers/favorites/`
- `storage/customers/cart/`

Cada customer guarda favoritos y carrito en archivos JSON por id. Esto permite pruebas rapidas aunque la base principal siga en MySQL.

### `utils/`

Utilidades transversales.

- `hash.js`: hashing y verificacion de contrasenas
- `jwt.js`: generacion y validacion de tokens

---

## Modulos del backend

### `auth.customer`

Area dedicada a customers.

Incluye:

- registro local
- login local
- login Google
- perfil
- imagen de perfil
- favoritos
- carrito
- cashback
- administracion de customers desde admin

Endpoints representativos:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/auth/favorites`
- `GET /api/auth/cart`
- `GET /api/auth/cashback`

### `auth.company`

Area dedicada a empresas.

Incluye:

- registro local
- login local
- perfil de empresa
- imagen de perfil
- administracion de companies y roles desde admin

Endpoints representativos:

- `POST /api/company-auth/register`
- `POST /api/company-auth/login`
- `GET /api/company-auth/profile`
- `PUT /api/company-auth/profile`
- `GET /api/company-auth/admin/companies`

### `products`

Area de catalogo publico y gestion de productos.

Incluye:

- catalogo publico paginado con filtros, busqueda y orden por reseñas
- detalle publico por id o SKU
- recomendados y resumenes de reseñas por producto
- reseñas publicas editables con promedio por producto
- categorias y subcategorias
- lineas y referencias administradas
- CRUD de productos y variantes
- stock e historial de stock
- imagen principal y secundarias

Endpoints representativos:

- `GET /api/products/catalog`
- `GET /api/products/recommended`
- `GET /api/products/:productId/reviews`
- `POST /api/products/:productId/reviews`
- `GET /api/products/catalog/sku/:sku`
- `GET /api/products/categories`
- `GET /api/products/management/products`
- `POST /api/products`
- `PUT /api/products/:productId`

### `exchange`

Area de tasa de cambio.

Incluye:

- consulta publica de la ultima tasa
- listado administrativo
- registro administrativo de nuevas tasas

Endpoints representativos:

- `GET /api/exchange-rate/latest`
- `GET /api/exchange-rate`
- `POST /api/exchange-rate`

### `purchases`

Area de compras, checkout, pagos y revision por empresa.

Incluye:

- checkout desde carrito
- historial de checkouts por customer
- carga de evidencias por grupo
- metodos de pago por company
- aprobacion, rechazo y expiracion de grupos
- soporte para cashback aplicado al checkout
- agrupacion de compras por proveedor

Endpoints representativos:

- `POST /api/purchases/checkout`
- `GET /api/purchases/my-checkouts`
- `POST /api/purchases/groups/:groupId/evidence`
- `GET /api/purchases/company/groups`
- `POST /api/purchases/company/groups/:groupId/approve`

---

## Persistencia mixta

El backend no usa una sola estrategia de persistencia.

### Base relacional

La informacion principal del negocio se guarda en MySQL/MariaDB:

- customers y companies
- roles
- cashback e historial
- catalogo, stock y reseñas de producto
- tasa de cambio
- compras, grupos, items y evidencias

La referencia recomendada para reiniciar pruebas desde cero es:

- `DB/databasefor0test.sql`

### Archivos JSON

El carrito y los favoritos del customer se manejan en archivos JSON bajo `src/storage/customers/`.

Esto hoy cumple dos objetivos:

- acelerar pruebas del frontend provisional
- desacoplar esas colecciones del rediseño futuro de base de datos

---

## Archivos subidos

`upload.middleware.js` prepara carpetas y estrategias de nombre para los siguientes tipos de archivo:

- imagenes de perfil de customer
- imagenes de perfil de company
- imagenes de productos
- evidencias de pago de compras

Las rutas fisicas apuntan a `public/uploads/`, y `app.js` las expone por HTTP para que el frontend pueda consumirlas.

---

## Relacion con `public/`

El frontend de `public/` es el principal consumidor de esta API en el entorno actual.

La relacion entre ambas carpetas es directa:

- `src/` define contratos y reglas de negocio
- `public/` ejecuta pruebas manuales de esos contratos
- `/` sirve `public/index.html`
- `/uploads` sirve archivos generados por flujos del backend

En otras palabras, `public/` funciona como cliente de prueba y `src/` como backend real del prototipo.

---

## Dependencias principales

Segun `package.json`, el backend usa:

- `express`
- `mysql2`
- `bcrypt`
- `jsonwebtoken`
- `google-auth-library`
- `multer`
- `dotenv`
- `nodemon`

---

## Ejecucion local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar `.env`

Variables minimas esperadas:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=tuherramientaonline
JWT_SECRET=tu_clave
GOOGLE_CLIENT_ID=tu_google_client_id
```

### 3. Inicializar base

```bash
mysql -u root -p < DB/databasefor0test.sql
```

### 4. Levantar servidor

```bash
node src/app.js
```

---

## Criterio de mantenimiento

Si se siguen haciendo pruebas funcionales desde cero, este backend debe mantenerse como fuente principal de verdad del prototipo.

Las reglas practicas hoy son:

- mantener la logica de negocio en `services/`
- dejar `controllers/` delgados
- usar `routes/` solo como capa de exposicion HTTP
- documentar aqui cualquier cambio fuerte de arquitectura o persistencia
- tratar `DB/databasefor0test.sql` como bootstrap principal mientras el esquema siga consolidado

Cuando el proyecto vuelva a modularizar mas componentes, este README debe reflejar esa separacion.