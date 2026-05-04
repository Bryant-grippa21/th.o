# Pruebas Postman - Usuarios

Este archivo documenta las pruebas manuales recomendadas para `Customer` y `Company`.

Base URL:

```text
http://localhost:3000
```

---

## 1. Customer

### 1.1 Registro local

```http
POST /api/auth/register
Content-Type: application/json
```

Body:

```json
{
	"name": "Bryant Test",
	"email": "bryant@test.com",
	"password": "Test1234",
	"cell_phone": "04141234567",
	"mail_address": "Calle Test #1"
}
```

Respuesta esperada:

```json
{
	"message": "Usuario registrado correctamente"
}
```

### 1.2 Login local

```http
POST /api/auth/login
Content-Type: application/json
```

Body:

```json
{
	"email": "bryant@test.com",
	"password": "Test1234"
}
```

Guardar el token retornado como variable de entorno en Postman, por ejemplo `customer_token`.

### 1.2.1 Login con Google

```http
POST /api/auth/google
Content-Type: application/json
```

Body:

```json
{
	"credential": "GOOGLE_ID_TOKEN_AQUI"
}
```

Notas:

- `credential` debe ser un Google ID Token válido emitido por Google.
- si el correo no existe en el sistema, se crea como usuario Google
- si el correo ya existe como usuario local, el sistema lo enlaza y pasa a `auth_provider = both`

Respuesta esperada:

```json
{
	"message": "Login con Google exitoso",
	"token": "..."
}
```

### 1.2.2 Caso `both`

Flujo recomendado para probar `both`:

1. Registrar usuario local:

```http
POST /api/auth/register
```

```json
{
	"name": "Bryant Both",
	"email": "both@test.com",
	"password": "Both1234",
	"cell_phone": "04145550000",
	"mail_address": "Dirección Both"
}
```

2. Hacer login con Google usando el mismo correo `both@test.com`.

3. Verificar sesión:

```http
GET /api/auth/me
Authorization: Bearer {{customer_token}}
```

Resultado esperado dentro del payload del token o datos derivados:

- el usuario queda asociado a Google
- el backend permite luego login local también
- el `auth_provider` pasa a `both`

### 1.3 Sesión actual

```http
GET /api/auth/me
Authorization: Bearer {{customer_token}}
```

### 1.4 Obtener perfil

```http
GET /api/auth/profile
Authorization: Bearer {{customer_token}}
```

### 1.5 Actualizar perfil

```http
PUT /api/auth/profile
Authorization: Bearer {{customer_token}}
Content-Type: application/json
```

Body:

```json
{
	"name": "Bryant Actualizado",
	"cell_phone": "04140000000",
	"mail_address": "Nueva dirección 123"
}
```

### 1.6 Actualizar contraseña

```http
PUT /api/auth/profile
Authorization: Bearer {{customer_token}}
Content-Type: application/json
```

Body:

```json
{
	"password": "NuevaClave1234"
}
```

### 1.7 Actualizar imagen de perfil

```http
PUT /api/auth/profile/image
Authorization: Bearer {{customer_token}}
Content-Type: multipart/form-data
```

Body `form-data`:

- `image` → tipo `File`

---

## 2. Company

### 2.1 Registro local de empresa

```http
POST /api/company-auth/register
Content-Type: application/json
```

Body:

```json
{
	"company_name": "FerreTools C.A.",
	"rif": "J-41234567-8",
	"email": "empresa@test.com",
	"password": "Empresa1234",
	"phone": "02125557812",
	"address": "Zona Industrial",
	"id_role": 2
}
```

### 2.2 Login empresa

```http
POST /api/company-auth/login
Content-Type: application/json
```

Body:

```json
{
	"email": "empresa@test.com",
	"password": "Empresa1234"
}
```

Guardar el token como `company_token`.

### 2.3 Sesión actual empresa

```http
GET /api/company-auth/me
Authorization: Bearer {{company_token}}
```

### 2.4 Obtener perfil empresa

```http
GET /api/company-auth/profile
Authorization: Bearer {{company_token}}
```

### 2.5 Actualizar perfil empresa

```http
PUT /api/company-auth/profile
Authorization: Bearer {{company_token}}
Content-Type: application/json
```

Body:

```json
{
	"company_name": "FerreTools C.A. Actualizada",
	"phone": "02120000000",
	"address": "Nueva zona industrial"
}
```

### 2.6 Actualizar contraseña empresa

```http
PUT /api/company-auth/profile
Authorization: Bearer {{company_token}}
Content-Type: application/json
```

Body:

```json
{
	"password": "NuevaClaveEmpresa1234"
}
```

### 2.7 Actualizar imagen empresa

```http
PUT /api/company-auth/profile/image
Authorization: Bearer {{company_token}}
Content-Type: multipart/form-data
```

Body `form-data`:

- `image` → tipo `File`

---

## 3. Casos de validación recomendados

### 3.1 Login con contraseña incorrecta

Ejecutar 3 veces:

```http
POST /api/auth/login
```

```json
{
	"email": "bryant@test.com",
	"password": "incorrecta"
}
```

Resultado esperado:

- intento 1 → `attempts_left: 2`
- intento 2 → `attempts_left: 1`
- intento 3 → usuario bloqueado

### 3.2 Registro con correo duplicado

Repetir el registro con el mismo correo y validar respuesta `400`.

### 3.2.1 Registro local sobre usuario Google

Si primero existe un usuario creado por Google, luego puedes probar registro local con el mismo correo:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
	"name": "Usuario Google Local",
	"email": "googlelocal@test.com",
	"password": "GoogleLocal1234",
	"cell_phone": "04140001111",
	"mail_address": "Dirección mixta"
}
```

Resultado esperado:

- no debería crear un duplicado
- debería enlazar login local al usuario existente
- el usuario queda en `auth_provider = both`

### 3.3 Perfil sin token

Probar `/profile` sin `Authorization` y validar `401` o `403`.

