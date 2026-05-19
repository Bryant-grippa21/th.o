# Insercion Inicial por Empresa y Actualizacion Masiva de Productos

## Objetivo de este documento

Definir un acercamiento practico para resolver tres necesidades del sistema de productos:

1. insercion inicial de productos para una empresa especifica
2. control global para evitar choques de SKU entre empresas
3. actualizacion masiva posterior de stock, precios y datos de productos ya existentes sin romper el sistema

Este documento complementa el analisis general de `product.md` y se centra en la operacion real del backend.

---

## Contexto de negocio

### Caso 1: insercion inicial

Escenario:

Una empresa especifica entrega un Excel con su catalogo. El administrador del sistema carga ese archivo y realiza la primera insercion de productos de esa empresa en la plataforma.

Eso implica que:

- la carga pertenece a una sola empresa por lote
- el admin actua como operador de importacion
- la empresa todavia no tiene necesariamente sus productos cargados en el sistema
- el objetivo es construir su catalogo inicial dentro del sistema

### Caso 2: actualizacion masiva posterior

Escenario:

La empresa ya tiene productos cargados. Luego envia un nuevo Excel donde puede cambiar:

- stock disponible
- precio
- costo
- descripcion
- imagenes

La logica debe saber distinguir entre:

- crear productos nuevos
- actualizar productos existentes
- marcar filas que requieren revision manual

---

## Enfoque general recomendado

La carga no debe ir directamente a las tablas finales.

Debe pasar por un flujo controlado:

```text
Excel de empresa X
	↓
Validacion del archivo
	↓
Tabla de staging del lote
	↓
Analisis del producto
	├─ clasificacion sugerida
	├─ generacion o mapeo de SKU global
	├─ validacion de imagenes
	└─ deteccion de coincidencia con productos existentes
	↓
Revision del admin
	↓
Accion por fila
	├─ crear producto nuevo
	├─ actualizar producto existente
	├─ omitir fila
	└─ corregir manualmente
	↓
Insercion o actualizacion final
```

---

## 1. Insercion inicial por empresa

### Regla principal

Cada lote de importacion debe estar asociado a una sola empresa.

Ejemplo conceptual:

```text
Import_Batch
└── id_batch = 15
└── company_id = 8
└── source_file = empresa_x_catalogo_abril.xlsx
└── mode = INITIAL_IMPORT
```

Eso evita mezclar productos de varias empresas en un mismo proceso de carga.

### Lo que debe pasar en insercion inicial

Por cada fila del Excel:

1. validar que la fila tenga datos minimos
2. normalizar nombre, marca y descripcion
3. intentar clasificar categoria y subcategoria
4. generar o reservar un SKU global del sistema
5. procesar referencia de imagenes
6. guardar todo en staging
7. esperar aprobacion del admin

### Ventaja de hacerlo asi

Permite que el admin corrija antes de insertar al catalogo final y evita errores masivos en tablas productivas.

---

## 2. Problema de los SKU

### Requisito

No debe haber choque de SKU entre productos del sistema, aunque la empresa tenga su propio SKU interno.

Eso significa que hay que separar dos conceptos:

1. `external_sku` o SKU de la empresa
2. `global_sku` o SKU del sistema

### Recomendacion fuerte

No reutilizar el SKU de la empresa como SKU principal del sistema.

Usar este enfoque:

```text
Empresa X
└── SKU interno: BROCHA-8MM

Sistema
└── SKU global: THO-000001
```

Y guardar ambos:

- `external_sku`: el valor que vino en el Excel de la empresa
- `sku`: el SKU unico del sistema usado en `Product`

### Beneficios

- no colisionan SKUs de distintas empresas
- puedes seguir mostrando o almacenando el SKU interno original
- te queda trazabilidad entre dato fuente y dato del sistema

### Estrategias posibles de SKU global

#### Opcion recomendada

SKU secuencial del sistema:

```text
THO-000001
THO-000002
THO-000003
```

#### Opcion alternativa

SKU con prefijo por empresa:

```text
EMP008-000001
EMP008-000002
```

Mi recomendacion:

Si el SKU es publico, mejor una convención clara y estable, por ejemplo:

```text
THO-000001
```

Y guardar el SKU de la empresa por separado.

### Cambios sugeridos al modelo

En `Product` o en staging deberia existir tambien:

- `external_sku`

Si no quieres tocar `Product` todavia, al menos debe existir en la tabla staging.

---

## 3. Renombrado de imagenes

### Requisito

Las imagenes que entregue la empresa deben renombrarse con una convención controlada.

Ejemplo dado:

```text
img-1-skunumber
ejemplo: 001101
```

### Recomendacion concreta

Usar nombre sistematico basado en el SKU global, no en el SKU de la empresa.

Ejemplo:

```text
THO-000101
```

Imagenes:

```text
img-1-THO-000101.jpg
img-2-THO-000101.jpg
img-3-THO-000101.jpg
```

O si prefieres sin prefijo THO:

```text
img-1-000101.jpg
img-2-000101.jpg
```

### Regla recomendada

La secuencia de imagenes debe indicar orden visual:

- `img-1-<sku>` = imagen principal
- `img-2-<sku>` = imagen secundaria
- `img-3-<sku>` = imagen adicional

### Flujo de imagenes sugerido

```text
ZIP o carpeta de imagenes
	↓
parser detecta archivos
	↓
relaciona imagen con fila staging
	↓
genera SKU global
	↓
renombra imagen segun estandar del sistema
	↓
guarda en carpeta definitiva
	↓
crea registros en Product_Image
```

### Recomendacion de carpeta final

```text
public/uploads/products/<company_id>/<sku>/
```

Ejemplo:

```text
public/uploads/products/8/THO-000101/img-1-THO-000101.jpg
public/uploads/products/8/THO-000101/img-2-THO-000101.jpg
```

Esto te da:

- aislamiento por empresa
- agrupacion por SKU
- orden natural de imagenes

---

## 4. Diferencia entre insercion inicial y actualizacion masiva

Esta distincion es obligatoria.

### Insercion inicial

Modo:

```text
INITIAL_IMPORT
```

Supuesto principal:

- gran parte de los productos aun no existen en el sistema para esa empresa

Acciones esperadas:

- crear productos nuevos
- crear variantes nuevas
- crear stock inicial
- asociar imagenes

### Actualizacion masiva

Modo:

```text
MASS_UPDATE
```

Supuesto principal:

- la empresa ya tiene catalogo cargado
- el nuevo archivo sirve para sincronizar o corregir datos

Acciones esperadas:

- actualizar stock
- actualizar precio
- actualizar costo
- actualizar textos permitidos
- actualizar imagen principal o agregar nuevas
- detectar filas nuevas no existentes

---

## 5. Como detectar si una fila crea o actualiza

### Regla recomendada

Nunca depender solo del nombre del producto.

Prioridad de identificacion:

1. `external_sku`
2. `source_code`
3. relacion previa en staging o tabla de mapeo
4. heuristica por nombre + marca + atributos

### Tabla de mapeo sugerida

Agregar una tabla tipo:

### `Company_Product_Map`

Campos sugeridos:

- `id_map`
- `company_id`
- `external_sku`
- `source_code`
- `id_product_fk`
- `id_product_fk`
- `created_at`

### Utilidad

Con esa tabla, cuando llegue una nueva actualizacion masiva:

- buscas por `company_id + external_sku`
- si existe → actualizas
- si no existe → propones como producto nuevo

Esto resuelve el problema real de sincronizacion por empresa.

---

## 6. Actualizacion masiva de stock

### Requisito dado

Si el sistema tiene 20 y el nuevo Excel indica 15, el stock debe quedar exactamente en 15.

Eso significa que para actualizaciones masivas no debes usar solo “sumar” o “restar”, sino un modo de sincronizacion absoluta.

### Recomendacion

Tener dos modos de stock en backend:

1. `incremental`
2. `absolute_sync`

Para la carga masiva usar:

```text
absolute_sync
```

### Ejemplo

Sistema:

```text
SKU THO-000101
stock actual = 20
```

Excel nuevo:

```text
stock = 15
```

Resultado esperado:

```text
stock final = 15
```

### Recomendacion tecnica

Crear una logica de actualizacion de stock tipo:

```text
new_quantity = valor_del_excel
quantity_change = new_quantity - current_quantity
```

Y registrar eso en `Stock_History` como movimiento tipo:

```text
ADJUSTMENT
```

No como compra o venta.

---

## 7. Actualizacion masiva de precio

### Requisito dado

Si cambia el precio en USD para uno o varios productos, el sistema debe actualizarlo sin romper nada.

### Recomendacion

La actualizacion masiva debe permitir modificar como minimo:

- `price`
- `description`
- `attributes_json`
- `stock_quantity`

### Regla de seguridad recomendada

No actualizar campos estructurales delicados sin revision manual, por ejemplo:

- categoria final
- subcategoria final
- empresa dueña
- SKU global del sistema

Esos no deberian alterarse mediante una simple actualizacion masiva salvo proceso administrativo especial.

---

## 8. Diseño recomendado del Excel para insercion inicial

### Objetivo

Este Excel debe enfocarse en datos de producto y no en categoria/subcategoria, porque esa parte la resolvera el sistema.

### Plantilla recomendada

```text
row_id | company_id | company_name | source_code | external_sku | product_name | brand | product_description | variant_description | attributes_json | price_usd | stock_quantity | min_stock | main_image | extra_images | notes
```

### Descripcion de columnas

- `row_id`: numero de fila logica de importacion
- `company_id`: empresa dueña del lote
- `company_name`: redundancia visual para control manual
- `source_code`: codigo de origen del archivo o ERP de la empresa
- `external_sku`: SKU original de la empresa
- `product_name`: nombre base del producto
- `brand`: marca
- `product_description`: descripcion general
- `variant_description`: descripcion especifica de la variante si aplica
- `attributes_json`: atributos estructurados si ya existen
- `price_usd`: precio de venta en dolares
- `stock_quantity`: cantidad disponible
- `min_stock`: stock minimo
- `main_image`: nombre de la imagen principal
- `extra_images`: lista separada por comas
- `notes`: observaciones

### Ejemplo de fila

```text
1 | 8 | Empresa X | ERP-0001 | BROCHA-8MM | Brocha profesional 8 mm | GenTools | Brocha para acabados finos | Cerdas suaves | {"medida":"8mm","tipo":"acabado"} | 4.50 | 15 | 5 | BROCHA-8MM.jpg | BROCHA-8MM-2.jpg,BROCHA-8MM-3.jpg | Carga inicial abril
```

---

## 9. Diseño recomendado del Excel para actualizacion masiva

### Objetivo

Este Excel no debe intentar redefinir toda la estructura del producto. Debe enfocarse solo en sincronizar datos ya existentes.

### Plantilla recomendada

```text
row_id | company_id | external_sku | source_code | new_price_usd | new_stock_quantity | new_main_image | new_extra_images | notes
```

### Regla principal

Toda fila debe poder mapearse a un producto existente usando:

- `company_id`
- `external_sku`

o en su defecto:

- `source_code`

### Ejemplo

```text
1 | 8 | BROCHA-8MM | ERP-0001 | 4.80 | 2.20 | 15 | BROCHA-8MM.jpg | BROCHA-8MM-2.jpg | Ajuste de stock y precio mayo
```

---

## 10. Propuesta de tablas auxiliares para este proceso

### `Import_Batch`

- `id_batch`
- `company_id`
- `source_file`
- `mode` (`INITIAL_IMPORT`, `MASS_UPDATE`)
- `status`
- `uploaded_by`
- `created_at`

### `Import_Product_Staging`

- `id_staging`
- `id_batch_fk`
- `company_id`
- `source_code`
- `external_sku`
- `raw_name`
- `raw_brand`
- `raw_description`
- `raw_variant_description`
- `raw_attributes`
- `raw_price`
- `raw_cost`
- `raw_stock_quantity`
- `raw_main_image`
- `raw_extra_images`
- `suggested_category_id`
- `suggested_subcategory_id`
- `global_sku_candidate`
- `matched_variant_id`
- `operation_type` (`CREATE`, `UPDATE`, `REVIEW`)
- `classification_score`
- `review_status`
- `review_notes`
- `created_at`

### `Company_Product_Map`

- `id_map`
- `company_id`
- `external_sku`
- `source_code`
- `id_product_fk`
- `id_product_fk`
- `global_sku`
- `created_at`

---

## 11. Diagrama del flujo de insercion inicial

```text
Empresa X entrega Excel + imagenes
	↓
Admin carga lote INITIAL_IMPORT
	↓
Sistema crea batch por empresa
	↓
Parser guarda filas en staging
	↓
Motor sugiere categoria y subcategoria
	↓
Sistema genera SKU global candidato
	↓
Sistema valida y renombra imagenes
	↓
Admin revisa y aprueba
	↓
Insercion final en catalogo
	↓
Se crea mapeo company_id + external_sku → variant_id + global_sku
```

---

## 12. Diagrama del flujo de actualizacion masiva

```text
Empresa X entrega nuevo Excel
	↓
Admin carga lote MASS_UPDATE
	↓
Sistema busca coincidencia por external_sku/source_code
	↓
Si existe
	├─ actualiza precio
	├─ actualiza costo
	├─ sincroniza stock en modo absoluto
	└─ actualiza imagenes si aplica
	↓
Si no existe
	├─ marcar como CREATE o REVIEW
	└─ enviar a validacion del admin
```

---

## 13. Ejemplo visual de decision por fila

```text
Fila del Excel
└── external_sku = BROCHA-8MM

Busqueda en mapeo
├── existe
│   └── operacion = UPDATE
│       ├── stock actual = 20
│       ├── stock excel = 15
│       └── stock final = 15
│
└── no existe
	 └── operacion = CREATE o REVIEW
```

---

## 14. Reglas practicas para no romper el sistema

1. no usar el SKU de la empresa como SKU principal del sistema
2. guardar siempre `external_sku` y `global_sku`
3. procesar una sola empresa por batch
4. para updates, mapear primero y actualizar despues
5. el stock masivo debe ser sincronizacion absoluta, no suma incremental
6. registrar en historial toda actualizacion importante
7. no permitir que una actualizacion masiva cambie silenciosamente categoria o empresa dueña
8. las imagenes deben renombrarse con un formato estable derivado del SKU global

---

## 15. Recomendacion final de implementacion

### Fase recomendada inmediata

1. diseñar tablas staging y mapeo
2. diseñar Excel oficial de insercion inicial
3. diseñar Excel oficial de actualizacion masiva
4. crear parser de Excel
5. crear generador de SKU global
6. crear motor de renombrado y relacion de imagenes
7. crear flujo de aprobacion admin
8. conectar insercion final y actualizacion final al catalogo

### Prioridad tecnica

La pieza mas importante despues del parser no es el clasificador, sino el mapeo:

```text
company_id + external_sku -> global_sku / variant_id
```

Si esa relacion queda bien definida, la actualizacion masiva futura sera mucho mas segura y simple.

---

## 16. Decision actual del proyecto

Aunque todo lo anterior sigue siendo valido como diseño futuro, por ahora este modulo no va a continuar por la ruta de importacion masiva.

### Decision tomada

La importacion inicial por Excel, la actualizacion masiva y el sistema de clasificacion semi-automatica quedan documentados como una fase posterior.

La prioridad inmediata pasa a ser:

1. insercion manual de productos uno por uno
2. validacion del sistema de productos
3. pruebas de compras y ventas
4. desarrollo posterior de carrito de compras
5. desarrollo posterior de paneles de admin, customer y company

### Motivo

El objetivo inmediato no es resolver primero la automatizacion de la carga, sino tener productos reales registrados en el sistema para empezar a probar el flujo comercial.

Eso permite validar antes:

- creacion manual de productos
- precios
- stock
- imagen principal
- variantes si aplica
- impacto de las compras y ventas sobre el stock

---

## 17. Alcance actual del modulo de productos

### En esta etapa si se va a hacer

- insercion manual uno por uno de productos
- uso de categorias y subcategorias ya creadas manualmente
- creacion de producto base
- creacion de variante
- asignacion de precio
- asignacion de costo si aplica
- asignacion de stock inicial
- asignacion de imagen principal
- pruebas funcionales para validar catalogo y stock

### En esta etapa no se va a hacer todavia

- importacion masiva desde Excel
- clasificacion semi-automatica
- parser de archivos Excel
- generacion automatica de SKU global desde lotes masivos
- actualizacion masiva por archivo
- `sp_create_product_auto` como flujo principal operativo

---

## 18. Flujo actual recomendado

```text
Admin crea categorias y subcategorias manualmente
	↓
Admin registra producto manualmente
	↓
Admin crea variante con SKU unico del sistema
	↓
Admin asigna precio, costo y stock inicial
	↓
Admin agrega imagen principal
	↓
Producto queda disponible para pruebas internas
	↓
Se usa el catalogo para probar compras, ventas y movimientos de stock
```

---

## 19. Relacion con los SP actuales

Para esta etapa actual, el sistema puede apoyarse en los procedimientos ya existentes del modulo de productos, especialmente:

- `sp_admin_create_category`
- `sp_admin_create_subcategory`
- `sp_create_product_full`
- `sp_add_variant`
- `sp_update_product`
- `sp_update_variant`
- `sp_update_stock`
- `sp_add_stock`
- `sp_remove_stock`

### Observacion importante

`sp_create_product_auto` no sera el flujo principal por ahora.

Ese procedimiento queda reservado como posible fase futura cuando se retome la automatizacion parcial o total del alta de productos.

---

## 20. Orden recomendado de trabajo desde este punto

### Paso 1

Terminar el flujo de insercion manual de productos uno por uno.

### Paso 2

Probar que el sistema de productos funcione correctamente con:

- categoria
- subcategoria
- producto
- variante
- stock
- precio
- imagen

### Paso 3

Usar esos productos para iniciar pruebas de:

- carrito de compras
- ventas
- descuento de stock
- validaciones de disponibilidad

### Paso 4

Despues pasar a los paneles:

- panel admin
- panel customer
- panel company

### Paso 5

Una vez validado gran parte del flujo comercial, retomar la automatizacion de carga de productos si sigue siendo necesaria.

---

## 21. Requisitos minimos del producto para esta etapa manual

Para poder empezar a probar el sistema comercial, cada producto registrado manualmente deberia tener como minimo:

- nombre del producto
- categoria
- subcategoria
- SKU del sistema
- precio en USD
- stock disponible
- descripcion
- imagen principal opcional, con fallback a imagen por defecto si luego se decide implementar

### Representacion simple

```text
Producto
├── nombre
├── categoria
├── subcategoria
├── variante
│   ├── sku
│   ├── precio
│   ├── costo
│   └── stock
└── imagen principal
```

---

## 22. Ruta futura ya documentada

Cuando se retome la importacion masiva, este mismo documento ya deja resuelto el enfoque general para:

- insercion inicial por empresa
- actualizacion masiva posterior
- renombrado de imagenes
- uso de SKU global y SKU externo
- staging y mapeo por empresa

Por ahora esa parte queda en pausa deliberadamente para priorizar la validacion del flujo real de productos, compras y ventas.

