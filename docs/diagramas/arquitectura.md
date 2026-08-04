# Arquitectura del Sistema

## Descripción

La arquitectura de RefugiPet sigue una arquitectura cliente-servidor, separando el frontend, el backend y la base de datos.

## Componentes

### Frontend

Desarrollado con React.

Responsabilidades:

- Mostrar la interfaz de usuario.
- Consumir la API REST.
- Gestionar la navegación.

### Backend

Desarrollado con FastAPI.

Responsabilidades:

- Procesar la lógica de negocio.
- Validar la información.
- Gestionar la autenticación.
- Exponer la API REST.

### Base de Datos

Implementada en PostgreSQL.

Responsabilidades:

- Almacenar usuarios.
- Almacenar mascotas.
- Registrar solicitudes.
- Mantener la integridad de la información.

## Flujo de comunicación

Usuario → Frontend (React) → API REST (FastAPI) → PostgreSQL

Las respuestas siguen el mismo recorrido en sentido contrario hasta mostrarse en la interfaz.

## Ventajas

- Separación de responsabilidades.
- Facilidad de mantenimiento.
- Escalabilidad.
- Mayor seguridad en el manejo de los datos.