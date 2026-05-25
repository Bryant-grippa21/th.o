# Inicio de pruebas

## 1. Inicio
- El sistema se hizo en base a la validacion anterior de usuarios, por lo tanto la base de datos no se reinicio

## 2. Registro de usuario Juridico
- El usuario juridico se registro correctamente ingresando el nombre de la empresa, RIF, el correo, la contraseña, el numero telefonico y direccion.
- Se valida que al momento de crear una empresa se detalla que se requerira mas informacion para se aprobado correctamente, ademas que necesita ingresar para validar las evidencias.

    ## Datos de prueba
    - empresa: 1
    - nombre: Empresa de tornillos
    - RIF: J-123456780
    - correo: empresa1@mail.com
    - contraseña: 12345
    - numero telefonico: 3162345678
    - direccion: La guaira

## 2. Inicio de sesion y datos de la empresa
- El usuario juridico se loguea correctamente con el correo y la contraseña ingresada al momento del registro.
- Se valida que el usuario pueda ingresar a su dashboard y visualizar la informacion de su empresa, ademas de que pueda ingresar a la seccion de evidencias para subir los documentos requeridos para su aprobacion.
- Se evidencia que las evidencias se suben correctamente y se muestran en la seccion de evidencias, ademas de que se muestra el estado de cada evidencia.

## Errores y/o inconsistencias encontradas
- si al momento de subir las evidencias, el administrado aprueba parcialmente las pruebas ya sea todas o las mayorias, el usuario juridico tiene accesso a subir no solo evidencias adicionales, sino tambien tiene accesso a los modulos de catalogo, compra y ventas, lo que no deberia ser asi, ya que el usuario juridico solo deberia tener accesso a esos modulos una vez que todas las evidencias hayan sido aprobadas.
- referente al punto anterior incluso si se rechaza la solicitud de evidencias, el usuario juridico sigue teniendo accesso a los modulos de catalogo, compra y ventas, lo que no deberia ser asi, ya que el usuario juridico solo deberia tener accesso a esos modulos una vez que todas las evidencias hayan sido aprobadas.
- la vista del historial de evidencias enviadas se muestra pero no de forma agrupada y por ronda y ademas se ve la informacion bastante larga, es decir en ves de estar agrupadas y ordenadas solo se muestra el historial de el mas reciente al mas antiguo, lo que hace que se vea un poco desordenado y no se pueda visualizar claramente el historial de evidencias enviadas.


## observaciones generales
- la vista de la imagen de la empresa no se muestra correctamente, y tambien esta el modulo de seleccion de modulos en la vista principal del dashboard lo que generaba inconvenientes igual que el modulo de clientes
- debido a las observaciones anteriores se recomienda arreglar los errores presentados porque podrian romper la logica de negocio de los usuarios juridicos.







## pruebas de registro, inicio de sesion y evidencias de usuario juridico 2.0
    - Se realizaran pruebas nuevamentes de sistema para verificar que los errores encontrados en la primera ronda de pruebas hayan sido corregidos y que el sistema funcione correctamente para los usuarios juridicos.

