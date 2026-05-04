# Pruebas Postman - Categorías y Productos

Este archivo documenta las pruebas manuales del módulo actual de productos.

Base URL:

```text
http://localhost:3000
```

Importante:

- Las categorías y subcategorías se crean con token de empresa admin (`id_role = 1`).
- La creación y edición de productos requiere token de empresa.
- La imagen en creación de producto o variante se envía por `form-data`.

---

## 1. Tokens recomendados

Variables sugeridas en Postman:

- `admin_company_token`
- `company_token`
- `category_id`
- `subcategory_id`
- `product_id`
- `variant_id`

---

## 2. Categorías

### 2.1 Listar categorías

```http
GET /api/products/categories
```

### 2.2 Crear categoría

```http
POST /api/products/categories
Authorization: Bearer {{admin_company_token}}
Content-Type: application/json
```

Body:

```json
{
	"name": "Herramientas Manuales"
}
```

Respuesta esperada:

```json
{
	"message": "Categoría creada correctamente",
	"category": {
		"id_category": 1,
		"name": "Herramientas Manuales"
	}
}
```

### 2.3 Crear subcategoría

```http
POST /api/products/subcategories
Authorization: Bearer {{admin_company_token}}
Content-Type: application/json
```

Body:

```json
{
	"name": "Herramientas de pintura",
	"category_id": 1
}
```

### 2.4 Listar subcategorías por categoría

```http
GET /api/products/categories/1/subcategories
```

---

## 3. Producto manual 1 a 1

### 3.1 Crear producto completo sin imagen

```http
POST /api/products
Authorization: Bearer {{company_token}}
Content-Type: application/json
```

Body:

```json
{
	"name": "Brocha profesional 8mm",
	"id_subcategory": 1,
	"brand": "GenTools",
	"sku": "THO-000001",
	"description": "Brocha para acabados finos y pintura base de agua",
	"price": 4.50,
	"attributes": {
		"medida": "8mm",
		"tipo": "acabado"
	},
	"quantity": 15,
	"min_stock": 5
}
```

### 3.2 Crear producto completo con imagen

```http
POST /api/products
Authorization: Bearer {{company_token}}
Content-Type: multipart/form-data
```

Body `form-data`:

- `name` → `Brocha profesional 8mm`
- `id_subcategory` → `1`
- `brand` → `GenTools`
- `sku` → `THO-000001`
- `description` → `Brocha para acabados finos y pintura base de agua`
- `price` → `4.50`
- `attributes` → `{"medida":"8mm","tipo":"acabado"}`
- `quantity` → `15`
- `min_stock` → `5`
- `image` → tipo `File`

### 3.3 Crear variante adicional

```http
POST /api/products/{{product_id}}/variants
Authorization: Bearer {{company_token}}
Content-Type: application/json
```

Body:

```json
{
	"sku": "THO-000002",
	"description": "Brocha profesional 12mm",
	"price": 5.25,
	"attributes": {
		"medida": "12mm",
		"tipo": "acabado"
	},
	"quantity": 10,
	"min_stock": 3
}
```

### 3.4 Actualizar producto

```http
PUT /api/products/{{product_id}}
Authorization: Bearer {{company_token}}
Content-Type: application/json
```

Body:

```json
{
	"name": "Brocha profesional premium 8mm",
	"brand": "GenTools Pro"
}
```

### 3.5 Actualizar variante

```http
PUT /api/products/variants/{{variant_id}}
Authorization: Bearer {{company_token}}
Content-Type: application/json
```

Body:

```json
{
	"price": 4.80,
	"attributes": {
		"medida": "8mm",
		"tipo": "acabado premium"
	}
}
```

### 3.6 Sincronizar stock

Esto reemplaza el stock actual por el valor indicado.

```http
PUT /api/products/variants/{{variant_id}}/stock
Authorization: Bearer {{company_token}}
Content-Type: application/json
```

Body:

```json
{
	"quantity": 15,
	"notes": "Ajuste manual de inventario"
}
```

---

## 4. Casos de validación recomendados

### 4.1 Crear categoría con token no admin

Debe responder `403`.

### 4.2 Crear producto sin campos mínimos

Debe fallar si faltan:

- `name`
- `id_subcategory`
- `sku`
- `price`
- `quantity`

### 4.3 Crear variante con SKU duplicado

Debe fallar con error de `SKU ya existe`.

### 4.4 Sincronizar stock con variantId inválido

Debe responder `400`.

### 4.5 Crear subcategoría con category_id inexistente

Debe fallar con error de categoría no existente.

---

## 5. Orden sugerido de prueba

1. Login empresa admin
2. Crear categoría
3. Crear subcategoría
4. Listar subcategorías
5. Login empresa vendedora
6. Crear producto completo
7. Crear variante adicional
8. Actualizar producto
9. Actualizar variante
10. Sincronizar stock

