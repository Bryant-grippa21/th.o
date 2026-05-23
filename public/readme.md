# Frontend publico actual

## Objetivo

La carpeta `public/` contiene el frontend provisional del sistema, construido con HTML, CSS y JavaScript vanilla para validar manualmente los flujos del backend.

No es el frontend definitivo del proyecto. Su funcion actual es servir como laboratorio de integracion mientras se siguen ajustando compras, cashback, dashboards y operaciones por rol.

Tambien queda pensado para trabajar con una base reiniciable desde cero usando `DB/databasefor0test.sql`.

---

## Alcance actual

Este prototipo ya permite probar:

- acceso publico al home y al detalle de producto
- registro y login de customer
- login con Google para customer
- login de company
- lectura de sesion y logout
- perfiles de customer y company
- dashboard admin, company y customer
- catalogo y gestion de productos para company
- carrito y favoritos persistidos por customer
- checkout agrupado por proveedor
- carga de evidencias por grupo de compra
- revision de compras por empresa
- consulta y uso de cashback en compras
- consulta de tasa de cambio para montos referenciales

---

## Estructura real

### Vistas HTML

- `index.html`: portada publica con accesos rapidos y catalogo basico
- `auth/login.html`: login local y acceso con Google para customer
- `auth/register.html`: registro local de customer
- `modules/admin/dashboard.html`: dashboard administrativo
- `modules/company/dashboard.html`: dashboard de empresa
- `modules/company/catalog-management.html`: gestion compacta de catalogo para empresa
- `modules/company/products.html`: gestion de productos y stock de empresa
- `modules/company/profile.html`: perfil de empresa
- `modules/company/purchases.html`: revision de grupos de compra recibidos
- `modules/customer/dashboard.html`: dashboard de customer
- `modules/customer/cart.html`: carrito y checkout
- `modules/customer/cashback.html`: saldo e historial de cashback
- `modules/customer/favorites.html`: favoritos
- `modules/customer/profile.html`: perfil de customer
- `modules/customer/purchases.html`: historial de compras del customer
- `products/detail.html`: detalle publico de producto

### JavaScript por dominio

- `assets/js/index.js`: home, accesos y catalogo publico
- `assets/js/auth/login.js`: login local
- `assets/js/auth/register.js`: registro local
- `assets/js/auth/google.js`: login con Google
- `assets/js/admin/dashboard.js`: modulos y resumen admin
- `assets/js/company/dashboard.js`: accesos principales de empresa
- `assets/js/company/catalog-management.js`: catalogo compacto por empresa
- `assets/js/company/products.js`: CRUD de productos, variantes y stock
- `assets/js/company/profile.js`: perfil de empresa
- `assets/js/company/purchases.js`: metodos de pago y revision de grupos
- `assets/js/customer/dashboard.js`: accesos principales de customer
- `assets/js/customer/cart.js`: carrito, tasa y checkout con cashback
- `assets/js/customer/cashback.js`: saldo e historial de cashback
- `assets/js/customer/favorites.js`: favoritos persistidos
- `assets/js/customer/profile.js`: perfil de customer
- `assets/js/customer/purchases.js`: compras, ordenes y evidencias
- `assets/js/utils/auth.js`: token, sesion y cabeceras de autorizacion

### Estilos

- `assets/css/styles.css`: estilos del prototipo actual

---

## Relacion con el backend

El frontend de `public/` consume directamente las rutas reales del backend Express. Las familias principales son:

- `/api/auth`: customer, perfil, favoritos, carrito, cashback y sesion
- `/api/company-auth`: autenticacion y perfil de empresas
- `/api/products`: catalogo publico, detalle, categorias y gestion de productos
- `/api/exchange-rate`: tasa actual e historial
- `/api/purchases`: checkout, compras del customer, compras de company y evidencias

### Contratos importantes ya contemplados

- el token se guarda en `localStorage`
- customer y company usan sesiones separadas en frontend
- el checkout puede enviar uso de cashback por body y header
- las compras del customer se muestran con `order_code`
- la carga de evidencia aplica por grupo de compra, no por checkout completo
- si un grupo queda cubierto al 100% por cashback, el backend puede resolverlo sin evidencia manual

---

## Flujo recomendado de pruebas

### 1. Reiniciar la base

Para pruebas limpias desde cero, la referencia actual es:

- `DB/databasefor0test.sql`

### 2. Levantar backend

El frontend asume el servidor Express activo en `http://localhost:3000`.

### 3. Probar por bloques

Orden sugerido:

- home y detalle de producto
- registro y login de customer
- favoritos y carrito
- checkout con y sin cashback
- historial de compras del customer
- login de company
- revision de grupos y metodos de pago
- dashboard admin y tasa de cambio

---

## Lo que ya refleja el prototipo

- la separacion real entre `admin`, `company` y `customer`
- vistas mas compactas en compras y productos usando bloques expandibles
- soporte visual para cashback disponible, cashback usado y total a pagar
- agrupacion de compras por proveedor
- soporte para tasa Bs/USD como referencia en carrito y compras
- manejo provisional pero funcional de autenticacion y navegacion protegida

---

## Limitaciones actuales

Este frontend sigue siendo util para pruebas, pero mantiene limites claros:

- usa JavaScript plano y `fetch` directo
- depende de una URL base local fija
- no hay componentes reutilizables ni estado global formal
- no hay una capa unica de cliente HTTP
- el estilo visual sigue siendo funcional, no definitivo
- no debe tomarse como base tecnica final para un frontend escalable

---

## Criterio de mantenimiento

Mientras el proyecto siga validando backend y reglas de negocio, `public/` debe mantenerse pequeno y practico.

La idea no es convertir esta carpeta en el frontend final, sino conservarla como entorno de pruebas manuales, especialmente util cuando se reinicia la base y se quiere volver a recorrer los flujos desde cero.

Cuando el producto migre a un frontend mas estructurado, este prototipo debe usarse como referencia funcional de pantallas, contratos y secuencia de pruebas.
