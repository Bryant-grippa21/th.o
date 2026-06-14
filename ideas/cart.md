# Carrito de compra y ventas

## Objetivo

Definir una ruta simple y realista para implementar primero el carrito de compras y luego el modulo de ventas, sin forzar desde el inicio un sistema demasiado abstracto o dificil de mantener.

---

## Problema actual

El sistema ya tiene:

- autenticacion separada para `Customer` y `Company`
- catalogo de productos con variantes
- stock por variante
- credito entre empresas (`Company` detallista y `Company` mayorista)

Lo que falta es decidir como modelar:

- compra normal de un cliente final
- compra de una empresa detallista
- ventas registradas por la empresa que vende
- pagos inmediatos y pagos a credito

---

## Enfoque recomendado por fases

Para reducir complejidad, no conviene intentar resolver todo a la vez.

### Fase 1: carrito solo para Customer

Primero implementar el flujo mas simple:

- `Customer` agrega productos al carrito
- `Customer` actualiza cantidades
- `Customer` elimina items
- `Customer` confirma compra
- la compra genera una orden basica
- se descuenta stock
- se registra pago simple

Ventaja:

- valida inventario
- valida precios congelados al comprar
- valida estructura de ordenes
- permite probar compra real sin meter aun credito B2B

---

### Fase 2: historial de compras del Customer

Una vez que exista la compra basica:

- listar ordenes del cliente
- ver detalle de cada orden
- ver estado de pago
- ver estado de entrega

---

### Fase 3: modulo de ventas para Company

Aqui no se crea otra logica de producto o stock. Lo que se crea es una vista operacional sobre las ordenes ya generadas.

La empresa deberia poder:

- ver pedidos recibidos
- ver productos vendidos
- ver total vendido por periodo
- cambiar estado de pedido
- confirmar despacho o entrega
- revisar pagos asociados a cada orden

En esta etapa, el modulo de ventas no necesita todavia credito complejo. Solo lectura y gestion del flujo comercial.

---

### Fase 4: compra de Company detallista

Cuando el carrito de Customer ya funcione, se adapta el mismo modelo para `Company`.

En ese momento se agrega:

- carrito para empresa compradora
- orden B2B
- pago inmediato o a credito
- validacion de `can_buy`

La razon para hacerlo despues es simple:

- ya existira el flujo base de ordenes
- ya existira el descuento de stock
- ya existira el detalle de items
- solo se agrega otra clase de comprador y otra modalidad de pago

---

## Modelo simple recomendado hoy

Si se quiere evitar complejidad por ahora, la recomendacion realista es esta:

### Opcion inicial

- `Cart` solo para `Customer`
- `Order` comun
- `Order_Item` comun
- `Payment` comun
- `Sales view` para `Company` leyendo `Order`

### Opcion posterior

- extender `Order` para soportar tambien comprador tipo `Company`
- extender `Payment` para soportar `CREDIT`

Esto evita bloquear el proyecto por intentar resolver B2C y B2B completos desde el dia uno.

---

## Flujo operativo sugerido

### Compra Customer

1. Cliente inicia sesion.
2. Agrega variantes al carrito.
3. El backend valida stock y precio actual.
4. Se genera una orden.
5. Se generan sus items.
6. Se descuenta stock.
7. Se registra pago.
8. La empresa vendedora ve esa orden en su modulo de ventas.

### Compra Company detallista

1. Empresa inicia sesion.
2. Agrega variantes al carrito B2B.
3. El backend valida stock, estado de empresa y permisos `can_buy`.
4. Se genera orden B2B.
5. Se registra pago inmediato o uso de linea de credito.
6. Se descuenta stock.
7. La empresa vendedora la ve en ventas.

---

## Estructura funcional sugerida

### Tablas futuras

- `Cart`
- `Cart_Item`
- `Order_Header`
- `Order_Item`
- `Payment`

### Estados utiles

#### Carrito

- `ACTIVE`
- `CHECKED_OUT`
- `ABANDONED`

#### Orden

- `PENDING`
- `CONFIRMED`
- `PAID`
- `CANCELLED`
- `DELIVERED`

#### Pago

- `PENDING`
- `PAID`
- `REJECTED`

---

## Riesgos si se intenta hacer todo junto

- duplicar flujo de compra para `Customer` y `Company`
- duplicar tablas y SP
- enredar el control de stock
- mezclar credito B2B con pago inmediato demasiado temprano
- retrasar pruebas reales del sistema

---

## Recomendacion practica

Orden sugerido de desarrollo:

1. carrito + checkout de `Customer`
2. ordenes + historial del cliente
3. panel de ventas para `Company`
4. adaptacion del flujo para `Company` compradora
5. pagos a credito y conciliacion B2B

---

## Decision temporal recomendada

Para avanzar sin frenar el proyecto:

- implementar primero carrito y checkout para `Customer`
- usar el mismo modulo de ordenes como base del panel de ventas de `Company`
- dejar la compra B2B del detallista para la siguiente iteracion

Con eso se valida primero el flujo mas corto y menos riesgoso.

---

## Manejo de precios USD y visualizacion en bolivares

## Objetivo funcional

Mantener el precio oficial del catalogo en dolares y usar la tasa diaria para mostrar y registrar el equivalente en bolivares al momento de la compra.

Esto permite:

- mantener el catalogo estable en USD
- evitar recalcular precios base en cada producto todos los dias
- mostrar al usuario el equivalente en VES en carrito y checkout
- guardar evidencia de la tasa usada cuando se concreto la compra

---

## Regla recomendada

- `Product_Variant.price` sigue siendo el precio oficial en USD
- el frontend muestra `price_usd` y `price_ves`
- el carrito calcula subtotales en USD y en VES
- al confirmar la compra se guarda una foto de la tasa usada
- la orden no depende de la tasa futura, sino de la tasa congelada al momento del checkout

---

## Fuente de tasa

### Lo que no conviene

No conviene depender de Google como fuente directa del sistema.

Motivos:

- Google no ofrece una API oficial simple para este caso
- extraer datos desde la web implica scraping fragil
- el HTML puede cambiar sin aviso
- puede haber problemas de disponibilidad o bloqueo
- es mala base para auditoria financiera

### Lo recomendable

Usar una fuente mas controlable:

- API oficial si existe una util para tu operacion
- proveedor cambiario confiable
- servicio propio que consuma una fuente externa y la normalice
- incluso carga manual admin como respaldo

Google puede servir como referencia visual, pero no como dependencia principal del backend.

---

## Frecuencia de actualizacion

Si por operacion quieres manejar una tasa diaria, la regla puede ser:

- actualizar la tasa una vez al dia a las `12:00 AM` hora Venezuela
- guardar esa tasa como la tasa oficial interna del dia
- usar esa tasa durante todo el dia para carrito y checkout

Ventaja:

- comportamiento estable
- menos confusion para el usuario
- mejor trazabilidad contable
- menos riesgo de diferencias entre carrito y pago

Si luego quieres mas precision, el sistema puede evolucionar a varias actualizaciones por dia.

---

## Tabla recomendada para tasa

Tabla sugerida:

- `Exchange_Rate`

Campos recomendados:

- `id_exchange_rate`
- `base_currency` = `USD`
- `target_currency` = `VES`
- `rate_value`
- `source_name`
- `source_reference`
- `effective_date`
- `fetched_at`
- `is_active`

Ejemplo conceptual:

```text
id | base | target | rate_value | source_name | effective_date | fetched_at           | is_active
1  | USD  | VES    | 488.94     | internal-daily-rate | 2026-05-04 | 2026-05-04 00:00:05 | 1
2  | USD  | VES    | 492.10     | internal-daily-rate | 2026-05-05 | 2026-05-05 00:00:04 | 1
```

---

## Datos que debe guardar la orden

Cuando una compra se confirme, la orden debe guardar no solo el total en USD, sino tambien la tasa usada y el total equivalente en VES.

Campos recomendados en `Order_Header`:

- `subtotal_usd`
- `cashback_usd`
- `exchange_rate_used`
- `exchange_rate_date`
- `subtotal_ves`
- `cashback_ves`
- `total_ves`

Con eso se puede reconstruir exactamente la compra incluso si la tasa cambia al dia siguiente.

---

## Ejemplo practico

Caso base:

- total compra = `20.00 USD`
- cashback = `4.50 USD`

### Dia 1

- tasa = `450 VES`
- total = `9000 VES`
- cashback = `2025 VES`

### Dia 2

- tasa = `750 VES`
- total = `15000 VES`
- cashback = `3375 VES`

### Dia 3

- tasa = `550 VES`
- total = `11000 VES`
- cashback = `2475 VES`

El backend no cambia el precio del producto en USD. Lo que cambia es el equivalente registrado en la compra.

---

## Vista esperada en carrito y checkout

Cada item puede mostrar:

- `Precio USD: 5.00`
- `Precio VES: 2444.70`

Y el resumen:

- `Subtotal USD`
- `Subtotal VES`
- `Tasa aplicada del dia`
- `Fecha/hora de tasa`

Esto mejora transparencia para el usuario y para soporte.

---

## Implementacion tecnica sugerida

### Backend

- job diario programado a medianoche hora Venezuela
- consulta de fuente externa
- validacion de respuesta
- insercion en `Exchange_Rate`
- activacion de nueva tasa del dia

### Frontend

- consulta precio en USD desde catalogo
- consulta tasa vigente desde backend
- calcula equivalente VES o recibe ambos ya calculados por API

### Checkout

- toma la tasa vigente del backend
- congela la tasa en la orden
- guarda valores USD y VES

---

## Recomendacion practica actual

La ruta mas sana para esta funcionalidad es:

1. mantener todos los productos en USD en base de datos
2. crear tabla historica de tasas `USD -> VES`
3. correr actualizacion diaria de tasa a las `12:00 AM` hora Venezuela
4. mostrar precios en USD y VES en carrito y checkout
5. guardar en la compra la tasa exacta usada ese dia

Con eso ya tienes una base fuerte para compras, cashback y futura integracion de pagos.
