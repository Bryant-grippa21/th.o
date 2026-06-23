# Storage operativo

Este directorio guarda estructuras JSON temporales o de soporte que hoy no están persistidas en MySQL.

## Estructura actual

- `customers/cart/`: carrito por cliente.
- `customers/favorites/`: favoritos por cliente.
- `customers/account-recovery/`: solicitudes de recuperación de cuenta por cliente.
- `b2b/retailer-cart/`: carrito temporal B2B del detallista, guardado en JSON por empresa.
- `notifications/customers/`: estado de lectura de notificaciones de clientes.
- `notifications/companies/`: estado de lectura de notificaciones de empresas.
- `notifications/admins/`: estado de lectura de notificaciones del admin.

## Notificaciones

Las notificaciones actuales usan dos capas:

1. Datos reales del sistema para derivar el mensaje.
2. JSON por usuario para recordar si ya fue leído.

El JSON no es la fuente de verdad del negocio. Solo conserva `read_at`, `event_key` y metadatos de lectura.

## Catálogo de notificaciones

## Cliente

### Implementadas hoy

- Tasa actualizada con carrito activo.
- Perfil incompleto por falta de teléfono o dirección.
- Compra enviada y esperando aprobación.
- Compra aprobada.
- Pago parcialmente aprobado.
- Compra rechazada.
- Compra expirada.
- Compra enviada por la empresa.
- Compra entregada.

### Propuestas siguientes

- Producto del carrito sin inventario suficiente.
- Producto del carrito con cambio de precio desde la última visita.
- Cashback acreditado por compra aprobada.
- Ajuste o reverso de cashback.
- Incidencia logística en el pedido.

## Empresa detallista o mayorista

### Implementadas hoy

- Expediente jurídico pendiente.
- Expediente jurídico con correcciones solicitadas.
- Expediente jurídico rechazado.
- Expediente jurídico aprobado.
- Solicitud de compra recibida con evidencias.
- Compra aprobada lista para preparar o despachar.
- Incidencia logística en compra.

### Terminología acordada

Para mensajes comerciales futuros entre mayoristas y detallistas, usar **cotización** en lugar de **crédito**.

Ejemplos sugeridos:

- Mayorista 1 aprobó tu cotización.
- Mayorista 2 rechazó tu cotización.
- Detallista 1 solicitó una cotización.
- La cotización 12345 vence en 10 días.

## Admin

### Implementadas hoy

- Nueva solicitud jurídica pendiente de revisión.
- Usuario solicitando recuperación de cuenta.

### Propuestas siguientes

- Resumen diario disponible.
- Resumen mensual disponible.
- Variación atípica en métricas.
- Compras con incidencias activas.
- Solicitudes pendientes sin movimiento por demasiado tiempo.

## Recuperación de cuenta

Flujo actual:

1. El cliente indica email y teléfono en la pantalla pública de recuperación.
2. Se valida coincidencia contra el usuario registrado.
3. Se crea o refresca una solicitud `PENDING` en JSON.
4. El admin recibe una notificación derivada.
5. El admin revisa la solicitud en el modal de cliente.
6. Si decide resolverla, define una nueva contraseña manualmente y marca la solicitud como `RESOLVED`.
7. Si no procede, la marca como `REJECTED` con observación.

## Regla de diseño

Crear una notificación solo cuando ocurra al menos una de estas condiciones:

1. Cambia la responsabilidad de un actor.
2. Cambia el riesgo o el permiso operativo.
3. El usuario debe tomar una acción concreta.

## Siguiente fase

- reestructuracion de cotizaciones en el apartado de catalogo antes de ampliar el flujo comercial B2B