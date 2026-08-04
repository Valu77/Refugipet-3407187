# Especificación de Requisitos del Software (SRS)

# Proyecto RefugiPet

## 1. Introducción

### 1.1 Propósito

Este documento describe los requisitos funcionales y no funcionales del sistema RefugiPet, una plataforma web diseñada para centralizar el proceso de adopción de mascotas entre refugios y adoptantes.

### 1.2 Alcance

RefugiPet permitirá:

- Registro e inicio de sesión de usuarios.
- Publicación de mascotas por parte de los refugios.
- Consulta de mascotas disponibles.
- Solicitudes de adopción.
- Gestión de solicitudes.
- Administración del sistema.

### 1.3 Definiciones

- Usuario: Persona interesada en adoptar una mascota.
- Refugio: Organización encargada de publicar mascotas.
- Administrador: Responsable de supervisar la plataforma.
- Solicitud: Petición realizada por un usuario para adoptar una mascota.

---

# 2. Descripción General

## Perspectiva del producto

RefugiPet es una aplicación web desarrollada con React para el frontend y FastAPI para el backend, utilizando PostgreSQL como sistema gestor de base de datos.

## Usuarios del sistema

- Adoptantes
- Refugios
- Administradores

## Restricciones

- Acceso mediante autenticación.
- Base de datos PostgreSQL.
- Comunicación mediante API REST.

---

# 3. Requisitos Funcionales

El sistema deberá:

- Registrar usuarios.
- Permitir iniciar sesión.
- Gestionar perfiles.
- Registrar mascotas.
- Consultar mascotas.
- Buscar mascotas mediante filtros.
- Registrar solicitudes de adopción.
- Gestionar solicitudes.
- Administrar usuarios y refugios.

---

# 4. Requisitos No Funcionales

- Seguridad mediante cifrado de contraseñas.
- Tiempo de respuesta menor a 3 segundos.
- Interfaz intuitiva.
- Compatibilidad con navegadores modernos.
- Escalabilidad.
- Mantenibilidad.

---

# 5. Arquitectura

El sistema estará compuesto por:

Frontend
- React

Backend
- FastAPI

Base de Datos
- PostgreSQL

Control de versiones
- Git y GitHub

---

# 6. Casos de Uso

- Registro de usuario.
- Inicio de sesión.
- Consultar mascotas.
- Registrar mascota.
- Solicitar adopción.
- Gestionar solicitudes.

---

# 7. Conclusión

RefugiPet busca optimizar el proceso de adopción de mascotas mediante una plataforma centralizada, segura y fácil de utilizar para usuarios, refugios y administradores.