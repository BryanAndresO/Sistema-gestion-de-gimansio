# Sistema de Reservas de Gimnasio

Sistema completo de gestión de reservas para gimnasios desarrollado con React + TypeScript (Frontend) y Spring Boot (Backend).

## 📋 Descripción del Proyecto

Este sistema permite a los usuarios registrarse, ver clases disponibles, hacer reservas y gestionar su perfil. Los administradores pueden gestionar usuarios, clases, entrenadores, reservas y ver reportes del sistema.

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como build tool
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **Tailwind CSS** para estilos
- **JWT** para autenticación

### Backend
- **Spring Boot 3.5.7**
- **Spring Security** con JWT
- **Spring Data JPA** con Hibernate
- **MySQL 5.5.5**
- **BCrypt** para encriptación de contraseñas
- **Gradle** como build tool

---

## 📝 Historial de Commits

### Commit 1: `454550a` - Primer commit del proyecto gimnasio
- Inicialización del proyecto
- Configuración base de Spring Boot y React
- Estructura de carpetas inicial

### Commit 2: `47c160c` - Realizacion de domain, controller, dto, etc para Dev1
- **Domain**: Creación de entidades JPA (Clase, Entrenador, Usuario, Reserva, Horario)
- **Controllers**: Endpoints básicos para gestión de clases y entrenadores
- **DTOs**: Objetos de transferencia de datos para comunicación frontend-backend
- **Repositories**: Interfaces JPA para acceso a datos
- **Services**: Lógica de negocio para operaciones CRUD

### Commit 3: `1066879` - Sistema de Seguridad JWT
- Implementación de **JwtTokenProvider** para generación y validación de tokens
- Configuración de filtros de seguridad para interceptar peticiones
- Sistema de refresh tokens para renovación de sesiones
- Manejo de expiración de tokens (24h access token, 7 días refresh token)

### Commit 4: `e6fb171` - Configuración Spring Security
- **SecurityConfig**: Configuración de seguridad con autorización basada en roles
- **CORS**: Configuración para permitir peticiones desde el frontend (localhost:5173)
- **MethodSecurityConfig**: Habilitación de @PreAuthorize para proteger endpoints
- **PasswordEncoderConfig**: Configuración de BCrypt para encriptación de contraseñas
- Endpoints públicos: `/api/auth/**` (login, register)
- Endpoints protegidos: `/api/admin/**` requieren rol ADMIN

### Commit 5: `9096405` - Servicios de Autenticacion
- **AuthenticationService**: Lógica de registro y login de usuarios
- **UserDetailsServiceImpl**: Carga de usuarios para Spring Security
- **AuthController**: Endpoints REST para autenticación
  - `POST /api/auth/login` - Inicio de sesión
  - `POST /api/auth/register` - Registro de usuarios
  - `POST /api/auth/refresh` - Renovación de tokens
- Creación automática de usuario con rol USER al registrarse
- Generación de tokens JWT en respuesta de login

### Commit 6: `3ba103b` - Merge pull request #1 from BryanAndresO/main
- Integración de ramas de desarrollo
- Fusión de cambios de múltiples desarrolladores

### Commit 7: `8182957` - Commit del Desarrollador 4, Sin integración con el desarrollador 3
- Desarrollo de funcionalidades adicionales del backend
- Controladores y servicios para módulos específicos
- Pendiente de integración con otros desarrolladores

### Commit 8: `6cb7d8a` - Integraciones
- **Integración Frontend-Backend**: Conexión completa entre React y Spring Boot
- **Corrección de errores de CORS**: Eliminación de @CrossOrigin conflictivos
- **Autenticación funcional**: Login y registro operativos
- **Creación de usuario admin**: Script SQL con contraseña encriptada BCrypt
  - Usuario: `admin@gimnasio.com`
  - Contraseña: `admin123`
- **Panel de Administración completo**:
  - ✅ **Gestión de Usuarios** (CRUD completo, activar/desactivar)
  - ✅ **Gestión de Clases** (crear con horario, entrenador, duración, capacidad)
  - ✅ **Gestión de Entrenadores** (CRUD con especialidades)
  - ✅ **Gestión de Reservas** (ver todas, filtrar por estado, cambiar estados)
  - ✅ **Reportes** (estadísticas generales del gimnasio)
  - ✅ **Dashboard Admin** (métricas y accesos rápidos)
- **Corrección de formato de respuestas**: Actualización de hooks para manejar arrays directos del backend
- **Fix de tokens JWT**: Corrección del helper getFromStorage() para manejar strings planos
- **Navegación por roles**: Sidebar dinámico según rol (USER/ADMIN)
- **Base de datos**: Actualización de entrenadores con estado activo

---

## 🎯 Funcionalidades Principales

### Para Usuarios (USER)
- ✅ Registro e inicio de sesión
- ✅ Ver catálogo de clases disponibles
- ✅ Realizar reservas de clases
- ✅ Ver mis reservas activas
- ✅ Historial de reservas
- ✅ Gestión de perfil
- ✅ Configuración de cuenta

### Para Administradores (ADMIN)
- ✅ Gestión completa de usuarios (crear, editar, eliminar, activar/desactivar)
- ✅ Gestión de clases (crear con horario, entrenador, duración, capacidad)
- ✅ Gestión de entrenadores (CRUD con especialidades)
- ✅ Gestión de reservas (ver todas, filtrar, cambiar estados)
- ✅ Dashboard con métricas clave
- ✅ Reportes y estadísticas del sistema
- ✅ Vista de usuario (cambiar entre vista admin y usuario)

---

## 🔐 Seguridad

- **Autenticación JWT**: Tokens seguros para sesiones
- **Encriptación BCrypt**: Contraseñas hasheadas con salt
- **Autorización por roles**: Endpoints protegidos según rol (USER/ADMIN)
- **CORS configurado**: Solo permite peticiones desde el frontend autorizado
- **Validación de tokens**: Verificación en cada petición protegida

---

## 📦 Instalación y Ejecución

### Backend (Spring Boot)
```bash
cd gimnasioreserva-spring
./gradlew bootRun
```
El servidor se ejecuta en `http://localhost:8080`

### Frontend (React + Vite)
```bash
cd Frontend-gimnasio
npm install
npm run dev
```
El frontend se ejecuta en `http://localhost:5173`

### Base de Datos (MySQL)
1. Crear base de datos: `gimnasio_reserva`
2. Configurar credenciales en `application.properties`
3. Las tablas se crean automáticamente con JPA
4. Usuario admin se crea automáticamente con `data.sql`

---

## 👥 Credenciales de Acceso

### Usuario Administrador
- **Email**: `admin@gimnasio.com`
- **Contraseña**: `admin123`
- **Rol**: ADMIN

### Usuarios Regulares
Se crean mediante el formulario de registro en `/register`
- **Rol por defecto**: USER

---

## 🗂️ Estructura del Proyecto

```
gimnasio_reserva/
├── Frontend-gimnasio/          # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── common/         # Button, Card, Input, Table, Modal
│   │   │   └── layout/         # Sidebar, Header, MainLayout, Breadcrumb
│   │   ├── pages/
│   │   │   ├── admin/          # Páginas de administración
│   │   │   ├── auth/           # Login y Register
│   │   │   ├── clases/         # Catálogo y detalles de clases
│   │   │   ├── reservas/       # Mis reservas e historial
│   │   │   └── user/           # Dashboard, Perfil, Settings
│   │   ├── hooks/              # useApi, useApiMutation
│   │   ├── utils/              # constants, helpers
│   │   └── AppRoutes.tsx       # Configuración de rutas
│   └── package.json
│
└── gimnasioreserva-spring/     # Aplicación Spring Boot
    ├── src/main/java/com/gimansioreserva/gimnasioreserva_spring/
    │   ├── config/             # SecurityConfig, CorsConfig, PasswordEncoder
    │   ├── domain/             # Entidades JPA (Usuario, Clase, Reserva, etc.)
    │   ├── repository/         # Interfaces JPA Repository
    │   ├── service/
    │   │   ├── admin/          # Servicios para admin
    │   │   ├── auth/           # Servicios de autenticación
    │   │   └── core/           # Servicios de negocio
    │   ├── web/controller/
    │   │   ├── admin/          # Controladores admin
    │   │   └── api/            # Controladores públicos y de usuario
    │   ├── security/jwt/       # JwtTokenProvider, JwtAuthenticationFilter
    │   └── dto/                # DTOs para transferencia de datos
    └── src/main/resources/
        ├── application.properties
        └── data.sql            # Script de inicialización (usuario admin)
```

---

## 🔄 Flujo de Autenticación

1. Usuario hace login en `/login`
2. Backend valida credenciales y genera token JWT
3. Frontend guarda token en localStorage
4. Cada petición incluye token en header `Authorization: Bearer {token}`
5. Backend valida token en cada endpoint protegido
6. Token expira en 24h, se puede renovar con refresh token

---

## 🎨 Características de la UI

- **Diseño responsive**: Funciona en desktop, tablet y móvil
- **Tailwind CSS**: Estilos modernos y consistentes
- **Componentes reutilizables**: Button, Card, Input, Table, Modal
- **Navegación dinámica**: Sidebar cambia según rol de usuario
- **Feedback visual**: Loading states, error messages, confirmaciones
- **Estados con colores**: Verde (activo/confirmado), Rojo (cancelado), Amarillo (pendiente)

---

## 📊 Endpoints Principales del Backend

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/refresh` - Renovar token

### Admin - Usuarios
- `GET /api/admin/usuarios` - Listar todos
- `POST /api/admin/usuarios` - Crear usuario
- `PUT /api/admin/usuarios/{id}` - Actualizar usuario
- `DELETE /api/admin/usuarios/{id}` - Eliminar usuario

### Admin - Clases
- `GET /api/admin/clases` - Listar todas
- `POST /api/admin/clases` - Crear clase
- `PUT /api/admin/clases/{id}` - Actualizar clase
- `DELETE /api/admin/clases/{id}` - Eliminar clase

### Admin - Entrenadores
- `GET /api/admin/entrenadores` - Listar todos
- `POST /api/admin/entrenadores` - Crear entrenador
- `PUT /api/admin/entrenadores/{id}` - Actualizar entrenador
- `DELETE /api/admin/entrenadores/{id}` - Eliminar entrenador

### Reservas
- `GET /api/reservas/usuario/{id}` - Reservas de usuario
- `POST /api/reservas` - Crear reserva
- `POST /api/reservas/{id}/cancelar` - Cancelar reserva

---

## 👨‍💻 Desarrolladores

Este proyecto fue desarrollado en equipo por múltiples desarrolladores trabajando en diferentes módulos del sistema.

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico.

---

## 🐛 Solución de Problemas Conocidos

### Error: Port 8080 already in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Error: CORS policy
- Verificar que el backend esté corriendo en puerto 8080
- Verificar que no haya `@CrossOrigin` duplicados en controllers

### Error: 401 Unauthorized
- Verificar que el token esté guardado en localStorage
- Verificar que el token no haya expirado
- Verificar que el usuario tenga el rol correcto

### Frontend no carga datos
- Verificar que el backend esté corriendo
- Abrir DevTools → Network → ver respuestas de API
- Verificar que los endpoints devuelvan datos correctos

---

## 📞 Contacto

Para preguntas o sugerencias sobre el proyecto, contactar al equipo de desarrollo.
