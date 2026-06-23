# Informe de integración Frontend + Backend + Base de datos

## Estado general

Se integró el frontend React convertido a `.js` dentro del proyecto backend Express y se dejó compilado en `public/` para que el servidor lo entregue directamente con los estilos incluidos.

## Cambios realizados

### Frontend

- Se reemplazaron los componentes `.jsx` por componentes `.js` dentro de `frontend-react/src`.
- Se eliminaron referencias internas a `.jsx`.
- Se conectó el cliente API del frontend al backend local servido por Express usando `/api` en vez de `http://localhost:3000/api`.
- Se ajustaron rutas del frontend para coincidir con las rutas reales del backend:
  - Login persona natural: `/api/auth/login`
  - Login empresa/jurídico: `/api/company-auth/login`
  - Registro persona natural: `/api/auth/register`
  - Registro empresa/jurídico: `/api/company-auth/register`
  - Catálogo público: `/api/products/catalog`
  - Detalle de producto: `/api/products/catalog/:id`
  - Carrito: `/api/auth/cart` y `/api/auth/cart/items`
  - Checkout: `/api/purchases/checkout`
- El marketplace ahora intenta cargar productos desde la base de datos mediante el endpoint de catálogo. Si el backend/base de datos no responde, conserva el catálogo local como respaldo visual.
- Se recompiló el frontend y el resultado quedó en `public/`.

### Backend

- Se agregó `npm start` para arrancar el servidor con `node src/app.js`.
- Se agregó `npm run dev` para desarrollo con `nodemon src/app.js`.
- Se configuró Express para servir el build React desde `public/`.
- Se agregó fallback de rutas SPA para que rutas del frontend no devuelvan 404 al refrescar la página.
- Se mantuvieron activas las rutas API existentes:
  - `/api/auth`
  - `/api/company-auth`
  - `/api/products`
  - `/api/purchases`
  - `/api/exchange-rate`
  - `/api/notifications`
  - `/api/b2b-quotes`

### Base de datos

- El backend ya está conectado por MySQL usando `src/config/db.js`.
- El script principal para crear/importar la base está en `DB/databasefor0test.sql`.
- Las variables de conexión se leen desde `.env`:
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

## Verificación realizada

- Se verificó que no quedaran archivos `.jsx` en `frontend-react/src`.
- Se verificó que no quedaran rutas antiguas como `/cart/sync`, `/orders`, `/auth/register/natural` o `localhost:3000/api` en el frontend compilado.
- Se verificó sintaxis del backend con `node --check src/app.js`.
- Se compiló el frontend correctamente con `react-scripts build`.

## Cómo correrlo

1. Importa la base de datos:

```bash
mysql -u root -p tuherramientaonline < DB/databasefor0test.sql
```

2. Revisa `.env` y ajusta credenciales si hace falta.

3. Instala dependencias:

```bash
npm install
```

4. Arranca el backend y frontend integrado:

```bash
npm start
```

5. Abre:

```txt
http://localhost:3000
```

## Nota importante

No incluí `node_modules` en el ZIP final para mantenerlo liviano. Debes ejecutar `npm install` antes de iniciar el proyecto.
