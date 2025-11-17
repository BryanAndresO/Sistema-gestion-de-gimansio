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
