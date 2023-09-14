Endpoint /enpo1
---

    Método: GET
    Descripción: Este endpoint obtiene una lista de pacientes ordenados de manera alfabética por su primer nombre. Utiliza la base de datos para buscar los registros de pacientes y devuelve el resultado en formato JSON.

Endpoint /enpo2
---
    Método: GET
    Descripción: Este endpoint obtiene las citas programadas para una fecha específica (en este caso, 14 de septiembre de 2023). Las citas se ordenan alfabéticamente por el primer nombre del paciente. Los datos de las citas se combinan con los datos de los pacientes utilizando la base de datos y se devuelven en formato JSON.

Endpoint /enpo3
---
    Método: GET
    Descripción: Este endpoint busca médicos que tengan una especialidad específica (en este caso, Cardiología clínica) en la base de datos. Devuelve información detallada de los médicos, incluyendo detalles de su consultorio y especialidad en formato JSON.

Endpoint /enpo4
---
    Método: GET
    Descripción: Este endpoint busca la próxima cita programada para un paciente específico (identificado por su ID de usuario) que está programada para una fecha posterior a la fecha actual. Devuelve la información de la cita en formato JSON.

Endpoint /enpo5
---
    Método: GET
    Descripción: Este endpoint busca pacientes que tienen citas programadas con un médico específico (identificado por su ID de médico). Combina los datos de la cita, el médico y el paciente y los devuelve en formato JSON.

Endpoint /enpo6
---
    Método: GET
    Descripción: Este endpoint obtiene las citas programadas para una fecha específica (en este caso, 14 de septiembre de 2023). Las citas se ordenan alfabéticamente por el primer nombre del paciente. Los datos de las citas se combinan con los datos de los pacientes utilizando la base de datos y se devuelven en formato JSON.

Endpoint /enpo7
---
    Método: GET
    Descripción: Este endpoint busca médicos y sus consultorios correspondientes en la base de datos. Devuelve información detallada de los médicos y sus respectivos consultorios en formato JSON.

Endpoint /enpo8
---
    Método: GET
    Descripción: Este endpoint busca la cantidad de citas que tiene un médico en específico (identificado por su ID de médico) en la base de datos. Devuelve la cantidad de citas y detalles de las citas en formato JSON.

Endpoint /enpo9
---
    Método: GET
    Descripción: Este endpoint busca los consultorios donde se han aplicado citas para un paciente específico (identificado por su ID de usuario) en la base de datos. Devuelve una lista de consultorios en formato JSON.

Endpoint /enpo10
---
    Método: GET
    Descripción: Este endpoint obtiene todas las citas realizadas por pacientes de acuerdo al género registrado, siempre y cuando el estado de la cita se encuentre registrado como "Atendida". Combina los datos de las citas y los datos de los pacientes y los devuelve en formato JSON.