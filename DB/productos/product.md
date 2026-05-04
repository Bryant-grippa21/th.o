# Modulo de Productos e Importacion Masiva

## Objetivo

Definir una estrategia realista para cargar productos al sistema por primera vez mediante Excel, con una fase de categorizacion semi-automatica y validacion administrativa antes de insertar en las tablas finales del catalogo.

La idea no es insertar productos directamente desde el Excel a `Product`, `Product_Variant`, `Stock` y `Product_Image`, sino pasar primero por una capa de revision para evitar datos mal clasificados, duplicados o incompletos.

---

## Situacion actual del modelo

La base de datos ya tiene una estructura final suficientemente buena para el catalogo:

- `Category`
- `Subcategory`
- `Product`
- `Product_Variant`
- `Stock`
- `Stock_History`
- `Product_Image`

Tambien existen procedimientos almacenados utiles para:

- crear categorias y subcategorias manualmente
- crear productos completos
- crear productos automáticos
- agregar variantes
- actualizar stock
- activar o desactivar productos y variantes

Esto sirve bien para la operacion final del catalogo, pero todavia falta una capa de ingesta inicial y clasificacion previa.

---

## Problema de negocio

Se requiere un proceso inicial para poblar el sistema con productos desde un Excel maestro.

Flujo deseado:

1. Cargar un Excel ya estructurado.
2. Analizar sus filas en el backend.
3. Sugerir categoria y subcategoria en base a reglas del sistema.
4. Guardar esos datos en una tabla staging o temporal persistente.
5. Permitir que un administrador revise, corrija o apruebe.
6. Insertar al catalogo final solo los productos validados.

---

## Viabilidad tecnica

Si, es totalmente factible.

No es un problema para resolver con SP como logica principal. Los SP actuales son utiles para persistencia final y operaciones del catalogo, pero la clasificacion semi-automatica desde Excel debe vivir en backend, porque requiere:

- normalizacion de texto
- reglas flexibles
- comparacion por palabras clave
- scoring
- manejo de ambiguedades
- revision manual
- trazabilidad del proceso de importacion

Esto se maneja mejor en `Node.js` o, en una fase posterior, con apoyo de `Python` si el procesamiento se vuelve muy pesado.

---

## Recomendacion de stack

### Opcion recomendada inicial

Usar `Node.js` para la primera version.

Ventajas:

- mismo stack del backend actual
- integracion directa con la API ya existente
- menos complejidad operativa
- suficiente para reglas, parsing de Excel y guardado en staging

### Cuándo usar Python tambien

Python puede entrar despues como proceso auxiliar si se necesita:

- limpieza masiva de texto
- fuzzy matching
- clasificacion por similitud
- procesamiento pesado de Excel
- tareas batch fuera del request HTTP

No hay problema tecnico en usar mas de un lenguaje, siempre que la responsabilidad quede clara:

- `Node.js` como backend principal y APIs
- `Python` como auxiliar de procesamiento si hace falta

---

## Complejidad estimada

### Version 1

Complejidad media.

Incluye:

- parser del Excel
- normalizacion de strings
- motor de reglas por palabras clave
- tabla staging
- revision de admin
- insercion final al catalogo

Esto es totalmente abordable.

### Version 2

Complejidad media-alta.

Incluye:

- manejo de miles de filas
- deduplicacion
- validacion avanzada
- mejores sugerencias por score
- relacion automatica con imagenes
- reglas mantenibles en DB

### Version 3

Complejidad alta.

Incluye:

- IA o embeddings
- fuzzy matching avanzado
- aprendizaje de correcciones del admin
- mejora automatica del clasificador

La recomendacion es arrancar por reglas, no por IA.

---

## Analisis del Excel actual

Se reviso el archivo Excel maestro y se encontro:

- 1 hoja principal
- aproximadamente 3300 filas utiles
- estructura de 3 niveles explicitos:
	- categoria
	- subcategoria
	- producto

Ejemplo real del archivo:

```text
Herramientas Manuales
└── Albañilería/Alicatado
		├── Cortador manual de cerámica
		└── Tenaza de alicatador

Herramientas Manuales
└── Albañilería/Herramientas varias
		├── Nivel de manguera de agua
		└── Picola para cemento
```

Tambien se detectaron problemas reales de normalizacion en el arbol:

- `Electricidad` y `Electricidad `
- `Gas` y `Gas `
- `Soldadura` y `Soldadura `
- `Madera y Derivados` y `Madera Y Derivados `

Conclusion importante:

El Excel actual sirve como base real del arbol, pero no debe usarse tal cual como fuente definitiva sin una fase de limpieza y consolidacion.

---

## Representacion grafica del flujo recomendado

```text
Excel maestro
	 ↓
Parser de carga
	 ↓
Tabla staging / temporal persistente
	 ↓
Motor de clasificacion
	 ├─ Coincidencia alta → categoria/subcategoria sugerida
	 ├─ Coincidencia media → pendiente de revision
	 └─ Coincidencia baja → Otros / Otros
	 ↓
Panel de validacion del administrador
	 ↓
Insercion final en:
Category / Subcategory / Product / Product_Variant / Stock / Product_Image
```

---

## Arquitectura recomendada

### Fase 1: Ingesta

Responsabilidades:

- cargar el Excel
- validar columnas esperadas
- limpiar texto
- guardar filas crudas en staging

### Fase 2: Clasificacion

Responsabilidades:

- evaluar nombre del producto
- usar reglas o diccionario
- sugerir categoria y subcategoria
- asignar score de confianza
- marcar pendientes de revision

### Fase 3: Revision admin

Responsabilidades:

- mostrar sugerencias
- corregir clasificaciones
- aprobar o rechazar filas
- marcar duplicados

### Fase 4: Insercion final

Responsabilidades:

- insertar en tablas definitivas
- usar SP finales cuando convenga
- guardar stock e imagenes
- registrar errores por fila si fallan

---

## Tablas recomendadas para staging

No se recomienda usar tablas temporales de sesion SQL. Es mejor usar tablas persistentes de staging para trazabilidad.

### `Import_Batch`

Campos sugeridos:

- `id_batch`
- `source_file`
- `uploaded_by`
- `status`
- `created_at`

### `Import_Product_Staging`

Campos sugeridos:

- `id_staging`
- `id_batch_fk`
- `raw_name`
- `raw_brand`
- `raw_description`
- `raw_sku`
- `raw_price`
- `raw_cost`
- `raw_images`
- `raw_attributes`
- `suggested_category_id`
- `suggested_subcategory_id`
- `classification_method`
- `classification_score`
- `review_status`
- `review_notes`
- `final_category_id`
- `final_subcategory_id`
- `created_at`

### `Category_Keyword_Rule`

Campos sugeridos:

- `id_rule`
- `id_category_fk`
- `id_subcategory_fk`
- `keyword`
- `weight`
- `is_active`

---

## Motor de clasificacion semi-automatica

### Enfoque recomendado para V1

Usar reglas por palabras clave y normalizacion de texto.

Ejemplo conceptual:

```js
{
	"herramientas manuales": {
		"herramientas de pintura": [
			"brocha",
			"brochas",
			"rodillo",
			"espatula"
		],
		"perforacion": [
			"broca",
			"brocas"
		]
	},
	"otros": {
		"otros": [
			"tetera",
			"plato"
		]
	}
}
```

### Recomendacion de evolucion

No dejar el diccionario permanentemente quemado en un `.js`.

Fase inicial aceptable:

- archivo `.js` o `.json` de reglas

Fase correcta a mediano plazo:

- reglas guardadas en DB para que sean editables sin redeploy

### Proceso recomendado de clasificacion

1. convertir texto a minusculas
2. quitar tildes
3. remover ruido como medidas o simbolos si aplica
4. buscar coincidencias por palabra clave
5. sumar puntajes por regla
6. elegir la mejor categoria/subcategoria
7. si el puntaje no alcanza un umbral, mandar a `Otros / Otros` o `Pendiente`

---

## Manejo de categorias desconocidas

Se recomienda mantener una salida controlada:

```text
Otros
└── Otros
```

Esto evita perder filas o bloquear toda la carga cuando entran productos que no encajan en el arbol actual.

Regla sugerida:

- score alto → clasificacion automatica sugerida
- score medio → pendiente de revision
- score bajo → `Otros / Otros`

---

## Carga masiva de imagenes

### Recomendacion

La carga de imagenes debe resolverse por identificador, no por nombre libre del producto.

La mejor opcion es que el Excel tenga una columna de referencia de imagen y que las imagenes lleguen en lote, por ejemplo en ZIP o carpeta.

### Estrategia recomendada

1. el admin sube el Excel
2. el admin sube un ZIP de imagenes
3. el sistema procesa las imagenes
4. el backend intenta relacionarlas por:
	 - SKU
	 - codigo importado
	 - nombre de archivo
5. guarda en staging si:
	 - la imagen fue encontrada
	 - falta imagen
	 - hay multiples coincidencias
6. el admin valida antes de insertar al catalogo final

### Regla practica importante

Usar un nombre de imagen alineado con el SKU o codigo del producto.

Ejemplo:

```text
SKU = BROCHA-8MM-001
Imagen principal = BROCHA-8MM-001.jpg
```

Esto hace el matching muchisimo mas confiable.

---

## Excel recomendado para la primera carga masiva

### Objetivo del Excel inicial

El Excel inicial no debe pedir categoria ni subcategoria al usuario de carga.

Debe enfocarse solo en:

- producto
- detalles
- precios
- marca
- empresa dueña
- stock
- imagenes

La categorizacion la hara el backend en una fase posterior del flujo.

### Columnas recomendadas

#### Identificacion de carga

- `row_id`
- `company_id`
- `company_name`
- `source_code`

#### Producto base

- `product_name`
- `brand`
- `product_description`

#### Variante

- `sku`
- `variant_description`
- `attributes_json`

#### Precios

- `price`

#### Inventario

- `stock_quantity`
- `min_stock`

#### Imagenes

- `main_image`
- `extra_images`

#### Observaciones

- `notes`

### Plantilla propuesta

```text
row_id | company_id | company_name | source_code | product_name | brand | product_description | sku | variant_description | attributes_json | price | stock_quantity | min_stock | main_image | extra_images | notes
```

### Ejemplo de fila recomendada

```text
1 | 2 | Herramax Soluciones Industriales C.A. | THO-0001 | Brocha profesional 8 mm | Pretul | Brocha para pintura de acabado fino | BROCHA-8MM-001 | Cerdas suaves 8 mm | {"medida":"8mm","tipo":"acabado"} | 4.50 | 40 | 5 | BROCHA-8MM-001.jpg | BROCHA-8MM-001-2.jpg,BROCHA-8MM-001-3.jpg | Producto importado desde lote inicial
```

---

## Reglas para diseñar bien el Excel

### Reglas importantes

1. cada fila debe representar una variante vendible
2. el SKU debe ser unico
3. las imagenes deben apuntar a nombres de archivo, no a descripciones libres
4. `attributes_json` puede quedar vacio en la primera version si todavia no se estructura
5. la categoria y subcategoria no deben venir en este Excel inicial si el objetivo es clasificacion semi-automatica

### Lo que no conviene hacer en el Excel inicial

- no meter formulas complejas
- no mezclar varias variantes en una sola fila
- no depender de nombres de imagen ambiguos
- no usar nombres de producto como unico identificador

---

## Flujo sugerido para la primera version

### Paso 1

Subir Excel de productos.

### Paso 2

Subir paquete de imagenes.

### Paso 3

Guardar filas en staging.

### Paso 4

Ejecutar clasificacion semi-automatica.

### Paso 5

Mostrar resultados al admin:

- categoria sugerida
- subcategoria sugerida
- score
- problemas detectados

### Paso 6

Admin aprueba o corrige.

### Paso 7

Insertar productos finales usando el modelo actual.

---

## Recomendacion tecnica final

La primera version debe construirse asi:

1. Excel simple de productos
2. tabla staging persistente
3. motor de clasificacion por reglas
4. fallback a `Otros / Otros`
5. revision manual del admin
6. insercion final al catalogo

No se recomienda:

- clasificar directo en SP
- insertar directo al catalogo sin revision
- construir una solucion basada en IA desde el primer dia

---

## Proximos pasos recomendados

1. limpiar y consolidar el arbol real del Excel actual
2. diseñar tablas staging en DB
3. crear plantilla oficial del Excel inicial
4. crear parser de Excel en backend
5. crear motor de clasificacion por reglas
6. crear flujo de revision administrativa
7. conectar la insercion final con el modelo actual de productos

