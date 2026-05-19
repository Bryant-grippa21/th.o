# Categorizacion 1 - Resumen del proceso

Este directorio guarda los scripts usados para sembrar la taxonomia base de categorias, subcategorias y lineas a partir del archivo Excel maestro.

## Objetivo

La idea fue cargar primero la estructura de catalogacion para que luego los productos puedan asociarse correctamente a una linea.

En este proyecto la carga de lineas se hace para la empresa administradora con `id_company = 1`.

## Fuente de datos

El insumo principal fue el archivo:

- `DB/productos/Master_THO_Global_Expandido_Completo (2).xlsx`

Ese Excel no traia precios, stock ni una estructura completa de producto.
Lo que si traia era una taxonomia de 3 niveles, sin encabezados:

1. Columna 1: categoria
2. Columna 2: subcategoria
3. Columna 3: linea

Se detectaron alrededor de 3300 filas en una sola hoja.

## Orden correcto de ejecucion

Los archivos deben ejecutarse en este orden:

1. `category.sql`
2. `subcategory.sql`
3. `line.sql`
4. `catalog_cleanup.sql`

El motivo es que:

- `subcategory.sql` depende de que la categoria ya exista.
- `line.sql` depende de que ya existan la categoria y la subcategoria.

## Regla de ownership

Las lineas ya no pertenecen a una empresa.

Ahora funcionan como catalogo maestro global y la relacion con la empresa se guarda en `Product.id_company_fk`.

## Logica aplicada en cada archivo

### 1. `category.sql`

Este archivo crea el procedimiento `sp_seed_master_categories()`.

Que hace:

- toma la lista de categorias extraidas del Excel
- normaliza con `LOWER(TRIM(...))`
- colapsa variantes repetidas por mayusculas, minusculas o espacios
- inserta solo las categorias que aun no existen en `Category`

Ejemplo de casos resueltos:

- `Equipos De Taller Y Automotriz` vs `Equipos de taller y automotriz`
- `Madera Y Derivados` vs `Madera y Derivados`

### 2. `subcategory.sql`

Este archivo crea el procedimiento `sp_seed_master_subcategories()`.

Que hace:

- trabaja con pares `categoria + subcategoria`
- busca la categoria real ya insertada en `Category`
- normaliza nombres con `LOWER(TRIM(...))`
- inserta solo las subcategorias faltantes en `Subcategory`
- evita duplicados dentro de la misma categoria

Importante:

- este archivo solo inserta subcategorias
- no inserta lineas

### 3. `line.sql`

Este archivo crea el procedimiento `sp_seed_master_lines()`.

Que hace:

- trabaja con triples `categoria + subcategoria + linea`
- relaciona cada linea con su subcategoria real
- inserta en la tabla `Line`
- evita reinsertar lineas ya existentes dentro de la misma subcategoria

Tambien aplica deduplicacion por la combinacion normalizada de:

- categoria
- subcategoria
- linea

## Problema encontrado durante el proceso

La primera version de `line.sql` uso `JSON_TABLE(...)` para descomprimir un bloque grande de datos embebidos.

Ese enfoque funcionaba a nivel de edicion, pero al ejecutar en MySQL aparecio este tipo de error:

- `#1064` cerca de `JSON_TABLE(...)`

La causa fue compatibilidad de version del motor SQL.
No todos los entornos soportan `JSON_TABLE`, especialmente si se usa una version mas vieja de MySQL o MariaDB.

## Solucion aplicada

Se reescribio `line.sql` para quitar la dependencia de `JSON_TABLE`.

La version final hace esto:

1. mantiene el bloque de datos embebidos en base64
2. lo convierte a texto dentro del procedimiento
3. lo parsea manualmente
4. carga los registros en una tabla temporal
5. desde esa tabla temporal hace el `INSERT INTO Line`

Con eso el script queda mucho mas compatible para ejecucion manual en entornos donde `JSON_TABLE` no existe.

## Resultado final del proceso

Al finalizar, quedaron separados los tres niveles de catalogacion en archivos distintos, con una logica mas facil de mantener:

- `category.sql` para categorias
- `subcategory.sql` para subcategorias
- `line.sql` para lineas

Esto permite:

- ejecutar cada nivel por separado
- detectar errores mas rapido
- rehacer una parte puntual sin tocar toda la carga
- dejar una base limpia para asociar productos a una linea despues

## Limpieza posterior recomendada

Despues de sembrar la taxonomia conviene ejecutar tambien:

- `catalog_cleanup.sql`

Este archivo resuelve dos problemas detectados en la base exportada:

1. categorias duplicadas semanticamente
2. nombres con texto roto por encoding
3. migracion de `brand` desde `Line` hacia `Product`

### Casos contemplados en categorias

- `Accesorios Herramientas Eléctricas` vs `Accesorios para herramientas eléctricas`
- `Hierro Y Acero` vs `Hierros y Perfiles`
- `Pintura Y Acabados` vs `Pinturas y Complementos`

### Que hace `catalog_cleanup.sql`

- mueve subcategorias de la categoria duplicada a la categoria canonica
- fusiona subcategorias repetidas despues del merge
- reasigna lineas a la subcategoria correcta
- elimina categorias sobrantes
- corrige mojibake en `Line.name`
- migra `Line.brand` a `Product.brand` cuando haga falta
- corrige mojibake en `Product.brand`
- corrige mojibake en `Product.description`
- corrige mojibake en `Product.attributes`

### Ejemplos de mojibake corregido

- `Adaptador magnÃ©tico` -> `Adaptador magnético`
- `Adaptador de aspiraciÃ³n para lijadora` -> `Adaptador de aspiración para lijadora`
- `Disco para corte rÃ¡pido` -> `Disco para corte rápido`

### Recomendacion operativa

Ejecutar `catalog_cleanup.sql` sobre una copia de seguridad o sobre una base de pruebas antes de aplicarlo como base definitiva.

## Casos que siguen requiriendo revision manual

No todos los parecidos de nombre deben fusionarse automaticamente.
Hay varios casos en subcategorias que pueden ser duplicado real o pueden representar un matiz comercial distinto.

Ejemplos detectados en el dump:

- `Grifería de cocina` vs `Griferías de cocina`
- `Cables eléctricos` vs `Cables Y Conductores`
- `Protecciones` vs `Protecciones eléctricas`

Por eso `catalog_cleanup.sql` automatiza solo merges de categoria que ya son claramente equivalentes y deja esos casos para validacion manual.

## Recomendaciones para futuras cargas

Si se vuelve a repetir el proceso con un nuevo Excel, conviene seguir estas reglas:

1. validar primero si el archivo trae solo taxonomia o tambien productos completos
2. separar siempre categoria, subcategoria y linea en scripts independientes
3. deduplicar con `LOWER(TRIM(...))`
4. evitar funciones SQL avanzadas si no se conoce la version exacta del servidor
5. probar primero `category.sql`, luego `subcategory.sql` y por ultimo `line.sql`

## Nota final

Estos scripts resuelven la carga de la estructura del catalogo, no la carga de productos, stock, imagenes o precios.
Esos pasos se deben manejar despues, ya con las lineas correctamente sembradas.
