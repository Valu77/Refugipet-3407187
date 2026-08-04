# Diccionario de Datos

## Usuario

| Campo | Tipo | Descripción |
|--------|------|-------------|
| id_usuario | SERIAL | Identificador del usuario |
| nombre | VARCHAR(100) | Nombre completo |
| correo | VARCHAR(100) | Correo electrónico |
| contraseña | VARCHAR(255) | Contraseña cifrada |
| telefono | VARCHAR(20) | Número telefónico |

---

## Refugio

| Campo | Tipo | Descripción |
|--------|------|-------------|
| id_refugio | SERIAL | Identificador |
| nombre | VARCHAR(100) | Nombre del refugio |
| direccion | VARCHAR(150) | Dirección |
| telefono | VARCHAR(20) | Contacto |
| correo | VARCHAR(100) | Correo institucional |

---

## Mascota

| Campo | Tipo | Descripción |
|--------|------|-------------|
| id_mascota | SERIAL | Identificador |
| nombre | VARCHAR(50) | Nombre |
| especie | VARCHAR(30) | Perro, gato, etc. |
| raza | VARCHAR(50) | Raza |
| edad | INTEGER | Edad |
| sexo | VARCHAR(15) | Sexo |
| estado_salud | VARCHAR(100) | Estado de salud |
| descripcion | TEXT | Información adicional |
| foto | VARCHAR(255) | Ruta de la imagen |
| id_refugio | INTEGER | Refugio responsable |

---

## Solicitud

| Campo | Tipo | Descripción |
|--------|------|-------------|
| id_solicitud | SERIAL | Identificador |
| fecha | DATE | Fecha de solicitud |
| estado | VARCHAR(20) | Pendiente, Aprobada o Rechazada |
| id_usuario | INTEGER | Usuario solicitante |
| id_mascota | INTEGER | Mascota solicitada |