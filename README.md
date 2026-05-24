# TUHERRAMIENTA.ONLINE

Plataforma tipo marketplace enfocada en herramientas, ferreteria y operaciones B2C/B2B. El sistema separa clientes finales (`Customer`) y empresas (`Company`), con roles administrativos y flujos propios para catalogo, compras, pagos, tasa de cambio y cashback.

El frontend ubicado en `public/` sigue siendo un prototipo funcional en HTML/JS para validar contratos del backend mientras se consolida el producto.

---

## Estado actual

Proyecto en desarrollo activo.

### Modulos operativos
- Autenticacion local y Google para `Customer`.
- Autenticacion local para `Company`.
- Registro publico de empresas con rol inicial `DETALLISTA`.
- Dashboard admin con modulos de clientes, juridicos, productos y tasa.
- Gestion de perfiles con imagen para customer y company.
- Landing publico con buscador general, buscador de categorias, paginacion y carrito desplegable.
- Catalogo publico, detalle de producto, recomendados y reseñas editables con promedio.
- Gestion de productos para empresas y admin.
- Carrito y favoritos persistidos en JSON por customer.
- Tasa de cambio con administracion e historial.
- Checkout agrupado por proveedor.
- Evidencias de pago por grupo de compra.
- Revision de compras por empresa.
- Cashback para customers con historial y vista dedicada.

### Modulos en ajuste
- Checkout con cashback y redencion.
- Estados derivados de compras cuando el total queda cubierto por cashback.

### Modulos en analisis
- Prestamos monetarios B2B entre mayorista y detallista.
- Restricciones operativas por mora sin bloquear completamente la administracion del negocio.

---

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Base de datos | MySQL / MariaDB con `mysql2/promise` |
| Auth | JWT + bcrypt |
| OAuth | Google Identity Services |
| Uploads | multer |
| Config | dotenv |
| Desarrollo | nodemon |

---

## Estructura principal

```text
TUHERRAMIENTA.ONLINE/
├── DB/
│   ├── databasefor0test.sql
│   ├── compras/
│   ├── dashboards/
│   ├── exchange/
│   ├── productos/
│   └── usuarios/
├── ideas/
├── public/
│   ├── index.html
│   ├── auth/
│   ├── modules/
│   │   ├── admin/
│   │   ├── company/
│   │   └── customer/
│   ├── products/
│   ├── assets/
│   │   ├── css/
│   │   └── js/
│   └── uploads/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── storage/
│   └── utils/
├── package.json
└── README.md
```

---

## Funcionalidades implementadas

### Customer
- Registro local.
- Login local.
- Login y vinculacion con Google.
- Perfil y subida de imagen.
- Dashboard customer.
- Favoritos y carrito por archivos JSON.
- Carrito temporal desde el landing con acciones para sumar, restar y eliminar productos.
- Checkout propio y vista de compras.
- Carga de evidencias de pago.
- Consulta de cashback e historial.

### Company
- Registro local.
- Login local.
- Dashboard company.
- Perfil e imagen.
- Gestion de productos propios.
- Gestion de compras recibidas por proveedor.
- Registro de metodos de pago.
- Revision de evidencias y aprobacion/rechazo/expiracion de grupos.

### Admin
- Dashboard modular.
- Gestion de customers.
- Gestion de companies y roles.
- Gestion/listado de productos.
- Gestion de tasa de cambio.

### Catalogo y stock
- Jerarquia `Category -> Subcategory -> Line -> Product`.
- Landing con orden por reseñas, sugerencias de busqueda y filtro por categoria.
- Imagen principal y secundarias por producto.
- Promedio de reseñas visible en landing, detalle y recomendados.
- Reseña publica por producto con una sola reseña editable por customer o company.
- Stock e historial de stock.
- Filtros administrativos y paginacion.

### Compras y pagos
- Checkout separado por proveedor.
- Reserva de stock al crear checkout.
- Evidencias por grupo de compra.
- Fechas limite de pago.
- Liberacion de stock en rechazo/expiracion.
- Historial de compras del customer y gestion para company.

### Cashback
- Acumulacion por compras aprobadas.
- Historial de movimientos.
- Vista separada para customer.
- Base para redencion sobre checkout, aun en ajuste funcional.

---

## Endpoints por area

El backend se organiza por familias de rutas:

- `/api/auth`
    Customer auth, perfil, favoritos, carrito, cashback y utilidades de customer.

- `/api/company-auth`
    Auth, perfil y administracion de empresas.

- `/api/products`
    Catalogo publico, categorias, lineas, productos y gestion administrativa/empresarial.

- `/api/exchange-rate`
    Consulta y administracion de tasa de cambio.

- `/api/purchases`
    Checkout, historial de compras, evidencias, metodos de pago y revision empresarial.

El detalle fino de contratos se valida actualmente desde el frontend prototipo en `public/assets/js/`.

---

## Base de datos

### Script recomendado
Para levantar una base nueva, el punto de partida mas directo es:

`DB/databasefor0test.sql`

Ese archivo concentra:
- customers y companies
- roles
- cashback
- creditos base heredados
- taxonomia y productos
- stock e imagenes
- tasa de cambio
- compras y evidencias
- stored procedures principales

### Scripts modulares
Tambien existen carpetas por dominio dentro de `DB/` para trabajo incremental o referencia:
- `DB/usuarios/`
- `DB/productos/`
- `DB/exchange/`
- `DB/compras/`
- `DB/dashboards/`

### Tablas clave del sistema actual
- `Customer`
- `Company`
- `Role`
- `Cashback`
- `Cashback_History`
- `Category`
- `Subcategory`
- `Line`
- `Product`
- `Product_Image`
- `Product_Review`
- `Stock`
- `Stock_History`
- `Exchange_Rate`
- `Purchase_Checkout`
- `Purchase_Group`
- `Purchase_Item`
- `Purchase_Evidence`
- `Company_Payment_Method`

### Creditos B2B
El script consolidado ya contiene `Credit_Limit` y `Credit_History` como base heredada de credito entre empresas.

Hoy esas tablas se toman como referencia para el siguiente modulo, pero el producto de prestamos monetarios B2B no esta cerrado ni implementado de punta a punta.

La decision actual de analisis es:
- no tratarlo todavia como parte del checkout normal
- no asumir que `Credit_Limit` por si sola resuelve prestamos puntuales multiples
- evaluar el modulo como cartera/prestamos B2B con pagos por evidencia y reglas de mora separadas

---

## Instalacion y arranque

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear `.env`

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=tuherramientaonline
JWT_SECRET=tu_clave_secreta
GOOGLE_CLIENT_ID=tu_google_client_id
```

### 3. Inicializar base de datos

Opcion recomendada:

```bash
mysql -u root -p < DB/databasefor0test.sql
```

### 4. Levantar servidor

```bash
node src/app.js
```

En desarrollo:

```bash
npx nodemon src/app.js
```

La aplicacion expone por defecto `http://localhost:3000`.

---

## Frontend prototipo

El frontend en `public/` existe para validar contratos y flujos del backend.

Hoy permite:
- autenticacion y manejo de sesion por entidad
- dashboards de customer, company y admin
- catalogo y detalle publico
- carrito, favoritos y compras customer
- productos y compras company
- tasa y modulos admin basicos

No debe leerse todavia como UI final del producto.

---

## Estado del modulo de prestamos B2B

Este modulo esta en fase de analisis funcional.

### Lo que si esta claro
- el cliente de negocio quiere prestamos monetarios entre mayorista y detallista
- el desembolso del dinero ocurre fuera de la plataforma
- la plataforma solo registraria solicitud, aprobacion, deuda, pagos y mora
- puede haber multiples prestamos con multiples mayoristas

### Riesgos detectados
- ambiguedad entre prestamo monetario y credito comercial
- dificultad para amarrar el dinero a una compra real
- bloqueo total del detallista puede afectar clientes finales y pedidos activos
- `Credit_Limit` no parece suficiente por si sola para modelar prestamos puntuales multiples

### Criterio actual de producto
- no bloquear por completo la administracion del detallista en caso de mora
- restringir nuevas operaciones de crecimiento antes que romper operaciones existentes
- separar convenio de credito, prestamo puntual y pagos/evidencias

Mientras no se cierre esta definicion con negocio, el README lo documenta como modulo en analisis y no como feature implementada.

---

## Notas operativas

- El frontend actual es transicional.
- El arbol de taxonomia y reglas de producto siguen evolucionando.
- Las imagenes se almacenan en disco bajo `public/uploads/`.
- Los carritos y favoritos de customers se almacenan en `src/storage/customers/`.
- El proyecto puede tener cambios experimentales en curso; conviene revisar el estado real de `DB/` y `src/services/` antes de introducir migraciones nuevas.

---

## Pendientes de alto nivel

- estabilizar completamente checkout con cashback/redencion
- consolidar reglas finales del modulo de prestamos B2B
- definir restricciones por mora sin romper operaciones activas
- mejorar endurecimiento de validaciones y errores de negocio
- ampliar pruebas automatizadas
- seguir desacoplando el frontend prototipo del backend definitivo

---

## Autor

Bryant Grippa

GitHub: [@Bryant-grippa21](https://github.com/Bryant-grippa21)

---

Ultima actualizacion: Mayo 2026