# Frontend público actual

## Estado real

La carpeta `public/` contiene un frontend provisional hecho con HTML, CSS y JavaScript simple para acelerar pruebas manuales del backend.

No es todavía el frontend React final del proyecto.

Su propósito actual es:

- validar autenticación de customer
- validar lectura de sesión
- validar edición básica de perfil
- validar un catálogo público mínimo
- servir como base temporal mientras el equipo de frontend implementa la versión real

---

## Estructura actual

### Archivos principales

- `index.html`: entrada pública simple
- `auth/login.html`: pantalla de login local y Google
- `auth/register.html`: pantalla de registro local
- `modules/user_n/dashboard.html`: dashboard temporal de customer
- `modules/user_n/profile.html`: edición temporal de perfil
- `products/detail.html`: detalle temporal y mínimo de producto

### JavaScript actual

- `assets/js/index.js`: detecta sesión y muestra accesos
- `assets/js/index.js`: también consulta el catálogo público básico
- `assets/js/auth/login.js`: login local
- `assets/js/auth/register.js`: registro local
- `assets/js/auth/google.js`: login con Google
- `assets/js/user_n/dashboard.js`: consulta `/api/auth/me`
- `assets/js/user_n/profile.js`: consulta y actualiza `/api/auth/profile`
- `assets/js/utils/auth.js`: utilidades simples de token/logout

### Estilos

- `assets/css/styles.css`: estilos mínimos del prototipo

---

## Qué ya está alineado con el backend

El frontend provisional ya puede integrarse con estas rutas reales:

### Customer

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Catálogo público

- `GET /api/products/catalog`
- `GET /api/products/catalog/:productId`

### Importante

- el registro actual ya no usa `DOB`
- el perfil se obtiene con respuesta tipo `{ message, user }`
- el token se guarda en `localStorage` con la key `token`
- el `index.html` ya muestra productos reales desde backend
- el detalle de producto existe como placeholder funcional

---

## Problemas detectados y corregidos

Durante la revisión del prototipo se corrigieron varios desajustes con el backend actual:

- `register.html` todavía mostraba el campo `DOB`, pero el backend actual ya no lo usa
- `register.js` todavía enviaba `DOB` al backend
- `login.js` tenía código viejo de backend mezclado dentro del archivo del navegador
- `profile.js` estaba leyendo mal la respuesta de `GET /api/auth/profile`
- `index.js` y `dashboard.js` duplicaban manejo de sesión en vez de usar una base común
- el homepage no consumía todavía el catálogo real del backend

Estas correcciones ya quedaron aplicadas para que el prototipo siga siendo útil al equipo de frontend.

---

## Evaluación de la estructura actual

La estructura cumple como prototipo de prueba, pero no debería crecer mucho más así.

### Lo bueno

- permite probar rápido el backend sin esperar UI final
- separa vistas públicas de scripts
- hace visible el contrato real de las APIs
- ya sirve como smoke test de catálogo público mínimo

### Lo débil

- mantiene nombres legacy como `user_n`
- usa `fetch('http://localhost:3000/...')` hardcodeado
- no hay manejo centralizado de errores
- no hay componente reutilizable
- no existe manejo de estado de sesión más allá de `localStorage`
- no hay separación por dominio (`auth`, `profile`, `products`, etc.)

---

## Cómo debería integrarse el frontend React

Cuando el equipo de frontend empiece con React, lo más sano es tratar este `public/` como referencia funcional, no como base técnica directa.

### Recomendación de arquitectura React

Separar por módulos:

- `auth/`
- `customer/`
- `company/`
- `products/`
- `shared/`

Separar también:

- `services/` para llamadas HTTP
- `pages/` para vistas
- `components/` para piezas reutilizables
- `hooks/` para sesión, perfil y datos
- `context/` o equivalente para auth global

---

## Implementación progresiva sugerida

### Etapa 1

Replicar en React lo que ya funciona en el backend:

- login local customer
- registro customer
- login con Google
- lectura de sesión con `/api/auth/me`
- edición de perfil

### Etapa 2

Agregar módulos de productos ya existentes:

- ampliar el catálogo público y el detalle de producto
- listar categorías
- listar subcategorías
- crear producto manual
- crear variante
- subir imagen de producto

### Etapa 3

Preparar la base para siguientes dominios:

- carrito
- órdenes
- ventas
- tipo de cambio USD/VES

---

## Recomendaciones técnicas para frontend

### 1. Evitar URLs hardcodeadas

En React, usar una configuración central como:

- `VITE_API_URL`
- `REACT_APP_API_URL`

según el stack elegido.

### 2. Centralizar llamadas HTTP

No repetir `fetch` por archivo. Crear un cliente API reutilizable.

### 3. Centralizar auth

Crear una sola capa para:

- guardar token
- leer token
- logout
- validar sesión
- redirigir cuando el token expire

### 4. Preparar separación customer/company

Ya el backend distingue entidades. El frontend también debería separar claramente:

- login customer
- login company
- dashboard customer
- dashboard company

### 5. Mantener este prototipo pequeño

No conviene convertir `public/` en el frontend definitivo. Conviene usarlo solo mientras el equipo de frontend valida contratos y flujos.

---

## Resumen práctico

Hoy `public/` sirve como laboratorio de integración con el backend.

Es útil para:

- probar endpoints
- entender contratos
- verificar flujos base
- validar que el homepage ya consuma productos reales

Pero el frontend real debería moverse a una app React separada por módulos y con integración más limpia.

Mientras tanto, este prototipo ya quedó corregido para seguir haciendo pruebas sin arrastrar errores viejos del backend anterior.
