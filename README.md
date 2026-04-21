# 🔧 TUHERRAMIENTA.ONLINE

Plataforma e-commerce/marketplace orientada a la venta de herramientas, con soporte para clientes finales (B2C) y empresas detallistas/mayoristas (B2B). Incluye autenticación separada para `Customer` y `Company`, gestión de perfiles, carga de imágenes de perfil y base para cashback, crédito empresarial, catálogo con variantes y control de stock.

---

## 📌 Estado del Proyecto

> ⚠️ **En refactorización activa, pero con auth funcional.**
> El backend ya fue migrado desde la estructura inicial de prueba hacia `Customer` y `Company`.
> El frontend sigue desacoplado y será integrado después.

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
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── public/
│   ├── index.html
│   ├── assets/
│   ├── utils/
│   │   └── auth.js
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── auth/ -- por renombrar
│   │   │   ├── google.js
│   │   │   ├── login.js
│   │   │   └── register.js
│   │   └── user_n/ -- por renombrar
│   │       ├── dashboard.js
│   │       └── profile.js
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── modules/
│   │   └── user_n/
│   │       ├── dashboard.html -- por renombrar
│   │       └── profile.html -- por renombrar
│   └── uploads/
│       └── profiles/
│           ├── customers/
│           └── companies/
│  
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── google.js
│   ├── controllers/
│   │   ├── auth.customer.controller.js
│   │   └── auth.company.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── routes/
│   │   ├── auth.customer.routes.js
│   │   └── auth.company.routes.js
│   ├── services/
│   │   ├── auth.customer.service.js
│   │   └── auth.company.service.js
│   └── utils/
│       ├── hash.js
│       └── jwt.js
└── DB/
    ├── usuarios/
    │   ├── users_tables.sql
    │   └── users_SP.sql
    └── productos/
        ├── products_tables.sql
        └── products_sp_manual.sql
```

---

## ✅ Funcionalidades implementadas

### Customer
- Registro local
- Login local
- Login con Google
- `/me`
- `GET /profile`
- `PUT /profile`
- `PUT /profile/image`

### Company
- Registro local
- Login local
- `/me`
- `GET /profile`
- `PUT /profile`
- `PUT /profile/image`

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

### Company → `/api/company-auth`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Registro empresa |
| POST | `/login` | Login empresa |
| GET | `/me` | Sesión actual empresa |
| GET | `/profile` | Obtener perfil empresa |
| PUT | `/profile` | Actualizar perfil empresa |
| PUT | `/profile/image` | Subir imagen de perfil empresa |

---

## 🖼️ Gestión de imágenes

Las imágenes se guardan en disco y el backend almacena solo el nombre del archivo en la base de datos.

### Rutas de almacenamiento
- `public/uploads/profiles/customers/`
- `public/uploads/profiles/companies/`

### Acceso público
- `/uploads/profiles/customers/<archivo>`
- `/uploads/profiles/companies/<archivo>`

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
```

### 5. Levantar servidor
```bash
npx nodemon src/app.js
```

---

## 🧩 Base de datos

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
- `Product`
- `Product_Variant`
- `Stock`
- `Stock_History`
- `Product_Image`

### SPs principales
- `sp_register_customer_local`
- `sp_register_customer_google`
- `sp_update_customer`
- `sp_register_company`
- `sp_update_company`
- `sp_update_login_failed`
- `sp_reset_login_failed`
- `sp_toggle_customer_status`
- `sp_update_login_failed_company`
- `sp_reset_login_failed_company`
- `sp_toggle_company_status`

---

## 🗺️ Siguiente a realizar

- CRUD de productos
- variantes e inventario
- gestión de categorías y subcategorías
- gestión de productos e imágenes
- carrito de compras del lado del cliente
- proceso de compra
- historial de compras
- gestión de ventas para empresas
- gestión de cashback y créditos
- cashback para customers.
- crédito B2B para companies.
- panel de administración para gestión de usuarios, productos, categorías, cashback y créditos.
- panel de empresa para gestión de productos, ventas y cashback.
- panel de cliente para gestión de perfil, compras, cashback y records.
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

## 🔄 Refactorización futura prevista

Una vez completada la mayor parte del backend, se realizará una mini refactorización para:

- renombrar carpetas legacy del frontend (`user_n`, `auth`)
- alinear nombres de vistas, scripts y módulos con `Customer` y `Company`
- reorganizar módulos de productos, categorías, compras y paneles
- separar mejor frontend público, panel cliente, panel empresa y panel admin
- revisar consistencia de nombres entre DB, backend y frontend
- evaluar centralización de respuestas, validaciones y manejo de errores

---

*Última actualización: Abril 2026*