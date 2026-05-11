# Integración backend

Configura la URL base del backend con una de estas variables:

- Vite: `VITE_API_BASE_URL=http://localhost:3000/api`
- Create React App: `REACT_APP_API_BASE_URL=http://localhost:3000/api`

Endpoints esperados por `apiClient.js`:

- `POST /auth/login`
- `POST /auth/register/natural`
- `POST /auth/register/juridica`
- `PUT /cart/sync`
- `POST /orders`

Formato sugerido para login/registro:

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

`sessionType` soportados: `natural`, `juridico_detallista`, `juridico_mayorista`, `guest`.
