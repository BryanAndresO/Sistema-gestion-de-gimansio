<<<<<<< HEAD
-- Script de datos iniciales para Dev
-- Se agregarán 20 registros de prueba por tabla

-- Nota: El usuario administrador se crea automáticamente mediante DataInitializer.java
-- Credenciales: admin@hotmail.com / admin
=======
-- Script de datos iniciales
-- Usuario admin por defecto

-- Insertar usuario administrador
-- Correo: admin@gimnasio.com
-- Contraseña: admin123
-- El hash BCrypt corresponde a la contraseña "admin123"
INSERT INTO usuarios (nombre, correo, contrasena, rol, activo)
SELECT 'Administrador', 'admin@gimnasio.com', '$2a$10$8cjz47bjbR4Mn8GMg9IZx.vyjhLXR/SKKMSZ9.mP9vpMu0ssKi8GW', 'ADMIN', true
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo = 'admin@gimnasio.com'
);
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
