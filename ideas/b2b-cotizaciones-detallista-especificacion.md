# Especificacion Funcional: Cotizaciones B2B para Detallista

## Objetivo

Redisenar el flujo de cotizaciones B2B del detallista para que ya no dependa de conocer el ID de un mayorista.

El nuevo flujo debe permitir que el detallista:

- explore el catalogo de productos
- agregue y quite productos desde un carrito temporal
- agrupe automaticamente los productos por empresa
- envie una solicitud de cotizacion por empresa
- defina si el pago de esa empresa sera unico o por cuotas
- mantenga evidencia y seguimiento de pagos segun el tipo de pago escogido

Ademas, una vez enviada la cotizacion, el detallista queda bloqueado para crear nuevos productos en ese flujo y para pedir nuevas cotizaciones, pero sigue habilitado para:

- aprobar o denegar pagos de clientes asociados a sus productos
- subir evidencias de pago para las cotizaciones ya existentes

---

## Alcance

### Incluido

- carrito temporal B2B del detallista
- agrupacion automatica por empresa proveedora
- comentario por empresa antes del envio
- seleccion de forma de pago por empresa
- cotizacion con vigencia maxima de 30 dias desde su creacion
- historial de cotizaciones ordenado por fecha descencente
- historial agrupado por empresa
- evidencias multiples para pagos a cuotas
- una sola evidencia activa para pago unico
- reapertura de evidencia cuando una sea rechazada

### Excluido por ahora

- integracion con pasarela de pago real
- calculo automatico de cuotas financieras complejas
- conciliacion bancaria externa
- automatizacion completa de cobranza

---

## Idea General Del Flujo

```text
Detallista entra al catalogo
↓
Ve productos aleatorios o destacados
↓
Agrega y quita productos de un carrito temporal
↓
El sistema agrupa el carrito por empresa
↓
El detallista define comentario y tipo de pago por empresa
↓
Envía la solicitud de cotizacion
↓
El mayorista recibe la cotizacion agrupada
↓
El mayorista aprueba, responde o rechaza
↓
El detallista paga fuera del sistema
↓
El detallista sube evidencia de pago
↓
El mayorista revisa y aprueba o rechaza la evidencia
```

---

## Reglas Principales

### 1. El detallista no necesita conocer el ID del mayorista

El detallista no elegira manualmente el ID de la empresa proveedora desde un formulario tecnico.

El sistema tomara la empresa automaticamente a partir de los productos agregados al carrito.

### 2. El carrito es temporal

Antes de enviar la cotizacion, el detallista puede:

- agregar productos
- quitar productos
- cambiar cantidades
- separar compras por empresa

El carrito funciona como area de preparacion, no como cotizacion formal aun.

### 3. La cotizacion se separa por empresa

Si el carrito contiene productos de varias empresas, el sistema debe dividirlo automaticamente en grupos.

Ejemplo:

- Empresa A: 4 productos
- Empresa B: 2 productos

Cada grupo generara su propia solicitud de cotizacion.

### 4. El plazo limite es de 30 dias

Cada cotizacion queda limitada a 30 dias desde el momento en que se crea.

Eso significa:

- la cotizacion nace con fecha de creacion y fecha limite
- despues de 30 dias se considera vencida
- una cotizacion vencida no deberia aceptar nuevas acciones comerciales normales

### 5. El detallista queda bloqueado despues de cotizar

Una vez que el detallista envia sus cotizaciones:

- no puede seguir agregando mas productos a nuevas cotizaciones
- no puede pedir mas cotizaciones nuevas

Pero si puede continuar con el ciclo operativo de lo ya enviado:

- subir evidencias de pago
- corregir evidencias rechazadas
- aprobar o denegar pagos de clientes sobre sus propios productos

---

## Comportamiento Del Catalogo

### Visualizacion

El detallista entra al catalogo y ve productos de forma no fija, es decir, aleatoria o rotativa.

### Seleccion

Desde el catalogo puede:

- agregar un producto al carrito temporal
- aumentar o reducir cantidad
- quitar un producto del carrito

### Resultado esperado

El carrito debe reflejar la composicion real del pedido antes del envio.

---

## Comportamiento Del Carrito B2B

### Estructura interna

El carrito debe guardar, como minimo:

- producto
- empresa asociada
- cantidad
- precio referencial o snapshot
- comentario por empresa
- modo de pago por empresa

### Regla de agrupacion

Cuando el detallista confirme el carrito, el sistema debe agrupar automaticamente los productos por empresa proveedora.

### Comentario por empresa

Antes de enviar, el detallista puede escribir un comentario especifico para cada empresa.

Ejemplo:

- Empresa A: "Necesito entrega rapida"
- Empresa B: "Solo cotizar pago fraccionado"

---

## Modalidad De Pago

Cada empresa dentro del carrito puede tener su propio modo de pago.

### Pago unico

- se permite una sola evidencia principal activa por cotizacion o por ciclo de revision
- si el mayorista rechaza la evidencia, el detallista puede subir una nueva
- el sistema mantiene el historial de evidencias enviadas

### Pago a cuotas

- se permiten multiples evidencias para la misma cotizacion de empresa
- cada evidencia puede representar un pago parcial
- el detallista puede indicar el monto que cree haber pagado
- el mayorista puede aprobar, rechazar o solicitar correccion del valor reportado

### Ejemplo de cuotas

Si la empresa A cotiza 50 productos por un total de 100 USD:

- el detallista puede enviar una evidencia de 20 USD
- despues otra de 30 USD
- luego otra de 50 USD

El mayorista revisa cada evidencia y decide si coincide con lo mostrado en la prueba de pago.

### Regla de correccion

Si la evidencia muestra 10 USD pero el detallista registro 20 USD en el sistema:

- el mayorista puede rechazar la evidencia
- o pedir correccion del valor reportado

El sistema debe guardar observacion de esa discrepancia.

---

## Estados Funcionales

### Estado del carrito

- `ACTIVE`: el detallista sigue editando el carrito
- `READY_TO_SUBMIT`: el carrito ya esta listo para envio
- `SUBMITTED`: la solicitud ya fue enviada
- `LOCKED`: el flujo de nuevas cotizaciones queda cerrado para ese detallista

### Estado de la cotizacion

- `REQUESTED`: el detallista envio la solicitud
- `QUOTED`: el mayorista respondio la cotizacion
- `ACCEPTED`: el detallista acepto la cotizacion
- `REJECTED`: el detallista la rechazo
- `DELIVERED`: el mayorista registro despacho o entrega
- `PAYMENT_PENDING`: falta evidencia o confirmacion de pago
- `PAYMENT_SUBMITTED`: el detallista envio evidencia
- `PAID`: el mayorista aprobo el pago
- `OVERDUE`: vencio el plazo de 30 dias

### Estado de evidencia

- `PENDING`: enviada y pendiente de revision
- `APPROVED`: aprobada por el mayorista
- `REJECTED`: rechazada por el mayorista

---

## Bloqueo Del Detallista

El bloqueo aplica como medida de control cuando el detallista ya envio su flujo de cotizacion.

### Lo que no puede hacer

- crear nuevas cotizaciones desde el catalogo
- seguir agregando productos para nuevas solicitudes

### Lo que si puede hacer

- subir evidencias de pago de cotizaciones existentes
- volver a enviar evidencia cuando una sea rechazada
- aprobar o denegar pagos de clientes asociados a sus propios productos

### Razon del bloqueo

Evita que el detallista siga abriendo nuevos procesos comerciales mientras tiene un ciclo pendiente de revision.

---

## Historial De Cotizaciones

### Orden

El modulo de cotizaciones debe mostrar el historial:

1. por fecha, del mas reciente al mas antiguo
2. dentro de cada fecha, agrupado por empresa
3. dentro de cada empresa, con los productos separados y ordenados

### Estructura visual deseada

```text
2026-06-22
  Empresa A
    - Producto 1
    - Producto 2
  Empresa B
    - Producto 3
    - Producto 4

2026-06-21
  Empresa C
    - Producto 5
```

### Lo que debe mostrar cada grupo

- empresa
- fecha de solicitud
- estado actual
- comentario del detallista
- total de productos
- total monetario
- evidencias asociadas

---

## Reglas De Revision Del Mayorista

El mayorista debe poder:

- ver la cotizacion agrupada por productos
- aprobar la cotizacion
- rechazarla
- registrar despacho o entrega
- revisar evidencias de pago
- aprobar una evidencia
- rechazar una evidencia
- pedir correccion del valor reportado

### Regla de integridad

El mayorista solo puede revisar evidencias asociadas a su propia empresa y a la cotizacion correspondiente.

---

## Reglas De Vigencia

### Fecha limite

La fecha limite de cada cotizacion se calcula al momento de su creacion.

### Duracion

30 dias exactos.

### Efecto del vencimiento

Cuando una cotizacion vence:

- pasa a `OVERDUE`
- no debe aceptar nuevos pasos comerciales normales
- se conserva como historial

---

## Casos De Uso

### Caso 1: cotizacion por varias empresas

1. el detallista entra al catalogo
2. agrega productos de empresa A y empresa B
3. quita un producto de empresa A
4. el carrito queda dividido por empresa
5. agrega comentario por empresa
6. define pago unico para empresa A y cuotas para empresa B
7. envía la solicitud
8. cada empresa recibe su grupo correspondiente

### Caso 2: pago unico rechazado

1. el detallista sube una evidencia
2. el mayorista la rechaza
3. el detallista sube una nueva evidencia

### Caso 3: pago a cuotas

1. el detallista registra un pago parcial
2. el mayorista revisa la evidencia
3. si no coincide el monto, puede pedir correccion
4. el detallista ajusta y vuelve a enviar

---

## Resultados Esperados

- el detallista no necesita conocer IDs de mayorista
- el catalogo se convierte en el punto de entrada real para cotizar
- el carrito temporal permite editar antes de enviar
- cada empresa recibe su cotizacion separada
- el historial queda claro por fecha y por empresa
- los pagos pueden manejarse con una logica similar al modulo de pagos de clientes, pero adaptada a cotizaciones B2B
- el plazo de 30 dias y el bloqueo del detallista evitan ciclos comerciales abiertos indefinidamente

---

## Observacion Importante

Antes de codificar, conviene confirmar una sola definicion operativa:

- si el bloqueo del detallista es total para nuevas cotizaciones apenas envia una solicitud, o
- si el bloqueo se activa solo cuando al menos una cotizacion queda formalmente abierta o pendiente

La presente especificacion asume el segundo criterio como mas util, pero el flujo puede ajustarse segun la regla final que quieras aplicar.