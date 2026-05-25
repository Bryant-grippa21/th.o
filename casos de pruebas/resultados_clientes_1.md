# Inicio de pruebas

## 1. Inicio

- El sistema se ha reiniciado con la base de datos limpia usando `DB/databasefor0test.sql`.
- Debido a que la base de datos se ha reiniciado, solo esta el administador con correo 'tho@mail.com' y contraseña '12345'

## 2. Landing Page 1.0

- el landing carga correctamente-
    - los productos no cargan debido a que no hay productos en la base de datos.
    - el buscador no muestra resultados por la misma razon.
    - las categorias no muestran productos por la misma razon.

## 3. Registro persona Natural Local
- el registro local funciona correctamente, se puede crear un nuevo usuario con los siguientes datos:

    ### datos:
    - cliente: 1
    - nombre: Bryant Grippa
    - correo: bryant@mail.com
    - contraseña: 12345
    - celular: 04242488387
    - direccion: Los magallanes, la fila casa 1

    - cliente: 2
    - nombre: Gilberto Grippa
    - correo: Gilberto@mail.com
    - contraseña: 12345
    - celular: nulo
    - direccion: nulo

- el sistema muestra un mensaje de registro exitoso y redirige al login.

    ### Prueba de fallos
- El sistema no permite registrar un usuario con correo ya existente, mostrando un mensaje de error adecuado.
- El sistema permite registrar al usuario ingresando sus datos a expcepcion del numero de celular y la direccion los cuales no son obligatorio inicialmente.
- El sistema no permite registrar un usuario sin nombre, correo y contraseña, mostrando un mensaje de error donde no especifica los campos faltantes. 

## 4. Login Persona Natural Local
- Los cliente 1 y 2 pudieron logearse correctamente con su correo y contraseña.
- El header de la pagina muestra el nombre del cliente logeado.
- El cliente puede acceder al dashboard inicialmente sin inconveniente.

    ### Prueba de fallos
- El sistema automatiza las mayusculas y minusculas del correo, permitiendo el ingreso sin importar la combinacion de mayusculas y minusculas.

    ### Errores y/o inconsistencias detectados
- El sistema sigue mostrando el mensaje "Modulos Cargando modulos..." cuando inicia sesion cuando no se ha seleccionado ningun modulo, lo cual es confuso para el usuario.
- El sistema no muestra ningun mensaje de recordatorio para clientes que necesiten ingresar un numero de telefono o direccion, lo cual puede llevar a que los clientes no completen su perfil y tengan problemas para recuperar su cuenta en el futuro. Se recomienda mostrar un mensaje de recordatorio para completar el perfil si el cliente no tiene un numero de telefono o direccion registrado.

## 5. Login incorrecto persona Natural Local
- El sistema reconoce que el correo existe y despliega un mensaje de error indicando que la contraseña es incorrecta ademas de añadir un conteo de la cantidad de intentos restantes.
- El sistema bloquea al usuario despues de 3 intentos fallidos consecutivos mostrando un mensaje de bloqueo.

    ## Datos de prueba:
    - cliente: 2
    - correo: gilberto@mail.com
    - contraseña: 123

- El usuario no puede iniciar sesion haciendo que el sistema muestre un mensaje de error indicando que el usuario esta bloqueado. independientemente de que el usuario ingrese la contraseña correcta o no.

    ### Prueba de desbloqueo
- Se procede a desbloquear al usuario desde la base de datos.

    ### Prueba de fallos
- El sistema reinicia el conteo de intentos fallidos despues de un intento exitoso, permitiendo al usuario volver a intentar iniciar sesion normalmente.

    ### Errores y/o inconsistencias detectados
- El sistema muestra de forma explicita el conteo de intentos restantes, lo cual puede ser un riesgo de seguridad. Se recomienda mostrar un mensaje genérico de error sin especificar la cantidad de intentos restantes.

## 6. Recuperacion de contraseña persona Natural Local
- El cliente 2 fue bloqueado para generar la prueba.
- El cliente 2 ingresa a la pagina de recuperacion de contraseña donde debe ingresar su correo y numero de celular para validar su identidad.
- Debido a que el cliente 2 no tiene un numero de celular registrado, el sistema no le permite validar su identidad, mostrando un mensaje de error indicando que el numero de celular es requerido para la recuperacion de contraseña. por lo tanto se procede a usar el cliente 1 para probar la recuperacion de contraseña.
- El cliente 1 pudo verificar su identidad ingresando su correo y numero de celular correctamente, lo cual hace que el sistema almacene una solicitud de recuperacion de contraseña en estado `PENDING` y notifique al admin.
- Se verifica si el administrado recibio la solicitud. En efecto, el admin recibe una notificacion indicando que el cliente 1 ha solicitado la recuperacion de su cuenta.
- El admin revisa la solicitud de recuperacion de contraseña del cliente 1, donde puede ver su correo, numero de celular y el estado de la solicitud.
- El admin decide resolver la solicitud de recuperacion de contraseña del cliente 1, donde define una nueva contraseña manualmente y marca la solicitud como `RESOLVED`.
- El cliente 1 puede iniciar sesion con su nueva contraseña, lo cual hace que el sistema permita el acceso normalmente.

    ### Datos de prueba:
    - cliente: 2
    - correo: gilberto@mail.com
    - celular: nulo

    - cliente: 1
    - correo: bryant@mail.com
    - celular: 04242488387

    - cliente 2:
    - celular nuevo: 3162488387

    ### Pruebas de fallo
- Se procede a hacer el proceso de recuperacion de contraseña con el cliente 1, ingresando un numero de celular incorrecto, lo cual hace que el sistema muestre un mensaje de error indicando que el numero de celular es incorrecto.
- Se procede a hacer el proceso de recuperacion de contraseña cuando el cliente 1 no esta bloqueado, lo cual hace que el sistema muestre un mensaje de error indicando que el cliente no esta bloqueado y no necesita recuperar su contraseña.
- Se procede a insertar manualmente un numero telefonico para el cliente 2 en la base de datos, lo cual hace que el sistema permita validar su identidad y generar una solicitud de recuperacion de contraseña, lo cual hace que el admin reciba una notificacion indicando que el cliente 2 ha solicitado la recuperacion de su cuenta.

    ### Errores y/o inconsistencias detectados
- El sistema si o si requiere el numero de celular para validar la identidad del usuario, lo cual es un problema ya que el cliente 2 no tiene un numero de celular registrado. Se recomienda permitir la recuperacion de contraseña solo con el correo, enviando un enlace de restablecimiento de contraseña al correo registrado.
- El sistema no muestra una alternativa para recuperar su cuenta en caso de no tener un numero de celular registrado, lo cual puede dejar a los usuarios sin la posibilidad de recuperar su cuenta. Se recomienda dejar un texto informativo indicando que en caso de no tener un numero de celular registrado, el usuario puede contactar al soporte para recuperar su cuenta, el cual puede ser un correo de contacto o un formulario de contacto directo.
- Debido a que el cliente 1 no esta bloqueado actualmente, desde la vista del admin no hay ninguna opcion para resolver o rechazar la solicitud de recuperacion de contraseña.
- Se recomienda solo habilitar esta opcion para solicitudes de recuperacion de contraseña de clientes bloqueados, ya que no tiene sentido habilitar esta opcion para clientes que no estan bloqueados, lo cual puede generar confusión para el admin.

## 7. Registro y login persona Natural Google
- El cliente pudo registrarse usando su cuenta de Google, lo cual hace que el sistema cree un nuevo usuario con los datos obtenidos de Google y le permita iniciar sesion normalmente.
- El registro con Google funciona independientemente si se usa el boton de Google en la pagina de login o en la pagina de registro, ya que ambos botones redirigen al mismo flujo de autenticacion de Google.

    ## Datos de prueba:
    - cliente: 3
    - nombre: BRYANT GRIPPA
    - correo: bryantgrippagamer@gmail.com
    - contraseña: null
    - celular: null
    - direccion: null

    ## Observaciones
- El sistema no muestra como tal un mensaje o modal al momento de iniciar al dashboard del usuario despues de registrarse con Google para actualizar su perfil, sino que aparece una notificacion en la campana de notificaciones en el landing.

### Errores y/o inconsistencias detectados
- Error en consola referente a la actualizacion de perfil Uncaught SyntaxError: Identifier 'CUSTOMER_MODULES' has already been declared (at dashboard.js:1:1)

## 8. Actualizacion de perfil
- El cliente 3 puede actualizar su perfil desde el boton perfil en el dashboard, donde puede actualizar su numero de celular, direccion, contraseña y foto de perfil.
- El sistema muestra una imagen de perfil por defecto para los clientes que no han subido una foto de perfil, lo cual hace que el cliente 3 tenga una imagen de perfil por defecto hasta que suba su propia foto de perfil.

    ## Datos de prueba:
    - cliente: 3
    - celular nuevo: 3162488388
    - direccion nueva: Bogota, Colombia
    - contraseña nueva: 12345

### Observaciones.
- El sistema no muestra la foto de perfil que el cliente haya subido reflejada en el dashboard, haciendo que la funcion desde el punto de vista del cliente se vea innecesario

## 9. Ingreso por medios diferentes.
- El cliente 3 puede iniciar sesion usando su correo y contraseña, lo cual hace que el sistema permita el acceso normalmente a pesar de haber registrado su cuenta con Google. Esta funcion solo aplica cuando el cliente que haya ingresado desde Google haya actualizado su contraseña desde el perfil, ya que si no ha actualizado su contraseña, el sistema no le permite iniciar sesion con correo y contraseña.

- El cliente 4 puede iniciar sesion usando su cuenta Google si anteriormente ya se habia registrado como local, lo cual hace que el sistema permita el acceso normalmente a pesar de haber registrado su cuenta como local. Esta funcion solo aplica cuando el cliente que haya ingresado como local haya registrado su cuenta con el mismo correo que la cuenta de Google, ya que si no ha registrado su cuenta con el mismo correo, el sistema le registrara una cuenta nueva de Google.

- Ambos casos resultaron ser un exito, ya que el sistema permite el acceso normalmente sin importar el medio de autenticacion usado, siempre y cuando el cliente haya actualizado su contraseña desde su perfil despues de registrarse con Google y viceversa. ademas de que en la base de datos queda establecido el medio de logeo "local", "google" o "both" dependiendo de los casos.

    ## Datos de prueba:
    - cliente: 4
    - nombre: Bryant test
    - correo: testbryant3@gmail.com 
    - contraseña: 12345
    - celular: 1234567890
    - direccion: test direccion


## Observaciones generales
- El header que esta en el landing deberia tener una variante cuando esta en otra pagina diferente al landing, ya que actualmente el header es el mismo en todas las paginas, lo cual puede generar confusión para el usuario cuando ingresa a los detalles de un producto.
- La campana de notificaciones para todos los roles esta solo en el landing, se recomienda agregar la campana de notificaciones en el header de todas las paginas para que los usuarios puedan acceder a sus notificaciones desde cualquier pagina, ya que actualmente solo pueden acceder a sus notificaciones desde el landing, lo cual puede generar confusión para los usuarios cuando estan en otras paginas y no saben que tienen notificaciones nuevas.

## Correciones realizadas

- Se corrigio el error de JavaScript en el dashboard customer relacionado con la redeclaracion de `CUSTOMER_MODULES`, lo cual evitaba la carga correcta de la vista en algunos casos.
- Se ajusto la carga de sesion del customer para que el dashboard consulte los datos actualizados desde base de datos y no quede usando telefono, direccion o imagen desactualizados desde el token inicial.
- Se corrigio el comportamiento del recordatorio de perfil incompleto para que deje de aparecer cuando el cliente ya tiene numero telefonico y direccion registrados.
- Se elimino el submenu redundante de `Modulos` dentro del dashboard customer.
- Se removio el boton `Dashboard` de la navegacion customer, dejando solo los accesos utiles: perfil, favoritos, carrito, mis compras y cashback.
- Se mejoro la cabecera de navegacion customer para mostrar un mensaje de bienvenida y reflejar la imagen de perfil actual o un avatar por defecto cuando no exista imagen cargada.
- Se mejoraron los mensajes de validacion en el registro local de customer para indicar de forma explicita los campos obligatorios faltantes.
- Se ajusto el login local de customer para no mostrar al usuario la cantidad exacta de intentos restantes en caso de credenciales invalidas.
- Se mantuvo la recuperacion de cuenta obligatoria por correo y numero telefonico, segun el criterio actual de la prueba.
- Se agrego una restriccion para que la solicitud de recuperacion de cuenta solo pueda ser realizada por clientes bloqueados.
- Se agrego en la vista de recuperacion de cuenta un bloque visible para correo y telefono publico de soporte, dejados por ahora como `Pendiente por definir`.
- Se realizaron validaciones tecnicas posteriores a los cambios y los archivos tocados quedaron sin errores de sintaxis.
