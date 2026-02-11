# Sistema de Gestión de Gimnasio 💪

Sistema integral para la administración y reserva de clases en gimnasios, desarrollado con una arquitectura moderna de microservicios utilizando Spring Boot (Backend) y React (Frontend).

## Descripción

Esta aplicación proporciona una solución completa para:
- **Usuarios**: Registro, consulta de horarios, reserva de clases y gestión de perfil.
- **Administradores**: Gestión de inventario de clases, entrenadores, usuarios y visualización de métricas operativas.

El sistema está diseñado para ser desplegable en contenedores Docker, facilitando su implementación en plataformas de nube como Render.

## Arquitectura y Tecnologías

### Frontend
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Comunicación**: Axios (REST API)

### Backend
- **Framework**: Spring Boot 3.5.7
- **Seguridad**: Spring Security con JWT (Java Web Tokens)
- **Base de Datos**: 
  - Producción: H2 (En memoria)
  - Desarrollo: MySQL 8 (Soportado)
- **Build Tool**: Gradle

## Estructura del Proyecto

- `Frontend-gimnasio/`: Código fuente de la aplicación cliente (SPA).
- `gimnasioreserva-spring/`: Código fuente del servidor API REST.
- `docs/`: Documentación técnica y manuales de despliegue.

## Documentación

La documentación detallada del proyecto se ha consolidado en el siguiente manual técnico:

- [Manual Técnico y Guía de Despliegue](docs/MANUAL_TECNICO.md)

Este documento incluye:
1. Instrucciones de instalación local.
2. Guía de despliegue en Render (Docker).
3. Credenciales de administración.
4. Detalles de arquitectura y base de datos.

## Instalación Rápida

### Requisitos
- Java 17+
- Node.js 20+
- Docker (Opcional, para despliegue)

### Ejecución Local

**Backend:**
```bash
cd gimnasioreserva-spring
./gradlew bootRun
```

**Frontend:**
```bash
cd Frontend-gimnasio
npm install
npm run dev
```

## Credenciales por Defecto

El sistema incluye una cuenta administrativa preconfigurada para el primer despliegue:

- **Usuario**: `admin@hotmail.com`
- **Contraseña**: `admin`
