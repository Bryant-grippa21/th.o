# Pruebas QA manuales

Este documento sirve como guia para probar el sistema completo partiendo desde una base de datos reiniciada y un storage limpio.

## Objetivo

Validar manualmente:

- landing publico
- autenticacion de clientes y empresas
- dashboards por rol
- catalogo, carrito, favoritos y checkout
- compras, evidencias y revision empresarial
- tasa de cambio y cashback
- notificaciones en landing
- validaciones de formularios y permisos
- expediente juridico de empresas
- recuperacion de cuenta

## Preparacion inicial

Antes de ejecutar casos:

1. Restaurar la base con `DB/databasefor0test.sql`.
2. Levantar backend y frontend segun el flujo normal del proyecto.
3. Confirmar que el backend responde en `http://localhost:3000`.
4. Limpiar storage JSON si se quiere una corrida totalmente limpia.
   Nota: si alguna de estas carpetas no existe todavia, no hace falta crearla manualmente; el sistema la genera automaticamente cuando el flujo correspondiente guarda su primer JSON.
	- `src/storage/customers/cart/`
	- `src/storage/customers/favorites/`
	- `src/storage/customers/account-recovery/`
	- `src/storage/notifications/customers/`
	- `src/storage/notifications/companies/`
	- `src/storage/notifications/admins/`
5. Tener identificados al menos estos tipos de usuario para la prueba:
	- cliente nuevo local
    - cliente nuevo google
    - cliente con perfil incompleto
	- cliente con perfil completo
	- empresa detallista
	- empresa mayorista
	- admin

## Regla de ejecucion

Para cada caso registrar:

- resultado real
- capturas si aplica
- si fue aprobado o fallido
- observaciones

Formato sugerido:

| ID | Modulo | Prioridad | Severidad | Estado | Resultado esperado | Resultado real | Evidencia | Observaciones |
|---|---|---|---|---|---|---|---|---|

### Convencion de columnas

- `Prioridad`: Alta, Media, Baja.
- `Severidad`: Critica, Alta, Media, Baja.
- `Estado`: Pendiente, En progreso, Aprobado, Fallido, Bloqueado.
- `Evidencia`: captura, video corto, nombre de archivo o referencia al error.

---

## Bloque 1. Smoke inicial

### QA-001. Carga del landing

**Precondicion:** sistema levantado.

**Pasos:**

1. Abrir `public/index.html` desde el flujo normal del proyecto.
2. Verificar que cargue encabezado, buscador y productos.
3. Navegar por la pagina.

**Resultado esperado:**

- el landing carga sin errores visibles
- se muestran productos o estados vacios controlados
- no hay errores de render criticos

### QA-002. Navegacion publica basica

**Pasos:**

1. Usar el buscador general.
2. Filtrar por categoria si hay categorias disponibles.
3. Entrar al detalle de un producto.
4. Volver al landing.

**Resultado esperado:**

- la navegacion funciona sin romper la sesion publica
- el filtro y la busqueda responden coherentemente
- el detalle muestra informacion del producto

### QA-003. Estado inicial sin sesion

**Pasos:**

1. Abrir el landing sin iniciar sesion.
2. Revisar header y acciones visibles.

**Resultado esperado:**

- no aparece dashboard ni menu privado
- no aparece campana de notificaciones autenticadas
- carrito y favoritos se comportan segun el flujo publico permitido

---

## Bloque 2. Registro y login de cliente

### QA-010. Registro local de cliente

**Precondicion:** email no existente.

**Pasos:**

1. Ir a registro de cliente.
2. Completar campos obligatorios.
3. Enviar formulario.

**Resultado esperado:**

- el cliente se registra correctamente
- no se duplican emails existentes
- el sistema redirige o informa el resultado correctamente

### QA-011. Validaciones de registro de cliente

**Pasos:**

1. Intentar registrar con email vacio.
2. Intentar registrar con password vacia o invalida.
3. Intentar registrar con email repetido.

**Resultado esperado:**

- cada caso muestra validacion clara
- no se crea el usuario cuando el formulario es invalido

### QA-012. Login local de cliente

**Precondicion:** cliente registrado.

**Pasos:**

1. Ir al login.
2. Iniciar sesion con credenciales correctas.

**Resultado esperado:**

- el login es exitoso
- se guarda la sesion
- el header cambia a estado autenticado
- aparece acceso al dashboard de cliente

### QA-013. Login fallido de cliente

**Pasos:**

1. Intentar login con password incorrecta.
2. Repetir hasta observar manejo de errores.

**Resultado esperado:**

- el sistema muestra mensaje de credenciales invalidas o bloqueo segun corresponda
- no inicia sesion

### QA-014. Recuperacion de cuenta desde login

**Precondicion:** cliente existente con email y telefono registrados.

**Pasos:**

1. En login, pulsar "Olvide mi contrasena".
2. Completar email y telefono.
3. Enviar solicitud.

**Resultado esperado:**

- redirige a la pantalla de recuperacion
- valida coincidencia de email y telefono
- crea solicitud de recuperacion en estado pendiente
- muestra feedback de solicitud recibida

### QA-015. Recuperacion de cuenta con datos incorrectos

**Pasos:**

1. Entrar a recuperacion de cuenta.
2. Enviar email correcto con telefono incorrecto.
3. Enviar email inexistente.

**Resultado esperado:**

- no se crea la solicitud
- el sistema informa que los datos no coinciden o son invalidos

### QA-016. Registro o acceso de cliente con Google desde login

**Precondicion:** navegador con sesion Google disponible o posibilidad de autenticarse en Google.

**Pasos:**

1. Ir al login de cliente.
2. Pulsar el boton de Google.
3. Completar el flujo de autenticacion de Google.

**Resultado esperado:**

- el boton de Google se renderiza correctamente
- el flujo autentica al usuario contra `/api/auth/google`
- si el usuario no existia, se crea o vincula como customer segun el flujo implementado
- el sistema guarda la sesion y redirige al dashboard customer

### QA-017. Registro o acceso de cliente con Google desde registro

**Precondicion:** navegador con sesion Google disponible o posibilidad de autenticarse en Google.

**Pasos:**

1. Ir a la pantalla de registro.
2. Pulsar el boton de Google.
3. Completar el flujo de autenticacion de Google.

**Resultado esperado:**

- el boton de Google aparece tambien en registro
- el flujo autentica correctamente al customer
- la sesion queda iniciada al finalizar

### QA-018. Validacion de disponibilidad del boton Google

**Pasos:**

1. Abrir login.
2. Abrir registro.
3. Confirmar que el contenedor de Google carga sin romper la pagina.

**Resultado esperado:**

- el boton o seccion de Google aparece en login y registro
- si Google Identity tarda en cargar, la pagina no falla
- el resto del formulario local sigue operando con normalidad

---

## Bloque 3. Perfil y dashboard de cliente

### QA-020. Acceso al dashboard customer

**Precondicion:** cliente autenticado.

**Pasos:**

1. Entrar al dashboard customer.
2. Recorrer modulos principales.

**Resultado esperado:**

- el dashboard carga sin errores
- se muestran accesos a perfil, compras, favoritos, carrito o modulos relacionados

### QA-021. Perfil incompleto genera notificacion

**Precondicion:** cliente autenticado sin telefono o direccion completa.

**Pasos:**

1. Entrar al landing con sesion iniciada.
2. Abrir campana de notificaciones.

**Resultado esperado:**

- aparece notificacion indicando perfil incompleto
- la notificacion invita a completar datos

### QA-022. Actualizacion de perfil de cliente

**Pasos:**

1. Ir al perfil del cliente.
2. Editar telefono, direccion y datos editables.
3. Guardar.

**Resultado esperado:**

- los cambios se guardan
- al volver a cargar se muestran persistidos
- la notificacion de perfil incompleto desaparece cuando corresponda

### QA-023. Subida de imagen de perfil de cliente

**Pasos:**

1. Cargar una imagen valida.
2. Guardar perfil.

**Resultado esperado:**

- la imagen se procesa correctamente
- el perfil muestra la nueva imagen

---

## Bloque 4. Favoritos y carrito

### QA-030. Agregar producto a favoritos

**Precondicion:** cliente autenticado y productos visibles.

**Pasos:**

1. Marcar un producto como favorito desde landing o detalle.
2. Recargar la pagina.
3. Entrar a favoritos.

**Resultado esperado:**

- el producto queda guardado
- persiste tras recarga
- aparece en la vista de favoritos

### QA-031. Quitar producto de favoritos

**Pasos:**

1. Eliminar un favorito existente.
2. Recargar la pagina.

**Resultado esperado:**

- el producto deja de aparecer como favorito
- el estado queda persistido

### QA-032. Agregar producto al carrito desde landing

**Pasos:**

1. Agregar un producto al carrito.
2. Abrir el carrito desplegable.

**Resultado esperado:**

- el carrito refleja el producto agregado
- se actualizan cantidades y total

### QA-033. Modificar cantidades en carrito

**Pasos:**

1. Sumar cantidad de un item.
2. Restar cantidad.
3. Eliminar un item.

**Resultado esperado:**

- cada accion actualiza cantidades y total correctamente
- el carrito nunca queda con cantidades invalidas

### QA-034. Persistencia JSON del carrito

**Pasos:**

1. Agregar varios productos al carrito.
2. Recargar el landing.
3. Cerrar sesion e iniciar de nuevo con el mismo cliente si aplica.

**Resultado esperado:**

- el carrito persiste segun el comportamiento esperado del cliente autenticado

---

## Bloque 5. Catalogo, detalle y resenas

### QA-040. Listado de productos con busqueda y filtros

**Pasos:**

1. Buscar por texto.
2. Filtrar por categoria.
3. Cambiar pagina si hay paginacion.

**Resultado esperado:**

- el listado responde a busqueda y filtros
- la paginacion no rompe filtros activos

### QA-041. Detalle de producto

**Pasos:**

1. Abrir un producto desde el landing.
2. Revisar imagenes, precio, descripcion y resenas.

**Resultado esperado:**

- el detalle muestra informacion completa disponible
- las imagenes y datos coinciden con el producto

### QA-042. Crear o editar resena como cliente

**Precondicion:** cliente autenticado.

**Pasos:**

1. Entrar al detalle de un producto.
2. Crear resena.
3. Editar la misma resena.

**Resultado esperado:**

- el sistema permite una sola resena por entidad y producto
- la resena puede editarse
- se actualiza promedio y conteo si corresponde

---

## Bloque 6. Checkout, compras y evidencias de cliente

### QA-050. Checkout agrupado por proveedor

**Precondicion:** carrito con productos de uno o mas proveedores.

**Pasos:**

1. Iniciar checkout.
2. Revisar agrupacion por empresa.

**Resultado esperado:**

- el checkout divide la compra por proveedor
- muestra subtotales y total general
- congela precios y tasa usados en la compra

### QA-051. Reserva de stock al crear checkout

**Pasos:**

1. Ejecutar checkout de un producto con stock limitado.
2. Validar luego disponibilidad desde vistas correspondientes.

**Resultado esperado:**

- el stock queda reservado al crear la compra
- no se venden cantidades imposibles si el stock ya fue tomado

### QA-052. Subida de evidencia por grupo de compra

**Precondicion:** compra creada.

**Pasos:**

1. Ir a compras del cliente.
2. Abrir un grupo pendiente.
3. Subir evidencia.

**Resultado esperado:**

- la evidencia se registra para el grupo correcto
- el estado cambia a enviado o pendiente de revision segun el flujo implementado

### QA-053. Historial de compras del cliente

**Pasos:**

1. Entrar al historial de compras.
2. Abrir una compra con detalle.

**Resultado esperado:**

- se listan compras y grupos creados
- el detalle muestra estados, montos y evidencias cuando existan

### QA-054. Notificaciones de compra para cliente

**Precondicion:** existe una compra con cambios de estado.

**Pasos:**

1. Enviar evidencia como cliente.
2. Iniciar sesion de nuevo en landing.
3. Abrir notificaciones.

**Resultado esperado:**

- aparecen notificaciones derivadas del estado de compra
- ejemplos posibles: enviada, aprobada, parcialmente aprobada, rechazada, expirada, enviada por empresa, entregada

---

## Bloque 7. Cashback de cliente

### QA-060. Visualizacion de saldo e historial cashback

**Precondicion:** cliente con movimientos o saldo disponible.

**Pasos:**

1. Entrar al modulo de cashback.
2. Revisar saldo e historial.

**Resultado esperado:**

- el saldo se muestra correctamente
- el historial lista movimientos existentes

### QA-061. Cashback luego de compra aprobada

**Precondicion:** una compra del cliente es aprobada por la empresa.

**Pasos:**

1. Completar flujo de compra.
2. Aprobar grupo desde empresa.
3. Volver al customer y revisar cashback.

**Resultado esperado:**

- si el flujo ya esta operativo para ese caso, se acredita cashback
- el historial refleja el movimiento
- si el modulo esta aun en ajuste para un caso concreto, registrar el comportamiento observado

---

## Bloque 8. Registro y login de empresa

### QA-070. Registro publico de empresa

**Precondicion:** rif y email no existentes.

**Pasos:**

1. Ir al registro de empresa.
2. Completar datos.
3. Enviar formulario.

**Resultado esperado:**

- la empresa se registra correctamente
- por defecto entra con rol de detallista si ese es el flujo actual

### QA-071. Validaciones de registro de empresa

**Pasos:**

1. Intentar registrar con rif duplicado.
2. Intentar registrar con email duplicado.
3. Dejar campos obligatorios vacios.

**Resultado esperado:**

- el sistema bloquea registros invalidos
- muestra mensajes claros

### QA-072. Login de empresa

**Precondicion:** empresa registrada y activa.

**Pasos:**

1. Iniciar sesion como empresa.
2. Entrar al dashboard company.

**Resultado esperado:**

- login exitoso
- acceso al dashboard y modulos privados

---

## Bloque 9. Perfil y expediente juridico de empresa

### QA-080. Actualizacion de perfil de empresa

**Pasos:**

1. Ir al perfil company.
2. Editar datos permitidos.
3. Guardar.

**Resultado esperado:**

- los cambios se guardan y persisten

### QA-081. Carga de documentos juridicos

**Precondicion:** empresa autenticada.

**Pasos:**

1. Entrar al modulo o seccion juridica del perfil.
2. Cargar documentos requeridos.
3. Enviar expediente.

**Resultado esperado:**

- el expediente queda registrado como pendiente de revision
- la empresa recibe estado coherente en interfaz
- el admin recibe notificacion de solicitud juridica pendiente

### QA-082. Notificaciones juridicas para empresa

**Precondicion:** admin revisa expediente juridico.

**Pasos:**

1. Enviar expediente juridico como empresa.
2. Aprobar, rechazar o pedir correcciones desde admin.
3. Volver al landing autenticado como empresa.

**Resultado esperado:**

- la empresa ve notificaciones de pendiente, correcciones, rechazo o aprobacion segun corresponda

---

## Bloque 10. Dashboard y operaciones de empresa

### QA-090. Gestion de productos propios

**Precondicion:** empresa autenticada.

**Pasos:**

1. Ir al modulo de productos de la empresa.
2. Crear un producto si el rol y permisos lo permiten.
3. Editarlo.
4. Revisar su aparicion en el catalogo o listas relacionadas.

**Resultado esperado:**

- el CRUD visible para empresa funciona segun permisos del rol
- los datos guardados se reflejan en vistas relacionadas

### QA-091. Gestion de compras recibidas por empresa

**Precondicion:** existe una compra hecha por customer hacia esta empresa.

**Pasos:**

1. Entrar a compras en dashboard company.
2. Abrir grupo con evidencia enviada.
3. Revisar montos y evidencia.

**Resultado esperado:**

- la empresa ve grupos asignados a ella
- puede revisar evidencia y detalle del pedido

### QA-092. Aprobar compra desde empresa

**Pasos:**

1. Aprobar un grupo de compra con evidencia valida.
2. Verificar estado resultante.

**Resultado esperado:**

- el grupo cambia a aprobado
- el customer puede ver el nuevo estado
- se generan notificaciones derivadas para el customer

### QA-093. Rechazar o expirar compra desde empresa

**Pasos:**

1. Rechazar un grupo.
2. Probar expiracion si el flujo existe en pantalla o backend.

**Resultado esperado:**

- el estado cambia correctamente
- el stock reservado se libera cuando corresponda
- el customer ve el nuevo estado y su notificacion derivada

### QA-094. Metodos de pago de empresa

**Pasos:**

1. Crear o revisar metodos de pago de empresa.
2. Confirmar que el customer los vea en el flujo correspondiente si aplica.

**Resultado esperado:**

- los metodos quedan registrados y utilizables

---

## Bloque 11. Admin, clientes y empresas

### QA-100. Login admin y carga de dashboard

**Precondicion:** usuario admin existente y activo.

**Pasos:**

1. Iniciar sesion como admin.
2. Entrar al dashboard admin.
3. Cambiar entre modulos.

**Resultado esperado:**

- el dashboard admin carga correctamente
- se visualizan modulos de clientes, empresas, productos y tasa

### QA-101. Listado y gestion de clientes

**Pasos:**

1. Entrar al modulo de clientes.
2. Revisar listado.
3. Abrir modal de un cliente.

**Resultado esperado:**

- se listan clientes disponibles
- el modal muestra datos editables y estado general

### QA-102. Recuperacion de cuenta vista por admin

**Precondicion:** existe solicitud de recuperacion pendiente creada por un cliente.

**Pasos:**

1. Iniciar sesion como admin.
2. Abrir landing o dashboard segun flujo actual.
3. Confirmar notificacion de recuperacion.
4. Ir al cliente afectado y abrir su modal.

**Resultado esperado:**

- el admin recibe notificacion tipo recuperacion de cuenta
- en el modal se visualiza resumen de la solicitud
- se muestra estado pendiente y fecha

### QA-103. Resolver solicitud de recuperacion

**Pasos:**

1. Abrir modal del cliente con solicitud pendiente.
2. Seleccionar resolver.
3. Escribir nueva contrasena.
4. Guardar.

**Resultado esperado:**

- el sistema exige nueva contrasena para resolver
- la solicitud cambia a resuelta
- el cliente puede iniciar sesion con la nueva contrasena

### QA-104. Rechazar solicitud de recuperacion

**Pasos:**

1. Abrir modal del cliente con solicitud pendiente.
2. Seleccionar rechazar.
3. Guardar con o sin observacion segun flujo.

**Resultado esperado:**

- la solicitud cambia a rechazada
- deja de aparecer como pendiente

### QA-105. Gestion de empresas y roles desde admin

**Pasos:**

1. Entrar al modulo de empresas.
2. Revisar listado y datos.
3. Editar rol o estado si el flujo actual lo permite.

**Resultado esperado:**

- el admin puede revisar y gestionar empresas segun permisos disponibles

---

## Bloque 12. Admin y expediente juridico

### QA-110. Notificacion admin de juridico pendiente

**Precondicion:** una empresa envio expediente juridico.

**Pasos:**

1. Iniciar sesion como admin.
2. Abrir notificaciones en landing o revisar dashboard.

**Resultado esperado:**

- aparece notificacion de nueva solicitud juridica pendiente

### QA-111. Revisar expediente y pedir correcciones

**Pasos:**

1. Abrir el expediente juridico de la empresa.
2. Marcar correcciones solicitadas.
3. Guardar.

**Resultado esperado:**

- el estado queda en correccion solicitada
- la empresa ve el cambio y su notificacion correspondiente

### QA-112. Aprobar expediente juridico

**Pasos:**

1. Abrir expediente pendiente.
2. Aprobarlo.

**Resultado esperado:**

- el estado cambia a aprobado
- la empresa recibe notificacion de aprobacion

### QA-113. Rechazar expediente juridico

**Pasos:**

1. Abrir expediente pendiente.
2. Rechazarlo.

**Resultado esperado:**

- el estado cambia a rechazado
- la empresa recibe notificacion de rechazo

---

## Bloque 13. Admin, productos y tasa de cambio

### QA-120. Gestion administrativa de productos

**Pasos:**

1. Entrar al modulo admin de productos.
2. Revisar listado, filtros y paginacion si existen.
3. Crear o editar un producto segun el flujo disponible.

**Resultado esperado:**

- el admin puede revisar y mantener productos segun capacidades implementadas

### QA-121. Registrar tasa de cambio

**Pasos:**

1. Entrar al modulo de tasa.
2. Registrar una nueva tasa valida.
3. Revisar historial.

**Resultado esperado:**

- la nueva tasa se guarda
- el historial la muestra como la mas reciente

### QA-122. Validacion de tasa invalida

**Pasos:**

1. Intentar registrar tasa `0`.
2. Intentar registrar valor negativo.

**Resultado esperado:**

- el sistema bloquea tasas invalidas

### QA-123. Notificacion de tasa para customer con carrito activo

**Precondicion:** customer con carrito activo y una tasa recien actualizada por admin.

**Pasos:**

1. Como admin, cambiar la tasa.
2. Como customer, volver al landing.
3. Abrir notificaciones.

**Resultado esperado:**

- aparece notificacion indicando cambio relevante de tasa con carrito activo

---

## Bloque 14. Notificaciones en landing

### QA-130. Campana visible para usuario autenticado

**Pasos:**

1. Iniciar sesion como customer.
2. Ir al landing.
3. Repetir como empresa y admin.

**Resultado esperado:**

- la campana aparece para usuarios autenticados
- no aparece para usuarios anonimos

### QA-131. Apertura y listado de notificaciones

**Pasos:**

1. Abrir la campana.
2. Revisar listado.

**Resultado esperado:**

- se muestran mensajes segun el rol y estado real del sistema
- el listado no mezcla notificaciones de otros usuarios

### QA-132. Marcar notificacion como leida

**Pasos:**

1. Abrir una notificacion.
2. Recargar pagina.

**Resultado esperado:**

- la notificacion queda marcada como leida
- el estado persiste por JSON

### QA-133. Marcar todas como leidas

**Pasos:**

1. Usar la accion de marcar todas como leidas.
2. Recargar el landing.

**Resultado esperado:**

- todas quedan en estado leido
- la persistencia se conserva

### QA-134. Navegacion desde notificacion

**Pasos:**

1. Abrir una notificacion accionable.
2. Verificar si redirige o enfoca la vista relacionada.

**Resultado esperado:**

- la accion abre el modulo esperado cuando la notificacion tenga destino asociado

---

## Bloque 15. Permisos y seguridad funcional

### QA-140. Customer no accede a dashboard admin

**Pasos:**

1. Iniciar sesion como customer.
2. Intentar abrir rutas admin manualmente.

**Resultado esperado:**

- acceso denegado o redireccion adecuada

### QA-141. Company no accede a modulos de customer ajeno

**Pasos:**

1. Iniciar sesion como empresa.
2. Intentar abrir vistas privadas de customer.

**Resultado esperado:**

- acceso denegado o datos no expuestos

### QA-142. Usuario anonimo no accede a dashboards privados

**Pasos:**

1. Sin sesion, intentar abrir dashboard customer, company y admin.

**Resultado esperado:**

- el sistema protege rutas privadas

---

## Bloque 16. Casos de regresion recomendados

Ejecutar al final de cada corrida:

### QA-150. Regresion de login y sesion

**Pasos:**

1. Probar login customer.
2. Probar login company.
3. Probar login admin.
4. Cerrar sesion y volver a entrar.

**Resultado esperado:**

- no se rompen sesiones ni redirecciones base

### QA-151. Regresion de carrito tras compras

**Pasos:**

1. Crear una compra.
2. Verificar estado final del carrito.

**Resultado esperado:**

- el carrito queda coherente despues del checkout

### QA-152. Regresion de notificaciones despues de leer

**Pasos:**

1. Leer una o varias notificaciones.
2. Cerrar sesion.
3. Volver a iniciar sesion.

**Resultado esperado:**

- el estado de lectura se conserva

### QA-153. Regresion de estados de compra cruzados

**Pasos:**

1. Customer crea compra.
2. Company la revisa.
3. Customer consulta historial y notificaciones.

**Resultado esperado:**

- ambos lados ven el mismo estado funcional de la compra

---

## Matriz de seguimiento

Usa esta tabla como hoja operativa durante la ejecucion. La prioridad y severidad quedan precargadas para acelerar el seguimiento.

| ID | Modulo | Prioridad | Severidad | Estado | Resultado real | Evidencia | Observaciones |
|---|---|---|---|---|---|---|---|
| QA-001 | Landing smoke | Alta | Critica | Pendiente |  |  |  |
| QA-002 | Landing navegacion | Alta | Alta | Pendiente |  |  |  |
| QA-003 | Landing sin sesion | Alta | Alta | Pendiente |  |  |  |
| QA-010 | Customer registro | Alta | Critica | Pendiente |  |  |  |
| QA-011 | Customer registro validaciones | Alta | Alta | Pendiente |  |  |  |
| QA-012 | Customer login | Alta | Critica | Pendiente |  |  |  |
| QA-013 | Customer login fallido | Alta | Alta | Pendiente |  |  |  |
| QA-014 | Recuperacion de cuenta | Alta | Alta | Pendiente |  |  |  |
| QA-015 | Recuperacion invalidaciones | Alta | Media | Pendiente |  |  |  |
| QA-016 | Customer Google desde login | Alta | Alta | Pendiente |  |  |  |
| QA-017 | Customer Google desde registro | Alta | Alta | Pendiente |  |  |  |
| QA-018 | Disponibilidad boton Google | Media | Media | Pendiente |  |  |  |
| QA-020 | Dashboard customer | Alta | Alta | Pendiente |  |  |  |
| QA-021 | Notificacion perfil incompleto | Media | Media | Pendiente |  |  |  |
| QA-022 | Perfil customer update | Alta | Alta | Pendiente |  |  |  |
| QA-023 | Perfil customer imagen | Media | Baja | Pendiente |  |  |  |
| QA-030 | Favoritos agregar | Media | Media | Pendiente |  |  |  |
| QA-031 | Favoritos eliminar | Media | Media | Pendiente |  |  |  |
| QA-032 | Carrito agregar | Alta | Alta | Pendiente |  |  |  |
| QA-033 | Carrito cantidades | Alta | Alta | Pendiente |  |  |  |
| QA-034 | Carrito persistencia | Alta | Alta | Pendiente |  |  |  |
| QA-040 | Catalogo filtros | Alta | Alta | Pendiente |  |  |  |
| QA-041 | Producto detalle | Alta | Media | Pendiente |  |  |  |
| QA-042 | Resenas customer | Media | Media | Pendiente |  |  |  |
| QA-050 | Checkout agrupado | Alta | Critica | Pendiente |  |  |  |
| QA-051 | Reserva de stock | Alta | Critica | Pendiente |  |  |  |
| QA-052 | Evidencia de pago | Alta | Alta | Pendiente |  |  |  |
| QA-053 | Historial compras customer | Alta | Alta | Pendiente |  |  |  |
| QA-054 | Notificaciones de compra customer | Media | Alta | Pendiente |  |  |  |
| QA-060 | Cashback vista | Media | Media | Pendiente |  |  |  |
| QA-061 | Cashback tras aprobacion | Media | Alta | Pendiente |  |  |  |
| QA-070 | Company registro | Alta | Critica | Pendiente |  |  |  |
| QA-071 | Company validaciones | Alta | Alta | Pendiente |  |  |  |
| QA-072 | Company login | Alta | Critica | Pendiente |  |  |  |
| QA-080 | Company perfil update | Alta | Alta | Pendiente |  |  |  |
| QA-081 | Expediente juridico envio | Alta | Alta | Pendiente |  |  |  |
| QA-082 | Notificaciones juridicas company | Media | Alta | Pendiente |  |  |  |
| QA-090 | Company productos | Alta | Alta | Pendiente |  |  |  |
| QA-091 | Company compras recibidas | Alta | Alta | Pendiente |  |  |  |
| QA-092 | Company aprobar compra | Alta | Critica | Pendiente |  |  |  |
| QA-093 | Company rechazar o expirar | Alta | Critica | Pendiente |  |  |  |
| QA-094 | Company metodos de pago | Media | Media | Pendiente |  |  |  |
| QA-100 | Admin login y dashboard | Alta | Critica | Pendiente |  |  |  |
| QA-101 | Admin listado clientes | Alta | Alta | Pendiente |  |  |  |
| QA-102 | Admin ve recuperacion | Alta | Alta | Pendiente |  |  |  |
| QA-103 | Admin resuelve recuperacion | Alta | Critica | Pendiente |  |  |  |
| QA-104 | Admin rechaza recuperacion | Media | Alta | Pendiente |  |  |  |
| QA-105 | Admin gestiona empresas | Alta | Alta | Pendiente |  |  |  |
| QA-110 | Admin notif juridico pendiente | Media | Media | Pendiente |  |  |  |
| QA-111 | Admin pide correcciones juridico | Alta | Alta | Pendiente |  |  |  |
| QA-112 | Admin aprueba juridico | Alta | Alta | Pendiente |  |  |  |
| QA-113 | Admin rechaza juridico | Alta | Alta | Pendiente |  |  |  |
| QA-120 | Admin productos | Alta | Alta | Pendiente |  |  |  |
| QA-121 | Admin registra tasa | Alta | Alta | Pendiente |  |  |  |
| QA-122 | Admin valida tasa invalida | Alta | Alta | Pendiente |  |  |  |
| QA-123 | Notificacion de tasa customer | Media | Media | Pendiente |  |  |  |
| QA-130 | Campana por rol | Alta | Alta | Pendiente |  |  |  |
| QA-131 | Listado de notificaciones | Alta | Alta | Pendiente |  |  |  |
| QA-132 | Notificacion leida | Media | Media | Pendiente |  |  |  |
| QA-133 | Marcar todas leidas | Media | Media | Pendiente |  |  |  |
| QA-134 | Navegacion desde notificacion | Media | Media | Pendiente |  |  |  |
| QA-140 | Permiso customer vs admin | Alta | Critica | Pendiente |  |  |  |
| QA-141 | Permiso company vs customer | Alta | Critica | Pendiente |  |  |  |
| QA-142 | Permiso anonimo vs privados | Alta | Critica | Pendiente |  |  |  |
| QA-150 | Regresion login y sesion | Alta | Critica | Pendiente |  |  |  |
| QA-151 | Regresion carrito post checkout | Alta | Alta | Pendiente |  |  |  |
| QA-152 | Regresion lectura notificaciones | Media | Media | Pendiente |  |  |  |
| QA-153 | Regresion estados cruzados | Alta | Critica | Pendiente |  |  |  |

---

## Observaciones para esta ronda

- Si la base queda realmente desde cero, algunos casos dependen de poblar productos, categorias, empresas o admin segun el script consolidado.
- Si un caso no aplica por falta de datos semilla, marcarlo como bloqueado y anotar exactamente que faltaba.
- En mensajes futuros B2B usar el termino **cotizacion** cuando el flujo comercial correspondiente sea implementado en runtime.

## Propuesta de orden de ejecucion

1. Smoke inicial.
2. Registro y login customer.
3. Perfil customer, favoritos, carrito y checkout.
4. Compras, evidencias y cashback.
5. Registro y login company.
6. Perfil company y juridico.
7. Operacion company sobre compras.
8. Login admin.
9. Gestion admin de clientes, empresas, productos y tasa.
10. Notificaciones y regresiones finales.
