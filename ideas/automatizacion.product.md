# Planificacion de semi automatizacion para ingreso masivo de productos

## Objetivo

Definir una forma semiautomatica de cargar muchos productos al sistema sin depender de inserciones manuales una por una, pero sin asumir una automatizacion total que termine ensuciando el catalogo.

---

## Idea general

La importacion masiva no deberia insertar directamente al catalogo final sin revision.

La mejor estrategia es:

1. recibir archivo fuente
2. normalizar datos
3. clasificar automaticamente lo que sea posible
4. dejar revision humana donde haya duda
5. aprobar e insertar al catalogo real

Este enfoque es semiautomatico porque mezcla reglas del sistema con validacion operativa.

---

## Problemas que debe resolver

- nombres inconsistentes de categorias y subcategorias
- productos duplicados o casi duplicados
- variantes mezcladas dentro del nombre
- marcas mal escritas o vacias
- unidades y medidas con formatos distintos
- imagenes faltantes o mal nombradas
- stock y precios con valores invalidos
- productos que no pertenecen claramente a una subcategoria existente

---

## Flujo propuesto

### Fase 1: archivo de entrada

Se recibe un archivo Excel o CSV con columnas como:

- `source_code`
- `product_name`
- `brand`
- `description`
- `category_raw`
- `subcategory_raw`
- `variant_raw`
- `attributes_raw`
- `price`
- `stock_quantity`
- `main_image`

---

### Fase 2: staging

Los datos no van directo a `Product` ni a `Product_Variant`.

Se guardan en una tabla o conjunto de tablas temporales de staging, por ejemplo:

- `Import_Batch`
- `Import_Product_Row`
- `Import_Row_Image`
- `Import_Row_Validation`

Cada fila debe conservar:

- valor original
- valor normalizado
- estado de validacion
- observaciones
- decision final

---

### Fase 3: normalizacion automatica

Aqui se aplican reglas simples pero utiles:

- quitar espacios dobles
- unificar mayusculas y minusculas
- limpiar caracteres raros
- separar marca del nombre cuando sea posible
- detectar medidas comunes como `8mm`, `10m`, `1/2`, `2in`
- convertir atributos a una estructura JSON basica

Ejemplo:

```text
"BROCHA PROF. 2 Pulg GenTools"
```

puede terminar como:

```text
product_name = "Brocha profesional"
brand = "GenTools"
attributes = {"medida":"2 pulgadas"}
```

---

### Fase 4: clasificacion semiautomatica

Se intenta mapear la fila a categoria y subcategoria existente usando:

- coincidencia exacta
- diccionario de sinonimos
- reglas por palabras clave
- historial de clasificaciones previas

Ejemplo:

- si contiene `brocha`, sugerir subcategoria `Brochas`
- si contiene `alicate`, sugerir subcategoria `Alicates`
- si contiene `extension`, sugerir subcategoria `Extensiones`

Si la confianza es alta, se marca como sugerencia automatica.
Si la confianza es baja, queda pendiente de revision.

---

### Fase 5: revision humana

Un admin o una empresa revisa solo lo dudoso:

- categoria sugerida
- subcategoria sugerida
- marca
- atributos extraidos
- productos duplicados
- imagen principal

La automatizacion buena no elimina a la persona del proceso. Solo le reduce el trabajo repetitivo.

---

### Fase 6: aprobacion e insercion final

Cuando la fila ya esta validada:

- se crea o reutiliza categoria
- se crea o reutiliza subcategoria
- se crea producto
- se crea variante
- se inserta stock
- se vinculan imagenes

Esto puede ejecutarse por lote aprobado o por filas individuales aprobadas.

---

## Componentes recomendados

### Base de datos

Se recomienda agregar tablas nuevas para el proceso:

- `Import_Batch`
- `Import_Product_Row`
- `Import_Product_Row_Image`
- `Import_Product_Row_Log`

### Backend

Se recomienda crear un modulo propio, no mezclarlo con el modulo manual:

- `import.products.controller.js`
- `import.products.service.js`
- `import.products.routes.js`

### Almacenamiento de archivos

- carpeta para archivos subidos
- carpeta temporal para imagenes detectadas

---

## Reglas utiles para la semi automatizacion

### Reglas de categoria

- palabras clave por categoria
- palabras clave por subcategoria
- sinonimos conocidos

### Reglas de duplicado

- mismo `source_code`
- mismo `sku` externo
- mismo nombre normalizado + misma marca
- mismo nombre + mismo atributo principal

### Reglas de confianza

- alta: se autocompleta sugerencia
- media: se autocompleta pero requiere confirmacion
- baja: queda pendiente

---

## Nivel de automatizacion recomendable

Por ahora, lo razonable no es una IA que haga todo sola.

Lo recomendable es:

- reglas deterministicas primero
- catalogo de sinonimos editable
- historial de decisiones anteriores reutilizable
- panel de aprobacion humana

Eso ya da mucho valor sin meter complejidad innecesaria.

---

## Fases sugeridas de implementacion

### Fase 1

- definir formato base del Excel
- crear tablas de staging
- subir archivo
- guardar filas crudas

### Fase 2

- normalizar columnas
- detectar duplicados basicos
- sugerir categoria y subcategoria

### Fase 3

- panel de revision manual
- aprobacion por fila o por lote
- insercion al catalogo real

### Fase 4

- aprendizaje asistido por reglas guardadas
- reaprovechar decisiones previas
- mejorar precision de sugerencias

---

## Riesgos si se automatiza demasiado pronto

- contaminar el catalogo real
- crear categorias repetidas
- crear subcategorias mal asignadas
- generar variantes incorrectas
- duplicar productos existentes
- perder trazabilidad sobre errores de importacion

---

## Recomendacion practica actual

Como prioridad inmediata del proyecto, lo mejor es:

1. mantener el ingreso manual de productos para validar compras y ventas
2. dejar definida la estructura de staging para importacion futura
3. implementar luego la semi automatizacion por lotes

Eso permite avanzar en negocio real sin cerrar la puerta a la carga masiva.

---

## Resultado esperado de esta estrategia

Se busca llegar a un punto donde:

- el archivo se sube una sola vez
- el sistema sugiere clasificaciones
- el operador solo corrige excepciones
- el catalogo final queda consistente
- el proceso es repetible para futuras cargas
