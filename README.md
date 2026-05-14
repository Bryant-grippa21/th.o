# 🔧 TUHERRAMIENTA.ONLINE

Plataforma e-commerce/marketplace orientada a la venta de herramientas, con soporte para clientes finales (B2C) y empresas detallistas/mayoristas (B2B). Incluye autenticación separada para `Customer` y `Company`, panel administrativo, perfiles con imagen, catálogo por jerarquía `Category -> Subcategory -> Line -> Product`, variantes/stock y un frontend HTML/JS temporal para validar contratos del backend.

---

## 📌 Estado del Proyecto

> ⚠️ **Proyecto en desarrollo activo.**
> El backend principal ya opera sobre entidades separadas para clientes y empresas.
> El frontend en `public/` sigue siendo un prototipo operativo para validar flujos mientras se sigue iterando el producto.

### Estado actual resumido
- Auth local y Google para `Customer`.
- Auth local para `Company`.
- Registro público de empresas forzado a rol `DETALLISTA`.
- Panel admin separado por módulos de clientes, jurídicos y productos.
- Perfil de empresa restringido: no puede editar `nombre`, `RIF` ni `correo` por autoservicio.
- Gestión administrativa de clientes y empresas con bloqueo/desbloqueo, reinicio de intentos y reseteo de contraseña.
- Listado administrativo de productos con filtros y paginación de 20 elementos.
- Módulo público de catálogo y detalle de producto activo.
- Módulo de taxonomía/gestión de líneas para empresas deshabilitado temporalmente en frontend.

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Base de datos | MySQL + mysql2/promise |
| Auth | JWT + bcrypt |
| OAuth | Google Identity Services |
| Uploads | multer |
| Variables de entorno | dotenv |
| Dev | nodemon |

---

## 📁 Estructura del Proyecto

```text
TUHERRAMIENTA.ONLINE/
├── package.json
├── README.md
├── ideas/
├── auth/
│   ├── login.html
│   └── register.html
├── modules/
│   ├── admin/
│   │   └── dashboard.html
│   ├── company/
│   │   ├── catalog-management.html
│   │   ├── dashboard.html
│   │   └── profile.html
│   └── customer/
│       ├── dashboard.html
│       └── profile.html
├── products/
│   └── detail.html
├── public/
│   ├── index.html
│   ├── readme.md
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       ├── admin/
│   │       │   └── dashboard.js
│   │       ├── auth/
│   │       │   ├── google.js
│   │       │   ├── login.js
│   │       │   └── register.js
│   │       ├── company/
│   │       │   ├── catalog-management.js
│   │       │   ├── dashboard.js
│   │       │   └── profile.js
│   │       ├── customer/
│   │       │   ├── dashboard.js
│   │       │   └── profile.js
│   │       ├── products/
│   │       └── utils/
│   │           └── auth.js
│   └── uploads/
│       ├── products/
│       └── profiles/
│           ├── customers/
│           └── companies/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── google.js
│   ├── controllers/
│   │   ├── auth.customer.controller.js
│   │   ├── auth.company.controller.js
│   │   └── products.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── routes/
│   │   ├── auth.customer.routes.js
│   │   ├── auth.company.routes.js
│   │   └── products.routes.js
│   ├── services/
│   │   ├── auth.customer.service.js
│   │   ├── auth.company.service.js
│   │   └── products.service.js
│   └── utils/
│       ├── hash.js
│       └── jwt.js
└── DB/
    ├── README.md
    ├── categorizacion 1/
    │   ├── catalog_cleanup.sql
    │   ├── category.sql
    │   ├── line.sql
    │   ├── prod.sql
    │   ├── readme.md
    │   ├── subcategory.sql
    │   └── tuherramientaonline (1).sql
    ├── dashboards/
    │   ├── company_admin_dashboard.sql
    │   ├── customer_admin_dashboard.sql
    │   └── readme.md
    ├── postman/
    ├── productos/
    │   ├── product.md
    │   ├── product2.md
    │   ├── products_sp_manual.sql
    │   └── products_tables.sql
    ├── usuarios/
    │   ├── users_tables.sql
    │   └── users_SP.sql
```

---

## ✅ Funcionalidades implementadas

### Customer
- Registro local
- Login local
- Login con Google
- Transición automática a `both` cuando combina login local y Google
- `/me`
- `GET /profile`
- `PUT /profile`
- `PUT /profile/image`
- Dashboard customer
- Perfil customer
- Módulo admin para listar customers, actualizar nombre/correo, bloquear, reiniciar intentos y resetear contraseña

### Company
- Registro local
- Login local
- `/me`
- `GET /profile`
- `PUT /profile`
- `PUT /profile/image`
- Dashboard company
- Perfil company con edición limitada a `phone`, `address` y `password`
- Registro público con rol fijo `DETALLISTA`
- Normalización de RIF: el frontend pide números y backend almacena `J-<digits>`
- Panel admin para empresas con cambio de rol entre `DETALLISTA` y `MAYORISTA`, bloqueo, reinicio de intentos y reset de contraseña
- Empresas no admin solo pueden consultar/gestionar sus propios productos cuando usan endpoints protegidos de catálogo

### Productos
- `GET /catalog`
- `GET /catalog/:productId`
- `GET /categories`
- `GET /categories/:categoryId/subcategories`
- `GET /management/subcategories`
- `GET /management/lines`
- `GET /management/products`
- `POST /categories`
- `PUT /categories/:categoryId`
- `PUT /categories/:categoryId/status`
- `POST /subcategories`
- `PUT /subcategories/:subcategoryId`
- `PUT /subcategories/:subcategoryId/status`
- `POST /api/products`
- `POST /api/products/:productId/variants`
- `PUT /api/products/:productId`
- `PUT /api/products/:productId/status`
- `PUT /api/products/variants/:variantId`
- `PUT /api/products/variants/:variantId/stock`
- SKU autogenerado por backend para productos y variantes
- Listado administrativo paginado con 20 productos por página, filtros por nombre, empresa, categoría, subcategoría y línea, e imagen principal

### Seguridad
- JWT
- bcrypt
- bloqueo por intentos fallidos
- variables sensibles en `.env`

---

## 🔐 Endpoints disponibles

### Customer → `/api/auth`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Registro local |
| POST | `/login` | Login local |
| POST | `/google` | Login/registro con Google |
| GET | `/me` | Sesión actual |
| GET | `/profile` | Obtener perfil |
| PUT | `/profile` | Actualizar perfil |
| PUT | `/profile/image` | Subir imagen de perfil |
| GET | `/admin/customers` | Listado administrativo de customers |
| PUT | `/admin/customers/:customerId/basic` | Actualizar nombre/correo de customer |
| PUT | `/admin/customers/:customerId/status` | Bloquear o desbloquear customer |
| PUT | `/admin/customers/:customerId/attempts/reset` | Reiniciar intentos fallidos |
| PUT | `/admin/customers/:customerId/password` | Reset administrativo de contraseña |

### Company → `/api/company-auth`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Registro empresa |
| POST | `/login` | Login empresa |
| GET | `/me` | Sesión actual empresa |
| GET | `/profile` | Obtener perfil empresa |
| PUT | `/profile` | Actualizar teléfono, dirección o contraseña |
| PUT | `/profile/image` | Subir imagen de perfil empresa |
| GET | `/admin/companies` | Listado administrativo de empresas |
| GET | `/admin/company-roles` | Roles válidos para empresas |
| PUT | `/admin/companies/:companyId/role` | Cambiar rol entre `DETALLISTA` y `MAYORISTA` |
| PUT | `/admin/companies/:companyId/status` | Activar o desactivar empresa |
| PUT | `/admin/companies/:companyId/attempts/reset` | Reiniciar intentos fallidos |
| PUT | `/admin/companies/:companyId/password` | Reset administrativo de contraseña |

### Productos → `/api/products`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/catalog` | Listado público simple para homepage |
| GET | `/catalog/:productId` | Detalle público básico de producto |
| GET | `/categories` | Listar categorías |
| GET | `/categories/:categoryId/subcategories` | Listar subcategorías por categoría |
| GET | `/management/subcategories` | Listar subcategorías para gestión |
| GET | `/management/lines` | Listar líneas filtrables por empresa/categoría/subcategoría |
| GET | `/management/products` | Listar productos paginados y filtrables para admin o empresa |
| POST | `/categories` | Crear categoría manualmente |
| PUT | `/categories/:categoryId` | Actualizar categoría |
| PUT | `/categories/:categoryId/status` | Activar o desactivar categoría |
| POST | `/subcategories` | Crear subcategoría manualmente |
| PUT | `/subcategories/:subcategoryId` | Actualizar subcategoría |
| PUT | `/subcategories/:subcategoryId/status` | Activar o desactivar subcategoría |
| POST | `/` | Crear producto completo manualmente |
| POST | `/:productId/variants` | Agregar variante a un producto |
| PUT | `/:productId` | Actualizar producto |
| PUT | `/:productId/status` | Activar o desactivar línea/producto lógico |
| PUT | `/variants/:variantId` | Actualizar variante |
| PUT | `/variants/:variantId/stock` | Sincronizar stock |

---

## 🖼️ Gestión de imágenes

Las imágenes se guardan en disco y el backend almacena solo el nombre del archivo en la base de datos.

En el módulo de productos, el `sku` no se envía manualmente: el backend genera automáticamente un código numérico único de `7` dígitos, sin cero inicial y distinto de `9999999`.

El homepage público ya puede consumir un catálogo básico desde backend y enlazar a una vista placeholder de detalle por producto.

La vista administrativa de productos usa `Product_Image.is_main = TRUE` para mostrar la imagen principal en el listado.

### Rutas de almacenamiento
- `public/uploads/profiles/customers/`
- `public/uploads/profiles/companies/`
- `public/uploads/products/`

### Acceso público
- `/uploads/profiles/customers/<archivo>`
- `/uploads/profiles/companies/<archivo>`
- `/uploads/products/<archivo>`

> Por ahora, las imágenes anteriores **no se eliminan** automáticamente.

---

## ⚙️ Instalación

### 1. Clonar
```bash
git clone https://github.com/Bryant-grippa21/th.o.git
cd th.o
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear `.env`
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=tuherramientaonline
JWT_SECRET=tu_clave_secreta_aqui
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
```

### 4. Inicializar base de datos
```bash
mysql -u root -p < DB/usuarios/users_tables.sql
mysql -u root -p < DB/usuarios/users_SP.sql
mysql -u root -p tuherramientaonline < DB/productos/products_tables.sql
mysql -u root -p tuherramientaonline < DB/productos/products_sp_manual.sql
mysql -u root -p tuherramientaonline < "DB/categorizacion 1/category.sql"
mysql -u root -p tuherramientaonline < "DB/categorizacion 1/subcategory.sql"
mysql -u root -p tuherramientaonline < "DB/categorizacion 1/line.sql"
```

### 5. Levantar servidor
```bash
npx nodemon src/app.js
```

---

## 🧩 Base de datos

### Modelo actual de catálogo
- `Category`
- `Subcategory`
- `Line`
- `Product`
- `Product_Image`
- `Stock`
- `Stock_History`

`brand` vive en `Product`, no en `Line`.

### Tablas principales
- `Customer`
- `Company`
- `Role`
- `Cashback`
- `Cashback_History`
- `Credit_Limit`
- `Credit_History`
- `Category`
- `Subcategory`
- `Line`
- `Product`
- `Stock`
- `Stock_History`
- `Product_Image`

### SPs principales
- `sp_register_customer_local`
- `sp_register_customer_google`
- `sp_update_customer`
- `sp_register_company`
- `sp_update_company`
- `sp_admin_create_category`
- `sp_admin_create_subcategory`
- `sp_create_product_full`
- `sp_add_variant`
- `sp_update_product`
- `sp_toggle_product`
- `sp_update_variant`
- `sp_update_stock`
- `sp_update_login_failed`
- `sp_reset_login_failed`
- `sp_toggle_customer_status`
- `sp_update_login_failed_company`
- `sp_reset_login_failed_company`
- `sp_toggle_company_status`

---

## 🧪 Datos y limpieza de catálogo

La carpeta `DB/categorizacion 1/` contiene scripts de carga y limpieza para revisar jerarquías, corregir mojibake y ajustar datos heredados.

### Archivos relevantes
- `DB/categorizacion 1/catalog_cleanup.sql`
- `DB/categorizacion 1/category.sql`
- `DB/categorizacion 1/subcategory.sql`
- `DB/categorizacion 1/line.sql`
- `DB/categorizacion 1/prod.sql`

### Nota operativa
- `DB/usuarios/users_tables.sql` siembra la empresa admin base con `id_company = 1` y rol `ADMIN`.
- Los scripts de dashboards en `DB/dashboards/` documentan consultas auxiliares para paneles de customers y companies.

---

## 🌐 Frontend público temporal

La carpeta `public/` sigue siendo un prototipo HTML/JS simple para validar contratos del backend mientras el frontend React definitivo avanza por separado.

Hoy ese prototipo ya permite:

- login local customer
- login con Google
- registro local customer
- registro/login company
- lectura de sesión por entidad
- dashboard y perfil de customer
- dashboard y perfil de company
- dashboard admin con módulos separados: clientes, jurídicos y productos
- listado administrativo de productos con filtros y paginación
- listado público de productos en homepage
- enlace a detalle público de producto

La guía específica del prototipo está en `public/readme.md`.

---

## 🗺️ Siguiente a realizar

- carrito de compras del lado del cliente
- checkout unificado para customer y company
- historial de compras / órdenes
- gestión de ventas y pagos para empresas detallistas/mayoristas
- gestión de cashback y créditos
- cashback para customers
- crédito B2B para companies
- profundizar el módulo de productos del admin más allá del listado actual
- habilitar nuevamente gestión de catálogo empresarial cuando se redefina su alcance
- panel de cliente para gestión de compras, cashback y records
- integración frontend
- estrategia de eliminación/versionado de imágenes
- validaciones más estrictas para uploads
- CORS para producción
- tests automáticos

---

## 👤 Autor

**Bryant Grippa**  
GitHub: [@Bryant-grippa21](https://github.com/Bryant-grippa21)

---

## 🔄 Notas de evolución

- El proyecto ya migró de una estructura de prueba a un modelo con `Customer` y `Company` separados.
- El frontend HTML actual sigue siendo transicional y prioriza validación funcional sobre diseño final.
- La taxonomía y las reglas de producto aún están cambiando, así que conviene revisar `DB/categorizacion 1/` y `DB/productos/` antes de introducir seeds o migraciones nuevas.

---

*Última actualización: Mayo 2026*