# Integración backend

La app está preparada como frontend React/Create React App.

## Configuración

Copia `.env.example` a `.env` y ajusta la URL del backend:

```bash
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

Reinicia `npm start` después de cambiar variables de entorno.

## Contrato mínimo esperado

### Autenticación

- `POST /auth/login`
- `POST /auth/register/natural`
- `POST /auth/register/juridica`
- `POST /auth/google`
- `POST /auth/google/register`
- `GET /auth/me`
- `POST /auth/logout`

Respuesta sugerida para login/registro:

```json
{
  "token": "jwt",
  "user": {
    "name": "Nombre",
    "email": "correo@ejemplo.com",
    "sessionType": "natural"
  }
}
```

`sessionType` soportados actualmente: `natural`, `juridico_detallista`, `juridico_mayorista`, `juridico_pendiente`, `guest`.

### Productos, carrito y órdenes

- `GET /products`
- `GET /products/:id`
- `PUT /cart/sync`
- `POST /orders`

`cartApi.checkout(payload)` espera recibir el payload final de checkout y devolver la orden creada.

## Headers y sesión

`apiClient.js` agrega automáticamente:

- `Content-Type: application/json` salvo cuando el body es `FormData`.
- `Authorization: Bearer <authToken>` si existe `authToken` en `localStorage`.
- `credentials: include` para permitir cookies de sesión si el backend las usa.
