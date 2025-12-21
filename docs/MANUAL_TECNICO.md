# Manual Técnico del Sistema de Gestión de Gimnasio

## 1. Visión General del Proyecto

Este sistema es una aplicación web full-stack para la gestión de reservas de gimnasios. Permite a los usuarios registrarse y reservar clases, y a los administradores gestionar recursos, horarios y usuarios.

### Arquitectura Técnica
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS. Construido como aplicación de página única (SPA).
- **Backend**: Spring Boot 3.5.7, Java 17. API RESTful protegida con Spring Security y JWT.
- **Base de Datos**: 
  - **Desarrollo**: MySQL 8 (opcional) o H2.
  - **Producción (Render)**: H2 Database en memoria (volátil) para persistencia temporal.
- **Despliegue**: Docker multi-stage build para contenedores ligeros.

---

## 2. Configuración de Entornos

### Entorno de Desarrollo Local

#### Backend (Spring Boot)
1. Navegar al directorio: `cd gimnasioreserva-spring`
2. Ejecutar servicio: `./gradlew bootRun`
   - URL: `http://localhost:8080`
   - Swagger Documentation: `http://localhost:8080/swagger-ui.html`

#### Frontend (React)
1. Navegar al directorio: `cd Frontend-gimnasio`
2. Instalar dependencias: `npm install`
3. Iniciar servidor de desarrollo: `npm run dev`
   - URL: `http://localhost:5173`

#### Modo Híbrido (Frontend Local + Backend Remoto)
Para conectar el entorno de desarrollo local con el backend desplegado en la nube:
1. Crear archivo `.env` en `Frontend-gimnasio/`.
2. Configurar la URL remota: `VITE_API_BASE_URL=https://tu-backend.onrender.com/api`

---

## 3. Guía de Despliegue en Render

El proyecto está optimizado para despliegue en Render utilizando Docker para el backend y Static Site para el frontend.

### Despliegue del Backend

1. **Crear Web Service** en Render conectado al repositorio GitHub.
2. **Configuración del Servicio**:
   - Runtime: Docker
   - Root Directory: `gimnasioreserva-spring`
3. **Variables de Entorno Requeridas**:
   - `DATABASE_URL`: `jdbc:h2:mem:gimnasio;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`
   - `JWT_SECRET`: Cadena base64 segura (generar con `openssl rand -base64 64`).
   - `CORS_ALLOWED_ORIGINS`: URL del frontend desplegado (ej. `https://mi-gimnasio.onrender.com`).
   - `SPRING_PROFILES_ACTIVE`: `render`

### Despliegue del Frontend

1. **Crear Static Site** en Render conectado al repositorio GitHub.
2. **Configuración del Sitio**:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Root Directory: `Frontend-gimnasio`
3. **Variables de Entorno**:
   - `VITE_API_BASE_URL`: URL del backend desplegado (ej. `https://mi-backend.onrender.com/api`).

---

## 4. Guía de Administración

### Credenciales de Acceso Inicial
El sistema inicia con una cuenta administrativa por defecto establecida en `DataInitializer.java`:

- **Usuario**: `admin@hotmail.com`
- **Contraseña**: `admin`
- **Rol**: `ADMIN`

**Nota de Seguridad**: Se recomienda cambiar esta contraseña inmediatamente después del primer inicio de sesión o modificar el archivo `DataInitializer.java` antes de desplegar en producción.

### Gestión de Usuarios
Los administradores pueden:
1. Crear nuevos entrenadores y clases.
2. Gestionar reservas de usuarios.
3. Actualizar roles de usuario a ADMIN si es necesario.

---

## 5. Detalles de Implementación H2 y Docker

### Persistencia de Datos
En el entorno de Render, se utiliza H2 en memoria. Esto significa que **los datos se restablecen cada vez que el servicio se reinicia**. Esto es intencional para demostraciones y control de costos.

Si se requiere persistencia permanente:
1. Provisionar una base de datos MySQL o PostgreSQL (ej. Railway, AWS RDS).
2. Actualizar la variable de entorno `DATABASE_URL` con la cadena de conexión JDBC del proveedor externo.

### Dockerfile
El archivo `Dockerfile` en `gimnasioreserva-spring/` utiliza un enfoque "Multi-stage build":
1. **Stage 1 (Builder)**: Usa Gradle para compilar el código fuente.
2. **Stage 2 (Runner)**: Usa una imagen JRE ligera (Eclipse Temurin) para ejecutar el archivo JAR, optimizando el tamaño final de la imagen y la seguridad.
