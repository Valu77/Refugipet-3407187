# Diagrama Entidad Relación (DER)

## Descripción

El Diagrama Entidad Relación muestra la estructura lógica de la base de datos de RefugiPet y las relaciones existentes entre sus entidades.

## Entidades principales

### Usuario

Contiene la información de las personas registradas en la plataforma.

### Refugio

Almacena la información de los refugios responsables de las mascotas.

### Mascota

Registra la información de cada mascota disponible para adopción.

### Solicitud

Representa las solicitudes realizadas por los usuarios para adoptar una mascota.

## Relaciones

- Un refugio puede registrar muchas mascotas.
- Una mascota pertenece a un único refugio.
- Un usuario puede realizar varias solicitudes.
- Cada solicitud corresponde a una sola mascota.

## Objetivo

Diseñar una base de datos organizada que garantice la integridad y consistencia de la información.