# Instrucciones para Usuarios Administradores

## Usuario Admin por Defecto

Ya se ha creado un usuario administrador inicial con las siguientes credenciales:

- **Correo:** `admin@gimnasio.com`
- **Contraseña:** `admin123`
- **Rol:** `ADMIN`

Este usuario se crea automáticamente cuando se inicia la aplicación por primera vez gracias al archivo `data.sql`.

## Iniciar Sesión como Admin

1. Ve a la página de login de tu aplicación
2. Ingresa el correo: `admin@gimnasio.com`
3. Ingresa la contraseña: `admin123`
4. Haz clic en "Iniciar sesión"

## Crear Más Usuarios Admin Manualmente

Si necesitas crear más usuarios administradores directamente en la base de datos, sigue estos pasos:

### Opción 1: Usar la Utilidad PasswordEncoderUtil (Recomendado)

1. Desde el directorio del proyecto Spring:
   ```bash
   cd gimnasioreserva-spring
   ```

2. Compila el proyecto:
   ```bash
   ./gradlew build
   ```

3. Ejecuta la utilidad con la contraseña que deseas encriptar:
   ```bash
   java -cp "build/classes/java/main:build/libs/*" \
   com.gimansioreserva.gimnasioreserva_spring.util.PasswordEncoderUtil "tu_contraseña_aqui"
   ```

4. Copia el hash generado y úsalo en el siguiente comando SQL:
   ```sql
   INSERT INTO usuarios (nombre, correo, contrasena, rol, activo)
   VALUES ('Nombre Admin', 'nuevo.admin@gimnasio.com', 'HASH_GENERADO_AQUI', 'ADMIN', true);
   ```

### Opción 2: Usar BCrypt Online (Rápido pero menos seguro)

1. Ve a un generador BCrypt online (por ejemplo: https://bcrypt-generator.com/)
2. Ingresa tu contraseña
3. Usa 10 rounds (el estándar)
4. Copia el hash generado
5. Inserta el usuario en la base de datos con ese hash

## Registro de Nuevos Usuarios

Cuando un usuario se registra a través del formulario de registro:

- **Automáticamente se le asigna el rol:** `USER`
- **Puede:** Ver horarios, hacer reservas, gestionar su perfil
- **NO puede:** Acceder a funciones administrativas

## Diferencias entre Roles

### Usuario Normal (USER)
- Ver horarios y disponibilidad
- Hacer reservas de clases
- Ver sus propias reservas
- Modificar su perfil
- Cancelar sus reservas

### Administrador (ADMIN)
- Todas las funciones de USER
- Gestionar clases
- Gestionar horarios
- Gestionar entrenadores
- Ver todas las reservas
- Gestionar usuarios
- Configuración del sistema

## Solución de Problemas

### No puedo iniciar sesión
- Verifica que el backend esté corriendo
- Asegúrate de estar usando `admin@gimnasio.com` y `admin123`
- Revisa la consola del navegador (F12) para ver errores

### Error al registrar nuevo usuario
- Verifica que el correo no esté ya registrado
- Asegúrate de que las contraseñas coincidan
- La contraseña debe tener al menos 6 caracteres

### Cambiar la contraseña del admin
Si deseas cambiar la contraseña del admin por seguridad:

1. Genera un nuevo hash usando la utilidad PasswordEncoderUtil
2. Actualiza en la base de datos:
   ```sql
   UPDATE usuarios
   SET contrasena = 'NUEVO_HASH_AQUI'
   WHERE correo = 'admin@gimnasio.com';
   ```

## Notas de Seguridad

**IMPORTANTE:** Es altamente recomendable cambiar la contraseña del admin por defecto en un ambiente de producción.
